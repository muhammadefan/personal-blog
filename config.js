// Auto-detect environment and set API URL
const CONFIG = {
    // Detect if running locally
    isLocal: window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1' ||
             window.location.protocol === 'file:',
    
    // Netlify function URL (update this after deploying to Netlify)
    netlifyFunctionUrl: 'https://muhammadefan.netlify.app/.netlify/functions/gemini-proxy'
};

// Log current environment
if (CONFIG.isLocal) {
    console.log('🔧 Environment: LOCAL DEVELOPMENT');
    console.log('📍 API calls will be made directly from browser');
} else {
    console.log('🚀 Environment: PRODUCTION');
    console.log('📍 API calls will go through Netlify proxy');
    console.log('🔗 Proxy URL:', CONFIG.netlifyFunctionUrl);
}