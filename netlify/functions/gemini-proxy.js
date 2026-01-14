// Netlify serverless function to proxy Gemini API calls
// This keeps API key secure on the server

exports.handler = async (event, context) => {
  // Enable CORS FIRST
  const headers = {
    'Access-Control-Allow-Origin': 'https://muhammadefan.github.io',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests for actual API calls
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Method not allowed. Use POST.' 
      })
    };
  }

  try {
    // Parse the request body
    let requestData;
    try {
      requestData = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body' 
        })
      };
    }
    
    const { action, question, query, prompt } = requestData;
    
    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'API key not configured on server' 
        })
      };
    }

    // Handle different actions
    if (action === 'embed') {
      // Generate embedding for query
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: { parts: [{ text: query }] }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Embedding API error:', errorData);
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({
            success: false,
            error: errorData.error?.message || 'Embedding API failed'
          })
        };
      }

      const data = await response.json();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          embedding: data.embedding.values
        })
      };

    } else if (action === 'generate') {
      // Generate answer with context
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Generation API error:', errorData);
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({
            success: false,
            error: errorData.error?.message || 'Generation API failed'
          })
        };
      }

      const data = await response.json();
      const answer = data.candidates[0]?.content?.parts[0]?.text || 'No response from AI';

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          answer: answer
        })
      };

    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid action. Use "embed" or "generate"'
        })
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      })
    };
  }
};