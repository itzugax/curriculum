// Variables globales
const { jsPDF } = window.jspdf;
let colorPrincipal = '#3498db';
let fuenteSeleccionada = "'Poppins', sans-serif";
let fotoPerfilUrl = null;
let fotoPerfilLocal = null;
let fotoPerfilId = null;
const IMGBB_API_KEY = '7fbfd4fd0883d7aa649035d839b12e43';

// Animación de máquina de escribir para el título
// Animación de máquina de escribir para el título
function animarTitulo() {
    const titulo = document.getElementById('titulo-generador');
    const texto = "Generador de Currículum";
    
    function escribir(i = 0) {
        if (i <= texto.length) {
            titulo.textContent = `${texto.slice(0, i)}|`; // Cursor al final
            setTimeout(() => escribir(i + 1), 100);
        } else {
            setTimeout(borrar, 1000);
        }
    }
    
    function borrar(i = texto.length) {
        if (i >= 0) {
            titulo.textContent = `${texto.slice(0, i)}|`; // Cursor al final
            setTimeout(() => borrar(i - 1), 50);
        } else {
            setTimeout(escribir, 500);
        }
    }
    
    escribir();
}
// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarDatos();
    cargarCVsGuardados();
    configurarPersonalizacion();
    actualizarVistaPrevia();
    animarTitulo(); // Iniciar animación del título
    
    // Configurar el input de foto
    document.getElementById('FotoPerfil').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            fotoPerfilLocal = URL.createObjectURL(file);
            const previewContainer = document.getElementById('fotoPreviewContainer');
            const previewImg = document.getElementById('fotoPreview');
            previewContainer.style.display = 'block';
            previewContainer.innerHTML = `
                <div style="width: 150px; height: 150px; border-radius: 50%; 
                            border: 4px solid ${colorPrincipal}; overflow: hidden; margin: 0 auto;">
                    <img id="fotoPreview" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            `;
            document.getElementById('fotoPreview').src = fotoPerfilLocal;
            subirFotoABackground(file);
            actualizarVistaPrevia();
        } else {
            fotoPerfilLocal = null;
            fotoPerfilUrl = null;
            document.getElementById('fotoPreviewContainer').style.display = 'none';
            actualizarVistaPrevia();
        }
    });

    // Escuchar cambios en el formulario para vista previa en tiempo real
    document.getElementById('cvForm').addEventListener('input', actualizarVistaPrevia);
});

// Subir foto en segundo plano
async function subirFotoABackground(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            fotoPerfilUrl = data.data.url;
            fotoPerfilId = data.data.id;
        }
    } catch (error) {
        console.error("Error al subir la foto:", error);
    }
}

// Configuración de personalización (color y tipografía)
function configurarPersonalizacion() {
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            colorPrincipal = this.getAttribute('data-color');
            actualizarEstilos();
            actualizarVistaPrevia();
            reapplyAnimations();
        });
    });

    document.querySelectorAll('.font-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.font-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            fuenteSeleccionada = this.getAttribute('data-font');
            actualizarVistaPrevia();
            reapplyAnimations();
        });
    });
}

// Reaplicar animaciones al seleccionar color o tipografía
function reapplyAnimations() {
    const previewContainer = document.querySelector('.preview-container');
    const titulo = document.getElementById('titulo-generador');
    
    previewContainer.classList.remove('reapply-animation');
    titulo.classList.remove('reapply-animation');
    
    void previewContainer.offsetWidth; // Forzar reflujo para reiniciar animación
    void titulo.offsetWidth;
    
    previewContainer.classList.add('reapply-animation');
    titulo.classList.add('reapply-animation');
}

// Actualizar estilos dinámicos
function actualizarEstilos() {
    document.querySelectorAll('.section-title').forEach(title => {
        title.style.borderBottomColor = colorPrincipal;
    });
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.style.color = colorPrincipal;
    });
    document.querySelectorAll('button.primary').forEach(btn => {
        btn.style.background = colorPrincipal;
    });
}

// Actualizar vista previa sin parpadeo ni glitches
function actualizarVistaPrevia() {
    const formato = document.getElementById('PreviewFormatoCV').value;
    const previewContent = document.getElementById('realTimePreview');
    const nuevoContenido = generarHTMLCV(formato);

    // Solo actualizar si el contenido cambió
    if (previewContent.innerHTML !== nuevoContenido) {
        requestAnimationFrame(() => {
            previewContent.innerHTML = nuevoContenido;
        });
    }
}

// Funciones existentes
function toggleAgenda() {
    const agendaPanel = document.getElementById('agendaPanel');
    const agendaBtn = document.querySelector('.agenda-btn');
    agendaPanel.classList.toggle('open');
    document.getElementById('agendaOverlay').classList.toggle('open');
    if (agendaPanel.classList.contains('open')) {
        agendaBtn.style.left = '360px';
    } else {
        agendaBtn.style.left = '10px';
    }
}

