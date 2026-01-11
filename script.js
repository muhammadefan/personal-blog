// ==== NAVBAR TITLE FUNCTIONALITY ====
// Function to scroll to top/first section
function scrollToTop(event) {
    event.preventDefault();
    document.querySelector('.first-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Function to initialize rotating subtitles
function initializeRotatingSubtitles() {
    // Customizable titles
    const subtitles = [
        "a Data Analyst",
        "a Data Scientist", 
        "an AI Engineer"
    ];
    
    const subtitleContainer = document.getElementById('navbarSubtitle');
    
    // Clear existing content
    subtitleContainer.innerHTML = '';
    
    // Add each subtitle as a span
    subtitles.forEach((subtitle, index) => {
        const span = document.createElement('span');
        span.textContent = subtitle;
        subtitleContainer.appendChild(span);
    });
    
    // Adjust animation timing based on number of subtitles
    const totalDuration = subtitles.length * 4; // 4 seconds per subtitle
    
    // Calculate percentage values
    const startFadeIn = (3 / totalDuration * 100).toFixed(2);
    const fullyVisible = (10 / totalDuration * 100).toFixed(2);
    const startFadeOut = (28 / totalDuration * 100).toFixed(2);
    const fullyHidden = (31 / totalDuration * 100).toFixed(2);
    
    // Update animation duration
    const styleSheet = document.styleSheets[0];
    try {
        styleSheet.insertRule(`
            @keyframes rotateWords {
                0% {
                    opacity: 0;
                    transform: translateY(10px);
                }
                ${startFadeIn}% {
                    opacity: 0;
                    transform: translateY(10px);
                }
                ${fullyVisible}% {
                    opacity: 1;
                    transform: translateY(0px);
                }
                ${startFadeOut}% {
                    opacity: 1;
                    transform: translateY(0px);
                }
                ${fullyHidden}% {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-10px);
                }
            }
        `, styleSheet.cssRules.length);
    } catch (e) {
        console.warn("Could not insert animation rule:", e);
    }
    
    // Update individual animation delays
    subtitles.forEach((_, index) => {
        const delay = index * 4; // 4 seconds between each
        try {
            styleSheet.insertRule(`
                .navbar-subtitle span:nth-child(${index + 1}) { 
                    animation-delay: ${delay}s; 
                }
            `, styleSheet.cssRules.length);
        } catch (e) {
            console.warn("Could not insert delay rule:", e);
        }
    });
    
    // Update overall animation duration
    subtitleContainer.style.animationDuration = `${totalDuration}s`;
}

// Blog posts metadata load from JSON files
let blogPosts = [];
let portfolio = [];

// Fetch blog posts from JSON
async function initializeBlogPosts() {
    try {
        const response = await fetch('assets/blog-posts.json');
        if (!response.ok) {
            throw new Error('Failed to load blog posts');
        }
        blogPosts = await response.json();
        loadBlogPosts(); // Call loadBlogPosts AFTER data is loaded
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}

// Initialize portfolio
async function initializePortfolio() {
    try {
        const response = await fetch('assets/portfolio.json');
        if (!response.ok) {
            throw new Error('Failed to load portfolio');
        }
        portfolio = await response.json();
        renderPortfolioProjects(); // Call render AFTER data is loaded
    } catch (error) {
        console.error('Error loading portfolio:', error);
    }
}

// Call initialization when page loads
window.addEventListener('DOMContentLoaded', async () => {
    initializeRotatingSubtitles();
    initializeBlogPosts();
    initializePortfolio();
    renderSocialMediaIcons();

    // Load embeddings for RAG
    await loadEmbeddings();
});

// ==== SECTION 2: BLOG POST ====
// MANUAL EDIT IF MORE ADDITIONS
function loadBlogPosts() {
    // Get 4 most recent posts for each category
    const categoryAPosts = blogPosts
        .filter(post => post.category === 'python-programming')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);
    
    const categoryBPosts = blogPosts
        .filter(post => post.category === 'B')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);

    renderBlogCards('categoryA', categoryAPosts);
    renderBlogCards('categoryB', categoryBPosts);
}

function renderBlogCards(containerId, posts) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'blog-card';
        card.onclick = () => openBlogPost(post);

        // Format date
        const dateObj = new Date(post.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            month: 'short', 
            day: '2-digit', 
            year: 'numeric' 
        });

        // Check if post has a custom image, otherwise show placeholder
        const imageHTML = post.image 
            ? `<img src="${post.image}" alt="${post.title}">` 
            : `<div class="blog-image-placeholder"></div>`;

        card.innerHTML = `
            <div class="blog-image">
                ${imageHTML}
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span>${formattedDate}</span>
                    <span class="blog-meta-separator">•</span>
                    <span>${post.readingTime} min read</span>
                </div>
                <h3 class="blog-title">${post.title}</h3>
                <p class="blog-summary">${post.summary}</p>
            </div>
        `;

        container.appendChild(card);
    });
}

