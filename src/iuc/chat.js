const API = {
    conversations: `${apiUrl}/api/chat-conversations`,
    messages: `${apiUrl}/api/chat-messages`,
    users: `${apiUrl}/api/chat-conversations/contacts`
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

const userSearchResults = document.getElementById('userSearchResults');
const selectedParticipantsContainer = document.getElementById('selectedParticipants');
const selectedParticipantsCount = document.getElementById('selectedParticipantsCount');
const createConversationBtn = document.getElementById('createConversationBtn');
const conversationName = document.getElementById('conversationName');
const conversationNameContainer = document.getElementById('conversationNameContainer');
const conversationDialogNotice = document.getElementById('conversationDialogNotice');

let selectedParticipants = new Map();
let availableUsers = [];
let isCreatingConversation = false;

const currentUserId = sessionStorage.getItem('userId');

let conversations = [];
let activeConversation = null;
let messages = [];
let isSending = false;
let conversationRequest = null;
let messageVersion = 0;
let messagesLoading = false;
let lastConversationRefresh = 0;
let pollRunning = false;
const ENABLE_AUTO_REFRESH = false; // Activar tras validar costos o implementar cursor.
const POLL_MS = 10000;
const CONVERSATION_MS = 30000;

document.addEventListener('DOMContentLoaded', init);

async function init() {
    messageForm.addEventListener('submit', sendMessage);
    searchConversations.addEventListener('input', renderConversations);
    refreshMessagesBtn.addEventListener('click', () => {
        refreshChat(true);
    });

    newConversationBtn.addEventListener(
        'click',
        openNewConversationDialog
    );

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

    conversationName.addEventListener(
        'input',
        updateConversationForm
    );

    document.querySelectorAll(
        'input[name="conversationType"]'
    ).forEach(input => {

        input.addEventListener('change', () => {

            selectedParticipants.clear();

            renderSelectedParticipants();
            renderUserResults();
            updateConversationForm();

        });

    });

    await loadConversations();
    if (ENABLE_AUTO_REFRESH) setInterval(() => refreshChat(), POLL_MS);
    document.addEventListener('visibilitychange', () => {
        if (ENABLE_AUTO_REFRESH && !document.hidden) refreshChat(true);
    });
}

async function refreshChat(force = false) {
    if (document.hidden || pollRunning || isSending) return;
    pollRunning = true;
    try {
        if (force || Date.now() - lastConversationRefresh >= CONVERSATION_MS) {
            await loadConversations(true);
        }
        if (activeConversation && !messagesLoading) {
            await loadMessages(activeConversation.id, true);
        }
    } finally { pollRunning = false; }
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
        window.location.href = '../home/index.html';
        throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    }

    return response;
}

async function loadConversations(silent = false) {
    if (conversationRequest) {
        await conversationRequest;
        if (silent) return;
    }
    const request = fetchConversations(silent);
    conversationRequest = request;
    try { await request; }
    finally { if (conversationRequest === request) conversationRequest = null; }
}

async function fetchConversations(silent) {
    if (!silent && !conversations.length) setLoading(conversationsList, 'Cargando conversaciones…');

    try {
        const response = await apiFetch(API.conversations);

        if (!response.ok) {
            throw new Error(`No se pudieron cargar las conversaciones (${response.status}).`);
        }

        const data = await response.json();
        conversations = normalizeList(data, ['conversations', 'data', 'items']);
        conversations.sort((a, b) => activityTime(b) - activityTime(a));
        lastConversationRefresh = Date.now();

        if (activeConversation) {
            const updated = conversations.find(item => item.id === activeConversation.id);
            if (updated) {
                activeConversation = updated;
                updateChatHeader(updated);
            } else {
                activeConversation = null;
                messageVersion++;
                messagesLoading = false;
                messages = [];
                messageInput.disabled = true;
                sendMessageBtn.disabled = true;
                chatTitle.textContent = 'Chat Escolar';
                chatSubtitle.textContent = 'Selecciona una conversación para comenzar';
                document.querySelector('#chatHeader .empty-avatar').textContent = '✉';
            }
        }

        renderConversations();
        if (!activeConversation && conversations.length) {
            await selectConversation(conversations[0]);
        } else if (!conversations.length) {
            renderEmptyChat('Todavía no hay conversaciones', 'Cuando tengas una conversación disponible, aparecerá aquí.');
        }
    } catch (error) {
        console.error('Error cargando conversaciones:', error);
        if (!silent) {
            if (!conversations.length) setLoading(conversationsList, 'No se pudieron cargar las conversaciones.');
            showNotice(error.message);
        }
    }
}