function actualizarDatos() {
    const sexo = document.getElementById("Sexo").value;
    const estadoCivil = document.getElementById("EstadoCivil");
    estadoCivil.innerHTML = "";
    
    if (sexo === "Femenino") {
        estadoCivil.innerHTML = `
            <option value="Soltera">Soltera</option>
            <option value="Casada">Casada</option>
            <option value="Divorciada">Divorciada</option>
            <option value="Viuda">Viuda</option>
        `;
    } else if (sexo === "Masculino") {
        estadoCivil.innerHTML = `
            <option value="Soltero">Soltero</option>
            <option value="Casado">Casado</option>
            <option value="Divorciado">Divorciado</option>
            <option value="Viudo">Viudo</option>
        `;
    } else {
        estadoCivil.innerHTML = `
            <option value="Soltero/a">Soltero/a</option>
            <option value="Casado/a">Casado/a</option>
            <option value="Divorciado/a">Divorciado/a</option>
            <option value="Viudo/a">Viudo/a</option>
        `;
    }
    actualizarVistaPrevia();
}

// Agregar campo extra
function agregarCampo(id) {
    const div = id === "EducacionSuperior" 
        ? document.getElementById("EducacionSuperiorCampos") 
        : document.getElementById(id);

    const input = document.createElement("input");
    input.type = "text";
    input.style.marginTop = "5px";
    
    if (id === "Habilidades") {
        input.placeholder = "Ej: Liderazgo, Trabajo en equipo...";
    } else if (id === "Experiencia") {
        input.placeholder = "Ej: Asistente administrativo en Empresa X (2020-2022)";
    } else if (id === "Cursos") {
        input.placeholder = "Ej: Curso de Marketing Digital - Instituto Y (2021)";
    } else {
        input.placeholder = `Ingrese ${id.toLowerCase()}`;
    }

    const removeBtn = document.createElement("span");
    removeBtn.className = "remove-btn";
    removeBtn.innerHTML = "(-)";
    removeBtn.onclick = function() {
        div.removeChild(input);
        div.removeChild(removeBtn);
        div.removeChild(document.createElement("br"));
        actualizarVistaPrevia();
    };

    input.addEventListener('input', actualizarVistaPrevia);

    div.appendChild(input);
    div.appendChild(removeBtn);
    div.appendChild(document.createElement("br"));
    actualizarVistaPrevia();
}

function limpiarFormulario() {
    document.getElementById("cvForm").reset();
    document.querySelectorAll("#EducacionSuperiorCampos, #Habilidades, #Experiencia, #Cursos").forEach(div => {
        div.innerHTML = "";
    });
    document.getElementById("EstadoCivil").innerHTML = "";
    document.getElementById("fotoPreviewContainer").style.display = "none";
    fotoPerfilUrl = null;
    fotoPerfilLocal = null;
    fotoPerfilId = null;
    actualizarVistaPrevia();
}

function generarCurriculum() {
    const nombres = document.getElementById("Nombres").value;
    const apellidos = document.getElementById("Apellidos").value;
    
    if (!nombres || !apellidos) {
        alert("Por favor ingresa al menos tu nombre y apellido");
        return;
    }
    
    guardarDatos(false);
    efectoSacudidaYDescarga(); // Inicia el efecto
}

// Efecto de sacudida y descarga ajustado
async function efectoSacudidaYDescarga() {
    const body = document.body;
    const overlay = document.createElement('div');
    overlay.className = 'white-overlay';
    body.appendChild(overlay);
    body.classList.add('shake-effect');

    // Reproducir sonido
    const genSound = document.getElementById('genSound');
    genSound.play().catch(error => console.error("Error al reproducir sonido:", error));

    // 2 segundos de sacudida
    setTimeout(() => {
        // Comienza el desvanecimiento
        overlay.style.animation = 'fadeToWhite 0.5s ease forwards';

        // Después de 0.5s (fin del desvanecimiento), congelar y descargar
        setTimeout(async () => {
            overlay.classList.add('freeze-white');
            await descargarPDF(); // Descarga el PDF al inicio del congelamiento

            // 3 segundos de congelamiento, luego subir y limpiar
            setTimeout(() => {
                // Subir la página al inicio mientras está en blanco
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Remover efectos y reiniciar
                body.classList.remove('shake-effect');
                body.removeChild(overlay);
                reiniciarTodo(); // Reinicia solo el formulario y opciones
                actualizarVistaPrevia();
                alert('¡Currículum descargado con éxito!');
            }, 3000); // Congelamiento dura 3 segundos
        }, 500); // Desvanecimiento dura 0.5 segundos
    }, 2000); // Sacudida dura 2 segundos
}

// Nueva función para reiniciar todo
function reiniciarTodo() {
    // Limpiar formulario
    limpiarFormulario();

    // Restablecer color principal
    colorPrincipal = '#3498db';
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.toggle('selected', opt.getAttribute('data-color') === '#3498db');
    });

    // Restablecer tipografía
    fuenteSeleccionada = "'Poppins', sans-serif";
    document.querySelectorAll('.font-option').forEach(opt => {
        opt.classList.toggle('selected', opt.getAttribute('data-font') === "'Poppins', sans-serif");
    });

    // Actualizar estilos
    actualizarEstilos();
}

