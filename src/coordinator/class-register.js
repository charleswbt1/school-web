const courseId = new URLSearchParams(window.location.search).get("course_id");
const contentId = new URLSearchParams(window.location.search).get("content_id");
let classeId;

async function loadModules() {
    const response = await fetch(`${apiUrl}/api/contents?id=${contentId}`);
    const content = (await response.json())[0];
    const select = document.getElementById("moduleSelect");
    content.modules.forEach(module => {
        select.innerHTML += `
            <option value="${module.id}">
                ${module.name}
            </option>
        `;
    });
}
loadModules();

const mediaContainer = document.getElementById("mediaContainer");
document.getElementById("addMediaBtn").addEventListener("click", addMedia);

async function loadClasses() {
    const moduleId = document.getElementById("moduleSelect").value;
    if (!moduleId) return;

    const response = await fetch(`${apiUrl}/api/classes?course_id=${courseId}&module_id=${moduleId}`);
    if (!response.ok) return;

    const data = await response.json();

    mediaContainer.innerHTML = "";
    if (!data || data.length === 0 || data[0].medias.length === 0) {
        addMedia();
        return;
    }
    classeId = data[0].id;
    data[0].medias.forEach(media => addMedia(media));
}

document.getElementById("moduleSelect").addEventListener("change", loadClasses);

function addMedia(media = {}) {
    const div = document.createElement("div");
    div.className = "media-item";
    div.innerHTML = `
        <input
            type="date"
            class="media-date"
            value="${media.date || ""}"
            required>
        <input
            type="text"
            class="media-link"
            placeholder="https://..."
            value="${media.link || ""}"
            required>
        <button
            type="button"
            class="delete-media">
            🗑️
        </button>
    `;

    div.querySelector(".delete-media").addEventListener("click", () => div.remove());
    mediaContainer.appendChild(div);
}
addMedia();

document.getElementById("classForm").addEventListener("submit", saveClasses);

async function saveClasses(e) {
    e.preventDefault();

    const medias = [...document.querySelectorAll(".media-item")]
        .map(item => ({
            date: item.querySelector(".media-date").value,
            link: item.querySelector(".media-link").value
        }));

    const request = {
        course_id: courseId,
        content_id: contentId,
        module_id: document.getElementById("moduleSelect").value,
        medias
    };
    const query = classeId ? `?id=${classeId}` : ``;
    const response = await fetch(
        `${apiUrl}/api/classes${query}`,
        {
            method: query ? 'PATCH' : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        }
    );

    if (!response.ok) {
        showError("No se pudieron guardar las clases.");
        return;
    }
    showSuccess("Clases guardadas correctamente.");
}