function convertString(str) {
// Split the string by the hyphen delimiter
const words = str.split("-");

// Capitalize the first letter of each word
const capitalizedWords = words.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
});

// Join the words back together with a space
const result = capitalizedWords.join(" ");

return result;
}

async function openBlogPost(post) {
    const modal = document.getElementById('blogModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const categoryTitle = convertString(post.category);

    modalTitle.innerHTML = '';
    modalBody.innerHTML = '<p>Loading...</p>';
    modal.classList.add('active');

    try {
        // ADD 'blog-posts/' prefix if not already in the path
        const filePath = post.contentFile.startsWith('blog-posts/') 
            ? post.contentFile 
            : `blog-posts/${post.contentFile}`;
        
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error('Could not load blog post');
        }
        const content = await response.text();

        const headerHTML = `
            <div class="post-header">
                <h1 class="post-title-modal">${post.title}</h1>
                <div class="post-meta">
                    <span class="post-category">${categoryTitle}</span>
                    <span class="meta-separator">|</span>
                    <span class="post-date">${post.date}</span>
                    <span class="meta-separator">|</span>
                    <span class="reading-time-modal">
                        <i class="far fa-clock"></i>
                        <span>${post.readingTime} ${post.readingTime === 1 ? 'minute' : 'minutes'}</span>
                    </span>
                </div>
            </div>
        `;

        const contentHTML = marked.parse(content);

        modalTitle.innerHTML = headerHTML;
        modalBody.innerHTML = `<div class="post-content">${contentHTML}</div>`;
        
    } catch (error) {
        modalBody.innerHTML = `
            <div style="color: #d32f2f; padding: 20px;">
                <p>Error loading blog post: ${error.message}</p>
                <p style="margin-top: 10px; color: #666;">File path: ${post.contentFile}</p>
            </div>
        `;
    }
}

function closeModal() {
    document.getElementById('blogModal').classList.remove('active');
}

// Show category list view
function showCategoryList(category) {
    const mainView = document.getElementById('blogMainView');
    const listView = document.getElementById('categoryListView');
    const title = document.getElementById('categoryListTitle');
    const subtitle = document.getElementById('categoryListSubtitle');
    const container = document.getElementById('postListContainer');
    const categoryTitle = convertString(category);

    // Get all posts for this category, sorted by date (newest first)
    const posts = blogPosts
        .filter(post => post.category === category)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Update title
    title.textContent = `${categoryTitle}`;
    subtitle.textContent = `${posts.length} post${posts.length !== 1 ? 's' : ''} in this category`;

    // Render posts
    container.innerHTML = '';
    posts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'post-list-item';

        // Format date (YYYY-MM-DD format)
        const formattedDate = post.date;

        // Truncate summary if too long (use summary as preview)
        const maxLength = 100;
        let preview = post.summary;
        if (preview.length > maxLength) {
            preview = preview.substring(0, maxLength) + '...';
        }

        postItem.innerHTML = `
            <h2 class="post-list-title">${post.title}</h2>
            <p class="post-list-date">Published at ${formattedDate}</p>
            <p class="post-list-content">${preview}</p>
            <a class="post-list-read-more" onclick="openBlogPostFromList(${JSON.stringify(post).replace(/"/g, '&quot;')})">read more</a>
        `;

        container.appendChild(postItem);
    });

    // Toggle views
    mainView.style.display = 'none';
    listView.classList.add('active');

    // Scroll to top of blog section
    document.querySelector('.blog-section').scrollIntoView({ behavior: 'smooth' });
}

