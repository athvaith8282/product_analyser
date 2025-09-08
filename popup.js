// DOM elements
const setupSection = document.getElementById('setup-section');
const analysisSection = document.getElementById('analysis-section');
const resultsSection = document.getElementById('results-section');
const errorSection = document.getElementById('error-section');
const loading = document.getElementById('loading');

const apiKeyInput = document.getElementById('api-key');
const toggleVisibilityBtn = document.getElementById('toggle-visibility');
const saveApiKeyBtn = document.getElementById('save-api-key');
const analyzeProductBtn = document.getElementById('analyze-product');
const newAnalysisBtn = document.getElementById('new-analysis');
const retryBtn = document.getElementById('retry-btn');

// Langfuse elements
const langfuseSecretKeyInput = document.getElementById('langfuse-secret-key');
const langfusePublicKeyInput = document.getElementById('langfuse-public-key');
const langfuseHostInput = document.getElementById('langfuse-host');
const toggleLangfuseSecretBtn = document.getElementById('toggle-langfuse-secret');
const toggleLangfusePublicBtn = document.getElementById('toggle-langfuse-public');

const resultsContent = document.getElementById('results-content');
const errorMessage = document.getElementById('error-message');
const langfuseStatus = document.getElementById('langfuse-status');

// State
let isApiKeyVisible = false;
let currentApiKey = '';
let isLangfuseSecretVisible = false;
let isLangfusePublicVisible = false;
let langfuseConfig = {
    secretKey: '',
    publicKey: '',
    host: ''
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const isAmazonIn = tab && /^https?:\/\/www\.amazon\.in\//.test(tab.url || '');
        if (!isAmazonIn) {
            showAmazonOnlyMessage();
            return;
        }
    } catch (e) {
        // If tab cannot be read, fail closed and show message
        showAmazonOnlyMessage();
        return;
    }

    await loadApiKey();
    await loadLangfuseConfig();
    updateUI();
    setupEventListeners();
});

// Load API key from storage
async function loadApiKey() {
    try {
        const result = await chrome.storage.sync.get(['geminiApiKey']);
        currentApiKey = result.geminiApiKey || '';
        if (currentApiKey) {
            apiKeyInput.value = currentApiKey;
        }
    } catch (error) {
        console.error('Error loading API key:', error);
    }
}

// Load Langfuse configuration from storage
async function loadLangfuseConfig() {
    try {
        const result = await chrome.storage.sync.get(['langfuseConfig']);
        if (result.langfuseConfig) {
            langfuseConfig = result.langfuseConfig;
            if (langfuseConfig.secretKey) {
                langfuseSecretKeyInput.value = langfuseConfig.secretKey;
            }
            if (langfuseConfig.publicKey) {
                langfusePublicKeyInput.value = langfuseConfig.publicKey;
            }
            if (langfuseConfig.host) {
                langfuseHostInput.value = langfuseConfig.host;
            }
        }
    } catch (error) {
        console.error('Error loading Langfuse config:', error);
    }
}

