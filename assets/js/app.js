import { GoogleGenerativeAI } from "@google/generative-ai";

document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const messagesList = document.getElementById('messages-list');
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatContainer = document.getElementById('chat-container');
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');

    let isTyping = false;
    let genAI = null;
    let model = null;
    let chatSession = null;

    // API Key Management
    const API_KEY_STORAGE = 'chatterai_api_key';

    function initializeAI() {
        let apiKey = localStorage.getItem(API_KEY_STORAGE);

        if (!apiKey) {
            apiKey = prompt("Please enter your Google Gemini API Key to continue:");
            if (apiKey) {
                localStorage.setItem(API_KEY_STORAGE, apiKey);
            } else {
                appendMessage('ai', "⚠️ **API Key Required**\n\nTo use ChatterAI, you need a Google Gemini API Key. Please refresh and enter your key.");
                return false;
            }
        }

        try {
            genAI = new GoogleGenerativeAI(apiKey);
            // Using gemini-1.5-flash as default, but allowing for upgrades
            model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            chatSession = model.startChat({
                history: [],
                generationConfig: {
                    maxOutputTokens: 1000,
                },
            });
            return true;
        } catch (error) {
            console.error("Error initializing AI:", error);
            appendMessage('ai', "❌ **Initialization Error**\n\nFailed to initialize the AI model. Please check your API key.");
            localStorage.removeItem(API_KEY_STORAGE);
            return false;
        }
    }

    // Initialize on load
    const isReady = initializeAI();

    function toggleSidebar() {
        const isClosed = sidebar.classList.contains('-translate-x-full');
        if (isClosed) {
            sidebar.classList.remove('-translate-x-full');
            sidebarOverlay.classList.remove('hidden');
            setTimeout(() => sidebarOverlay.classList.remove('opacity-0'), 10);
        } else {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('opacity-0');
            setTimeout(() => sidebarOverlay.classList.add('hidden'), 300);
        }
    }

    menuBtn.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);

    messageInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';

        if (this.value.trim().length > 0) {
            sendBtn.removeAttribute('disabled');
            sendBtn.classList.remove('cursor-not-allowed', 'bg-white/10', 'text-gray-500');
            sendBtn.classList.add('bg-primary', 'text-white', 'hover:bg-primary/90', 'cursor-pointer');
        } else {
            sendBtn.setAttribute('disabled', 'true');
            sendBtn.classList.add('cursor-not-allowed', 'bg-white/10', 'text-gray-500');
            sendBtn.classList.remove('bg-primary', 'text-white', 'hover:bg-primary/90', 'cursor-pointer');
        }
    });

    async function handleSendMessage() {
        if (!isReady && !initializeAI()) return;

        const text = messageInput.value.trim();
        if (!text || isTyping) return;

        messageInput.value = '';
        messageInput.style.height = 'auto';
        sendBtn.setAttribute('disabled', 'true');
        sendBtn.classList.add('cursor-not-allowed', 'bg-white/10', 'text-gray-500');
        sendBtn.classList.remove('bg-primary', 'text-white', 'hover:bg-primary/90', 'cursor-pointer');

        if (!welcomeScreen.classList.contains('hidden')) {
            welcomeScreen.style.opacity = '0';
            setTimeout(() => {
                welcomeScreen.classList.add('hidden');
                messagesList.classList.remove('hidden');
            }, 500);
        }

        appendMessage('user', text);
        scrollToBottom();

        isTyping = true;
        const typingId = appendTypingIndicator();
        scrollToBottom();

        try {
            // Send message to Gemini
            const result = await chatSession.sendMessageStream(text);

            removeMessage(typingId);
            const aiMessageId = appendMessage('ai', ''); // Create empty message bubble
            let fullResponse = "";

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullResponse += chunkText;
                updateMessageContent(aiMessageId, fullResponse);
                scrollToBottom();
            }

        } catch (error) {
            console.error("Generation Error:", error);
            removeMessage(typingId);
            appendMessage('ai', "⚠️ **Error**\n\n" + error.message);

            // If authentication error, clear key
            if (error.message.includes('403') || error.message.includes('API key')) {
                localStorage.removeItem(API_KEY_STORAGE);
                appendMessage('ai', "Key has been removed. Please try again to enter a new key.");
                // Reset session
                genAI = null;
                model = null;
                chatSession = null;
            }
        } finally {
            isTyping = false;
        }
    }

    sendBtn.addEventListener('click', handleSendMessage);

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const title = btn.querySelector('.font-medium').textContent;
            const subtitle = btn.querySelector('.text-xs').textContent;
            messageInput.value = `${title} ${subtitle}`;
            messageInput.dispatchEvent(new Event('input'));
            messageInput.focus();
        });
    });

    function appendMessage(role, text) {
        const id = 'msg-' + Date.now() + Math.random().toString(36).substr(2, 9);
        const div = document.createElement('div');
        div.id = id;
        div.className = `flex gap-4 max-w-3xl ${role === 'user' ? 'ml-auto' : ''} w-full animate-fade-in`;

        if (role === 'user') {
            div.innerHTML = `
                <div class="bg-surface border border-white/10 px-5 py-3 rounded-2xl rounded-tr-sm text-gray-100 shadow-sm max-w-[85%] ml-auto">
                    ${escapeHtml(text)}
                </div>
                <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-md order-last">
                    SA
                </div>
            `;
        } else {
            div.innerHTML = `
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/20">
                    <i class="fa-solid fa-robot text-white text-xs"></i>
                </div>
                <div class="flex-1 space-y-2 max-w-[85%]">
                    <div class="text-xs font-bold text-gray-400">ChatterAI</div>
                    <div class="text-gray-200 leading-relaxed prose-invert message-content">
                        ${parseMarkdown(text)}
                    </div>
                </div>
            `;
        }

        messagesList.appendChild(div);
        return id;
    }

    function updateMessageContent(id, text) {
        const messageDiv = document.getElementById(id);
        if (messageDiv) {
            const contentDiv = messageDiv.querySelector('.message-content');
            if (contentDiv) {
                contentDiv.innerHTML = parseMarkdown(text);
            }
        }
    }

    function appendTypingIndicator() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'flex gap-4 max-w-3xl w-full animate-fade-in';
        div.innerHTML = `
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/20">
                <i class="fa-solid fa-robot text-white text-xs"></i>
            </div>
            <div class="flex items-center">
                <div class="bg-surface border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm text-gray-100 shadow-sm">
                    <div class="flex gap-1">
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                    </div>
                </div>
            </div>
        `;
        messagesList.appendChild(div);
        return id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    function escapeHtml(unsafe) {
        if (!unsafe) return "";
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function parseMarkdown(text) {
        if (!text) return "";
        let html = escapeHtml(text);

        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/```(\w*)([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        html = html.replace(/\n/g, '<br>');

        return html;
    }
});
