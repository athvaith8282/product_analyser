// Background script for Chrome extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background script received message:', request.action);
    
    if (request.action === 'analyzeProduct') {
        console.log('Starting Gemini analysis...');
        analyzeProductWithGemini(request.productData, request.apiKey, request.langfuseConfig)
            .then(result => {
                console.log('Gemini analysis successful:', result);
                sendResponse({ success: true, data: result });
            })
            .catch(error => {
                console.error('Gemini analysis failed:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep message channel open for async response
    }
    
    console.log('Unknown action:', request.action);
    sendResponse({ success: false, error: 'Unknown action' });
});

// Analyze product using Google Gemini API
async function analyzeProductWithGemini(productData, apiKey, langfuseConfig = null) {
    try {
        console.log('API Key length:', apiKey ? apiKey.length : 'undefined');
        console.log('Product data:', productData);
        
        if (!apiKey) {
            throw new Error('API key is required');
        }
        
        // Prepare the prompt for Gemini
        const prompt = createAnalysisPrompt(productData);
        console.log('Prompt created, length:', prompt.length);
        
        // Call Gemini API with response schema enforcement
        let response;
        try {
            response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "object",
                            properties: {
                                "Product name": { type: "string" },
                                "Description": { type: "string" },
                                pros: { type: "array", items: { type: "string" } },
                                cons: { type: "array", items: { type: "string" } },
                                rating: { type: "number" },
                                ratingJustification: { type: "string" },
                                "Current price": { type: "string" },
                                otherWebsitePrices: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            site: { type: "string" },
                                            price: { type: "string" }
                                        },
                                        required: ["site", "price"]
                                    }
                                },
                                recommendations: { type: "string" }
                            },
                            required: [
                                "Product name",
                                "Description",
                                "pros",
                                "cons",
                                "rating",
                                "ratingJustification",
                                "Current price",
                                "otherWebsitePrices",
                                "recommendations"
                            ]
                        }
                    }
                })
            });
        } catch (error) {
            console.log('Trying fallback model...');
            response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "object",
                            properties: {
                                "Product name": { type: "string" },
                                "Description": { type: "string" },
                                pros: { type: "array", items: { type: "string" } },
                                cons: { type: "array", items: { type: "string" } },
                                rating: { type: "number" },
                                ratingJustification: { type: "string" },
                                "Current price": { type: "string" },
                                otherWebsitePrices: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            site: { type: "string" },
                                            price: { type: "string" }
                                        },
                                        required: ["site", "price"]
                                    }
                                },
                                recommendations: { type: "string" }
                            },
                            required: [
                                "Product name",
                                "Description",
                                "pros",
                                "cons",
                                "rating",
                                "ratingJustification",
                                "Current price",
                                "otherWebsitePrices",
                                "recommendations"
                            ]
                        }
                    }
                })
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error:', errorData);
            throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid response from Gemini API');
        }

        const analysisText = data.candidates[0].content.parts[0].text;
        
        // Try to parse the response as JSON, fallback to raw text
        let result;
        try {
            result = JSON.parse(analysisText);
        } catch {
            result = parseAnalysisText(analysisText);
        }

        // Track with Langfuse if configuration is provided
        if (langfuseConfig && langfuseConfig.secretKey && langfuseConfig.publicKey && langfuseConfig.host) {
            try {
                await trackWithLangfuse(productData, prompt, analysisText, result, langfuseConfig);
            } catch (langfuseError) {
                console.warn('Langfuse tracking failed:', langfuseError);
                // Don't fail the main operation if Langfuse tracking fails
            }
        }

        return result;
    } catch (error) {
        console.error('Error analyzing product with Gemini:', error);
        throw error;
    }
}

// Create the analysis prompt for Gemini
function createAnalysisPrompt(productData) {
    return `You are a product analyst. I will provide you with product url from amazon.in a merchant page. Your job is to 
1.)Identify the product,price,features and read the reviews from the page.
2.)Compare the product price with other merchant sites in india.
3.)Check product price history and give lowest,highest and avg price
4.)Give Product Rating (out of 5) with justification.
5.)List of pros and cons 
6.)Other options in this category in the similar price range.
7.)Provide a short product overview (1-2 sentences) and a short description (1-2 sentences). Be precise.

Product Details:
URL: 
    ${productData.url || 'N/A'}
PRODUCT_DETAILS:
    ${productData.title || 'N/A'}
    ${productData.price || 'N/A'}

Output format should be a proper Json with no extra spacing,colons

Output JSON shape (valid JSON only):
{
  "Product name" : "Name of the product",
  "Description": "1-2 sentences description",
  "pros": ["short point", "short point", "short point"],
  "cons": ["short point", "short point"],
  "rating": 4.2,
  "ratingJustification": "short reason",
  "Current price": "Price from a current Url",
  "otherWebsitePrices": [
    {"site": "FlipKart", "price": "₹24,999"},
    {"site": "Chroma", "price": "₹25,499"}
  ],
  "recommendations": "product recommendations in same range and category"
}

Notes:
- If unsure about price give N/A.`;
}