// Update UI based on current state
function updateUI() {
    if (currentApiKey) {
        setupSection.style.display = 'none';
        analysisSection.style.display = 'block';
        resultsSection.style.display = 'none';
        errorSection.style.display = 'none';
    } else {
        setupSection.style.display = 'block';
        analysisSection.style.display = 'none';
        resultsSection.style.display = 'none';
        errorSection.style.display = 'none';
    }
    
    // Show/hide Langfuse status
    if (langfuseConfig && langfuseConfig.secretKey && langfuseConfig.publicKey && langfuseConfig.host) {
        langfuseStatus.style.display = 'block';
    } else {
        langfuseStatus.style.display = 'none';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Toggle API key visibility
    toggleVisibilityBtn.addEventListener('click', () => {
        isApiKeyVisible = !isApiKeyVisible;
        apiKeyInput.type = isApiKeyVisible ? 'text' : 'password';
        
        const icon = toggleVisibilityBtn.querySelector('svg');
        if (isApiKeyVisible) {
            icon.innerHTML = `
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                <path d="M9 9L15 15" stroke="currentColor" stroke-width="2"/>
                <path d="M15 9L9 15" stroke="currentColor" stroke-width="2"/>
            `;
        } else {
            icon.innerHTML = `
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            `;
        }
    });

    // Toggle Langfuse secret key visibility
    toggleLangfuseSecretBtn.addEventListener('click', () => {
        isLangfuseSecretVisible = !isLangfuseSecretVisible;
        langfuseSecretKeyInput.type = isLangfuseSecretVisible ? 'text' : 'password';
        
        const icon = toggleLangfuseSecretBtn.querySelector('svg');
        if (isLangfuseSecretVisible) {
            icon.innerHTML = `
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                <path d="M9 9L15 15" stroke="currentColor" stroke-width="2"/>
                <path d="M15 9L9 15" stroke="currentColor" stroke-width="2"/>
            `;
        } else {
            icon.innerHTML = `
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            `;
        }
    });

    // Toggle Langfuse public key visibility
    toggleLangfusePublicBtn.addEventListener('click', () => {
        isLangfusePublicVisible = !isLangfusePublicVisible;
        langfusePublicKeyInput.type = isLangfusePublicVisible ? 'text' : 'password';
        
        const icon = toggleLangfusePublicBtn.querySelector('svg');
        if (isLangfusePublicVisible) {
            icon.innerHTML = `
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                <path d="M9 9L15 15" stroke="currentColor" stroke-width="2"/>
                <path d="M15 9L9 15" stroke="currentColor" stroke-width="2"/>
            `;
        } else {
            icon.innerHTML = `
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            `;
        }
    });

    // Save API key and Langfuse configuration
    saveApiKeyBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            showError('Please enter a valid API key');
            return;
        }

        // Collect Langfuse configuration
        const newLangfuseConfig = {
            secretKey: langfuseSecretKeyInput.value.trim(),
            publicKey: langfusePublicKeyInput.value.trim(),
            host: langfuseHostInput.value.trim()
        };

        try {
            // Save both API key and Langfuse config
            await chrome.storage.sync.set({ 
                geminiApiKey: apiKey,
                langfuseConfig: newLangfuseConfig
            });
            currentApiKey = apiKey;
            langfuseConfig = newLangfuseConfig;
            updateUI();
        } catch (error) {
            console.error('Error saving configuration:', error);
            showError('Failed to save configuration. Please try again.');
        }
    });

    // Analyze product
    analyzeProductBtn.addEventListener('click', async () => {
        try {
            showLoading();
            console.log('Starting product analysis...');
            
            // Ensure minimum loading time for visibility
            const startTime = Date.now();
            const minLoadingTime = 1000; // 1 second minimum
            
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('Current tab:', tab.url);
            
            // Ensure we are on amazon.in
            const isAmazonIn = /^https?:\/\/www\.amazon\.in\//.test(tab.url);
            if (!isAmazonIn) {
                showError('This extension only works on amazon.in product pages');
                return;
            }

            // Inject content script if needed and send message
            console.log('Injecting content script...');
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
                console.log('Content script injected successfully');
            } catch (error) {
                console.log('Content script already injected or error:', error.message);
            }
            
            // Wait a moment for the script to initialize
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Send message to content script to extract product data
            console.log('Sending message to content script...');
            let response;
            try {
                response = await chrome.tabs.sendMessage(tab.id, { action: 'extractProductData' });
                console.log('Content script response:', response);
            } catch (error) {
                console.error('Failed to send message to content script:', error);
                // Try to inject and retry
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    });
                    await new Promise(resolve => setTimeout(resolve, 200));
                    response = await chrome.tabs.sendMessage(tab.id, { action: 'extractProductData' });
                    console.log('Content script response after retry:', response);
                } catch (retryError) {
                    console.error('Retry also failed:', retryError);
                    throw new Error('Could not establish connection with content script. Please refresh the page and try again.');
                }
            }
            
            if (response && response.success) {
                console.log('Product data extracted successfully:', response.data);
                
                // Send data to background script for analysis
                console.log('Sending data to background script for analysis...');
                const analysisResult = await chrome.runtime.sendMessage({
                    action: 'analyzeProduct',
                    productData: response.data,
                    apiKey: currentApiKey,
                    langfuseConfig: langfuseConfig
                });
                console.log('Background script response:', analysisResult);

                if (analysisResult && analysisResult.success && analysisResult.data) {
                    console.log('Analysis successful, displaying results...');
                    // Ensure minimum loading time
                    const elapsed = Date.now() - startTime;
                    const remainingTime = Math.max(0, minLoadingTime - elapsed);
                    setTimeout(() => {
                        displayResults(analysisResult.data);
                    }, remainingTime);
                } else {
                    console.error('Analysis failed:', analysisResult);
                    const errorMsg = analysisResult?.error || 'Failed to analyze product';
                    // Ensure minimum loading time even for errors
                    const elapsed = Date.now() - startTime;
                    const remainingTime = Math.max(0, minLoadingTime - elapsed);
                    setTimeout(() => {
                        showError(errorMsg);
                    }, remainingTime);
                }
            } else {
                console.error('Content script failed:', response);
                // Try fallback extraction
                console.log('Trying fallback extraction...');
                try {
                    const fallbackData = await extractProductDataFallback(tab.id);
                    if (fallbackData) {
                        console.log('Fallback extraction successful:', fallbackData);
                        const analysisResult = await chrome.runtime.sendMessage({
                            action: 'analyzeProduct',
                            productData: fallbackData,
                            apiKey: currentApiKey,
                            langfuseConfig: langfuseConfig
                        });
                        
                        if (analysisResult && analysisResult.success && analysisResult.data) {
                            // Ensure minimum loading time
                            const elapsed = Date.now() - startTime;
                            const remainingTime = Math.max(0, minLoadingTime - elapsed);
                            setTimeout(() => {
                                displayResults(analysisResult.data);
                            }, remainingTime);
                        } else {
                            const errorMsg = analysisResult?.error || 'Failed to analyze product';
                            // Ensure minimum loading time even for errors
                            const elapsed = Date.now() - startTime;
                            const remainingTime = Math.max(0, minLoadingTime - elapsed);
                            setTimeout(() => {
                                showError(errorMsg);
                            }, remainingTime);
                        }
                    } else {
                        showError('Could not extract product information from this page. Please make sure you are on a product page.');
                    }
                } catch (fallbackError) {
                    console.error('Fallback extraction failed:', fallbackError);
                    showError('Could not extract product information from this page. Please make sure you are on a product page.');
                }
            }
        } catch (error) {
            console.error('Error analyzing product:', error);
            showError(`Failed to analyze product: ${error.message}`);
        }
    });

    // New analysis
    newAnalysisBtn.addEventListener('click', () => {
        updateUI();
    });

    // Retry button
    retryBtn.addEventListener('click', () => {
        updateUI();
    });
}

