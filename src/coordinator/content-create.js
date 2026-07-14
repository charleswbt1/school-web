const modulesContainer = document.getElementById('modulesContainer');
document.getElementById('addModuleBtn').addEventListener('click', addModule);

function addModule() {
    const template = document.getElementById('moduleTemplate');
    const moduleElement = template.content.firstElementChild.cloneNode(true);
    const topicsContainer = moduleElement.querySelector('.topics-container');

    moduleElement.querySelector('.add-topic-btn').addEventListener('click', () => {
        addTopic(topicsContainer);
    });

    moduleElement.querySelector('.remove-module-btn').addEventListener('click', () => {
        moduleElement.remove();
    });

    modulesContainer.appendChild(moduleElement);
    addTopic(topicsContainer);
}

function addTopic(topicsContainer) {
    const template = document.getElementById('topicTemplate');
    const topicElement = template.content.firstElementChild.cloneNode(true);

    topicElement.querySelector('.remove-topic-btn').addEventListener('click', () => {
        topicElement.remove();
    });

    topicsContainer.appendChild(topicElement);
}

document.getElementById("contentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.style.opacity = ".7";

    const data = {
        name: document.getElementById('contentName').value,
        description: document.getElementById('contentDescription').value,
        coordinator_id: sessionStorage.getItem("userId"),
        modules: []
    };

    document.querySelectorAll('.module-card').forEach(moduleCard => {
        const module = {
            name: moduleCard.querySelector('.module-name').value,
            description: moduleCard.querySelector('.module-description').value,
            qualification: Number(moduleCard.querySelector('.module-qualification').value),
            link: moduleCard.querySelector('.module-link').value,
            topics: []
        };

        moduleCard.querySelectorAll('.topic-card').forEach(topicCard => {
            module.topics.push({
                name: topicCard.querySelector('.topic-name').value,
                description: topicCard.querySelector('.topic-description').value,
                link: topicCard.querySelector('.module-link').value
            });
        });

        data.modules.push(module);
    });

    try {
        fetch(`${apiUrl}/api/contents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        await showSuccess("Registro Exitoso");
        document.getElementById("contentForm").reset();
        window.location.href = '../coordinator/contents.html';
    } catch (error) {
        showError("Error al Registrar");
    } finally {
        submitButton.disabled = false;
        submitButton.style.opacity = "1";
    }
});