// Parse analysis text if JSON parsing fails
function parseAnalysisText(text) {
    // Try to extract structured information from the text
    const result = {
        description: extractSection(text, 'Product Overview', 'description'),
        keyFeatures: extractSection(text, 'Key Features', 'features'),
        reviewSummary: extractSection(text, 'User Reviews', 'reviews'),
        pros: extractList(text, 'Pros', 'pros'),
        cons: extractList(text, 'Cons', 'cons'),
        rating: extractRating(text),
        ratingJustification: extractSection(text, 'Justification', 'justification'),
        priceAnalysis: extractSection(text, 'Price Analysis', 'price'),
        amazonPrice: 'N/A',
        flipkartPrice: 'N/A',
        cromaPrice: 'N/A',
        highestPrice: 'N/A',
        lowestPrice: 'N/A',
        averagePrice: 'N/A',
        recommendations: extractSection(text, 'Recommendations', 'recommendations')
    };

    return result;
}

// Helper function to extract sections from text
function extractSection(text, sectionName, fallback) {
    const patterns = [
        new RegExp(`${sectionName}[\\s\\S]*?([^\\n]+)`, 'i'),
        new RegExp(`${fallback}[\\s\\S]*?([^\\n]+)`, 'i')
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    return 'N/A';
}

// Helper function to extract lists
function extractList(text, sectionName, fallback) {
    const patterns = [
        new RegExp(`${sectionName}[\\s\\S]*?([\\s\\S]*?)(?=\\n\\n|$)`, 'i'),
        new RegExp(`${fallback}[\\s\\S]*?([\\s\\S]*?)(?=\\n\\n|$)`, 'i')
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const items = match[1]
                .split('\n')
                .map(item => item.replace(/^[-•*]\s*/, '').trim())
                .filter(item => item.length > 0);
            return items.length > 0 ? items : ['N/A'];
        }
    }

    return ['N/A'];
}

// Helper function to extract rating
function extractRating(text) {
    const ratingPatterns = [
        /rating[:\s]*(\d+\.?\d*)\/5/i,
        /(\d+\.?\d*)\/5/i,
        /(\d+\.?\d*)\s+out\s+of\s+5/i
    ];

    for (const pattern of ratingPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const rating = parseFloat(match[1]);
            if (rating >= 1 && rating <= 5) {
                return rating;
            }
        }
    }

    return 3.0; // Default rating
}

// Track LLM interaction with Langfuse
async function trackWithLangfuse(productData, prompt, response, parsedResult, langfuseConfig) {
    try {
        const langfuseHost = langfuseConfig.host.endsWith('/') 
            ? langfuseConfig.host.slice(0, -1) 
            : langfuseConfig.host;
        
        // Generate unique IDs for the trace and event
        const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create Basic Auth header (public key as username, secret key as password)
        const authString = btoa(`${langfuseConfig.publicKey}:${langfuseConfig.secretKey}`);
        
        const traceData = {
            id: eventId,
            timestamp: new Date().toISOString(),
            type: "trace-create",
            body: {
                id: traceId,
                name: "product-analysis",
                input: {
                    product_title: productData.title,
                    product_price: productData.price,
                    product_brand: productData.brand,
                    product_rating: productData.rating,
                    product_url: productData.url,
                    product_domain: productData.domain,
                    prompt: prompt
                },
                output: {
                    raw_response: response,
                    parsed_result: parsedResult
                },
                metadata: {
                    model: "gemini-2.5-pro",
                    extension_version: "1.0.0",
                    timestamp: new Date().toISOString()
                }
            }
        };

        const langfuseResponse = await fetch(`${langfuseHost}/api/public/ingestion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`
            },
            body: JSON.stringify({
                batch: [traceData]
            })
        });

        if (!langfuseResponse.ok) {
            const errorText = await langfuseResponse.text();
            throw new Error(`Langfuse API error: ${langfuseResponse.status} ${langfuseResponse.statusText} - ${errorText}`);
        }

        console.log('Successfully tracked with Langfuse:', traceId);
    } catch (error) {
        console.error('Langfuse tracking error:', error);
        throw error;
    }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Product Analyzer Pro extension installed');
    }
});
