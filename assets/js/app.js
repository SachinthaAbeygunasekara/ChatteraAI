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
e
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

        await new Promise(r => setTimeout(r, 1500));

        removeMessage(typingId);

        const responseResponse = getSimulatedResponse(text);
        appendMessage('ai', responseResponse);
        scrollToBottom();

        isTyping = false;
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
        const div = document.createElement('div');
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
                    <div class="text-gray-200 leading-relaxed prose-invert">
                        ${parseMarkdown(text)}
                    </div>
                </div>
            `;
        }

        messagesList.appendChild(div);
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
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function parseMarkdown(text) {
        let html = escapeHtml(text);

        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        html = html.replace(/\n/g, '<br>');

        return html;
    }

    function getSimulatedResponse(input) {
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
            return "Hello! I'm ChatterAI. **How can I assist you today?**";
        } else if (lowerInput.includes('python')) {
            return "Here's a simple Python script for you:\n\n```python\ndef hello_world():\n    print('Hello, World!')\n\nhello_world()\n```\n\nIs there anything specific you need help with?";
        } else if (lowerInput.includes('thank')) {
            return "You're welcome! Let me know if you need anything else.";
        } else {
            return "That's an interesting topic! As an AI, I can help you research, write code, or just chat about it. **What would you like to do next?**";
        }
    }
});
