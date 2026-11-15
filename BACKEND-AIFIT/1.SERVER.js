// ==========================================================
// AIFIT - SERVIDOR BACKEND PROFESIONAL (NODE.JS + EXPRESS + MONGODB + GEMINI)
// ==========================================================
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');

const app = express();

// Middlewares esenciales
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// ----------------------------------------------------------
// 1. CONEXIÓN A MONGODB
// ----------------------------------------------------------
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
})
    .then(() => console.log("📦 ¡Base de datos MongoDB conectada con éxito, mi papá!"))
    .catch(err => console.error("❌ Error conectando a MongoDB:", err));

// ----------------------------------------------------------
// 2. DEFINICIÓN DE ESQUEMAS Y MODELOS (MONGODB)
// ----------------------------------------------------------

// Esquema de Usuarios adaptado a tus formularios HTML
const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    usuarionombre: { type: String, required: true, unique: true },
    fdn: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    contrasena: { type: String, required: true },
    fechaRegistro: { type: Date, default: Date.now }
});
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Esquema de Historial de Chats (Vinculado al usuario)
const chatSchema = new mongoose.Schema({
    correoUsuario: { type: String, required: true },
    mensajeUsuario: { type: String, required: true },
    respuestaIA: { type: String, required: true },
    fecha: { type: Date, default: Date.now }
});
const ChatHistorial = mongoose.model('ChatHistorial', chatSchema);


// ----------------------------------------------------------
// 3. RUTA DE REGISTRO (Conectada a 3.REGISTRO.html)
// ----------------------------------------------------------
app.post('/registro', async (req, res) => {
    try {
        // Extraer variables soportando tanto 'contraseña' como 'contrasena'
        const { nombre, apellido, usuarionombre, fdn, correo, contraseña, contrasena } = req.body;
        const passFinal = contraseña || contrasena;

        if (!nombre || !apellido || !usuarionombre || !fdn || !correo || !passFinal) {
            return res.status(400).json({ success: false, error: "Faltan datos obligatorios para el registro, mi papá." });
        }

        // Validar si ya existe el correo o el nombre de usuario
        const usuarioExistente = await Usuario.findOne({ $or: [{ correo }, { usuarionombre }] });
        if (usuarioExistente) {
            return res.status(400).json({ success: false, error: "El correo o el nombre de usuario ya están registrados, mi papá." });
        }

        const nuevoUsuario = new Usuario({
            nombre,
            apellido,
            usuarionombre,
            fdn,
            correo,
            contrasena: passFinal
        });
        await nuevoUsuario.save();

        res.json({
            success: true,
            mensaje: "¡Registro exitoso! Ya puedes iniciar sesión, mi rey."
        });
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ success: false, error: "Error en el servidor al registrar usuario." });
    }
});


// ----------------------------------------------------------
// 4. RUTA DE INICIO DE SESIÓN / INGRESO (Conectada a 2.INICIOSESION.html)
// ----------------------------------------------------------
app.post('/ingreso', async (req, res) => {
    try {
        const { usuarionombre, correo, contrasena, contraseña } = req.body;
        const passFinal = contrasena || contraseña;

        // Buscar al usuario por correo o por nombre de usuario
        const queryBusqueda = [];
        if (correo) queryBusqueda.push({ correo });
        if (usuarionombre) queryBusqueda.push({ usuarionombre });

        if (queryBusqueda.length === 0) {
            return res.status(400).json({ success: false, error: "Ingresa tu usuario o correo para entrar." });
        }

        const usuario = await Usuario.findOne({ $or: queryBusqueda });
        if (!usuario) {
            return res.status(404).json({ success: false, error: "Usuario o correo no encontrados, mi papá." });
        }

        // Validar contraseña
        if (usuario.contrasena !== passFinal) {
            return res.status(401).json({ success: false, error: "Contraseña incorrecta, ¡pilas pues!" });
        }

        res.json({
            success: true,
            mensaje: `¡Bienvenido de nuevo, ${usuario.nombre}!`,
            usuario: {
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo,
                usuarionombre: usuario.usuarionombre
            }
        });
    } catch (error) {
        console.error("Error en ingreso:", error);
        res.status(500).json({ success: false, error: "Error en el servidor al iniciar sesión." });
    }
});


// ----------------------------------------------------------
// 5. RUTA DEL CHAT CON LA IA (GEMINI)
// ----------------------------------------------------------
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/Api_geminis', async (req, res) => {
    try {
        const { mensajito_usu, foto_ia, correo, usuario } = req.body;

        // Identificador del usuario (acepta correo o nombre de usuario)
        const idUsuario = correo || usuario || "invitado@aifit.com";

        // Si se envió un correo o usuario real, verificar si existe en la base de datos
        let usuarioValido = null;
        if (idUsuario !== "invitado@aifit.com") {
            usuarioValido = await Usuario.findOne({ $or: [{ correo: idUsuario }, { usuarionombre: idUsuario }] });
        }

        const promptSistema = `Eres Aifit-Coach, un entrenador personal y nutricionista experto, motivador, empático y con un estilo muy fresco y cercano (usando expresiones colombianas motivadoras como "mi papá", "mi papacho", "¡a darle con toda!"). Ayuda al usuario con rutinas de hipertrofia/calistenia, conteo de calorías y consejos de suplementación. Si te envía una foto de comida, analiza qué plato es y dale un estimado de calorías y macros.`;

        let contenidoParaGemini = [];
        if (mensajito_usu) contenidoParaGemini.push(mensajito_usu);

        if (foto_ia) {
            const matches = foto_ia.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                contenidoParaGemini.push({
                    inlineData: { data: matches[2], mimeType: matches[1] }
                });
            }
        }

        if (contenidoParaGemini.length === 0) {
            contenidoParaGemini.push("¡Hola Coach! Dame un consejo motivacional para entrenar hoy.");
        }

        // Función con reintento automático para la API de Gemini
        const solicitarGeminiConReintento = async (intentos = 3, esperaMs = 2000) => {
            for (let i = 0; i < intentos; i++) {
                try {
                    return await ai.models.generateContent({
                        model: 'gemini-3.8-flash',
                        contents: contenidoParaGemini,
                        config: { systemInstruction: promptSistema }
                    });
                } catch (err) {
                    const esSaturacion = err.status === 503 || (err.message && err.message.includes("503"));
                    if (esSaturacion && i < intentos - 1) {
                        console.warn(`⚠️ Servidor de Gemini ocupado (503). Reintentando... (Intento ${i + 1}/${intentos})`);
                        await new Promise(resolve => setTimeout(resolve, esperaMs));
                    } else {
                        throw err;
                    }
                }
            }
        };

        const response = await solicitarGeminiConReintento();
        const respuestaIA = response.text || "¡A darle duro, mi papá! Sigue entrenando con disciplina.";

        // Guardar automáticamente el chat en MongoDB
        const nuevoChat = new ChatHistorial({
            correoUsuario: usuarioValido ? usuarioValido.correo : idUsuario,
            mensajeUsuario: mensajito_usu || "Consulta con imagen/multimedia",
            respuestaIA: respuestaIA
        });
        await nuevoChat.save();

        res.json({
            success: true,
            respuesta: respuestaIA
        });

    } catch (error) {
        console.error("❌ Error detallado en el chat:", error);
        res.status(500).json({
            success: false,
            error: "Hubo un error procesando tu solicitud con el Coach."
        });
    }
});

// Arrancar servidor en el puerto 3000
app.listen(3000, () => {
    console.log("🚀 Servidor AIFIT corriendo re blando en http://localhost:3000");
});