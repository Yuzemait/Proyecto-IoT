// Configurar la URL base del backend
const BASE_URL = "http://localhost:3000";

// Manejar el registro de usuario
async function registerUser(event) {
    event.preventDefault();

    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;
    const temperature = 50.0;

    if (!username || !password) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password, temperature }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            showLogin(); // Cambiar a la vista de inicio de sesión
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Error en el registro:", error);
        alert("Ocurrió un error durante el registro.");
    }
}

// Manejar el inicio de sesión
async function loginUser(event) {
    event.preventDefault();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    if (!username || !password) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            showData(); // Cambiar a la vista de datos
            fetchData(); // Obtener datos de Adafruit
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        alert("Ocurrió un error durante el inicio de sesión.");
    }
}

// Obtener datos de Adafruit IO
async function fetchData() {
    try {
        const response = await fetch(`${BASE_URL}/data`);
        const data = await response.json();

        const dataContainer = document.getElementById("adafruit-data");
        dataContainer.innerHTML = ""; // Limpiar datos anteriores

        if (response.ok) {
            data.forEach((item) => {
                const listItem = document.createElement("li");
                listItem.textContent = `Valor: ${item.value}, Fecha: ${item.created_at}`;
                dataContainer.appendChild(listItem);
            });
        } else {
            alert("Error al obtener datos de Adafruit IO.");
        }
    } catch (error) {
        console.error("Error al obtener datos:", error);
        alert("Ocurrió un error al conectar con Adafruit IO.");
    }
}

// Cambiar entre vistas
function showLogin() {
    document.getElementById("register-container").classList.remove("active");
    document.getElementById("login-container").classList.add("active");
}

function showRegister() {
    document.getElementById("login-container").classList.remove("active");
    document.getElementById("register-container").classList.add("active");
}

function showData() {
    document.getElementById("login-container").classList.remove("active");
    document.getElementById("data-container").classList.add("active");
}

// Agregar event listeners
document.getElementById("register-form").addEventListener("submit", registerUser);
document.getElementById("login-form").addEventListener("submit", loginUser);
document.getElementById("to-login").addEventListener("click", showLogin);
document.getElementById("to-register").addEventListener("click", showRegister);