// Hide category list view
function hideCategoryList() {
    const mainView = document.getElementById('blogMainView');
    const listView = document.getElementById('categoryListView');

    mainView.style.display = 'block';
    listView.classList.remove('active');

    // Scroll to top of blog section
    document.querySelector('.blog-section').scrollIntoView({ behavior: 'smooth' });
}

// Open blog post from list view
function openBlogPostFromList(post) {
    openBlogPost(post);
}

// Close modal when clicking outside
document.getElementById('blogModal').addEventListener('click', (e) => {
    if (e.target.id === 'blogModal') {
        closeModal();
    }
});

// ==== SECTION 3: PROJECT PORTFOLIO ====
// Filter Portfolio
let currentPortfolioFilter = 'all';
function filterPortfolio(category) {
    currentPortfolioFilter = category;
    
    // Update active button
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Re-render projects with filter
    renderPortfolioProjects();
}

// Portfolio List
function renderPortfolioProjects() {
    const container = document.getElementById('projectsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Filter projects based on current filter
    const filteredProjects = currentPortfolioFilter === 'all' 
        ? portfolio 
        : portfolio.filter(p => p.category === currentPortfolioFilter);
    
    filteredProjects.forEach((project, index) => {
        const categoryClass = `category-${project.category.toLowerCase()}-label`;
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        
        projectItem.innerHTML = `
            <div class="project-info">
                <span class="project-category-label ${categoryClass}">${project.category}</span>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-tech-stacks">${project.techStacks}</p>
            </div>
            <div class="project-icon-container">
                <div class="project-icon-circle" onclick="openProjectModal(${project.id})">
                    <i class="${project.icon} project-icon"></i>
                </div>
            </div>
        `;
        
        container.appendChild(projectItem);
    });
}

async function openProjectModal(projectId) {
    const modal = document.getElementById('projectModal');
    const modalHeader = document.getElementById('projectModalHeader');
    const modalBody = document.getElementById('projectModalBody');
    
    const project = portfolio.find(p => p.id === projectId);
    if (!project) return;
    
    modalHeader.innerHTML = '';
    modalBody.innerHTML = '<p>Loading...</p>';
    modal.classList.add('active');
    
    try {
        // Define sections with their config
        const sections = [
            { 
                key: 'goals', 
                title: 'Goals',
                fallbackKey: 'goalsFile' // For backward compatibility
            },
            { 
                key: 'methods', 
                title: 'Methods',
                fallbackKey: 'methodsFile'
            },
            { 
                key: 'painPoints', 
                title: 'Pain Points & Lessons Learned',
                fallbackKey: 'painPointsFile'
            },
            { 
                key: 'improvements', 
                title: 'Future Improvements',
                fallbackKey: 'improvementsFile'
            },
            { 
                key: 'impact', 
                title: 'Impact',
                fallbackKey: 'impactFile'
            }
        ];
        
        // Process each section
        const sectionPromises = sections.map(async (section) => {
            let content = '';
            
            // Check for new flexible format first
            const sectionData = project[section.key];
            
            if (!sectionData) {
                // Fallback to old file reference format
                const fileName = project[section.fallbackKey];
                if (fileName) {
                    content = await loadContentFromFile(fileName, 'portfolio/');
                }
            } else if (typeof sectionData === 'string') {
                // String: treat as file reference
                content = await loadContentFromFile(sectionData, 'portfolio/');
            } else if (typeof sectionData === 'object' && sectionData.type === 'text') {
                // Object with type='text': use direct content
                content = sectionData.content || '';
            } else if (typeof sectionData === 'object' && sectionData.content) {
                // Object with content property
                content = sectionData.content;
            } else {
                // Other cases, convert to string
                content = String(sectionData);
            }
            
            return { title: section.title, content };
        });
        
        const sectionContents = await Promise.all(sectionPromises);
        
        // Create header
        const headerHTML = `
            <h1 class="project-modal-title">${project.title}</h1>
            <p class="project-modal-tech-stacks">${project.techStacks}</p>
        `;
        
        // Create body with sections
        let bodyHTML = '';
        sectionContents.forEach(({ title, content }) => {
            if (content && content.trim()) {
                const parsedContent = marked.parse(content);
                bodyHTML += `
                    <div class="project-section">
                        <h3 class="project-section-title">${title}</h3>
                        <div class="project-section-content">
                            ${parsedContent}
                        </div>
                    </div>
                `;
            }
        });
        
        modalHeader.innerHTML = headerHTML;
        modalBody.innerHTML = bodyHTML;
        
    } catch (error) {
        console.error('Error loading project details:', error);
        modalBody.innerHTML = `
            <div style="color: #d32f2f; padding: 20px;">
                <p>Error loading project details: ${error.message}</p>
            </div>
        `;
    }
}

// Helper function to load content from file
async function loadContentFromFile(fileName, basePath = '') {
    try {
        // Add base path if not already included
        const filePath = fileName.startsWith(basePath) 
            ? fileName 
            : `${basePath}${fileName}`;
        
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Could not load file: ${fileName}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error loading file ${fileName}:`, error);
        return `**Error loading content**: ${error.message}`;
    }
}

// Function to close project modal
function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
}

// Close project modal when clicking outside
document.getElementById('projectModal').addEventListener('click', (e) => {
    if (e.target.id === 'projectModal') {
        closeProjectModal();
    }
});

// ==== FOOTER: SOCIAL MEDIA ====
const socialMedia = [
    {
        platform: 'github',
        icon: 'fab fa-github',
        url: 'https://github.com/muhammadefan',
        name: 'GitHub'
    },
    {
        platform: 'linkedin',
        icon: 'fab fa-linkedin',
        url: 'https://linkedin.com/in/muhammadefan',
        name: 'LinkedIn'
    },
    {
        platform: 'instagram',
        icon: 'fab fa-instagram',
        url: 'https://instagram.com/efanmefanaf',
        name: 'Instagram'
    }
];

// Function to render social media icons
function renderSocialMediaIcons() {
    const container = document.getElementById('socialIcons');
    if (!container) return;
    
    container.innerHTML = '';
    container.className = 'social-icons-container simple';
    
    socialMedia.forEach(social => {
        const iconLink = document.createElement('a');
        iconLink.className = 'social-icon-simple';
        iconLink.href = social.url;
        iconLink.target = '_blank';
        iconLink.rel = 'noopener noreferrer';
        iconLink.title = social.name;
        iconLink.setAttribute('data-platform', social.platform);
        
        const icon = document.createElement('i');
        icon.className = social.icon;
        
        iconLink.appendChild(icon);
        container.appendChild(iconLink);
    });
}

// ==== OTHERS ====
// Navigation function
function navigateToPage(page) {
    if (page === 'article') {
        scrollToBlog();
    } else if (page == 'portfolio'){
        scrollToPortfolio();
    } else {
        console.log('Navigating to:', page);
        alert('Navigation to ' + page + ' (functionality to be implemented)');
    }
}

// Function to scroll to blog section
function scrollToBlog() {
    const blogSection = document.querySelector('.blog-section');
    if (blogSection) {
        blogSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Function to scroll to portfolio section
function scrollToPortfolio() {
    const portfolioSection = document.querySelector('.projects-section');
    if (portfolioSection) {
        portfolioSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ========================================
// RAG (RETRIEVAL-AUGMENTED GENERATION) 
// ========================================

// Global variable to store embeddings
let embeddingsData = null;
let isEmbeddingsLoaded = false;

// Load embeddings on page load
async function loadEmbeddings() {
    try {
        console.log('📚 Loading embeddings...');
        const response = await fetch('embeddings.json');
        
        if (!response.ok) {
            throw new Error('Embeddings file not found');
        }
        
        embeddingsData = await response.json();
        isEmbeddingsLoaded = true;
        console.log(`✓ Loaded ${embeddingsData.totalDocuments} document embeddings`);
        return true;
    } catch (error) {
        console.warn('⚠ Could not load embeddings:', error.message);
        console.warn('RAG features disabled. Chatbot will work without document retrieval.');
        isEmbeddingsLoaded = false;
        return false;
    }
}

// Cosine similarity function
function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Search for relevant documents using embeddings
async function searchWithEmbeddings(query, apiKey, topK = 3) {
    if (!isEmbeddingsLoaded || !embeddingsData) {
        console.warn('Embeddings not loaded, skipping RAG');
        return [];
    }
    
    try {
        console.log('🔍 Searching for relevant documents...');
        
        // Get embedding for the query
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
            throw new Error('Could not generate query embedding');
        }
        
        const data = await response.json();
        const queryEmbedding = data.embedding.values;
        
        // Calculate similarity with all documents
        const similarities = embeddingsData.embeddings.map(doc => ({
            id: doc.id,
            title: doc.title,
            type: doc.type,
            category: doc.category,
            similarity: cosineSimilarity(queryEmbedding, doc.embedding),
            metadata: doc.metadata || {}
        }));
        
        // Sort by similarity and return top K
        const topResults = similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);
        
        console.log(`✓ Found ${topResults.length} relevant documents`);
        topResults.forEach(result => {
            console.log(`  - ${result.title} (similarity: ${result.similarity.toFixed(3)})`);
        });
        
        return topResults;
        
    } catch (error) {
        console.error('Error in semantic search:', error);
        return [];
    }
}

// Load document content for retrieved results
async function loadDocumentContent(docId, docType) {
    try {
        // Find the document in original data
        let contentFile = null;
        
        if (docType === 'blog') {
            // Load from blog posts
            const blogResponse = await fetch('assets/blog-posts.json');
            const blogPosts = await blogResponse.json();
            const blogId = parseInt(docId.replace('blog-', ''));
            const post = blogPosts.find(p => p.id === blogId);
            
            if (post) {
                contentFile = post.contentFile.startsWith('blog-posts/') 
                    ? post.contentFile 
                    : `blog-posts/${post.contentFile}`;
            }
        } else if (docType === 'private') {
            // Load from private documents
            const privateResponse = await fetch('assets/private-documents.json');
            const privateDocs = await privateResponse.json();
            const doc = privateDocs.find(d => d.id === docId);
            
            if (doc) {
                contentFile = doc.contentFile;
            }
        }
        
        if (contentFile) {
            const contentResponse = await fetch(contentFile);
            return await contentResponse.text();
        }
        
        return null;
    } catch (error) {
        console.error(`Error loading content for ${docId}:`, error);
        return null;
    }
}

// MODIFIED sendQuestion function with RAG
async function sendQuestion() {
    const input = document.getElementById('questionInput');
    const question = input.value.trim();
    
    if (!question) {
        alert('Please write a question first');
        return;
    }
    
    const chatHistory = document.getElementById('chatHistory');
    const loading = document.getElementById('loading');
    const sendBtn = document.getElementById('sendBtn');
    
    // Add user question to chat
    addChatMessage('Your question', question, 'question-box');
    
    // Clear input and disable send button
    input.value = '';
    loading.classList.add('active');
    sendBtn.disabled = true;
    
    try {
        let answer;
        let apiKey;
        
        // Get API key based on environment
        if (CONFIG.isLocal && typeof LOCAL_CONFIG !== 'undefined') {
            apiKey = LOCAL_CONFIG.GEMINI_API_KEY;
        } else {
            // For production, you'll need to modify this based on your setup
            // Option 1: Use Netlify function that handles API key
            // Option 2: Use a different approach
            throw new Error('Production RAG not yet configured. Please see documentation.');
        }
        
        // RAG: Search for relevant documents
        let relevantDocs = [];
        let context = '';
        
        if (isEmbeddingsLoaded) {
            console.log('🤖 Using RAG (Retrieval-Augmented Generation)');
            relevantDocs = await searchWithEmbeddings(question, apiKey, 3);
            
            // Load content for top results
            const docContents = await Promise.all(
                relevantDocs.map(async (doc) => {
                    const content = await loadDocumentContent(doc.id, doc.type);
                    return content ? {
                        title: doc.title,
                        content: content,
                        type: doc.type,
                        similarity: doc.similarity
                    } : null;
                })
            );
            
            // Filter out nulls and build context
            const validDocs = docContents.filter(doc => doc !== null);
            
            if (validDocs.length > 0) {
                context = validDocs
                    .map(doc => `Document: ${doc.title}\nType: ${doc.type}\nContent: ${doc.content}`)
                    .join('\n\n---\n\n');
                
                console.log(`✓ Using ${validDocs.length} documents as context`);
            }
        } else {
            console.log('⚠ RAG not available, using direct response');
        }
        
        // Build prompt with or without context
        let prompt;
        if (context) {
            prompt = `You are a helpful AI assistant for a personal website/blog. Answer the user's question based on the following documents from the website.

IMPORTANT INSTRUCTIONS:
- Answer based ONLY on the information in the provided documents
- If the answer is not in the documents, politely say you don't have that information in the knowledge base
- Be conversational and helpful
- Keep your answer concise but complete
- If you reference information, mention which document it came from

Documents from the website:
${context}

User Question: ${question}

Answer:`;
        } else {
            // Fallback without RAG
            prompt = `You are a helpful AI assistant. Please answer the following question concisely and helpfully:

${question}`;
        }
        
        // Call Gemini API
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
            throw new Error(errorData.error?.message || 'API request failed');
        }
        
        const data = await response.json();
        answer = data.candidates[0].content.parts[0].text;
        
        // Add AI response to chat with sources (if using RAG)
        let messageText = answer;
        if (relevantDocs.length > 0) {
            const sources = relevantDocs.map(doc => 
                `${doc.type === 'blog' ? '📄' : '🔒'} ${doc.title}`
            ).join(', ');
            messageText += `\n\n**Sources used:** ${sources}`;
        }
        
        addChatMessage('AI response', messageText, 'response-box');
        
    } catch (error) {
        // Add error message to chat
        addChatMessage('AI response', `❌ Error: ${error.message}`, 'response-box');
        console.error('Error:', error);
    } finally {
        loading.classList.remove('active');
        sendBtn.disabled = false;
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

// Send question to Gemini API
// async function sendQuestion() {
//     const input = document.getElementById('questionInput');
//     const question = input.value.trim();
    
//     if (!question) {
//         alert('Please write a question first');
//         return;
//     }
    
//     const chatHistory = document.getElementById('chatHistory');
//     const loading = document.getElementById('loading');
//     const sendBtn = document.getElementById('sendBtn');
    
//     // Add user question to chat
//     addChatMessage('Your question', question, 'question-box');
    
//     // Clear input and disable send button
//     input.value = '';
//     loading.classList.add('active');
//     sendBtn.disabled = true;
    
//     try {
//         let answer;
        
//         if (CONFIG.isLocal && typeof LOCAL_CONFIG !== 'undefined') {
//             // LOCAL DEVELOPMENT: Call Gemini API directly
//             console.log('📍 Making direct API call (local mode)');
            
//             const response = await fetch(
//                 `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${LOCAL_CONFIG.GEMINI_API_KEY}`,
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({
//                         contents: [{
//                             parts: [{
//                                 text: question
//                             }]
//                         }]
//                     })
//                 }
//             );
            
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.error?.message || 'API request failed');
//             }
            
//             const data = await response.json();
//             answer = data.candidates[0].content.parts[0].text;
            
//         } else {
//             // PRODUCTION: Use Netlify proxy
//             console.log('📍 Calling via Netlify proxy (production mode)');
            
//             const response = await fetch(CONFIG.netlifyFunctionUrl, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     question: question
//                 })
//             });
            
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
            
//             const data = await response.json();
            
//             if (!data.success) {
//                 throw new Error(data.error || 'Unknown error');
//             }
            
//             answer = data.answer;
//         }
        
//         // Add AI response to chat
//         addChatMessage('AI response', answer, 'response-box');
        
//     } catch (error) {
//         // Add error message to chat
//         addChatMessage('AI response', `❌ Error: ${error.message}`, 'response-box');
//         console.error('Error:', error);
//     } finally {
//         loading.classList.remove('active');
//         sendBtn.disabled = false;
//         chatHistory.scrollTop = chatHistory.scrollHeight;
//     }
// }

// Helper function to add messages to chat
function addChatMessage(label, text, boxClass) {
    const chatHistory = document.getElementById('chatHistory');
    
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    
    const chatLabel = document.createElement('div');
    chatLabel.className = 'chat-label';
    chatLabel.textContent = label;
    
    const chatBox = document.createElement('div');
    chatBox.className = `chat-box ${boxClass}`;

    const isSimpleText = text.trim().split('\n').length === 1 && 
                        !text.includes('**') && 
                        !text.includes('*') && 
                        !text.includes('`') && 
                        !text.includes('#') &&
                        !text.includes('[') &&
                        !text.includes('- ') &&
                        !text.includes('1. ');
    
    if (isSimpleText) {
        chatBox.textContent = text;
    } else {
        chatBox.innerHTML = marked.parse(text);
    }
    
    chatItem.appendChild(chatLabel);
    chatItem.appendChild(chatBox);
    chatHistory.appendChild(chatItem);
    
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Allow Enter key to send question
document.getElementById('questionInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendQuestion();
    }
});