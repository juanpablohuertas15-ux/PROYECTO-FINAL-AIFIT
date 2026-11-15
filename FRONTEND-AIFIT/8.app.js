// ==========================================================
// AIFIT - SCRIPT MAESTRO UNIFICADO (FRONTEND + BACKEND GEMINI)
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {

    // ----------------------------------------------------------
    // 0. CARGAR FOTO DE PERFIL GUARDADA EN TODAS LAS PÁGINAS
    // ----------------------------------------------------------
    const fotoGuardada = localStorage.getItem('aifit_foto_usuario');
    if (fotoGuardada) {
        const todasLasFotosPerfil = document.querySelectorAll('.perfil_foto, .perfilito, .fotousu, .fotoperfil');
        todasLasFotosPerfil.forEach(img => {
            img.src = fotoGuardada;
        });
    }

    // ----------------------------------------------------------
    // 1. CERRAR SESIÓN (Botón Salir en Navbar)
    // ----------------------------------------------------------
    const botonesSalir = document.querySelectorAll('.btn-cerrar-sesion, .btn-cerrar_sesion');
    botonesSalir.forEach(boton => {
        boton.addEventListener('click', (event) => {
            event.preventDefault();
            if (confirm("¿Estás seguro de que deseas salir de AIFIT?")) {
                localStorage.removeItem('aifit_usuario');
                localStorage.removeItem('aifit_foto_usuario');
                window.location.href = "2.INICIOSESION.html";
            }
        });
    });

    // ----------------------------------------------------------
    // 2. BUSCADOR SUPERIOR
    // ----------------------------------------------------------
    const buscadorForm = document.querySelector('.buscador-form');
    if (buscadorForm) {
        buscadorForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = buscadorForm.querySelector('input[name="b"]');
            const textoBusqueda = input ? input.value.trim() : '';

            if (textoBusqueda !== '') {
                alert(`🔍 Buscando en AIFIT: "${textoBusqueda}"...`);
                input.value = '';
            }
        });
    }

    // ----------------------------------------------------------
    // 3. BOTÓN "SEGUIR" (DORADO ACTIVO / TRANSPARENTE INACTIVO)
    // ----------------------------------------------------------
    const btnSeguir = document.querySelector('.btn_seguir');
    if (btnSeguir) {
        const elementoContador = document.querySelector('.estadisticas_perfil .numeros_perfil li strong');
        let siguiendo = false;

        btnSeguir.style.backgroundColor = "transparent";
        btnSeguir.style.color = "var(--color-principal, #d4af37)";
        btnSeguir.style.border = "1px solid var(--color-principal, #d4af37)";
        btnSeguir.style.cursor = "pointer";

        btnSeguir.addEventListener('click', () => {
            let numeroSeguidores = 15600;
            if (elementoContador) {
                let textoLimpio = elementoContador.textContent.replace(/\./g, '').replace(/,/g, '');
                numeroSeguidores = parseInt(textoLimpio) || 15600;
            }

            if (!siguiendo) {
                siguiendo = true;
                numeroSeguidores += 1;
                btnSeguir.textContent = "Siguiendo";
                btnSeguir.style.backgroundColor = "var(--color-principal, #d4af37)";
                btnSeguir.style.color = "#000000";
                btnSeguir.style.border = "none";
                btnSeguir.style.fontWeight = "bold";
            } else {
                siguiendo = false;
                numeroSeguidores -= 1;
                btnSeguir.textContent = "Seguir";
                btnSeguir.style.backgroundColor = "transparent";
                btnSeguir.style.color = "var(--color-principal, #d4af37)";
                btnSeguir.style.border = "1px solid var(--color-principal, #d4af37)";
                btnSeguir.style.fontWeight = "bold";
            }

            if (elementoContador) {
                elementoContador.textContent = numeroSeguidores.toLocaleString('es-CO');
            }
        });
    }

    // ----------------------------------------------------------
    // 4. CAMBIAR FOTO DE PERFIL DESDE EL PERFIL (6.PERFIL.html)
    // ----------------------------------------------------------
    const fotoPerfilGrande = document.querySelector('.perfil_foto');
    const inputFotoPerfil = document.querySelector('#input-foto-perfil');

    if (fotoPerfilGrande && inputFotoPerfil) {
        fotoPerfilGrande.style.cursor = "pointer";
        fotoPerfilGrande.title = "Haz clic para cambiar tu foto de perfil";

        fotoPerfilGrande.addEventListener('click', () => {
            inputFotoPerfil.click();
        });

        inputFotoPerfil.addEventListener('change', (e) => {
            const archivo = e.target.files[0];
            if (archivo) {
                const reader = new FileReader();
                reader.onload = (evento) => {
                    const nuevaRutaFoto = evento.target.result;
                    localStorage.setItem('aifit_foto_usuario', nuevaRutaFoto);

                    const todasLasFotosPerfil = document.querySelectorAll('.perfil_foto, .perfilito, .fotousu, .fotoperfil');
                    todasLasFotosPerfil.forEach(img => {
                        img.src = nuevaRutaFoto;
                    });
                };
                reader.readAsDataURL(archivo);
            }
        });
    }

    // ----------------------------------------------------------
    // 5. CREAR PUBLICACIÓN EN FEED
    // ----------------------------------------------------------
    const formCrearPubli = document.querySelector('.form-crear-publi');
    const cajaCrear = document.querySelector('.publicrea');
    const muroPublicaciones = document.querySelector('.muro_publicacion');
    const inputSubirFoto = document.querySelector('#subirfoto');
    const contenedorMiniatura = document.querySelector('#vista-previa-miniatura');

    let imagenBase64Seleccionada = '';

    if (inputSubirFoto && contenedorMiniatura) {
        inputSubirFoto.addEventListener('change', (e) => {
            const archivo = e.target.files[0];
            if (archivo) {
                const reader = new FileReader();
                reader.onload = (evento) => {
                    imagenBase64Seleccionada = evento.target.result;
                    contenedorMiniatura.style.display = 'block';
                    contenedorMiniatura.innerHTML = `
                        <div style="position: relative; display: inline-block;">
                            <img src="${imagenBase64Seleccionada}" alt="Vista previa" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--color-principal, #d4af37);">
                            <button type="button" id="remover-foto-temp" style="position: absolute; top: -5px; right: -5px; background: #000; color: #fff; border: 1px solid #fff; border-radius: 50%; width: 22px; height: 22px; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold;">×</button>
                        </div>
                    `;

                    const btnRemover = document.querySelector('#remover-foto-temp');
                    if (btnRemover) {
                        btnRemover.addEventListener('click', () => {
                            inputSubirFoto.value = '';
                            imagenBase64Seleccionada = '';
                            contenedorMiniatura.innerHTML = '';
                            contenedorMiniatura.style.display = 'none';
                        });
                    }
                };
                reader.readAsDataURL(archivo);
            }
        });
    }

    if (formCrearPubli && muroPublicaciones) {
        formCrearPubli.addEventListener('submit', (event) => {
            event.preventDefault();
            const textarea = formCrearPubli.querySelector('textarea[name="publiparra"]');
            const textoMensaje = textarea ? textarea.value.trim() : '';

            if (textoMensaje !== '' || imagenBase64Seleccionada !== '') {
                const avatarActual = localStorage.getItem('aifit_foto_usuario') || 'fotoperfil.jpg';

                const nuevaPubli = document.createElement('article');
                nuevaPubli.classList.add('publiperson');

                let htmlFoto = imagenBase64Seleccionada ? `
                    <div class="fotopersonpubli">
                        <img src="${imagenBase64Seleccionada}" alt="Foto de la publicacion">
                    </div>
                ` : '';

                nuevaPubli.innerHTML = `
                    <header class="infopubliusu">
                        <div class="usuarioinfo">
                            <img src="${avatarActual}" alt="Foto de usuario" class="fotousu">
                            <div class="usu-textos">
                                <h4>Juan Huertas</h4>
                                <span class="tiempoconectado">Justo ahora</span>
                            </div>
                        </div>
                        <button class="btn_opciones_publi">⋮</button>
                    </header>

                    <div class="contenido_publi">
                        <p>${textoMensaje}</p>
                        ${htmlFoto}
                    </div>

                    <footer class="publi_reaccion">
                        <div class="reacciones">
                            <button class="btn_reaccion">❤️ <span>0</span></button>
                            <button class="btn_reaccion">💬 <span>0</span></button>
                            <button class="btn_reaccion">🔁 <span>0</span></button>
                        </div>
                        <div class="cajadecomentarios"></div>
                        <form action="/comentar" method="POST" class="form_comentar">
                            <input type="hidden" name="publi_id" value="nueva">
                            <input type="text" name="texto_comentario" placeholder="Agrega un comentario..." required autocomplete="off">
                            <button type="submit">Enviar</button>
                        </form>
                    </footer>
                `;

                if (cajaCrear) {
                    cajaCrear.insertAdjacentElement('afterend', nuevaPubli);
                } else {
                    muroPublicaciones.prepend(nuevaPubli);
                }

                if (textarea) textarea.value = '';
                if (inputSubirFoto) inputSubirFoto.value = '';
                imagenBase64Seleccionada = '';
                if (contenedorMiniatura) {
                    contenedorMiniatura.innerHTML = '';
                    contenedorMiniatura.style.display = 'none';
                }
            }
        });
    }

    // ----------------------------------------------------------
    // 6. REACCIONES DEL MURO (ME GUSTA Y COMPARTIR)
    // ----------------------------------------------------------
    document.addEventListener('click', (event) => {
        const botonClickeado = event.target.closest('.btn_reaccion');
        if (!botonClickeado) return;

        const textoBoton = botonClickeado.textContent;
        const publicacion = botonClickeado.closest('.publiperson');

        if (textoBoton.includes('❤️')) {
            let span = botonClickeado.querySelector('span');
            let num = span ? parseInt(span.textContent) || 0 : 0;

            if (botonClickeado.classList.contains('dio-like')) {
                botonClickeado.classList.remove('dio-like');
                num = Math.max(0, num - 1);
                botonClickeado.style.color = "inherit";
            } else {
                botonClickeado.classList.add('dio-like');
                num += 1;
                botonClickeado.style.color = "var(--color-principal, #d4af37)";
                botonClickeado.style.transform = "scale(1.1)";
                setTimeout(() => { botonClickeado.style.transform = "scale(1)"; }, 200);
            }
            if (span) span.textContent = num;
        }

        if (textoBoton.includes('🔁') && publicacion) {
            let span = botonClickeado.querySelector('span');
            let num = span ? parseInt(span.textContent) || 0 : 0;
            num += 1;
            if (span) span.textContent = num;

            const clonPubli = publicacion.cloneNode(true);
            if (cajaCrear) {
                cajaCrear.insertAdjacentElement('afterend', clonPubli);
            } else if (muroPublicaciones) {
                muroPublicaciones.prepend(clonPubli);
            }
            alert("🔁 ¡Publicación compartida con éxito!");
        }
    });

    // ----------------------------------------------------------
    // 7. COMENTARIOS EN EL FEED
    // ----------------------------------------------------------
    document.addEventListener('submit', (event) => {
        if (event.target.classList.contains('form_comentar')) {
            event.preventDefault();

            const form = event.target;
            const input = form.querySelector('input[name="texto_comentario"]');
            const textoComentario = input ? input.value.trim() : '';

            if (textoComentario !== '') {
                const publicacion = form.closest('.publiperson');
                const cajaComentarios = publicacion.querySelector('.cajadecomentarios');

                const nuevoComentario = document.createElement('div');
                nuevoComentario.classList.add('comentario-item');
                nuevoComentario.innerHTML = `
                    <strong>Juan Huertas</strong>
                    <p>${textoComentario}</p>
                `;

                cajaComentarios.appendChild(nuevoComentario);
                input.value = '';
            }
        }
    });

    // ----------------------------------------------------------
    // 8. CHAT IA COACH (CONEXIÓN REAL CON GEMINI EN NODE.JS) - 100% MELO
    // ----------------------------------------------------------
    const contenedorMensajes = document.querySelector('.chat_mesage');
    const formChat = document.querySelector('.barra_chataifit');
    const inputMensaje = document.querySelector('#mensaje_usu');
    const inputFotoChat = document.querySelector('#envio_foto');
    const previewArchivo = document.querySelector('#previewArchivo');
    const previewNombre = document.querySelector('.preview-nombre');
    const btnCancelarAdjunto = document.querySelector('.btn-cancelar-adjunto');
    const btnBorrarChat = document.querySelector('.btn-borrar_chat');
    const botonesTemas = document.querySelectorAll('.tema');

    let archivoFotoChatBase64 = null;

    const obtenerHoraChat = () => {
        const ahora = new Date();
        let h = ahora.getHours();
        let m = ahora.getMinutes();
        const ampm = h >= 12 ? 'pm' : 'am';
        h = h % 12 || 12;
        m = m < 10 ? '0' + m : m;
        return `${h}:${m} ${ampm}`;
    };

    const agregarBurbujaChat = (tipo, texto, srcImagen = '', idTemporal = null) => {
        if (!contenedorMensajes) return;
        const burbuja = document.createElement('div');
        burbuja.classList.add('mensaje-bubble');
        burbuja.classList.add(tipo === 'ia' ? 'msg-ia' : 'msg-usuario');

        if (idTemporal) {
            burbuja.id = idTemporal; // Permite identificar burbujas temporales (como "Escribiendo...")
        }

        let htmlImg = srcImagen ? `<img src="${srcImagen}" alt="Foto adjunta" class="img-adjunta-chat" style="max-width:100%; border-radius:8px; margin-bottom:8px;">` : '';

        burbuja.innerHTML = `
            ${htmlImg}
            <p>${texto}</p>
            <span class="hora_mensaje">${obtenerHoraChat()}</span>
        `;
        contenedorMensajes.appendChild(burbuja);
        contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
        return burbuja;
    };

    const enviarMensajeAlBackend = async (textoAEnviar, fotoAEnviar = null) => {
        agregarBurbujaChat('usuario', textoAEnviar || "Te comparto esta foto:", fotoAEnviar);

        if (inputMensaje) inputMensaje.value = '';
        if (inputFotoChat) inputFotoChat.value = '';
        const fotoTemporal = fotoAEnviar;
        archivoFotoChatBase64 = null;
        if (previewArchivo) previewArchivo.style.display = 'none';

        // Creamos un ID único para mostrar que la IA está analizando la solicitud
        const idCargando = 'cargando_' + Date.now();
        agregarBurbujaChat('ia', '⏳ Analizando tu requerimiento en AIFIT...', '', idCargando);

        const correoUsuarioLogueado = localStorage.getItem('correoUsuario') || "juanpabluertas15@gmail.com";

        try {
            const respuestaServidor = await fetch('http://localhost:3000/Api_geminis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mensajito_usu: textoAEnviar,
                    foto_ia: fotoTemporal,
                    correo: correoUsuarioLogueado
                })
            });

            const resultado = await respuestaServidor.json();

            // Borramos la burbuja de "Cargando..."
            const burbujaCargando = document.getElementById(idCargando);
            if (burbujaCargando) burbujaCargando.remove();

            if (resultado.success) {
                agregarBurbujaChat('ia', resultado.respuesta);
            } else {
                agregarBurbujaChat('ia', "⚠️ Hubo un alta demanda en los servidores de Google. Vuelve a intentarlo en un momento, mi rey.");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            const burbujaCargando = document.getElementById(idCargando);
            if (burbujaCargando) burbujaCargando.remove();

            agregarBurbujaChat('ia', "⚠️ No se pudo conectar con el servidor backend en localhost:3000. Asegúrate de encender Node.js.");
        }
    };

    if (btnBorrarChat && contenedorMensajes) {
        btnBorrarChat.addEventListener('click', () => {
            if (confirm("¿Deseas borrar la conversación con el Coach?")) {
                contenedorMensajes.innerHTML = '';
            }
        });
    }

    botonesTemas.forEach(boton => {
        boton.addEventListener('click', () => {
            const textoTema = boton.textContent.trim().toLowerCase();
            let preguntaSugerida = "";

            if (textoTema.includes('rutinas')) {
                preguntaSugerida = "🔥 Hola Coach, recomiéndame una rutina ideal de hipertrofia y calistenia al fallo.";
            } else if (textoTema.includes('calorías')) {
                preguntaSugerida = "🥗 Hola Coach, ¿cómo calculo mis calorías diarias para volumen limpio o definición?";
            } else if (textoTema.includes('suplementos')) {
                preguntaSugerida = "💊 Hola Coach, qué suplementos deportivos me aconsejas tomar?";
            }

            if (preguntaSugerida) {
                enviarMensajeAlBackend(preguntaSugerida, null);
            }
        });
    });

    if (inputFotoChat && previewArchivo) {
        inputFotoChat.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evento) => {
                    archivoFotoChatBase64 = evento.target.result;
                    if (previewNombre) previewNombre.textContent = `📷 ${file.name}`;
                    previewArchivo.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            }
        });

        if (btnCancelarAdjunto) {
            btnCancelarAdjunto.addEventListener('click', () => {
                inputFotoChat.value = '';
                archivoFotoChatBase64 = null;
                previewArchivo.style.display = 'none';
            });
        }
    }

    if (formChat && inputMensaje) {
        formChat.addEventListener('submit', (e) => {
            e.preventDefault();
            const mensajeTexto = inputMensaje.value.trim();
            if (mensajeTexto !== '' || archivoFotoChatBase64) {
                enviarMensajeAlBackend(mensajeTexto, archivoFotoChatBase64);
            }
        });
    }

    // ----------------------------------------------------------
    // 9. LÓGICA DE INICIO DE SESIÓN (2.INICIOSESION.html)
    // ----------------------------------------------------------
    const formLogin = document.querySelector('form[action="/ingreso"]');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usuarioInput = document.querySelector('#usuarionombre').value;
            const correoInput = document.querySelector('#correo').value;
            const passwordInput = document.querySelector('#contraseña').value;

            try {
                const respuestaServidor = await fetch('http://localhost:3000/ingreso', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuarionombre: usuarioInput,
                        correo: correoInput,
                        contrasena: passwordInput
                    })
                });

                const resultado = await respuestaServidor.json();

                if (resultado.success) {
                    localStorage.setItem('aifit_usuario', usuarioInput);
                    alert(`¡Bienvenido de nuevo a AIFIT, ${usuarioInput}! 🚀`);
                    window.location.href = "5.AIFIT.html";
                } else {
                    alert("❌ Error al iniciar sesión. Verifica tus datos.");
                }
            } catch (error) {
                localStorage.setItem('aifit_usuario', usuarioInput);
                window.location.href = "5.AIFIT.html";
            }
        });
    }


    // ==========================================================
    // 10. LÓGICA DE REGISTRO (3.REGISTRO.html)
    // ==========================================================
    const formRegistro = document.getElementById('formRegistro');

    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault(); // Detiene el envío feo por HTML y evita el error 405

            const nombre = document.querySelector('#nombre').value;
            const apellido = document.querySelector('#apellido').value;
            const usuarionombre = document.querySelector('#usuarionombre').value;
            const fdn = document.querySelector('#fdn').value;
            const correo = document.querySelector('#correo').value;
            const contraseña = document.querySelector('#contraseña').value;
            const confir = document.querySelector('#confir').value;

            if (contraseña !== confir) {
                alert("❌ ¡Las contraseñas no coinciden, mi hermano! Revísalas.");
                return;
            }

            try {
                const respuestaServidor = await fetch('http://localhost:3000/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre,
                        apellido,
                        usuarionombre,
                        fdn,
                        correo,
                        contraseña
                    })
                });

                const resultado = await respuestaServidor.json();

                if (resultado.success) {
                    alert("🎉 ¡Registro exitoso en AIFIT! Ahora inicia sesión, mi rey.");
                    window.location.href = "2.INICIOSESION.html";
                } else {
                    alert("❌ " + (resultado.error || "No se pudo completar el registro."));
                }
            } catch (error) {
                console.error("Error en la petición de registro:", error);
                alert("❌ Error de conexión: No se pudo comunicar con el servidor backend.");
            }
        });
    }
});