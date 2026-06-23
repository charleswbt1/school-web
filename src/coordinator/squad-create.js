document.getElementById("squadImage").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = document.getElementById("previewImage");
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
});

document.getElementById("squadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    const file = document.getElementById("squadImage").files[0];
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const cct = document.getElementById("cct").value;
    try {
        const formData = new FormData();
        formData.append("reqFile", file);
        formData.append("directory", `squad/${cct}`);
        const uploadResponse = await fetch(
            `${apiUrl}/api/files`,
            {
                method: "POST",
                body: formData
            }
        );

        const uploadData = await uploadResponse.json();
        const imageUrl = uploadData.url;

        const invoiceResponse = await fetch(
            `${apiUrl}/api/squads`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    logo: imageUrl,
                    name,
                    description,
                    cct
                })
            }
        );
        alert("Escuela creada correctamente");
        document.getElementById("squadForm").reset();
        window.location.href = "../coordinator/squads.html";
    } catch (error) {
        alert("Error al crear escuela");
    } finally {
        submitButton.disabled = false;
    }
});