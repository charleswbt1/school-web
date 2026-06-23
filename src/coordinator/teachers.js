async function loadTable() {
    try {
        const response = await fetch(`${apiUrl}/api/users/role?role=teacher`);
        if (!response.ok) {
            throw new Error('Error al obtener docentes');
        }
        const jsonResponse = await response.json();
        const tbody = document.getElementById('table-body');

        if (!jsonResponse.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">No hay docentes registrados</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = jsonResponse.map(element => `
            <tr>
                <td>${element.nick_name}</td>
                <td>${element.first_name} ${element.last_name} ${element.second_last_name}</td>
                <td>${element.phone}</td>
                <td>${element.email}</td>
                <td>
                    <label class="switch">
                        <input
                            type="checkbox"
                            class="status-switch"
                            data-userid="${element.id}"
                            ${element.state === "active" ? "checked" : ""}
                        >
                        <span class="slider"></span>
                    </label>

                </td>
            </tr>
        `).join('');
        addSwitchEvents();
    } catch (error) {
        console.error(error);

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

    document.querySelectorAll(".status-switch")
        .forEach(switchBtn => {

            switchBtn.addEventListener(
                "change",
                async () => {

                    const userId =
                        switchBtn.dataset.userid;

                    const state =
                        switchBtn.checked
                            ? "active"
                            : "inactive";

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
                            throw new Error(
                                "Error al actualizar estado"
                            );
                        }

                        console.log(
                            `Usuario ${userId} actualizado a ${state}`
                        );

                    } catch (error) {

                        alert(
                            "Error al actualizar el estado"
                        );

                        switchBtn.checked =
                            !switchBtn.checked;

                        console.error(error);
                    }
                }
            );

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