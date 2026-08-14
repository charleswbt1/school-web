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

const modalDocument = document.getElementById("contentDocumentModal");
modalDocument.addEventListener("click", (e) => {
    if (e.target === modalDocument) {
        closeDocumentModal();
    }
});
function viewDocument(studentId, type) {
    const student = students.find(student => student.id === studentId);
    document.getElementById("document-type").textContent = type;
    document.getElementById("student-name").textContent = student.name;
    document.getElementById("student-id").textContent = studentId;
    document.getElementById("course-id").textContent = student.course_id;
    modalDocument.style.display = "flex";
}
const preview = document.getElementById("previewImage");
const invoiceImage = document.getElementById("invoiceImage");
let previewUrl = null;
invoiceImage.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }
    previewUrl = URL.createObjectURL(file);
    if (file.type === "application/pdf") {
        preview.src = "https://storage.googleapis.com/school-source/web/pdf_image.png";
        preview.style.display = "block";
        preview.onclick = () => window.open(previewUrl, "_blank");
    } else {
        preview.src = previewUrl;
        preview.style.display = "block";
        preview.onclick = () => viewImage(previewUrl);
    }
});
const documentForm = document.getElementById("documentForm");
documentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    try {
        submitButton.disabled = true;
        submitButton.style.opacity = ".7";
        const file = invoiceImage.files[0];
        if (!file) {
            throw new Error("Selecciona un documento.");
        }
        const studentId = document.getElementById("student-id").textContent;
        const courseId = document.getElementById("course-id").textContent;

        const formData = new FormData();
        formData.append("reqFile", file);
        formData.append("directory", `courses/${courseId}/${studentId}/document`);
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
        const imageUrl = uploadData.url;
        const documentRequest = {
            url: imageUrl,
            student_id: studentId,
            type: document.getElementById("document-type").textContent
        }
        const invoiceResponse = await fetch(
            `${apiUrl}/api/students/document`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(documentRequest)
            }
        );
        if (!invoiceResponse.ok) {
            throw new Error("No se pudo registrar el documento");
        }
        closeDocumentModal();
        await showSuccess("Registro Exitoso");
        loadPage();
    } catch (error) {
        showError(`Error al Registrar - ${error.message}`);
    } finally {
        submitButton.disabled = false;
        submitButton.style.opacity = "1";
    }
});
function closeDocumentModal() {
    modalDocument.style.display = "none";
    documentForm.reset();

    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
    }
    preview.src = "";
    preview.style.display = "none";
}

async function deleteDocument(studentId, type, button) {
    if (!await showConfirm("¿Deseas eliminar este Documento?")) {
        return;
    }

    try {
        button.style.pointerEvents = "none";
        button.style.opacity = ".5";
        const response = await fetch(
            `${apiUrl}/api/students/document`,
            {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    student_id: studentId,
                    type: type
                })
            }
        );

        if (!response.ok) {
            throw new Error("No se pudo eliminar el documento");
        }

        await showSuccess("Documento eliminado");
        loadPage();
    } catch (error) {
        showError(error.message);
    } finally {
        button.style.pointerEvents = "auto";
        button.style.opacity = "1";
    }
}