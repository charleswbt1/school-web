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

document.getElementById('contentForm').addEventListener('submit', e => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    const data = {
        name: document.getElementById('contentName').value,
        description: document.getElementById('contentDescription').value,
        modules: []
    };

    document.querySelectorAll('.module-card').forEach(moduleCard => {
        const module = {
            name: moduleCard.querySelector('.module-name').value,
            description: moduleCard.querySelector('.module-description').value,
            qualification: Number(moduleCard.querySelector('.module-qualification').value),
            exam: moduleCard.querySelector('.module-exam').value,
            topics: []
        };

        moduleCard.querySelectorAll('.topic-card').forEach(topicCard => {
            module.topics.push({
                name: topicCard.querySelector('.topic-name').value,
                description: topicCard.querySelector('.topic-description').value,
                multimedia: topicCard.querySelector('.topic-multimedia').value
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
        alert('Contenido creado exitosamente');
        document.getElementById("contentForm").reset();
        window.location.href = '../coordinator/contents.html';
    } catch (error) {
        alert('Error al crear el contenido');
    } finally {
        submitButton.disabled = false;
    }
});