function renderConversations() {
    const term = searchConversations.value.trim().toLocaleLowerCase('es');
    const filtered = conversations.filter(conversation => {
        const title = getConversationTitle(conversation).toLocaleLowerCase('es');
        const preview = getLastMessageText(conversation).toLocaleLowerCase('es');
        return title.includes(term) || preview.includes(term) || getConversationSubtitle(conversation).toLocaleLowerCase('es').includes(term);
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
        timeElement.textContent = formatShortDate(conversation.last_message?.createdAt || conversation.updatedAt || conversation.updated_at || conversation.last_message_at);

        const previewElement = document.createElement('span');
        previewElement.className = 'conversation-preview';
        previewElement.textContent = preview;

        titleRow.append(titleElement, timeElement);
        const subtitle = document.createElement('span');
        subtitle.className = 'conversation-subtitle';
        subtitle.textContent = getConversationSubtitle(conversation);
        info.append(titleRow, subtitle, previewElement);
        button.append(avatarElement, info);

        const unread = Number(conversation.unread_count?.[currentUserId] || 0);
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
    if (isSending) return;
    activeConversation = conversation;
    messages = [];
    updateChatHeader(conversation);
    messageInput.disabled = false;
    sendMessageBtn.disabled = false;
    document.getElementById('messageHint').textContent = 'Enter para enviar · Shift + Enter para nueva línea';
    renderConversations();
    await loadMessages(conversation.id);
    if (activeConversation?.id === conversation.id) messageInput.focus();
}

function updateChatHeader(conversation) {
    chatTitle.textContent = getConversationTitle(conversation);
    chatSubtitle.textContent = getConversationSubtitle(conversation);
    document.querySelector('#chatHeader .empty-avatar').textContent = conversation.type === 'group' ? '👥' : initials(chatTitle.textContent);
}

async function loadMessages(conversationId, silent = false) {
    const version = ++messageVersion;
    messagesLoading = true;
    if (!silent) {
        setLoading(messagesList, 'Cargando mensajes…');
        hideNotice();
    }

    try {
        const url = new URL(API.messages, window.location.href);
        url.searchParams.set('conversation_id', conversationId);

        const response = await apiFetch(url.toString());

        if (!response.ok) {
            throw new Error(`No se pudieron cargar los mensajes (${response.status}).`);
        }

        const data = await response.json();
        if (version !== messageVersion || activeConversation?.id !== conversationId) return;
        const next = normalizeList(data, ['messages', 'data', 'items']);
        if (silent && JSON.stringify(next) === JSON.stringify(messages)) return;
        const nearBottom = messagesList.scrollHeight - messagesList.scrollTop - messagesList.clientHeight < 80;
        const oldTop = messagesList.scrollTop;
        messages = next;
        renderMessages();
        if (silent && !nearBottom) messagesList.scrollTop = oldTop;
    } catch (error) {
        console.error('Error cargando mensajes:', error);
        if (version === messageVersion && !silent) {
            renderEmptyChat('No se pudieron cargar los mensajes', 'Comprueba que el endpoint de mensajes coincida con tu backend.');
            showNotice(error.message);
        }
    } finally {
        if (version === messageVersion) messagesLoading = false;
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
        if (activeConversation?.id === payload.conversation_id) await loadMessages(payload.conversation_id);
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

async function openNewConversationDialog() {

    if (isCreatingConversation) return;

    if (typeof newConversationDialog.showModal !== 'function') {
        showNotice('Tu navegador no admite este diálogo.');
        return;
    }

    newConversationForm.reset();

    selectedParticipants.clear();
    availableUsers = [];

    conversationDialogNotice.hidden = true;

    renderSelectedParticipants();
    updateConversationForm();

    newConversationDialog.showModal();

    await loadAvailableUsers();
}

async function createConversation(event) {

    event.preventDefault();

    if (isCreatingConversation) return;

    const type = getConversationType();

    const participantIds = [
        ...selectedParticipants.values()
    ].map(user => user.id);
    const courseId = selectedCourseId();
    if (!courseId) return;


    const name = type === 'group'
        ? conversationName.value.trim()
        : '';

    if (type === 'direct' && participantIds.length !== 1) {
        return;
    }

    if (type === 'group' && (
        participantIds.length < 2 || participantIds.length > 29 || !name
    )) {
        return;
    }

    const payload = {
        name,
        type,
        course_id: courseId,
        participant_ids: participantIds
    };

    isCreatingConversation = true;

    conversationDialogNotice.hidden = true;

    updateConversationForm();

    try {

        const response = await apiFetch(API.conversations, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {

            const details = await readError(response);

            throw new Error(
                details || 'No se pudo crear la conversación.'
            );

        }

        const created = await response.json();

        closeNewConversationDialog();

        await loadConversations();

        const conversation =
            created.conversation || created.data || created;

        const createdId =
            conversation.id || conversation.conversation_id;

        const match = conversations.find(item =>
            String(item.id) === String(createdId)
        );

        if (match) {

            await selectConversation(match);

        } else {

            showNotice(
                'Conversación creada. Actualiza el listado para visualizarla.'
            );

        }

    } catch (error) {

        console.error('Error creando conversación:', error);

        conversationDialogNotice.textContent = error.message;
        conversationDialogNotice.hidden = false;

    } finally {

        isCreatingConversation = false;

        updateConversationForm();

    }
}

async function loadAvailableUsers() {

    showUserSearchState('Cargando participantes...');

    try {

        const response = await apiFetch(API.users);

        if (!response.ok) {
            throw new Error(
                'No se pudieron consultar los participantes.'
            );
        }

        const data = await response.json();

        if (!newConversationDialog.open) return;

        availableUsers = normalizeList(
            data,
            ['users', 'data', 'items']
        ).filter(user =>
            user &&
            user.id && user.course?.id &&
            String(user.id) !== String(currentUserId)
        );

        availableUsers = [...new Map(availableUsers.map(user => [getContactKey(user), user])).values()];
        renderUserResults();

    } catch (error) {

        console.error('Error cargando participantes:', error);

        showUserSearchState(error.message);

    }
}

function getConversationType() {

    return document.querySelector(
        'input[name="conversationType"]:checked'
    ).value;
}

function getContactKey(user) { return JSON.stringify([user.course.id, user.id]); }
function selectedCourseId() { return selectedParticipants.values().next().value?.course?.id; }

function toggleParticipant(user) {

    if (isCreatingConversation) return;

    if (selectedParticipants.has(getContactKey(user))) {

        selectedParticipants.delete(getContactKey(user));

    } else {

        if (getConversationType() === 'direct') {

            selectedParticipants.clear();

        }

        if (getConversationType() === 'group' && ((selectedCourseId() && selectedCourseId() !== user.course.id) || selectedParticipants.size >= 29)) return;
        selectedParticipants.set(getContactKey(user), user);

    }

    renderSelectedParticipants();
    renderUserResults();
    updateConversationForm();
}

function renderSelectedParticipants() {

    selectedParticipantsContainer.replaceChildren();

    selectedParticipantsCount.textContent =
        selectedParticipants.size;

    selectedParticipants.forEach(user => {

        const chip = document.createElement('span');

        chip.className = 'participant-chip';

        const name = document.createElement('span');

        name.textContent = user.name || 'Usuario';

        const removeButton = document.createElement('button');

        removeButton.type = 'button';
        removeButton.textContent = '×';

        removeButton.setAttribute(
            'aria-label',
            `Eliminar a ${user.name || 'usuario'}`
        );

        removeButton.addEventListener('click', () => {

            if (isCreatingConversation) return;

            selectedParticipants.delete(getContactKey(user));

            renderSelectedParticipants();
            renderUserResults();
            updateConversationForm();

        });

        chip.append(name, removeButton);

        selectedParticipantsContainer.appendChild(chip);

    });
}

function updateConversationForm() {

    const type = getConversationType();

    const isGroup = type === 'group';

    conversationNameContainer.hidden = !isGroup;

    conversationName.required = isGroup;

    let valid;

    if (isGroup) {

        valid =
            selectedParticipants.size >= 2 && selectedParticipants.size <= 29 &&
            conversationName.value.trim().length > 0;

    } else {

        valid = selectedParticipants.size === 1;

    }

    createConversationBtn.disabled =
        !valid || isCreatingConversation;

    createConversationBtn.textContent =
        isCreatingConversation
            ? 'Creando...'
            : isGroup
                ? 'Crear grupo'
                : 'Iniciar chat';
}

function showUserSearchState(text) {

    const element = document.createElement('div');

    element.className = 'user-search-empty';
    element.textContent = text;

    userSearchResults.replaceChildren(element);
}

function renderUserResults() {
    userSearchResults.replaceChildren();

    if (!availableUsers.length) {
        showUserSearchState('No hay participantes disponibles.');
        return;
    }

    let previousCourse;
    availableUsers.forEach(user => {
        if (previousCourse !== user.course.id) {
            const heading = document.createElement('div');
            heading.className = 'contact-course-heading';
            heading.textContent = user.course.name || 'Curso';
            userSearchResults.appendChild(heading);
            previousCourse = user.course.id;
        }

        const selected = selectedParticipants.has(getContactKey(user));

        const button = document.createElement('button');

        button.type = 'button';

        button.className = `user-result${selected ? ' selected' : ''}`;

        button.setAttribute('aria-pressed', String(selected));
        button.disabled = isCreatingConversation || (getConversationType() === 'group' && !selected && ((selectedCourseId() && selectedCourseId() !== user.course.id) || selectedParticipants.size >= 29));

        const avatar = document.createElement('span');

        avatar.className = 'user-result-avatar';
        avatar.textContent = initials(user.name);

        const info = document.createElement('span');

        info.className = 'user-result-info';

        const name = document.createElement('span');

        name.className = 'user-result-name';
        name.textContent = user.name || 'Usuario';

        const role = document.createElement('span');

        role.className = 'user-result-role';
        role.textContent = getRoleName(user.role);

        const action = document.createElement('span');

        action.className = 'user-result-action';
        action.textContent = selected ? '✓' : '+';

        info.append(name, role);

        button.append(avatar, info, action);

        button.addEventListener('click', () => {
            toggleParticipant(user);
        });

        userSearchResults.appendChild(button);

    });
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

function getOtherParticipant(conversation) {
    return (conversation.participants || []).find(user => String(user.id) !== String(currentUserId));
}

function getConversationTitle(conversation) {
    if (conversation.type === 'group') return conversation.name || 'Conversación grupal';
    return getOtherParticipant(conversation)?.name || conversation.display_name || conversation.other_user?.name || conversation.name || 'Conversación';
}

function getConversationSubtitle(conversation) {
    const course = conversation.course?.name;
    if (conversation.type === 'group') return [course, `${conversation.participant_ids?.length || 0} participantes`].filter(Boolean).join(' · ');
    const participant = getOtherParticipant(conversation);
    return [participant?.role ? getRoleName(participant.role) : null, course].filter(Boolean).join(' · ') || 'Conversación escolar';
}

function getLastMessageText(conversation) {
    const last = conversation.last_message || conversation.lastMessage;
    if (typeof last === 'string') return last;
    const text = last?.text || last?.content || conversation.last_message_text;
    if (!text) return 'Sin mensajes';
    if (String(last?.sender_id) === String(currentUserId)) return `Tú: ${text}`;
    if (conversation.type === 'group' && last?.sender_name) return `${last.sender_name}: ${text}`;
    return text;
}

function activityTime(conversation) {
    return toDate(conversation.last_message?.createdAt || conversation.updatedAt || conversation.updated_at || conversation.createdAt)?.getTime() || 0;
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
    if (value && typeof value._seconds === 'number') return new Date(value._seconds * 1000);
    return null;
}

function autoResizeMessage() {
    messageInput.style.height = 'auto';
    messageInput.style.height = `${Math.min(messageInput.scrollHeight, 130)}px`;
}

function getRoleName(role) {
    const roles = {
        student: 'Alumno',
        teacher: 'Docente',
        admin: 'Administrador',
        coordinator: 'Coordinación'
    };
    return roles[role] || role || 'Usuario';
}

async function readError(response) {
    try {
        const body = await response.json();
        return body.message || body.error || '';
    } catch {
        return '';
    }
}