// Ajuste en descargarPDF (eliminamos el appendChild duplicado)
async function descargarPDF() {
    const nombres = document.getElementById("Nombres").value;
    const apellidos = document.getElementById("Apellidos").value;
    
    try {
        const element = document.createElement('div');
        element.className = 'cv-template';
        let cvHTML = generarHTMLCV(document.getElementById('PreviewFormatoCV').value);
        
        if (fotoPerfilLocal) {
            try {
                const base64Image = await convertirImagenABase64(fotoPerfilLocal);
                cvHTML = cvHTML.replace(fotoPerfilLocal, base64Image);
            } catch (error) {
                console.error("Error al convertir la imagen local:", error);
                if (fotoPerfilUrl) {
                    try {
                        const base64Image = await convertirImagenABase64(fotoPerfilUrl);
                        cvHTML = cvHTML.replace(fotoPerfilUrl, base64Image);
                    } catch (error) {
                        console.error("Error al convertir la imagen de ImgBB:", error);
                    }
                }
            }
        } else if (fotoPerfilUrl) {
            try {
                const base64Image = await convertirImagenABase64(fotoPerfilUrl);
                cvHTML = cvHTML.replace(fotoPerfilUrl, base64Image);
            } catch (error) {
                console.error("Error al convertir la imagen:", error);
            }
        }
        
        element.innerHTML = cvHTML;
        document.body.appendChild(element);

        const opt = {
            margin: [15, 15],
            filename: `${nombres}_${apellidos}_CV.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { 
                scale: 2,
                letterRendering: true,
                useCORS: true,
                scrollX: 0,
                scrollY: 0,
                allowTaint: true,
                proxy: 'https://cors-anywhere.herokuapp.com/'
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait'
            }
        };

        await html2pdf().set(opt).from(element).save();
        document.body.removeChild(element); // Limpiar después de descargar
        
    } catch (error) {
        console.error("Error al generar PDF:", error);
        alert("Ocurrió un error al generar el PDF. Por favor, inténtalo de nuevo.");
    }
}

function convertirImagenABase64(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            resolve(dataURL);
        };
        img.onerror = error => reject(error);
        img.src = url;
    });
}

function generarHTMLCV(formato = document.getElementById('PreviewFormatoCV').value) {
    switch(formato) {
        case 'clasico':
            return generarFormatoClasico();
        case 'moderno':
            return generarFormatoModerno();
        case 'profesional':
            return generarFormatoProfesional();
        case 'minimalista':
            return generarFormatoMinimalista();
        case 'creativo':
        default:
            return generarFormatoCreativo();
    }
}

function generarFotoPerfilHTML() {
    const fotoParaMostrar = fotoPerfilLocal || fotoPerfilUrl;
    if (!fotoParaMostrar) return '';
    
    return `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 150px; height: 150px; border-radius: 50%; 
                        border: 4px solid ${colorPrincipal}; overflow: hidden; margin: 0 auto;">
                <img src="${fotoParaMostrar}" 
                     style="width: 100%; height: 100%; object-fit: cover;">
            </div>
        </div>
    `;
}

function generarFormatoProfesional() {
    const datosBasicos = obtenerDatosBasicos();
    const estudios = obtenerEstudios();
    const experiencia = obtenerSeccion('Experiencia', true);
    const habilidades = obtenerSeccion('Habilidades', true);
    const cursos = obtenerSeccion('Cursos', true);
    const fotoPerfil = generarFotoPerfilHTML();

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: ${fuenteSeleccionada};
                    margin: 0;
                    padding: 0;
                    color: #333;
                    line-height: 1.6;
                }
                .cv-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px;
                    background: white;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid ${colorPrincipal};
                }
                .name-title {
                    flex: 2;
                }
                h1 {
                    color: ${colorPrincipal};
                    margin: 0;
                    font-size: 32px;
                    font-weight: 700;
                }
                .contact-info {
                    margin-top: 15px;
                }
                .contact-item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 5px;
                    font-size: 14px;
                }
                .contact-item i {
                    color: ${colorPrincipal};
                    width: 20px;
                    margin-right: 8px;
                }
                .section {
                    margin-bottom: 25px;
                }
                .section-title {
                    color: ${colorPrincipal};
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                    border-bottom: 1px solid #eee;
                }
                .section-content {
                    font-size: 14px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 150px 1fr;
                    gap: 15px;
                }
                .skills-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .skill-item {
                    background: ${colorPrincipal}15;
                    border: 1px solid ${colorPrincipal}30;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 13px;
                }
            </style>
        </head>
        <body>
            <div class="cv-container">
                ${fotoPerfil}
                <div class="header">
                    <div class="name-title">
                        <h1>${document.getElementById('Nombres').value} ${document.getElementById('Apellidos').value}</h1>
                        <div class="contact-info">
                            ${document.getElementById('Email').value ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${document.getElementById('Email').value}</div>` : ''}
                            ${document.getElementById('Telefono').value ? `<div class="contact-item"><i class="fas fa-phone"></i> ${document.getElementById('Telefono').value}</div>` : ''}
                            ${document.getElementById('Direccion').value ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${document.getElementById('Direccion').value}</div>` : ''}
                        </div>
                    </div>
                </div>
                
                ${datosBasicos ? `<div class="section">
                    <div class="section-title">Información Personal</div>
                    <div class="section-content">
                        <div class="info-grid">
                            ${datosBasicos}
                        </div>
                    </div>
                </div>` : ''}
                
                ${estudios ? `<div class="section">
                    <div class="section-title">Formación Académica</div>
                    <div class="section-content">
                        ${estudios}
                    </div>
                </div>` : ''}
                
                ${experiencia ? `<div class="section">
                    <div class="section-title">Experiencia Profesional</div>
                    <div class="section-content">
                        ${experiencia.split('<li>').filter(item => item).map(item => 
                            `<div class="experience-item">${item.replace('</li>', '')}</div>`).join('')}
                    </div>
                </div>` : ''}
                
                ${habilidades ? `<div class="section">
                    <div class="section-title">Habilidades</div>
                    <div class="section-content">
                        <div class="skills-container">
                            ${habilidades.split('<li>').filter(item => item).map(item => 
                                `<div class="skill-item">${item.replace('</li>', '')}</div>`).join('')}
                        </div>
                    </div>
                </div>` : ''}
                
                ${cursos ? `<div class="section">
                    <div class="section-title">Cursos y Certificaciones</div>
                    <div class="section-content">
                        <ul>${cursos}</ul>
                    </div>
                </div>` : ''}
            </div>
        </body>
        </html>
    `;
}

function generarFormatoMinimalista() {
    const datosBasicos = obtenerDatosBasicos();
    const estudios = obtenerEstudios();
    const experiencia = obtenerSeccion('Experiencia', true);
    const habilidades = obtenerSeccion('Habilidades', true);
    const cursos = obtenerSeccion('Cursos', true);
    const fotoPerfil = generarFotoPerfilHTML();

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: ${fuenteSeleccionada};
                    margin: 0;
                    padding: 0;
                    color: #333;
                    line-height: 1.8;
                }
                .cv-container {
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 40px;
                    background: white;
                }
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                h1 {
                    color: ${colorPrincipal};
                    margin: 0;
                    font-size: 36px;
                    font-weight: 300;
                }
                .contact-info {
                    margin-top: 20px;
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 20px;
                }
                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                }
                .contact-item i {
                    color: ${colorPrincipal};
                }
                .section {
                    margin-bottom: 30px;
                }
                .section-title {
                    color: ${colorPrincipal};
                    font-size: 18px;
                    font-weight: 400;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                }
                .section-content {
                    font-size: 15px;
                }
                ul {
                    list-style: none;
                    padding: 0;
                }
                li {
                    margin-bottom: 15px;
                    padding-left: 20px;
                    position: relative;
                }
                li:before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 10px;
                    width: 10px;
                    height: 2px;
                    background: ${colorPrincipal};
                }
            </style>
        </head>
        <body>
            <div class="cv-container">
                ${fotoPerfil}
                <div class="header">
                    <h1>${document.getElementById('Nombres').value} ${document.getElementById('Apellidos').value}</h1>
                    <div class="contact-info">
                        ${document.getElementById('Email').value ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${document.getElementById('Email').value}</div>` : ''}
                        ${document.getElementById('Telefono').value ? `<div class="contact-item"><i class="fas fa-phone"></i> ${document.getElementById('Telefono').value}</div>` : ''}
                        ${document.getElementById('Direccion').value ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${document.getElementById('Direccion').value}</div>` : ''}
                    </div>
                </div>
                
                ${datosBasicos ? `<div class="section">
                    <div class="section-title">Sobre mí</div>
                    <div class="section-content">${datosBasicos}</div>
                </div>` : ''}
                
                ${estudios ? `<div class="section">
                    <div class="section-title">Educación</div>
                    <div class="section-content">${estudios}</div>
                </div>` : ''}
                
                ${experiencia ? `<div class="section">
                    <div class="section-title">Experiencia</div>
                    <div class="section-content"><ul>${experiencia}</ul></div>
                </div>` : ''}
                
                ${habilidades ? `<div class="section">
                    <div class="section-title">Habilidades</div>
                    <div class="section-content"><ul>${habilidades}</ul></div>
                </div>` : ''}
                
                ${cursos ? `<div class="section">
                    <div class="section-title">Cursos</div>
                    <div class="section-content"><ul>${cursos}</ul></div>
                </div>` : ''}
            </div>
        </body>
        </html>
    `;
}

function generarFormatoCreativo() {
    const datosBasicos = obtenerDatosBasicos();
    const estudios = obtenerEstudios();
    const experiencia = obtenerSeccion('Experiencia', true);
    const habilidades = obtenerSeccion('Habilidades', true);
    const cursos = obtenerSeccion('Cursos', true);
    const fotoPerfil = generarFotoPerfilHTML();

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: ${fuenteSeleccionada};
                    margin: 0;
                    padding: 20px;
                    color: #333;
                    line-height: 1.8;
                }
                .cv-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 30px;
                    background: white;
                    position: relative;
                }
                .cv-container::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 10px;
                    background: ${colorPrincipal};
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                }
                h1 {
                    color: ${colorPrincipal};
                    margin: 0;
                    font-size: 36px;
                    text-transform: uppercase;
                }
                .contact-info {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 20px;
                    margin-top: 15px;
                }
                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .section {
                    margin-bottom: 25px;
                    background: #f9f9f9;
                    padding: 15px;
                    border-radius: 8px;
                }
                .section-title {
                    color: ${colorPrincipal};
                    border-bottom: 2px solid ${colorPrincipal};
                    padding-bottom: 5px;
                    font-size: 22px;
                    margin-bottom: 15px;
                }
                ul {
                    padding-left: 20px;
                }
                li {
                    margin-bottom: 10px;
                }
                li::before {
                    content: "•";
                    color: ${colorPrincipal};
                    font-weight: bold;
                    display: inline-block;
                    width: 1em;
                    margin-left: -1em;
                }
            </style>
        </head>
        <body>
            <div class="cv-container">
                ${fotoPerfil}
                <div class="header">
                    <h1>${document.getElementById('Nombres').value} ${document.getElementById('Apellidos').value}</h1>
                    <div class="contact-info">
                        ${document.getElementById('Email').value ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${document.getElementById('Email').value}</div>` : ''}
                        ${document.getElementById('Telefono').value ? `<div class="contact-item"><i class="fas fa-phone"></i> ${document.getElementById('Telefono').value}</div>` : ''}
                        ${document.getElementById('Direccion').value ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${document.getElementById('Direccion').value}</div>` : ''}
                    </div>
                </div>
                
                ${datosBasicos ? `<div class="section">
                    <div class="section-title"><i class="fas fa-user"></i> Datos Personales</div>
                    <div>${datosBasicos}</div>
                </div>` : ''}
                
                ${estudios ? `<div class="section">
                    <div class="section-title"><i class="fas fa-graduation-cap"></i> Formación Académica</div>
                    <div>${estudios}</div>
                </div>` : ''}
                
                ${experiencia ? `<div class="section">
                    <div class="section-title"><i class="fas fa-briefcase"></i> Experiencia Laboral</div>
                    <ul>${experiencia}</ul>
                </div>` : ''}
                
                ${habilidades ? `<div class="section">
                    <div class="section-title"><i class="fas fa-star"></i> Habilidades</div>
                    <ul>${habilidades}</ul>
                </div>` : ''}
                
                ${cursos ? `<div class="section">
                    <div class="section-title"><i class="fas fa-certificate"></i> Cursos</div>
                    <ul>${cursos}</ul>
                </div>` : ''}
            </div>
        </body>
        </html>
    `;
}

