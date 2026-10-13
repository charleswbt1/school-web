const API = {
    conversations: `${apiUrl}/api/chat-conversations`,
    messages: `${apiUrl}/api/chat-messages`
};

const conversationsList = document.getElementById('conversationsList');
const messagesList = document.getElementById('messagesList');
const chatTitle = document.getElementById('chatTitle');
const chatSubtitle = document.getElementById('chatSubtitle');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const searchConversations = document.getElementById('searchConversations');
const chatNotice = document.getElementById('chatNotice');
const refreshMessagesBtn = document.getElementById('refreshMessagesBtn');
const newConversationBtn = document.getElementById('newConversationBtn');
const newConversationDialog = document.getElementById('newConversationDialog');
const newConversationForm = document.getElementById('newConversationForm');

const currentUserId = sessionStorage.getItem('userId');

let conversations = [];
let activeConversation = null;
let messages = [];
let isSending = false;

document.addEventListener('DOMContentLoaded', init);

async function init() {
    messageForm.addEventListener('submit', sendMessage);
    searchConversations.addEventListener('input', renderConversations);
    refreshMessagesBtn.addEventListener('click', () => {
        if (activeConversation) loadMessages(activeConversation.id);
        else loadConversations();
    });

    newConversationBtn.addEventListener('click', () => {
        if (typeof newConversationDialog.showModal === 'function') {
            newConversationDialog.showModal();
        } else {
            showNotice('Tu navegador no admite el diálogo para crear conversaciones.');
        }
    });

    document.getElementById('closeDialogBtn').addEventListener('click', closeNewConversationDialog);
    document.getElementById('cancelDialogBtn').addEventListener('click', closeNewConversationDialog);
    newConversationForm.addEventListener('submit', createConversation);

    messageInput.addEventListener('input', autoResizeMessage);
    messageInput.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            messageForm.requestSubmit();
        }
    });

    await loadConversations();
}

async function apiFetch(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers || {})
        }
    });

    if (response.status === 401) {
        window.location.href = '../login/login.html';
        throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    }

    return response;
}

async function loadConversations() {
    setLoading(conversationsList, 'Cargando conversaciones…');
    hideNotice();

    try {
        const response = await apiFetch(API.conversations);

        if (!response.ok) {
            throw new Error(`No se pudieron cargar las conversaciones (${response.status}).`);
        }

        const data = await response.json();
        conversations = normalizeList(data, ['conversations', 'data', 'items']);
        renderConversations();

        if (activeConversation) {
            const updated = conversations.find(item => item.id === activeConversation.id);
            if (updated) activeConversation = updated;
        }

        if (!activeConversation && conversations.length) {
            selectConversation(conversations[0]);
        } else if (!conversations.length) {
            renderEmptyChat('Todavía no hay conversaciones', 'Cuando tengas una conversación disponible, aparecerá aquí.');
        }
    } catch (error) {
        console.error('Error cargando conversaciones:', error);
        setLoading(conversationsList, 'No se pudieron cargar las conversaciones.');
        showNotice(`${error.message} Verifica la URL de la API y la configuración CORS.`);
    }
}

