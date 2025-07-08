# Golang Unit Test Generator Chrome Extension

A powerful Chrome extension that leverages AI to generate comprehensive unit tests for your Go/Golang code. Built with modern web technologies and integrated with multiple AI models for optimal test generation.

![Extension Logo](assets/logo.png)

## 🚀 Features

### Core Functionality
- **AI-Powered Test Generation**: Generate unit tests using advanced LLM models
- **Multiple AI Models**: Support for Mixtral, GPT, DeepSeek, and other models
- **File Upload Support**: Upload Go files directly for test generation
- **Smart Code Detection**: Automatically detects Go language and provides appropriate suggestions
- **Real-time Validation**: Ensures queries are related to testing and Go development

### User Interface
- **Side Panel Integration**: Seamless Chrome side panel experience
- **Dark/Light Theme**: Toggle between themes for comfortable usage
- **Responsive Design**: Works across different screen sizes
- **Syntax Highlighting**: Beautiful code display with Prism.js integration

### Advanced Features
- **Chat History**: Keep track of all your test generation sessions
- **Model Benchmarking**: Compare performance across different AI models
- **Timer Integration**: Built-in timer for productivity tracking
- **File Generator**: Export generated tests to files
- **Quick Actions**: Fast access to common testing tasks

## 📦 Installation

### Method 1: Load Unpacked Extension (Development)

1. **Download the Extension**
   \`\`\`bash
   git clone https://github.com/Rizald95/golang0-unit-test
   cd golang0-unit-test
   \`\`\`

2. **Open Chrome Extensions Page**
   - Navigate to \`chrome://extensions/\`
   - Enable "Developer mode" (toggle in top right)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the extension folder
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Golang Unit Test Generator" and pin it

### Method 2: Chrome Web Store (Coming Soon)
The extension will be available on the Chrome Web Store for easy installation.

## ⚙️ Configuration

### API Key Setup
The extension uses Groq API by default. To use your own API key:

1. Open the extension options page
2. Navigate to Settings
3. Enter your API key for the desired service
4. Save the configuration

### Supported AI Providers
- **Groq** (Default): Fast inference with Mixtral models
- **OpenAI**: GPT-3.5 and GPT-4 models
- **DeepSeek**: Advanced reasoning capabilities
- **Custom APIs**: Configure your own endpoints

## 🎯 Usage

### Basic Usage

1. **Open the Extension**
   - Click the extension icon or use the side panel
   - The interface will open with a welcome message

2. **Enter Your Query**
   - Type your testing-related question
   - Upload a Go file if needed
   - Select your preferred AI model

3. **Generate Tests**
   - Click Send or press Enter
   - Wait for the AI to generate comprehensive tests
   - Copy the generated code to your project

### Example Queries

\`\`\`
Generate unit tests for a Go function that calculates fibonacci numbers

Create table-driven tests for my HTTP handler function

Write benchmark tests for my sorting algorithm

Generate mocks for my database interface
\`\`\`

### File Upload

1. Click the file upload button (📎)
2. Select your Go source file
3. The file content will be loaded into the input
4. Ask for specific test generation based on the code

## 🛠️ Development

### Project Structure

\`\`\`
golang0-unit-test/
├── assets/                 # Icons and images
├── options/               # Extension options pages
│   ├── index.html        # Main settings page
│   ├── chatHistory.html  # Chat history viewer
│   ├── modelBenchmark.html # Model comparison
│   └── ...
├── manifest.json         # Extension manifest
├── popup.html           # Main extension popup
├── popup.js            # Main extension logic
├── background.js       # Service worker
├── style.css          # Main styles
└── README.md          # This file
\`\`\`

### Key Files

- **\`manifest.json\`**: Extension configuration and permissions
- **\`popup.js\`**: Main application logic and AI integration
- **\`fileHandler.js\`**: File upload and language detection
- **\`background.js\`**: Service worker for extension lifecycle
- **\`options/\`**: Settings and configuration pages

### Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI Integration**: Groq API, OpenAI API
- **Code Highlighting**: Prism.js
- **Storage**: Chrome Storage API
- **UI Framework**: Custom CSS with modern design patterns

### Development Setup

1. **Clone the Repository**
   \`\`\`bash
   git clone https://github.com/Rizald95/golang0-unit-test
   cd golang0-unit-test
   \`\`\`

2. **Install Dependencies**
   No build process required - pure vanilla JavaScript

3. **Load in Chrome**
   - Follow the installation instructions above
   - Make changes to the code
   - Reload the extension in \`chrome://extensions/\`

4. **Testing**
   - Test with various Go code samples
   - Verify AI model switching
   - Check file upload functionality

## 🎨 Customization

### Themes
The extension supports both light and dark themes:
- Toggle using the theme button in the interface
- Preference is saved automatically
- Consistent across all extension pages

### Models
Add new AI models by modifying the model selector in \`popup.js\`:

\`\`\`javascript
// Add new model option
const newModel = {
  id: "new-model-id",
  name: "New Model Name",
  icon: "assets/new-model-icon.png"
};
\`\`\`

## 📊 Features Overview

| Feature | Description | Status |
|---------|-------------|--------|
| AI Test Generation | Generate unit tests using AI | ✅ Active |
| Multiple Models | Support for various AI models | ✅ Active |
| File Upload | Upload Go files for analysis | ✅ Active |
| Chat History | Track conversation history | ✅ Active |
| Theme Toggle | Light/Dark mode support | ✅ Active |
| Model Benchmarking | Compare model performance | ✅ Active |
| Timer Integration | Built-in productivity timer | ✅ Active |
| Export Functionality | Save generated tests to files | ✅ Active |

## 🔒 Privacy & Security

- **Local Storage**: Chat history stored locally in Chrome
- **API Keys**: Stored securely in Chrome storage
- **No Data Collection**: Extension doesn't collect personal data
- **Secure Communication**: All API calls use HTTPS

## 🐛 Troubleshooting

### Common Issues

**Extension Not Loading**
- Ensure Developer mode is enabled
- Check for JavaScript errors in DevTools
- Verify all files are present

**API Errors**
- Check your API key configuration
- Verify internet connection
- Ensure API service is available

**File Upload Issues**
- Check file size (should be reasonable)
- Ensure file is a valid text file
- Verify file permissions

### Debug Mode

Enable debug logging by opening DevTools:
1. Right-click the extension popup
2. Select "Inspect"
3. Check Console for detailed logs

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Contribution Guidelines

- Follow existing code style
- Add comments for complex logic
- Test with multiple AI models
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Groq**: For providing fast AI inference
- **Prism.js**: For beautiful syntax highlighting
- **Chrome Extensions API**: For the platform
- **Go Community**: For inspiration and feedback

## 📞 Support

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join our GitHub Discussions
- **Email**: Contact us at support@example.com

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Basic AI test generation
- Multiple model support
- File upload functionality
- Chat history
- Theme support

---

**Made with ❤️ for the Go community**

*Generate better tests, write better code.*