function generarFormatoModerno() {
    const datosBasicos = obtenerDatosBasicos();
    const estudios = obtenerEstudios();
    const experiencia = obtenerSeccion('Experiencia', true);
    const habilidades = obtenerSeccion('Habilidades', true);
    const cursos = obtenerSeccion('Cursos', true);
    const fotoPerfil = generarFotoPerfilHTML();

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: ${fuenteSeleccionada};
                    margin: 0;
                    padding: 0;
                    color: #333;
                    line-height: 1.6;
                }
                .cv-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 30px;
                    background: white;
                    display: flex;
                    flex-direction: row;
                    gap: 30px;
                }
                .left-column {
                    flex: 1;
                    background: ${colorPrincipal}10;
                    padding: 20px;
                    border-radius: 8px;
                }
                .right-column {
                    flex: 2;
                }
                .header {
                    margin-bottom: 30px;
                }
                h1 {
                    color: ${colorPrincipal};
                    margin: 0;
                    font-size: 32px;
                    font-weight: 700;
                }
                .contact-info {
                    margin-top: 15px;
                }
                .contact-item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .contact-item i {
                    color: ${colorPrincipal};
                    width: 20px;
                    margin-right: 8px;
                }
                .section {
                    margin-bottom: 25px;
                }
                .section-title {
                    color: ${colorPrincipal};
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                    border-bottom: 1px solid ${colorPrincipal}50;
                }
                .section-content {
                    font-size: 14px;
                }
                ul {
                    padding-left: 20px;
                }
            </style>
        </head>
        <body>
            <div class="cv-container">
                ${fotoPerfil}
                <div class="left-column">
                    <div class="header">
                        <h1>${document.getElementById('Nombres').value} ${document.getElementById('Apellidos').value}</h1>
                        <div class="contact-info">
                            ${document.getElementById('Email').value ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${document.getElementById('Email').value}</div>` : ''}
                            ${document.getElementById('Telefono').value ? `<div class="contact-item"><i class="fas fa-phone"></i> ${document.getElementById('Telefono').value}</div>` : ''}
                            ${document.getElementById('Direccion').value ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${document.getElementById('Direccion').value}</div>` : ''}
                        </div>
                    </div>
                    ${datosBasicos ? `<div class="section">
                        <div class="section-title">Datos Personales</div>
                        <div class="section-content">${datosBasicos}</div>
                    </div>` : ''}
                    ${habilidades ? `<div class="section">
                        <div class="section-title">Habilidades</div>
                        <div class="section-content"><ul>${habilidades}</ul></div>
                    </div>` : ''}
                </div>
                <div class="right-column">
                    ${estudios ? `<div class="section">
                        <div class="section-title">Educación</div>
                        <div class="section-content">${estudios}</div>
                    </div>` : ''}
                    ${experiencia ? `<div class="section">
                        <div class="section-title">Experiencia</div>
                        <div class="section-content"><ul>${experiencia}</ul></div>
                    </div>` : ''}
                    ${cursos ? `<div class="section">
                        <div class="section-title">Cursos</div>
                        <div class="section-content"><ul>${cursos}</ul></div>
                    </div>` : ''}
                </div>
            </div>
        </body>
        </html>
    `;
}

function generarFormatoClasico() {
    const datosBasicos = obtenerDatosBasicos();
    const estudios = obtenerEstudios();
    const experiencia = obtenerSeccion('Experiencia', true);
    const habilidades = obtenerSeccion('Habilidades', true);
    const cursos = obtenerSeccion('Cursos', true);
    const fotoPerfil = generarFotoPerfilHTML();

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: ${fuenteSeleccionada};
                    margin: 0;
                    padding: 20px;
                    color: #333;
                    line-height: 1.8;
                }
                .cv-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 30px;
                    background: white;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid ${colorPrincipal};
                }
                h1 {
                    color: ${colorPrincipal};
                    margin: 0;
                    font-size: 28px;
                    text-transform: uppercase;
                }
                .contact-info {
                    margin-top: 10px;
                    font-size: 14px;
                }
                .section {
                    margin-bottom: 20px;
                }
                .section-title {
                    background: ${colorPrincipal};
                    color: white;
                    padding: 5px 10px;
                    font-size: 18px;
                    margin-bottom: 10px;
                }
                .section-content {
                    padding: 0 10px;
                }
                ul {
                    padding-left: 20px;
                }
            </style>
        </head>
        <body>
            <div class="cv-container">
                ${fotoPerfil}
                <div class="header">
                    <h1>${document.getElementById('Nombres').value} ${document.getElementById('Apellidos').value}</h1>
                    <div class="contact-info">
                        ${document.getElementById('Email').value ? `<span>${document.getElementById('Email').value}</span> | ` : ''}
                        ${document.getElementById('Telefono').value ? `<span>${document.getElementById('Telefono').value}</span> | ` : ''}
                        ${document.getElementById('Direccion').value ? `<span>${document.getElementById('Direccion').value}</span>` : ''}
                    </div>
                </div>
                
                ${datosBasicos ? `<div class="section">
                    <div class="section-title">Datos Personales</div>
                    <div class="section-content">${datosBasicos}</div>
                </div>` : ''}
                
                ${estudios ? `<div class="section">
                    <div class="section-title">Formación Académica</div>
                    <div class="section-content">${estudios}</div>
                </div>` : ''}
                
                ${experiencia ? `<div class="section">
                    <div class="section-title">Experiencia Laboral</div>
                    <div class="section-content"><ul>${experiencia}</ul></div>
                </div>` : ''}
                
                ${habilidades ? `<div class="section">
                    <div class="section-title">Habilidades</div>
                    <div class="section-content"><ul>${habilidades}</ul></div>
                </div>` : ''}
                
                ${cursos ? `<div class="section">
                    <div class="section-title">Cursos y Certificaciones</div>
                    <div class="section-content"><ul>${cursos}</ul></div>
                </div>` : ''}
            </div>
        </body>
        </html>
    `;
}

