// Content script to extract product data from merchant sites
(function() {
    'use strict';

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('Content script received message:', request.action);
        
        if (request.action === 'extractProductData') {
            try {
                console.log('Extracting product data...');
                const productData = extractProductData();
                console.log('Product data extracted:', productData);
                sendResponse({ success: true, data: productData });
            } catch (error) {
                console.error('Error extracting product data:', error);
                sendResponse({ success: false, error: error.message });
            }
        } else {
            console.log('Unknown action in content script:', request.action);
            sendResponse({ success: false, error: 'Unknown action' });
        }
        return true; // Keep message channel open for async response
    });

    // Extract product data from the current page
    function extractProductData() {
        const url = window.location.href;
        const domain = window.location.hostname.toLowerCase();
        
        // Common product data structure
        const productData = {
            url: url,
            domain: domain,
            title: '',
            price: '',
            description: '',
            images: [],
            specifications: {},
            reviews: [],
            rating: null,
            availability: '',
            brand: '',
            category: '',
            extractedAt: new Date().toISOString()
        };

        // Only support amazon.in
        if (domain.endsWith('amazon.in')) {
            extractAmazonData(productData);
        } else {
            throw new Error('This extension only works on amazon.in product pages');
        }

        return productData;
    }

    // Amazon-specific extraction
    function extractAmazonData(data) {
        // Product title
        data.title = getTextContent('#productTitle') || 
                    getTextContent('h1[data-automation-id="product-title"]') ||
                    getTextContent('.product-title') ||
                    getTextContent('h1.a-size-large');

        // Price
        data.price = getTextContent('.a-price-whole') ||
                    getTextContent('#priceblock_dealprice') ||
                    getTextContent('#priceblock_ourprice') ||
                    getTextContent('.a-price-range') ||
                    getTextContent('.a-offscreen');

        // Description
        data.description = getTextContent('#feature-bullets ul') ||
                          getTextContent('#productDescription p') ||
                          getTextContent('#aplus_feature_div');

        // Images
        data.images = getImages('#landingImage, #imgTagWrapperId img, .a-dynamic-image');

        // Brand
        data.brand = getTextContent('#bylineInfo') ||
                    getTextContent('.brand') ||
                    getTextContent('[data-automation-id="bylineInfo"]');

        // Rating
        const ratingText = getTextContent('.a-icon-alt');
        if (ratingText) {
            const ratingMatch = ratingText.match(/(\d+\.?\d*)\s+out\s+of\s+5/);
            if (ratingMatch) {
                data.rating = parseFloat(ratingMatch[1]);
            }
        }

        // Reviews
        data.reviews = extractReviews('.review-text-content, .a-expander-content');
    }

    // Remove other-site extractors and generic extractor as not needed

    // Helper function to get text content
    function getTextContent(selector) {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : null;
    }

    // Helper function to get images
    function getImages(selector) {
        const images = document.querySelectorAll(selector);
        return Array.from(images).map(img => img.src || img.getAttribute('data-src')).filter(src => src);
    }

    // Helper function to extract reviews
    function extractReviews(selector) {
        const reviewElements = document.querySelectorAll(selector);
        return Array.from(reviewElements).map(review => review.textContent.trim()).filter(text => text.length > 10);
    }

    // Extract specifications from common patterns
    function extractSpecifications() {
        const specs = {};
        
        // Look for specification tables
        const specTables = document.querySelectorAll('table, .specifications, .product-specs');
        specTables.forEach(table => {
            const rows = table.querySelectorAll('tr, .spec-row');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, .spec-label, .spec-value');
                if (cells.length >= 2) {
                    const key = cells[0].textContent.trim();
                    const value = cells[1].textContent.trim();
                    if (key && value) {
                        specs[key] = value;
                    }
                }
            });
        });

        return specs;
    }

    // Check if current page is a product page
    function isProductPage() {
        const url = window.location.href.toLowerCase();
        const productIndicators = [
            '/product/', '/p/', '/item/', '/dp/', '/products/',
            'productid=', 'itemid=', 'pid='
        ];
        
        return productIndicators.some(indicator => url.includes(indicator)) ||
               document.querySelector('[data-testid*="product"], .product-title, .product-name, h1[class*="product"]');
    }

    // Initialize content script
    if (isProductPage()) {
        console.log('Product Analyzer: Product page detected');
    }
})();
