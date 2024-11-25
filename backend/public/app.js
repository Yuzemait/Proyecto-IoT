// Configurar la URL base del backend
const BASE_URL = "https://proyecto-iot-1.onrender.com";
// const BASE_URL = "http://localhost:3000";


const desired_temp = 20.0
const max_temp = 30.0

// Manejar el registro de usuario
async function registerUser(event) {
    event.preventDefault();

    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;
    

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
            body: JSON.stringify({ username, password})
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
            setInterval(fetchData, 10000);
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
        const limit = 20

        const dataContainer = document.getElementById("adafruit-data");
        dataContainer.innerHTML = ""; // Limpiar datos anteriores

        if (response.ok) {

            const header = document.createElement("tr")
            const headerFecha = document.createElement("td");
            const headerValor = document.createElement("td");
            headerFecha.textContent = "Fecha";
            headerValor.textContent = "Valor";
            header.appendChild(headerValor);
            header.appendChild(headerFecha);

            dataContainer.appendChild(header)

            data.slice(0,limit).forEach((item) => {
                const listItem = document.createElement("tr");
                const listCol1 = document.createElement("td");
                const listCol2 = document.createElement("td");
                listCol1.textContent = `${item.value}`;
                listCol2.textContent = `${item.created_at}`;
                listItem.appendChild(listCol1);
                listItem.appendChild(listCol2);
                dataContainer.appendChild(listItem);
            });
            
            const realTemp = data[0].value;
            // const realTemp = 31.0;
            // Cambios en el icon
            const value = document.getElementById("temp-value");
            value.textContent = `${realTemp} °C`;
            adjustTemp(realTemp);

            console.log("Datos car");

        } else {
            alert("Error al obtener datos de Adafruit IO.");
        }
    } catch (error) {
        console.error("Error al obtener datos:", error);
        alert("Ocurrió un error al conectar con Adafruit IO.");
    }
}

async function sendTemp() {
    const backendURL = `${BASE_URL}/send-to-esp32`; // Cambia por la URL de tu backend
    const temp = parseFloat(document.getElementById("temp-range-slider").value);
    document.getElementById("temp-actual").textContent = temp + "°C"

    if (isNaN(temp)) {
        alert("Por favor ingresa un número válido.");
        return;
    }

    try {
        const response = await fetch(backendURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ temperature: temp }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Respuesta del backend:", data);
            alert("Valor enviado exitosamente al ESP32.");

        } else {
            console.error("Error al enviar al backend:", response.status);
            alert("Error al enviar el valor.");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("Error de conexión con el backend.");
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
    document.getElementById("temperature-container").classList.add("active");
}

function adjustTemp(temp){
    if (temp < desired_temp) {
        document.getElementById("temp-icon").classList.remove("fa-temperature-three-quarters");
        document.getElementById("temp-icon").classList.remove("normal");
        document.getElementById("temp-icon").classList.add("fa-thermometer-quarter");
        document.getElementById("temp-icon").classList.add("cold");
    }

    if (temp > desired_temp && (temp < max_temp)) {
        document.getElementById("temp-icon").classList.remove("fa-thermometer-quarter");
        document.getElementById("temp-icon").classList.remove("fa-thermometer-full");
        document.getElementById("temp-icon").classList.remove("cold");
        document.getElementById("temp-icon").classList.remove("hot");
        document.getElementById("temp-icon").classList.add("fa-temperature-three-quarters");
        document.getElementById("temp-icon").classList.add("normal");
    }

    if (temp > max_temp) {
        document.getElementById("temp-icon").classList.remove("fa-thermometer-quarter");
        document.getElementById("temp-icon").classList.remove("fa-thermometer-three-quarters");
        document.getElementById("temp-icon").classList.remove("cold");
        document.getElementById("temp-icon").classList.remove("normal");
        document.getElementById("temp-icon").classList.add("fa-temperature-full");
        document.getElementById("temp-icon").classList.add("hot");
    }
}

// Agregar event listeners
document.getElementById("register-form").addEventListener("submit", registerUser);
document.getElementById("login-form").addEventListener("submit", loginUser);
document.getElementById("to-login").addEventListener("click", showLogin);
document.getElementById("to-register").addEventListener("click", showRegister);
document.getElementById("set-temperature").addEventListener("click", sendTemp);
