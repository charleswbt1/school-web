const contentId = new URLSearchParams(window.location.search).get('id');

async function loadContent() {
    const response = await fetch(`${apiUrl}/api/contents?id=${contentId}`);
    const jsonResponse = await response.json();
    const content = jsonResponse[0];

    document.getElementById('contentName').value = content.name;
    document.getElementById('contentDescription').value = content.description;

    const modulesContainer = document.getElementById('modulesContainer');
    modulesContainer.innerHTML = '';

    content.modules.forEach(module => {
        const moduleElement = document
            .getElementById('moduleTemplate')
            .content
            .firstElementChild
            .cloneNode(true);

        moduleElement.dataset.id = module.id;

        moduleElement.querySelector('.module-name').value = module.name;
        moduleElement.querySelector('.module-description').value = module.description;
        moduleElement.querySelector('.module-qualification').value = module.qualification;

        const topicsContainer = moduleElement.querySelector('.topics-container');

        module.topics.forEach(topic => {
            const topicElement = document
                .getElementById('topicTemplate')
                .content
                .firstElementChild
                .cloneNode(true);

            topicElement.dataset.id = topic.id;

            topicElement.querySelector('.topic-name').value = topic.name;
            topicElement.querySelector('.topic-description').value = topic.description;

            topicElement.querySelector('.remove-topic-btn')
                .addEventListener('click', () => topicElement.remove());

            topicsContainer.appendChild(topicElement);
        });

        moduleElement.querySelector('.add-topic-btn')
            .addEventListener('click', () => addTopic(topicsContainer));

        moduleElement.querySelector('.remove-module-btn')
            .addEventListener('click', () => moduleElement.remove());

        modulesContainer.appendChild(moduleElement);
    });
}

loadContent();

const modulesContainer = document.getElementById('modulesContainer');

document.getElementById('addModuleBtn').addEventListener('click', addModule);

function addModule() {
    const template = document.getElementById('moduleTemplate');

    const moduleElement = template.content
        .firstElementChild
        .cloneNode(true);

    const topicsContainer =
        moduleElement.querySelector('.topics-container');

    moduleElement.querySelector('.add-topic-btn')
        .addEventListener('click', () => addTopic(topicsContainer));

    moduleElement.querySelector('.remove-module-btn')
        .addEventListener('click', () => moduleElement.remove());

    modulesContainer.appendChild(moduleElement);
}

function addTopic(topicsContainer) {
    const template = document.getElementById('topicTemplate');

    const topicElement = template.content
        .firstElementChild
        .cloneNode(true);

    topicElement.querySelector('.remove-topic-btn')
        .addEventListener('click', () => topicElement.remove());

    topicsContainer.appendChild(topicElement);
}

document.getElementById('contentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById('contentName').value,
        description: document.getElementById('contentDescription').value,
        modules: []
    };

    document.querySelectorAll('.module-card').forEach(moduleCard => {

        const module = {
            id: moduleCard.dataset.id || null,
            name: moduleCard.querySelector('.module-name').value,
            description: moduleCard.querySelector('.module-description').value,
            qualification: Number(
                moduleCard.querySelector('.module-qualification').value
            ),
            topics: []
        };

        moduleCard.querySelectorAll('.topic-card').forEach(topicCard => {
            module.topics.push({
                id: topicCard.dataset.id || null,
                name: topicCard.querySelector('.topic-name').value,
                description: topicCard.querySelector('.topic-description').value,
            });
        });

        data.modules.push(module);
    });

    try {
        const response = await fetch(`${apiUrl}/api/contents?id=${contentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        await showSuccess("Registro Exitoso");
        window.location.href = '../coordinator/contents.html';

    } catch (error) {
        console.error(error);
        showError("Error al Registrar");
    }

});