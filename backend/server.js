const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Configurar middleware
app.use(cors());
app.use(express.json());

// Configurar carpeta pública para el frontend
const PUBLIC_DIR = path.join(__dirname, "public");
app.use(express.static(PUBLIC_DIR));

// Configura tu clave y feed de Adafruit IO
const AIO_KEY = process.env.ADAFRUIT_API;
const USERNAME = "mar_vela15";
const FEED = "mqtt-publish-esp32-mar.temperatura";

const AIO_URL = `https://io.adafruit.com/api/v2/${USERNAME}/feeds/${FEED}/data`;

// Ruta del archivo JSON para usuarios
const USERS_FILE = path.join(__dirname, "data", "users.json");

// Lee los usuarios desde el archivo JSON
function getUsers() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify([]));
    }
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data);
}

// Guarda los usuarios en el archivo JSON
function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Endpoint para registrar un usuario
app.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
    }

    const users = getUsers();
    if (users.find((user) => user.username === username)) {
        return res.status(409).json({ error: "El usuario ya existe" });
    }

    users.push({ username, password });
    saveUsers(users);

    res.status(201).json({ message: "Usuario registrado con éxito" });
});

// Endpoint para iniciar sesión
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const users = getUsers();
    const user = users.find(
        (user) => user.username === username && user.password === password
    );

    if (!user) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    res.json({ message: "Inicio de sesión exitoso" });
});

// Endpoint para obtener datos desde Adafruit IO
app.get("/data", async (req, res) => {
    try {
        const response = await axios.get(AIO_URL, {
            headers: {
                "X-AIO-Key": AIO_KEY,
            },
        });
        res.json(response.data);
        // console.log(response.data);
    } catch (error) {
        console.error("Error al obtener datos:", error.message);
        res.status(500).json({ error: "Error al conectar con Adafruit IO" });
    }
});

// Servir el frontend para cualquier ruta no manejada
app.get("*", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
