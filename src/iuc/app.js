const apiUrl = "https://school-back-764239827508.us-east1.run.app";
const role = sessionStorage.getItem("role");
const showPrice = false;

async function loadComponents() {
    // SIDERBAR
    let sidebarFile = `../${role}/sidebar.html`;
    const sidebar = await fetch(sidebarFile);
    document.getElementById("sidebar-container").innerHTML = await sidebar.text();

    // HEADER
    const header = await fetch("../iuc/header.html");
    const headerHtml = await header.text();
    document.getElementById("header-container").innerHTML = headerHtml;

    initializeMenu();
    initializeSession();
}

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
    const logoutBtn = document.getElementById("closeSession");
    logoutBtn.addEventListener("click", function () {
        sessionStorage.removeItem("userId");
        sessionStorage.clear();
        window.location.replace("../home/index.html");
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
    return new Promise(resolve => {

        document.getElementById("alertOverlay").style.display = "block";
        document.getElementById("customAlert").style.display = "block";
        document.getElementById("alertCancelButton").style.display = "none";

        const icon = document.getElementById("alertIcon");

        icon.className = "alert-icon error";
        icon.innerHTML = "✕";

        document.getElementById("alertTitle").innerHTML = "ERROR";
        document.getElementById("alertMessage").innerHTML = message;

        const button = document.getElementById("alertButton");
        button.style.background = "#F44336";
        button.innerHTML = "ACEPTAR";

        button.onclick = () => {
            document.getElementById("alertOverlay").style.display = "none";
            document.getElementById("customAlert").style.display = "none";
            resolve();
        };
    });
}

function closeAlert() {
    document.getElementById("alertOverlay").style.display = "none";
    document.getElementById("customAlert").style.display = "none";
    document.getElementById("alertCancelButton").style.display = "none";
}