// Show loading state
function showLoading() {
    console.log('Showing loading state...');
    
    // Hide all other sections
    analysisSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
    
    // Show loading with animation
    loading.style.display = 'block';
    loading.style.visibility = 'visible';
    loading.style.opacity = '1';
    loading.style.transform = 'scale(1)';
    
    // Force a reflow to ensure the element is visible
    loading.offsetHeight;
    
    console.log('Loading state should now be visible');
}

// Show error
function showError(message) {
    loading.style.display = 'none';
    analysisSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'block';
    errorMessage.textContent = message;
}

// Show message when not on amazon.in
function showAmazonOnlyMessage() {
    try {
        if (loading) loading.style.display = 'none';
        if (setupSection) setupSection.style.display = 'none';
        if (analysisSection) analysisSection.style.display = 'none';
        if (resultsSection) resultsSection.style.display = 'none';
        if (errorSection) errorSection.style.display = 'none';

        const container = document.createElement('div');
        container.style.padding = '16px';
        container.style.width = '320px';
        container.style.maxWidth = '360px';
        container.innerHTML = `
            <div class="result-section" style="text-align:center;">
                <h3 style="display:flex;align-items:center;gap:8px;justify-content:center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                    Works only on amazon.in
                </h3>
                <p style="color:#4b5563;line-height:1.6;margin-top:8px;">Open a product page on <strong>https://www.amazon.in</strong> to analyze.</p>
            </div>
        `;
        document.body.innerHTML = '';
        document.body.appendChild(container);
    } catch (_) {
        // As a fallback, alert
        alert('This extension works only on amazon.in');
    }
}

