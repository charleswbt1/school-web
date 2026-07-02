const roleSession = localStorage.getItem('role');

async function loadTable() {
    try {
        if (roleSession !== 'coordinator') {
            document.getElementById('btn-add').style.display = 'none';
        }
        const response = await fetch(`${apiUrl}/api/courses/teachers`);
        if (!response.ok) {
            throw new Error('Error al obtener docentes');
        }
        const jsonResponse = await response.json();
        const tbody = document.getElementById('table-body');

        tbody.innerHTML = jsonResponse.map(element => `
            <tr>
                <td>${element.first_name} ${element.last_name} ${element.second_last_name}</td>
                <td>${element.phone}</td>
                <td>${element.email}</td>
                <td>${element.courses.map(course => `(${course.hours_week ?? 0}) ${course.name}`).join('<br>')}</td>
                <td>${element.courses.reduce((total, course) => total + (course.hours_week ?? 0), 0)}</td>
                <td>
                    ${roleSession === 'coordinator'
                ? `
                                    <label class="switch">
                                        <input
                                            type="checkbox"
                                            class="status-switch"
                                            data-userid="${element.id}"
                                            ${element.state === "active" ? "checked" : ""}
                                        >
                                        <span class="slider"></span>
                                    </label>
                                `
                : element.state === 'active'
                    ? 'Activo'
                    : 'Inactivo'
            }
                </td>
            </tr>
        `).join('');
        addSwitchEvents();
    } catch (error) {
        alert(error);
        document.getElementById('table-body').innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar los docentes
                </td>
            </tr>
        `;
    }
}

function addSwitchEvents() {
    document.querySelectorAll(".status-switch").forEach(switchBtn => {
        switchBtn.addEventListener("change", async () => {
            const userId = switchBtn.dataset.userid;
            const state = switchBtn.checked ? "active" : "inactive";

            try {
                const response = await fetch(
                    `${apiUrl}/api/users?id=${userId}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            state: state
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error("Error al actualizar estado");
                }
            } catch (error) {
                alert("Error al actualizar el estado");
                switchBtn.checked = !switchBtn.checked;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadTable();

    const btnAdd = document.getElementById('btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            window.location.href = '../user/register.html?roleRegister=teacher';
        });
    }
});