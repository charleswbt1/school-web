const apiUrl = "https://school-back-764239827508.us-east1.run.app";
// const apiUrl = "http://localhost:3000";

async function loadComponents() {
    const role = sessionStorage.getItem("role");

    // SIDEBAR
    let sidebarFile = "../components/sidebar.html";
    if (role === "student") {
        sidebarFile = "../components/sidebar-student.html";
    }
    if (role === "teacher") {
        sidebarFile = "../components/sidebar-teacher.html";
    }
    if (role === "adviser") {
        sidebarFile = "../components/sidebar-adviser.html";
    }
    if (role === "counter") {
        sidebarFile = "../components/sidebar-counter.html";
    }
    if (role === "coordinator") {
        sidebarFile = "../components/sidebar-coordinator.html";
    }
    if (role === "admin") {
        sidebarFile = "../components/sidebar-admin.html";
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
    const nick_name = document.getElementById("nickname");
    const password = document.getElementById("password");
    const text_error = document.getElementById("loginError");

    openLogin.addEventListener("click", () => {
        loginModal.style.display = "flex";
    });
    closeModal.addEventListener("click", () => {
        nick_name.value = "";
        password.value = "";
        text_error.textContent = ""; 
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

        

        try {

            const response = await fetch(
                `${apiUrl}/api/users/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nick_name: nick_name.value,
                        password: password.value
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

            sessionStorage.setItem("userId", data.user_id);
            sessionStorage.setItem("role", data.role);

            const courseid = sessionStorage.getItem("courseId");

            if (courseid) {

                await fetch(
                    `${apiUrl}/api/students`,
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

                sessionStorage.removeItem("courseId");
            }

            // Redirecciones...
            if (data.role === "student") {
                window.location.href = "../student/courses.html";
            }

            if (data.role === "teacher") {
                window.location.href = "../teacher/courses.html";
            }

            if (data.role === "adviser") {
                window.location.href = "../adviser/bill.html";
            }

            if (data.role === "counter") {
                window.location.href = "../control/periods.html";
            }

            if (data.role === "coordinator") {
                window.location.href = "../control/periods.html";
            }

            if (data.role === "admin") {
                window.location.href = "../admin/review.html";
            }

        } catch (error) {
            alert(error);
            text_error.textContent = "Error de conexión con el servidor";
        }
    });
}
loadComponents();

function showSuccess(message) {
    return new Promise(resolve => {
        document.getElementById("alertOverlay").style.display = "block";
        document.getElementById("customAlert").style.display = "block";
        document.getElementById("alertCancelButton").style.display = "none";

        const icon = document.getElementById("alertIcon");

        icon.className = "alert-icon success";
        icon.innerHTML = "✓";

        document.getElementById("alertTitle").innerHTML = "ÉXITO";
        document.getElementById("alertMessage").innerHTML = message;

        const button = document.getElementById("alertButton");
        button.style.background = "#4CAF50";
        button.innerHTML = "CONTINUAR";
        button.onclick = () => {
            closeAlert();
            resolve();
        };

    });

}

function showConfirm(message) {
    return new Promise(resolve => {
        document.getElementById("alertOverlay").style.display = "block";
        document.getElementById("customAlert").style.display = "block";
        document.getElementById("alertCancelButton").style.display = "block";

        const icon = document.getElementById("alertIcon");

        icon.className = "alert-icon confirm";
        icon.innerHTML = "?";

        document.getElementById("alertTitle").innerHTML = "CONFIRMAR";
        document.getElementById("alertMessage").innerHTML = message;

        const button = document.getElementById("alertButton");
        button.style.background = "#2196F3";
        button.innerHTML = "ACEPTAR";
        button.onclick = () => {
            closeAlert();
            resolve(true);
        };

        const cancelButton = document.getElementById("alertCancelButton");
        cancelButton.style.background = "#f33321";
        cancelButton.innerHTML = "CANCELAR";
        cancelButton.onclick = () => {
            closeAlert();
            resolve(false);
        };

    });

}

function showError(message) {
    document.getElementById("alertOverlay").style.display = "block";
    document.getElementById("customAlert").style.display = "block";
    document.getElementById("alertCancelButton").style.display = "none";

    const icon = document.getElementById("alertIcon");

    icon.className = "alert-icon error";
    icon.innerHTML = "✕";

    document.getElementById("alertTitle").innerHTML = "ERROR";
    document.getElementById("alertMessage").innerHTML = message;

    document.getElementById("alertButton").style.background = "#F44336";
    document.getElementById("alertButton").innerHTML = "ACEPTAR";
}

function closeAlert() {
    document.getElementById("alertOverlay").style.display = "none";
    document.getElementById("customAlert").style.display = "none";
    document.getElementById("alertCancelButton").style.display = "none";
}

function initializeLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;
    logoutBtn.addEventListener("click", window.logout);
}

window.logout = function () {
    sessionStorage.removeItem("userId");
    sessionStorage.clear();
    window.location.replace("../home/index.html");
};