// Display analysis results
function displayResults(data) {
    try {
        console.log('Displaying results with data:', data);
        
        loading.style.display = 'none';
        analysisSection.style.display = 'none';
        errorSection.style.display = 'none';
        resultsSection.style.display = 'block';

        // Parse the AI response and format it
        const formattedData = formatAnalysisResults(data);
        resultsContent.innerHTML = formattedData;
    } catch (error) {
        console.error('Error displaying results:', error);
        showError(`Error displaying results: ${error.message}`);
    }
}

// Format analysis results for display
function formatAnalysisResults(data) {
    try {
        // Try to parse as JSON first
        let analysis;
        if (typeof data === 'string') {
            try {
                analysis = JSON.parse(data);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                analysis = { description: data };
            }
        } else if (data && typeof data === 'object') {
            analysis = data;
        } else {
            console.error('Invalid data type:', typeof data, data);
            analysis = { description: 'Invalid data received' };
        }

        // Build competitor prices section if provided by the model
        const competitorPricesHtml = (() => {
            const list = Array.isArray(analysis.otherWebsitePrices) ? analysis.otherWebsitePrices : [];
            if (list.length === 0) return '';
            return `
                <div class="price-comparison">
                    ${list.map(p => `
                        <div class="price-item">
                            <div class="platform">${p.site}</div>
                            <div class="price">${p.price}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        })();

        return `
            <div class="result-section">
                <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                    📋 Product Overview
                </h3>
                <div style="margin-bottom: 16px;">
                    <h4 style="color: #374151; margin-bottom: 8px; font-size: 16px;">Product</h4>
                    <p style="line-height: 1.6; margin-bottom: 12px;">${analysis["Product name"] || analysis.Product_name || 'N/A'}</p>
                </div>
                <div style="margin-bottom: 16px;">
                    <h4 style="color: #374151; margin-bottom: 8px; font-size: 16px;">Description</h4>
                    <p style="line-height: 1.6; margin-bottom: 12px;">${analysis["Description"] || analysis.description || 'No description available'}</p>
                </div>
            </div>

            <div class="result-section">
                <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2"/>
                        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    ⚖️ Pros and Cons
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4 style="color: #059669; margin-bottom: 12px; font-size: 16px; font-weight: 600;">✅ Advantages</h4>
                        ${renderBulletList(analysis.pros)}
                    </div>
                    <div>
                        <h4 style="color: #dc2626; margin-bottom: 12px; font-size: 16px; font-weight: 600;">❌ Disadvantages</h4>
                        ${renderBulletList(analysis.cons)}
                    </div>
                </div>
            </div>

            <div class="result-section">
                <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9L15.09 9.74L12 16L8.91 9.74L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                    ⭐ Product Rating
                </h3>
                <div class="rating" style="margin-bottom: 16px;">
                    <span style="font-size: 16px; font-weight: 600;">Rating:</span>
                    <div class="stars" style="margin: 0 8px;">
                        ${generateStars(analysis.rating || 0)}
                    </div>
                    <span style="font-size: 16px; font-weight: 600;">${analysis.rating || 0}/5</span>
                </div>
                <div>
                    <h4 style="color: #374151; margin-bottom: 8px; font-size: 16px;">Justification</h4>
                    <p style="line-height: 1.6;">${analysis.ratingJustification || 'No justification provided'}</p>
                </div>
            </div>

            ${(analysis["Current price"] || competitorPricesHtml) ? `
            <div class="result-section">
                <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2V22M17 5H9.5C8.11929 5 7 6.11929 7 7.5S8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5S15.8807 15 14.5 15H7" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    💰 Pricing
                </h3>
                ${analysis["Current price"] ? `<div style="margin-bottom:8px; color:#374151;">Current price: <strong>${analysis["Current price"]}</strong></div>` : ''}
                ${competitorPricesHtml}
            </div>
            ` : ''}

            ${analysis.recommendations ? `
            <div class="result-section">
                <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    💡 Recommendations
                </h3>
                <p style="line-height: 1.6;">${analysis.recommendations}</p>
            </div>
            ` : ''}
        `;
    } catch (error) {
        // If parsing fails, display raw data
        return `
            <div class="result-section">
                <h3>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Analysis Results
                </h3>
                <div style="white-space: pre-wrap; font-family: monospace; font-size: 13px; line-height: 1.5;">
                    ${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
                </div>
            </div>
        `;
    }
}

