# Product Analyzer Pro - Chrome Extension

A powerful Chrome extension that analyzes products on merchant websites using Google Gemini AI. Get detailed product insights, ratings, pros/cons, and price analysis with just one click.

## Features

- 🤖 **AI-Powered Analysis**: Uses Google Gemini AI for intelligent product analysis
- 🛍️ **Multi-Platform Support**: Works on Amazon, Flipkart, Croma, Myntra, Nykaa, and other merchant sites
- 📊 **Comprehensive Insights**: Get product overview, pros/cons, ratings, and price analysis
- 🎨 **Beautiful UI**: Modern, responsive interface with excellent UX
- 🔒 **Secure**: API key stored locally in Chrome storage
- ⚡ **Fast**: Quick analysis with loading states and error handling

## Installation

### Method 1: Load as Unpacked Extension (Development)

1. **Download/Clone** this repository to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** by toggling the switch in the top-right corner
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

### Method 2: Package and Install

1. **Package the extension**:
   - Go to `chrome://extensions/`
   - Click "Pack extension"
   - Select the extension folder
   - Click "Pack Extension"
   - This will create a `.crx` file

2. **Install the packaged extension**:
   - Drag and drop the `.crx` file into Chrome
   - Or go to `chrome://extensions/` and click "Load unpacked"

## Setup

1. **Get a Google Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

2. **Configure the Extension**:
   - Click on the extension icon in your toolbar
   - Paste your Gemini API key in the input field
   - Click "Save API Key"
   - The extension is now ready to use!

## Usage

1. **Navigate** to any product page on supported merchant sites
2. **Click** the Product Analyzer Pro extension icon
3. **Click "Analyze This Product"** to start the analysis
4. **Wait** for the AI to process the product information
5. **View** the comprehensive analysis results including:
   - Product overview and description
   - Key features and specifications
   - Pros and cons
   - Product rating with justification
   - Price analysis and comparisons

## Supported Websites

- **Amazon** (amazon.com, amazon.in, etc.)
- **Flipkart** (flipkart.com)
- **Croma** (croma.com)
- **Myntra** (myntra.com)
- **Nykaa** (nykaa.com)
- **Generic merchant sites** (with basic product extraction)

## How It Works

1. **Product Detection**: The extension automatically detects when you're on a product page
2. **Data Extraction**: Extracts product details like title, price, description, images, and reviews
3. **AI Analysis**: Sends the data to Google Gemini AI for intelligent analysis
4. **Results Display**: Presents the analysis in a beautiful, easy-to-read format

## API Key Security

- Your API key is stored securely in Chrome's local storage
- The key is only used to communicate with Google's Gemini API
- No data is sent to any third-party servers except Google's official API
- You can clear your API key anytime by clicking "New Analysis" and re-entering it

## Troubleshooting

### Common Issues

1. **"Could not extract product information"**
   - Make sure you're on a product page (not a category or search page)
   - Try refreshing the page and analyzing again

2. **"Failed to analyze product"**
   - Check if your API key is valid and has sufficient quota
   - Ensure you have an active internet connection
   - Try again after a few seconds

3. **Extension not working on a specific site**
   - The extension works best on major e-commerce platforms
   - Some sites may have different page structures
   - Try the generic extraction mode

### Getting Help

If you encounter any issues:
1. Check the browser console for error messages
2. Ensure your API key is valid and active
3. Try refreshing the page and analyzing again
4. Check if the site is supported

## Development

### File Structure

```
├── manifest.json          # Extension manifest
├── popup.html             # Extension popup UI
├── popup.css              # Popup styles
├── popup.js               # Popup functionality
├── content.js             # Content script for data extraction
├── background.js          # Background script for API calls
├── icons/                 # Extension icons
│   ├── icon.svg          # Source icon
│   ├── icon16.png        # 16x16 icon
│   ├── icon48.png        # 48x48 icon
│   └── icon128.png       # 128x128 icon
└── README.md             # This file
```

### Customization

You can customize the extension by:
- Modifying the prompt in `background.js` to change analysis style
- Adding new merchant sites in `content.js`
- Updating the UI in `popup.html` and `popup.css`
- Adjusting the analysis format in `popup.js`

## Privacy Policy

- **Data Collection**: The extension only extracts publicly available product information
- **API Usage**: Product data is sent to Google Gemini API for analysis
- **Storage**: API key is stored locally in Chrome storage
- **No Tracking**: No user behavior or personal data is collected or tracked

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## Changelog

### Version 1.0.0
- Initial release
- Support for major e-commerce platforms
- AI-powered product analysis
- Beautiful, responsive UI
- Secure API key storage
