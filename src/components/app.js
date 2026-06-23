const apiUrl = "https://school-back-764239827508.us-east1.run.app";
// const apiUrl = "http://localhost:3000";

async function loadComponents() {
    const role = localStorage.getItem("role");

    // SIDEBAR
    let sidebarFile = "../components/sidebar.html";
    if (role === "student") {
        sidebarFile = "../components/sidebar-student.html";
    }
    if (role === "adviser") {
        sidebarFile = "../components/sidebar-adviser.html";
    }
    if (role === "coordinator") {
        sidebarFile = "../components/sidebar-coordinator.html";
    }
    if (role === "teacher") {
        sidebarFile = "../components/sidebar-teacher.html";
    }
    const sidebar = await fetch(sidebarFile);
    document.getElementById("sidebar-container").innerHTML = await sidebar.text();

    // HEADER
    const header = await fetch("../components/header.html");
    const headerHtml = await header.text();
    document.getElementById("header-container").innerHTML = headerHtml;

    // LOGIN-MODAL
    const modalResponse = await fetch("../components/login-modal.html");
    const modalHtml = await modalResponse.text();
    document.getElementById("modal-container").innerHTML = modalHtml;

    // HIDE LOGIN

    const loginButton = document.getElementById("openLogin");
    if (role && loginButton) {
        loginButton.style.display = "none";
    }

    initializeMenu();
    initializeLogout();
    initializeLoginModal();
}

function initializeMenu() {
    const sidebar = document.getElementById("sidebar");
    const hamburger = document.getElementById("hamburger");
    hamburger.addEventListener("click", () => {
        sidebar.classList.toggle("active");
    });
}

function initializeLoginModal() {
    /* ========================= MODAL ========================= */
    const loginModal = document.getElementById("loginModal");
    const openLogin = document.getElementById("openLogin");
    const closeModal = document.getElementById("closeModal");

    openLogin.addEventListener("click", () => {
        loginModal.style.display = "flex";
    });
    closeModal.addEventListener("click", () => {
        loginModal.style.display = "none";
    });

    // BOTÓN REGISTRO
    const registerBtn = document.getElementById("registerBtn");

    if (registerBtn) {
        registerBtn.addEventListener("click", () => {
            window.location.href = "../user/register.html";
        });
    }


    /* ========================= LOGIN ========================= */

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const nick_name =
            document.getElementById("nickname").value;

        const password =
            document.getElementById("password").value;

        try {

            const response = await fetch(
                `${apiUrl}/api/users/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nick_name,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                document.getElementById("loginError").textContent =
                    "Usuario o Contraseña Incorrectos";

                return;
            }

            loginModal.style.display = "none";

            localStorage.setItem("userId", data.user_id);
            localStorage.setItem("role", data.role);

            const courseid = localStorage.getItem("courseId");

            if (courseid) {

                await fetch(
                    `${apiUrl}/api/students/register`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            user_id: data.user_id,
                            course_id: courseid
                        })
                    }
                );

                localStorage.removeItem("courseId");
            }

            // Redirecciones...
            if (data.role === "adviser") {
                window.location.href = "../adviser/bill.html";
            }

            if (data.role === "student") {
                window.location.href = "../student/courses.html";
            }

            if (data.role === "coordinator") {
                window.location.href = "../coordinator/periods.html";
            }

            if (data.role === "teacher") {
                window.location.href = "../teacher/students.html";
            }

        } catch (error) {

            console.error(error);

            document.getElementById("loginError").textContent =
                "Error de conexión con el servidor";

        }

    });
}

function initializeLogout() {

    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener(
        "click",
        () => {
            localStorage.clear();
            sessionStorage.clear();

            window.location.replace("../home/index.html");
        }
    );
}
loadComponents();