// Helper function to format text with bullets
function formatTextWithBullets(text) {
    if (!text) return 'No information available';
    
    // If text already contains bullet points, return as is
    if (text.includes('•') || text.includes('-') || text.includes('*')) {
        return text;
    }
    
    // Split by common separators and format as bullets
    const lines = text.split(/[.!?]\s+/).filter(line => line.trim().length > 0);
    if (lines.length > 1) {
        return lines.map(line => `• ${line.trim()}`).join('<br>');
    }
    
    return text;
}

// Render a clean bullet list for arrays or delimited strings
function renderBulletList(value) {
    try {
        const items = Array.isArray(value)
            ? value
            : (typeof value === 'string' ? value.split(/\n|\r|\.|;|,|•|-/).map(s => s.trim()).filter(Boolean) : []);
        if (items.length === 0) return '<div style="color:#6b7280;">No items</div>';
        return `<ul style="margin-left: 16px; line-height: 1.6;">${items.map(i => `<li style=\"margin-bottom: 6px;\">${i}</li>`).join('')}</ul>`;
    } catch (_) {
        return '<div style="color:#6b7280;">No items</div>';
    }
}

// Fallback product data extraction using scripting
async function extractProductDataFallback(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                const url = window.location.href;
                const domain = window.location.hostname.toLowerCase();
                
                const productData = {
                    url: url,
                    domain: domain,
                    title: '',
                    price: '',
                    description: '',
                    images: [],
                    brand: '',
                    rating: null,
                    extractedAt: new Date().toISOString()
                };

                // Basic extraction for common sites
                if (domain.includes('amazon')) {
                    productData.title = document.querySelector('#productTitle')?.textContent?.trim() || '';
                    productData.price = document.querySelector('.a-price-whole')?.textContent?.trim() || '';
                    productData.brand = document.querySelector('#bylineInfo')?.textContent?.trim() || '';
                } else if (domain.includes('flipkart')) {
                    productData.title = document.querySelector('h1[class*="B_NuCI"]')?.textContent?.trim() || '';
                    productData.price = document.querySelector('._30jeq3._16Jk6d')?.textContent?.trim() || '';
                } else {
                    // Generic extraction
                    productData.title = document.querySelector('h1')?.textContent?.trim() || '';
                    productData.price = document.querySelector('.price, [class*="price"]')?.textContent?.trim() || '';
                }

                return productData;
            }
        });
        
        return (results && results.length > 0 && results[0] && results[0].result) ? results[0].result : null;
    } catch (error) {
        console.error('Fallback extraction error:', error);
        return null;
    }
}

// Generate star rating display
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star">★</span>';
    }
    
    if (hasHalfStar) {
        stars += '<span class="star" style="opacity: 0.5;">★</span>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<span class="star" style="opacity: 0.3;">☆</span>';
    }
    
    return stars;
}
