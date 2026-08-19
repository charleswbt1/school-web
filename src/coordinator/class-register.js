const params = new URLSearchParams(window.location.search);
const courseId = params.get("course_id");
const contentId = params.get("content_id");
const teacherId = params.get("teacher_id");
let classeId;

async function loadModules() {
    const response = await fetch(`${apiUrl}/api/contents?id=${contentId}`);
    const content = (await response.json())[0];
    const select = document.getElementById("moduleSelect");
    select.innerHTML = '';
    content.modules.forEach((module, index) => {
        select.innerHTML += `
            <option value="${module.id}" ${index === 0 ? "selected" : ""}>
                ${module.name}
            </option>
        `;
    });
    loadClasses();
}
loadModules();


const mediaClassContainer = document.getElementById("mediaClassContainer");
document.getElementById("addClassBtn").addEventListener("click", addMedia);

const mediaClassJobContainer = document.getElementById("mediaClassJobContainer");
document.getElementById("addClassJobBtn").addEventListener("click", addClassJob);

async function loadClasses() {
    classeId = null;
    const moduleId = document.getElementById("moduleSelect").value;
    if (!moduleId) return;

    const response = await fetch(`${apiUrl}/api/classes?course_id=${courseId}&module_id=${moduleId}`);
    if (!response.ok) return;

    const data = await response.json();

    mediaClassContainer.innerHTML = "";
    mediaClassJobContainer.innerHTML = "";
    if (!data || data.length === 0) {
        addMedia();
        addClassJob();
        return;
    }
    classeId = data[0].id;
    data[0].medias?.forEach(media => addMedia(media));
    data[0].jobs?.forEach(job => addClassJob(job));
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
    mediaClassContainer.appendChild(div);
}
function addClassJob(classJob = {}) {
    const div = document.createElement("div");
    div.className = "media-item";
    div.innerHTML = `
        <label class="link-label" hidden>${classJob?.link || ""}</label>
        <input class="job-file" type="file" accept="image/*,.pdf" hidden>
        <label 
            class="file-btn"
            style="display:${classJob.link ? "none" : "block"};"
        >
            Seleccionar Archivo
        </label>
        <img 
            class="preview-image" 
            style="display:${classJob.link ? "block" : "none"};" 
            alt="Vista previa"
            src=${classJob?.link
            ? classJob?.link.endsWith(".pdf")
                ? "https://storage.googleapis.com/school-source/web/pdf_image.png"
                : classJob.link
            : ""}
        >
        <label>Descripción</label>
        <input
            type="text"
            class="media-text"
            value="${classJob?.description || ""}"
            required>
        <button
            type="button"
            class="delete-job">
            🗑️
        </button>
    `;

    const fileInput = div.querySelector(".job-file");
    const fileButton = div.querySelector(".file-btn");
    const preview = div.querySelector(".preview-image");

    fileButton.addEventListener("click", () => { fileInput.click(); });
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;
        if (file.type === "application/pdf") {
            preview.src = "https://storage.googleapis.com/school-source/web/pdf_image.png";
            preview.style.display = "block";
            preview.onclick = () => { window.open(URL.createObjectURL(file), "_blank"); };
        } else {
            const url = URL.createObjectURL(file);
            preview.src = url;
            preview.style.display = "block";
            preview.onclick = () => viewImage(url);
        }
    });
    preview.addEventListener("click", () => {
        if (classJob.link) {
            viewImage(classJob.link);
        }
    });

    div.querySelector(".delete-job").addEventListener("click", async () => {
        if (classJob.link) {
            const response = await fetch(`${apiUrl}/api/files`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: classJob.link
                })
            });
            if (response.ok) {
                await showSuccess("Documento eliminado del servidor. no olvides guardar los cambios.");
            }
        }
        div.remove();
    });
    mediaClassJobContainer.appendChild(div);
}

document.getElementById("classForm").addEventListener("submit", saveClasses);
async function saveClasses(e) {
    e.preventDefault();
    const button = document.getElementById("saveClassBtn");
    try {
        button.style.pointerEvents = "none";
        button.style.opacity = ".5";
        const moduleId = document.getElementById("moduleSelect").value;
        const medias = [...document.querySelectorAll("#mediaClassContainer .media-item")]
            .map(item => ({
                date: item.querySelector(".media-date").value,
                link: item.querySelector(".media-link").value
            }));
        const jobs = await Promise.all(
            [...document.querySelectorAll("#mediaClassJobContainer .media-item")]
                .map(async item => ({
                    link: item.querySelector(".link-label").textContent
                        || await updateFile(
                            item.querySelector(".job-file").files[0]
                        ),
                    description: item.querySelector(".media-text").value
                })));

        const request = {
            course_id: courseId,
            content_id: contentId,
            teacher_id: teacherId,
            module_id: moduleId,
            medias,
            jobs
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
            await showError("No se pudieron guardar las clases.");
            return;
        }
        await showSuccess("Clases guardadas correctamente.");
        loadClasses();
    } catch (error) {
        showError(`Error al guardar clases - ${error.message}`);
    } finally {
        button.style.pointerEvents = "auto";
        button.style.opacity = "1";
    }
}

// Documents
const modalImage = document.getElementById("imageModal");
const payImage = document.getElementById("payImage");
function closeImage() {
    payImage.src = '';
    modalImage.style.display = "none";
}
function viewImage(imageUrl) {
    if (!imageUrl) return;
    if (imageUrl.endsWith(".pdf")) {
        window.open(imageUrl, "_blank");
    } else {
        payImage.src = imageUrl;
        modalImage.style.display = "flex";
    }
}

async function updateFile(file) {
    if (!file) {
        throw new Error("Selecciona un documento.");
    }

    const formData = new FormData();
    formData.append("reqFile", file);
    formData.append("directory", `courses/${courseId}/jobs`);
    const uploadResponse = await fetch(
        `${apiUrl}/api/files`,
        {
            method: "POST",
            body: formData
        }
    );
    if (!uploadResponse.ok) {
        throw new Error("Fallo al subir documento");
    }
    const uploadData = await uploadResponse.json();
    return uploadData.url;
}