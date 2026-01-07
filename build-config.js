// build-config.js
// Run this before starting Live Server to generate config.local.js from .env

const fs = require('fs');
const path = require('path');

console.log('🔧 Building local configuration...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env file not found!');
    console.log('📝 Create a .env file with:');
    console.log('   GEMINI_API_KEY=your_api_key_here\n');
    process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse .env into key-value pairs
const envVars = {};
envContent.split('\n').forEach(line => {
    line = line.trim();
    // Skip empty lines and comments
    if (line && !line.startsWith('#')) {
        const equalIndex = line.indexOf('=');
        if (equalIndex > 0) {
            const key = line.substring(0, equalIndex).trim();
            const value = line.substring(equalIndex + 1).trim();
            envVars[key] = value;
        }
    }
});

// Validate required keys
if (!envVars.GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY not found in .env file!\n');
    process.exit(1);
}

// Generate config.local.js
const configContent = `// ⚠️ AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// This file is generated from .env by build-config.js
// DO NOT COMMIT THIS FILE TO GIT!

const LOCAL_CONFIG = {
    GEMINI_API_KEY: '${envVars.GEMINI_API_KEY}',
    IS_LOCAL: true
};

console.log('✅ Local config loaded');
`;

// Write config.local.js
fs.writeFileSync(path.join(__dirname, 'config.local.js'), configContent);

console.log('✅ config.local.js generated successfully!');
console.log('📦 Configuration loaded:');
console.log(`   - GEMINI_API_KEY: ${envVars.GEMINI_API_KEY.substring(0, 10)}...`);
console.log('\n🚀 You can now start Live Server!\n');