function renderConversations() {
    const term = searchConversations.value.trim().toLocaleLowerCase('es');
    const filtered = conversations.filter(conversation => {
        const title = getConversationTitle(conversation).toLocaleLowerCase('es');
        const preview = getLastMessageText(conversation).toLocaleLowerCase('es');
        return title.includes(term) || preview.includes(term);
    });

    if (!filtered.length) {
        conversationsList.innerHTML = '<div class="empty-list">No hay conversaciones que coincidan.</div>';
        return;
    }

    conversationsList.replaceChildren();

    filtered.forEach(conversation => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `conversation-item${activeConversation?.id === conversation.id ? ' active' : ''}`;
        button.setAttribute('aria-current', activeConversation?.id === conversation.id ? 'true' : 'false');

        const title = getConversationTitle(conversation);
        const preview = getLastMessageText(conversation) || '';
        const avatar = initials(title);
        const isGroup = conversation.type === 'group' || (conversation.participant_ids || []).length > 2;

        const avatarElement = document.createElement('span');
        avatarElement.className = `conversation-avatar${isGroup ? ' group' : ''}`;
        avatarElement.textContent = isGroup ? '👥' : avatar;

        const info = document.createElement('span');
        info.className = 'conversation-info';

        const titleRow = document.createElement('span');
        titleRow.className = 'conversation-title-row';

        const titleElement = document.createElement('span');
        titleElement.className = 'conversation-title';
        titleElement.textContent = title;

        const timeElement = document.createElement('span');
        timeElement.className = 'conversation-time';
        timeElement.textContent = formatShortDate(conversation.updatedAt || conversation.updated_at || conversation.last_message_at);

        const previewElement = document.createElement('span');
        previewElement.className = 'conversation-preview';
        previewElement.textContent = preview;

        titleRow.append(titleElement, timeElement);
        info.append(titleRow, previewElement);
        button.append(avatarElement, info);

        const unread = Number(conversation.unread_count || 0);
        if (unread > 0) {
            const badge = document.createElement('span');
            badge.className = 'unread-badge';
            badge.textContent = unread > 99 ? '99+' : String(unread);
            button.appendChild(badge);
        }

        button.addEventListener('click', () => selectConversation(conversation));
        conversationsList.appendChild(button);
    });
}

async function selectConversation(conversation) {
    activeConversation = conversation;
    chatTitle.textContent = getConversationTitle(conversation);
    chatSubtitle.textContent = conversation.type === 'group' ? 'Conversación grupal' : 'Conversación escolar';
    messageInput.disabled = false;
    sendMessageBtn.disabled = false;
    document.getElementById('messageHint').textContent = 'Enter para enviar · Shift + Enter para nueva línea';
    renderConversations();
    await loadMessages(conversation.id);
    messageInput.focus();
}

async function loadMessages(conversationId) {
    setLoading(messagesList, 'Cargando mensajes…');
    hideNotice();

    try {
        const url = new URL(API.messages, window.location.href);
        url.searchParams.set('conversation_id', conversationId);

        const response = await apiFetch(url.toString());

        if (!response.ok) {
            throw new Error(`No se pudieron cargar los mensajes (${response.status}).`);
        }

        const data = await response.json();
        messages = normalizeList(data, ['messages', 'data', 'items']);
        renderMessages();
    } catch (error) {
        console.error('Error cargando mensajes:', error);
        renderEmptyChat('No se pudieron cargar los mensajes', 'Comprueba que el endpoint de mensajes coincida con tu backend.');
        showNotice(error.message);
    }
}

function renderMessages() {
    if (!messages.length) {
        renderEmptyChat('Inicia la conversación', 'Escribe un mensaje abajo para comenzar.');
        return;
    }

    messagesList.replaceChildren();

    messages.forEach(message => {
        const senderId = message.sender_id || message.user_id || message.sender?.id;
        const mine = currentUserId && String(senderId) === String(currentUserId);
        const senderName = message.sender_name || message.sender?.name || (mine ? 'Tú' : 'Participante');

        const row = document.createElement('div');
        row.className = `message-row${mine ? ' mine' : ''}`;

        if (!mine) {
            const avatar = document.createElement('span');
            avatar.className = 'message-avatar';
            avatar.textContent = initials(senderName);
            row.appendChild(avatar);
        }

        const stack = document.createElement('div');
        stack.className = 'message-stack';

        if (!mine) {
            const sender = document.createElement('span');
            sender.className = 'message-sender';
            sender.textContent = senderName;
            stack.appendChild(sender);
        }

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = message.text || message.content || message.message || '';

        const meta = document.createElement('div');
        meta.className = 'message-meta';
        meta.textContent = formatTime(message.createdAt || message.created_at || message.date);

        stack.append(bubble, meta);
        row.appendChild(stack);
        messagesList.appendChild(row);
    });

    messagesList.scrollTop = messagesList.scrollHeight;
}