function obtenerDatosBasicos() {
    let html = '';
    const campos = [
        { id: 'Cedula', nombre: 'Cédula', icono: 'id-card' },
        { id: 'FechaNacimiento', nombre: 'Fecha de Nacimiento', icono: 'birthday-cake' },
        { id: 'Sexo', nombre: 'Sexo', icono: 'venus-mars' },
        { id: 'EstadoCivil', nombre: 'Estado Civil', icono: 'heart' }
    ];

    campos.forEach(campo => {
        const valor = document.getElementById(campo.id).value;
        if (valor) {
            let valorMostrar = valor;
            if (campo.id === 'FechaNacimiento') {
                const [year, month, day] = valor.split('-');
                valorMostrar = `${day}/${month}/${year}`;
            }
            html += `<div class="info-item"><i class="fas fa-${campo.icono}"></i> <strong>${campo.nombre}:</strong> ${valorMostrar}</div>`;
        }
    });

    return html || null;
}

function obtenerEstudios() {
    let html = '';
    const estudios = [
        { id: 'EducacionPrimaria', nombre: 'Educación Primaria', icono: 'school' },
        { id: 'EducacionSecundaria', nombre: 'Educación Secundaria', icono: 'graduation-cap' }
    ];

    estudios.forEach(estudio => {
        const valor = document.getElementById(estudio.id).value;
        if (valor) {
            html += `<div class="education-item"><i class="fas fa-${estudio.icono}"></i> <strong>${estudio.nombre}:</strong> ${valor}</div>`;
        }
    });

    const educacionSuperior = document.getElementById('EducacionSuperior').value;
    if (educacionSuperior) {
        html += `<div class="education-item"><i class="fas fa-university"></i> <strong>Educación Superior:</strong> ${educacionSuperior}</div>`;
    }

    const inputsSuperior = document.getElementById('EducacionSuperiorCampos').getElementsByTagName('input');
    for (let i = 0; i < inputsSuperior.length; i++) {
        if (inputsSuperior[i].value) {
            html += `<div class="education-item"><i class="fas fa-university"></i> ${inputsSuperior[i].value}</div>`;
        }
    }

    return html || null;
}

