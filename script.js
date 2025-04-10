// Variables globales
const { jsPDF } = window.jspdf;
let colorPrincipal = '#3498db';
let fuenteSeleccionada = "'Poppins', sans-serif";
let fotoPerfilUrl = null;
let fotoPerfilLocal = null;
let fotoPerfilId = null;
const IMGBB_API_KEY = '7fbfd4fd0883d7aa649035d839b12e43';

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarDatos();
    cargarCVsGuardados();
    configurarPersonalizacion();
    actualizarVistaPrevia();
    
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

// Configuración de personalización
function configurarPersonalizacion() {
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            colorPrincipal = this.getAttribute('data-color');
            actualizarEstilos();
            actualizarVistaPrevia();
        });
    });

    document.querySelectorAll('.font-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.font-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            fuenteSeleccionada = this.getAttribute('data-font');
            actualizarVistaPrevia();
        });
    });
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

// Vista previa en tiempo real
function actualizarVistaPrevia() {
    const formato = document.getElementById('PreviewFormatoCV').value;
    const previewContent = document.getElementById('realTimePreview');
    previewContent.innerHTML = generarHTMLCV(formato);
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
    mostrarVistaPrevia();
}

async function mostrarVistaPrevia() {
    const nombres = document.getElementById("Nombres").value;
    const apellidos = document.getElementById("Apellidos").value;
    
    if (!nombres || !apellidos) {
        alert("Por favor ingresa al menos tu nombre y apellido");
        return;
    }

    if (fotoPerfilLocal) {
        try {
            await precargarImagen(fotoPerfilLocal);
        } catch (error) {
            console.error("Error al cargar la foto local:", error);
        }
    }

    const previewContent = document.getElementById('printPreviewContent');
    previewContent.innerHTML = generarHTMLCV(document.getElementById('PreviewFormatoCV').value);
    document.getElementById('printPreviewOverlay').classList.add('active');
    document.body.classList.add('preview-active');
}

function precargarImagen(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = resolve;
        img.onerror = reject;
    });
}

function cerrarVistaPrevia() {
    document.getElementById('printPreviewOverlay').classList.remove('active');
    document.body.classList.remove('preview-active');
    resetearEstilos();
}

function resetearEstilos() {
    colorPrincipal = '#3498db';
    fuenteSeleccionada = "'Poppins', sans-serif";
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.toggle('selected', opt.getAttribute('data-color') === colorPrincipal);
    });
    document.querySelectorAll('.font-option').forEach(opt => {
        opt.classList.toggle('selected', opt.getAttribute('data-font') === fuenteSeleccionada);
    });
    actualizarEstilos();
    actualizarVistaPrevia();
}

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
        document.body.removeChild(element);
        
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

// Formatos de CV
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
                    padding: 20px;
                    color: #333;
                    line-height: 1.6;
                }
                .cv-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 30px;
                    background: white;
                }
                .header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid ${colorPrincipal};
                }
                h1 {
                    color: ${colorPrincipal};
                    margin: 0;
                    font-size: 32px;
                    font-weight: 700;
                }
                .contact-info {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
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
                .two-columns {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 30px;
                }
                .section {
                    margin-bottom: 25px;
                }
                .section-title {
                    color: ${colorPrincipal};
                    font-size: 20px;
                    margin-bottom: 15px;
                    text-transform: uppercase;
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
                <div class="header">
                    <div class="name-container">
                        <h1>${document.getElementById('Nombres').value} ${document.getElementById('Apellidos').value}</h1>
                    </div>
                    <div class="contact-info">
                        ${document.getElementById('Email').value ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${document.getElementById('Email').value}</div>` : ''}
                        ${document.getElementById('Telefono').value ? `<div class="contact-item"><i class="fas fa-phone"></i> ${document.getElementById('Telefono').value}</div>` : ''}
                        ${document.getElementById('Direccion').value ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${document.getElementById('Direccion').value}</div>` : ''}
                    </div>
                </div>
                
                <div class="two-columns">
                    <div class="left-column">
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

async function cargarCVsGuardados() {
    try {
        const db = firebase.firestore();
        const querySnapshot = await db.collection('curriculums')
            .orderBy('fechaActualizacion', 'desc')
            .get();
        
        const lista = document.getElementById('savedCvsList');
        
        if (querySnapshot.empty) {
            lista.innerHTML = '<p style="text-align: center; color: #666;">No hay CVs guardados</p>';
            return;
        }
        
        let html = '';
        querySnapshot.forEach((doc, index) => {
            const cv = doc.data();
            html += `
                <div class="saved-cv-item">
                    <div class="saved-cv-content" onclick="cargarCV('${doc.id}')">
                        <strong>${cv.nombres} ${cv.apellidos}</strong>
                        <div>${cv.campos['Cedula'] || 'Sin cédula registrada'}</div>
                    </div>
                    <button class="cv-delete-btn" onclick="eliminarCV('${doc.id}', event)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });
        
        lista.innerHTML = html;
    } catch (error) {
        console.error("Error al cargar CVs:", error);
        document.getElementById('savedCvsList').innerHTML = 
            '<p style="text-align: center; color: #666;">Error al cargar los CVs</p>';
    }
}

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
                            div.removeChild(document.createElement('br'));
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
        
        colorPrincipal = cv.colorPrincipal || '#3498db';
        fuenteSeleccionada = cv.fuenteSeleccionada || "'Poppins', sans-serif";
        fotoPerfilUrl = cv.fotoPerfilUrl || null;
        fotoPerfilLocal = null;
        fotoPerfilId = cv.fotoPerfilId || null;
        
        if (fotoPerfilUrl) {
            document.getElementById('fotoPreview').src = fotoPerfilUrl;
            document.getElementById('fotoPreviewContainer').style.display = 'block';
        }
        
        actualizarEstilos();
        
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.toggle('selected', opt.getAttribute('data-color') === colorPrincipal);
        });
        
        document.querySelectorAll('.font-option').forEach(opt => {
            opt.classList.toggle('selected', opt.getAttribute('data-font') === fuenteSeleccionada);
        });
        
        toggleAgenda();
        actualizarVistaPrevia();
    } catch (error) {
        console.error("Error al cargar CV:", error);
        alert("Error al cargar el currículum");
    }
}

document.getElementById('Cedula').addEventListener('input', function(e) {
    const input = e.target;
    const startPos = input.selectionStart;
    const cursorWasAtEnd = (startPos === input.value.length);
    let value = input.value.replace(/^V-/, '').replace(/\./g, '');
    value = value.replace(/\D/g, '');
    if (value.length > 3) {
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    input.value = value ? 'V-' + value : '';
    if (!cursorWasAtEnd) {
        const adjustedPos = startPos - (input.value.length - e.target.value.length);
        input.setSelectionRange(adjustedPos, adjustedPos);
    }
});

document.getElementById('Cedula').addEventListener('blur', function(e) {
    if (e.target.value && !/^V-\d{1,3}(?:\.\d{3})*$/.test(e.target.value)) {
        alert('Formato de cédula inválido. Ejemplo correcto: V-1.234.567');
        e.target.focus();
    }
});