async function sendMessage(event) {
    event.preventDefault();

    const text = messageInput.value.trim();
    if (!text || !activeConversation || isSending) return;

    isSending = true;
    sendMessageBtn.disabled = true;
    hideNotice();

    const payload = {
        conversation_id: activeConversation.id,
        text
    };

    try {
        const response = await apiFetch(API.messages, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const details = await readError(response);
            throw new Error(details || `No se pudo enviar el mensaje (${response.status}).`);
        }

        messageInput.value = '';
        autoResizeMessage();
        await loadMessages(activeConversation.id);
        await loadConversations();
        // Si la conversación activa sigue disponible, mantenerla seleccionada.
        const updated = conversations.find(item => item.id === activeConversation?.id);
        if (updated) {
            activeConversation = updated;
            renderConversations();
        }
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        showNotice(error.message);
    } finally {
        isSending = false;
        sendMessageBtn.disabled = !activeConversation;
        messageInput.focus();
    }
}

async function createConversation(event) {
    event.preventDefault();

    const name = document.getElementById('conversationName').value.trim();
    const participantIds = document.getElementById('participantIds').value
        .split(',')
        .map(id => id.trim())
        .filter(Boolean);

    if (!name || !participantIds.length) {
        showNotice('Completa el nombre y al menos un participante.');
        return;
    }

    try {
        const response = await apiFetch(API.conversations, {
            method: 'POST',
            body: JSON.stringify({
                name,
                type: participantIds.length > 1 ? 'group' : 'direct',
                participant_ids: participantIds
            })
        });

        if (!response.ok) {
            const details = await readError(response);
            throw new Error(details || `No se pudo crear la conversación (${response.status}).`);
        }

        const created = await response.json();
        closeNewConversationDialog();
        newConversationForm.reset();
        await loadConversations();

        const conversation = created.conversation || created.data || created;
        const createdId = conversation.id || conversation.conversation_id;
        const match = conversations.find(item => String(item.id) === String(createdId));
        if (match) await selectConversation(match);
        else if (conversations.length) await selectConversation(conversations[0]);
    } catch (error) {
        console.error('Error creando conversación:', error);
        showNotice(error.message);
    }
}

function closeNewConversationDialog() {
    if (newConversationDialog.open) newConversationDialog.close();
}

function renderEmptyChat(title, description) {
    messagesList.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'empty-chat';

    const icon = document.createElement('div');
    icon.className = 'empty-chat-icon';
    icon.textContent = '✉';

    const heading = document.createElement('h3');
    heading.textContent = title;

    const paragraph = document.createElement('p');
    paragraph.textContent = description;

    wrapper.append(icon, heading, paragraph);
    messagesList.appendChild(wrapper);
}

function setLoading(container, text) {
    container.innerHTML = '';
    const state = document.createElement('div');
    state.className = 'loading-state';
    state.textContent = text;
    container.appendChild(state);
}

function showNotice(message) {
    chatNotice.textContent = message;
    chatNotice.hidden = false;
}

function hideNotice() {
    chatNotice.hidden = true;
    chatNotice.textContent = '';
}

function normalizeList(data, keys) {
    if (Array.isArray(data)) return data;
    for (const key of keys) {
        if (Array.isArray(data?.[key])) return data[key];
    }
    return [];
}

function getConversationTitle(conversation) {
    return conversation.name
        || conversation.title
        || conversation.display_name
        || conversation.other_user?.name
        || conversation.participant_name
        || 'Conversación';
}

function getLastMessageText(conversation) {
    const last = conversation.last_message || conversation.lastMessage;
    if (typeof last === 'string') return last;
    return last?.text || last?.content || conversation.last_message_text || '';
}

function initials(value) {
    const parts = String(value || '?').trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part[0].toUpperCase()).join('') || '?';
}

function formatTime(value) {
    if (!value) return '';
    const date = toDate(value);
    if (!date || Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function formatShortDate(value) {
    if (!value) return '';
    const date = toDate(value);
    if (!date || Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    return sameDay
        ? formatTime(date)
        : date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

function toDate(value) {
    if (value instanceof Date) return value;
    if (typeof value === 'number') return new Date(value);
    if (typeof value === 'string') return new Date(value);
    if (value && typeof value.toDate === 'function') return value.toDate();
    if (value && typeof value.seconds === 'number') return new Date(value.seconds * 1000);
    return null;
}

function autoResizeMessage() {
    messageInput.style.height = 'auto';
    messageInput.style.height = `${Math.min(messageInput.scrollHeight, 130)}px`;
}

async function readError(response) {
    try {
        const body = await response.json();
        return body.message || body.error || '';
    } catch {
        return '';
    }
}
