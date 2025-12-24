<div align="center">

# 🤖 ChatterAI UI

### *Modern & Responsive Chat Interface Template*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*A beautiful, dark-themed chat interface built with modern web technologies.*

---

</div>

## 📖 About

ChatterAI UI is a sleek, responsive frontend template designed for conversational AI applications. It features a premium dark mode aesthetic, smooth animations, and a polished user experience. This project runs entirely in the browser using HTML, CSS, and Vanilla JavaScript, making it an excellent starting point for building real AI chat applications.

> **Note:** This is currently a frontend demo with simulated responses. It does not connect to a live backend API out of the box.

---

## 📸 Screenshots

<div align="center">
  <img width="1919" height="906" alt="image" src="https://github.com/user-attachments/assets/ed9a697f-7453-47de-873d-923b3a70682e" />
</div>

## ✨ Features

- **🎨 Premium Dark UI**: Carefully crafted color palette using Tailwind CSS.
- **📱 Fully Responsive**: Collapsible sidebar for mobile devices and fluid layout.
- **⚡ Real-time Interactivity**:
  - Typing indicators
  - Auto-resizing message input
  - Smooth message scrolling
- **📝 Markdown Support**: Basic rendering for bold, italic, and code blocks.
- **🤖 Simulated Chat Logic**: Includes a demo mode with mock AI responses.

## 🛠️ Technologies Used

- **HTML5**: Semantic markup.
- **Tailwind CSS**: Utility-first styling (via CDN for easy setup).
- **Vanilla JavaScript**: Lightweight logic for UI interactions.
- **FontAwesome**: Scalable vector icons.
- **Google Fonts**: "Outfit" typeface for a modern look.

## 🚀 Getting Started

Since this is a static project, no complex installation is required.

1. **Clone the repository** (or download files):
   ```bash
   git clone https://github.com/yourusername/chatter-ai.git
   ```

2. **Open the project**:
   Simply double-click `index..html` to open it in your default web browser.

   *Tip: For the best experience, use a simple local server extension (like Live Server in VS Code) to avoid any local file security restrictions.*

## 🗂️ Project Structure

```
chatter-ai/
├── assets/
│   ├── css/
│   │   └── style.css       # Custom animations and overrides
│   └── js/
│       └── app.js          # Chat logic, event listeners, and mock responses
├── index..html             # Main application file
└── README.md               # Project documentation
```

## 💻 Usage Code Snippet

The `app.js` file contains a simple way to handle messages. You can easily replace the simulation logic with a real API call:

```javascript
// assets/js/app.js

async function handleSendMessage() {
    // ... input handling ...

    // REPLACE THIS:
    // const response = getSimulatedResponse(text);

    // WITH REAL API CALL:
    const response = await fetchYourAIEndpoint(text);
    
    appendMessage('ai', response);
}
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
Made by Sachintha
</div>
