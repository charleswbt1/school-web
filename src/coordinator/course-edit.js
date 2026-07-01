const courseId = new URLSearchParams(window.location.search).get('id');

document.addEventListener('DOMContentLoaded', () => {
    loadCourse();
    document
        .getElementById('courseForm')
        .addEventListener('submit', updateCourse);
});

async function loadCourse() {
    try {
        const response = await fetch(`${apiUrl}/api/courses?id=${courseId}`);
        if (!response.ok) {
            throw new Error('Error al obtener el curso');
        }

        const jsonResponse = await response.json();
        const course = jsonResponse[0];

        document.getElementById('name').value = course.name || '';
        document.getElementById('description').value = course.description || '';
        document.getElementById('call_link').value = course.call_link || '';
        document.getElementById('class_link').value = course.class_link || '';

    } catch (error) {
        console.error(error);
        alert('Error al cargar la escuela');
    }
}

async function updateCourse(event) {
    event.preventDefault();
    try {
        const response = await fetch(
            `${apiUrl}/api/courses?id=${courseId}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: document.getElementById('name').value,
                    description: document.getElementById('description').value,
                    call_link: document.getElementById('call_link').value,
                    class_link: document.getElementById('class_link').value
                })
            }
        );

        if (!response.ok) {
            throw new Error('Error al actualizar');
        }
        await showSuccess("Registro Exitoso");
    } catch (error) {
        showError("Error al Registrar");
    }
}