function obtenerSeccion(id, comoLista = false) {
    const inputs = document.getElementById(id).getElementsByTagName('input');
    let html = '';
    
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value) {
            if (comoLista) {
                html += `<li>${inputs[i].value}</li>`;
            } else {
                html += `<p>• ${inputs[i].value}</p>`;
            }
        }
    }
    
    return html || null;
}

async function guardarDatos(mostrarAlerta = true) {
    const nombres = document.getElementById("Nombres").value;
    const apellidos = document.getElementById("Apellidos").value;
    
    if (!nombres || !apellidos) {
        return false;
    }

    const fotoInput = document.getElementById('FotoPerfil');
    if (!fotoPerfilUrl && fotoInput.files.length > 0 && !fotoPerfilLocal) {
        const formData = new FormData();
        formData.append('image', fotoInput.files[0]);
        
        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                fotoPerfilUrl = data.data.url;
                fotoPerfilId = data.data.id;
            }
        } catch (error) {
            console.error("Error al subir la foto:", error);
            if (mostrarAlerta) {
                alert("Error al subir la foto, pero los demás datos se guardaron");
            }
        }
    }

    const datos = {
        nombres,
        apellidos,
        colorPrincipal,
        fuenteSeleccionada,
        fotoPerfilUrl,
        fotoPerfilId,
        campos: {},
        fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
    };

    document.querySelectorAll('#cvForm input, #cvForm select').forEach(campo => {
        if (campo.id && campo.id !== 'FotoPerfil') datos.campos[campo.id] = campo.value;
    });

    ['EducacionSuperiorCampos', 'Habilidades', 'Experiencia', 'Cursos'].forEach(id => {
        datos.campos[id] = [];
        const inputs = document.getElementById(id).getElementsByTagName('input');
        for (let input of inputs) {
            datos.campos[id].push(input.value);
        }
    });

    try {
        const db = firebase.firestore();
        let docRef;
        const querySnapshot = await db.collection('curriculums')
            .where('nombres', '==', nombres)
            .where('apellidos', '==', apellidos)
            .limit(1)
            .get();
        
        if (!querySnapshot.empty) {
            docRef = querySnapshot.docs[0].ref;
            await docRef.update(datos);
        } else {
            docRef = await db.collection('curriculums').add(datos);
        }
        
        if (mostrarAlerta) {
            alert(`CV de ${nombres} ${apellidos} guardado correctamente`);
        }
    } catch (error) {
        console.error("Error al guardar en Firebase:", error);
        if (mostrarAlerta) {
            alert("Error al guardar en la base de datos");
        }
        return false;
    }
    
    cargarCVsGuardados();
    return true;
}

