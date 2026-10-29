const apiUrl = "https://school-back-764239827508.us-east1.run.app";
const showPrice = false;

function initializeMenu() {
    const sidebar = document.getElementById("sidebar");
    const hamburger = document.getElementById("hamburger");
    hamburger.addEventListener("click", () => {
        sidebar.classList.toggle("active");
    });
    document.addEventListener("click", (e) => {
        if (
            sidebar.classList.contains("active") &&
            !sidebar.contains(e.target) &&
            !hamburger.contains(e.target)
        ) {
            sidebar.classList.remove("active");
        }
    });
}
function initializeSession() {
    const loginModal = document.getElementById("loginModal");
    const loginButton = document.getElementById("openLogin");
    const nick_name = document.getElementById("nickname");
    const password = document.getElementById("password");
    const text_error = document.getElementById("loginError");
    loginButton.addEventListener("click", () => {
        nick_name.value = "";
        password.value = "";
        text_error.textContent = "";
        loginModal.style.display = "flex";
    });
    loginModal.addEventListener("click", (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = "none";
        }
    });
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/api/users/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        nick_name: nick_name.value.trim(),
                        password: password.value.trim()
                    })
                }
            );
            const data = await response.json();
            if (!response.ok) {
                text_error.textContent = "Usuario o Contraseña Incorrectos";
                return;
            }
            sessionStorage.setItem("role", data.role);
            sessionStorage.setItem("userId", data.userId);
            switch (data.role) {
                case "admin":
                    window.location.href = `../${data.role}/review.html`;
                    break;
                case "adviser":
                    window.location.href = `../${data.role}/students.html`;
                    break;
                default:
                    window.location.href = `../${data.role}/courses.html`;
            }
        } catch (error) {
            console.error("Login error:", error);
            showError("Error de conexión. Por favor, inténtalo de nuevo más tarde.");
        }
    });
}

initializeMenu();
initializeSession();

/* =========================
   CARRUSEL DE EVENTOS
========================= */

const eventSlides = document.querySelectorAll(".event-slide");
const eventPrev = document.getElementById("eventPrev");
const eventNext = document.getElementById("eventNext");
const eventIndicators = document.getElementById("eventIndicators");

let currentEvent = 0;
let eventInterval;

/* Crear indicadores */
eventSlides.forEach((slide, index) => {
    const indicator = document.createElement("button");
    indicator.classList.add("event-indicator");
    if (index === 0) {
        indicator.classList.add("active");
    }
    indicator.addEventListener("click", () => {
        showEvent(index);
        restartEventInterval();
    });
    eventIndicators.appendChild(indicator);
});
function showEvent(index) {
    if (index >= eventSlides.length) {
        currentEvent = 0;
    } else if (index < 0) {
        currentEvent = eventSlides.length - 1;
    } else {
        currentEvent = index;
    }
    eventSlides.forEach((slide, index) => {
        slide.classList.toggle(
            "active",
            index === currentEvent
        );
    });
    const indicators = document.querySelectorAll(".event-indicator");
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle(
            "active",
            index === currentEvent
        );
    });
}
eventPrev.addEventListener("click", () => {
    showEvent(currentEvent - 1);
    restartEventInterval();
});
eventNext.addEventListener("click", () => {
    showEvent(currentEvent + 1);
    restartEventInterval();
});
function startEventInterval() {
    eventInterval = setInterval(() => {
        showEvent(currentEvent + 1);
    }, 5000);
}
function restartEventInterval() {
    clearInterval(eventInterval);
    startEventInterval();
}
startEventInterval();

function openWhatsApp(phone) {
    const message = "Solicito información sobre el curso.";
    const webUrl =
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    setTimeout(() => {
        window.open(webUrl, "_blank");
    }, 100);
}