// Variables globales para almacenar los CVs cargados
let cvData = [];

// Cargar CVs guardados y preparar búsqueda
async function cargarCVsGuardados() {
    try {
        const db = firebase.firestore();
        const querySnapshot = await db.collection('curriculums')
            .orderBy('fechaActualizacion', 'desc')
            .get();
        
        const lista = document.getElementById('savedCvsList');
        cvData = []; // Reiniciar datos
        
        if (querySnapshot.empty) {
            lista.innerHTML = '<p style="text-align: center; color: #666;">No hay CVs guardados</p>';
            return;
        }
        
        querySnapshot.forEach((doc) => {
            const cv = doc.data();
            cvData.push({
                id: doc.id,
                nombres: cv.nombres,
                apellidos: cv.apellidos,
                cedula: cv.campos['Cedula'] || 'Sin cédula registrada'
            });
        });
        
        mostrarCVs(cvData); // Mostrar todos inicialmente
        
    } catch (error) {
        console.error("Error al cargar CVs:", error);
        document.getElementById('savedCvsList').innerHTML = 
            '<p style="text-align: center; color: #666;">Error al cargar los CVs</p>';
    }
}

// Función para mostrar CVs en la lista
function mostrarCVs(cvs) {
    const lista = document.getElementById('savedCvsList');
    let html = '';
    
    if (cvs.length === 0) {
        html = '<p style="text-align: center; color: #666;">No se encontraron resultados</p>';
    } else {
        cvs.forEach(cv => {
            html += `
                <div class="saved-cv-item">
                    <div class="saved-cv-content" onclick="cargarCV('${cv.id}')">
                        <strong>${cv.nombres} ${cv.apellidos}</strong>
                        <div>${cv.cedula}</div>
                    </div>
                    <button class="cv-delete-btn" onclick="eliminarCV('${cv.id}', event)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });
    }
    
    lista.innerHTML = html;
}

// Agregar evento de búsqueda al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // (Código existente de inicialización aquí)

    // Evento de búsqueda
    document.getElementById('agendaSearch').addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        const filteredCvs = cvData.filter(cv => 
            `${cv.nombres} ${cv.apellidos}`.toLowerCase().includes(searchTerm) ||
            cv.cedula.toLowerCase().includes(searchTerm)
        );
        mostrarCVs(filteredCvs);
    });
});

async function eliminarCV(id, event) {
    event.stopPropagation();
    
    const codigoConfirmacion = prompt('Ingrese el código de confirmación para eliminar este currículum:');
    
    if (codigoConfirmacion === null) return;
    
    if (codigoConfirmacion !== '311009') {
        alert('Código incorrecto. No se ha eliminado el currículum.');
        return;
    }
    
    if (confirm('¿Estás seguro que deseas eliminar este currículum? Esta acción no se puede deshacer.')) {
        try {
            await firebase.firestore().collection('curriculums').doc(id).delete();
            alert('Currículum eliminado correctamente');
            cargarCVsGuardados();
        } catch (error) {
            console.error("Error al eliminar CV:", error);
            alert("Error al eliminar el currículum");
        }
    }
}

async function cargarCV(id) {
    try {
        const doc = await firebase.firestore().collection('curriculums').doc(id).get();
        
        if (!doc.exists) {
            alert("El currículum no existe");
            return;
        }
        
        const cv = doc.data();
        
        limpiarFormulario();
        
        document.getElementById('Nombres').value = cv.nombres || '';
        document.getElementById('Apellidos').value = cv.apellidos || '';
        
        for (const id in cv.campos) {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = cv.campos[id] || '';
            }
        }
        
        ['EducacionSuperiorCampos', 'Habilidades', 'Experiencia', 'Cursos'].forEach(id => {
            const div = document.getElementById(id);
            if (div && cv.campos[id]) {
                div.innerHTML = '';
                cv.campos[id].forEach(valor => {
                    if (valor) {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.value = valor;
                        input.style.marginTop = '5px';
                        
                        const removeBtn = document.createElement('span');
                        removeBtn.className = 'remove-btn';
                        removeBtn.innerHTML = '(-)';
                        removeBtn.onclick = function() {
                            div.removeChild(input);
                            div.removeChild(removeBtn);
                            div.removeChild(div.lastElementChild); // Remover <br>
                            actualizarVistaPrevia();
                        };
                        
                        input.addEventListener('input', actualizarVistaPrevia);
                        
                        div.appendChild(input);
                        div.appendChild(removeBtn);
                        div.appendChild(document.createElement('br'));
                    }
                });
            }
        });
        
        if (cv.fotoPerfilUrl) {
            fotoPerfilUrl = cv.fotoPerfilUrl;
            fotoPerfilId = cv.fotoPerfilId;
            const previewContainer = document.getElementById('fotoPreviewContainer');
            previewContainer.style.display = 'block';
            previewContainer.innerHTML = `
                <div style="width: 150px; height: 150px; border-radius: 50%; 
                            border: 4px solid ${cv.colorPrincipal || colorPrincipal}; overflow: hidden; margin: 0 auto;">
                    <img id="fotoPreview" style="width: 100%; height: 100%; object-fit: cover;" src="${fotoPerfilUrl}">
                </div>
            `;
        }
        
        colorPrincipal = cv.colorPrincipal || '#3498db';
        fuenteSeleccionada = cv.fuenteSeleccionada || "'Poppins', sans-serif";
        
        document.querySelectorAll('.color-option').forEach(opt => {
            if (opt.getAttribute('data-color') === colorPrincipal) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        
        document.querySelectorAll('.font-option').forEach(opt => {
            if (opt.getAttribute('data-font') === fuenteSeleccionada) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        
        actualizarDatos();
        actualizarEstilos();
        actualizarVistaPrevia();
        
        toggleAgenda();
        
    } catch (error) {
        console.error("Error al cargar CV:", error);
        alert("Error al cargar el currículum");
    }
}