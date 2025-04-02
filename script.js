// Variables globales
const { jsPDF } = window.jspdf;
let colorPrincipal = '#3498db';
let fuenteSeleccionada = "'Poppins', sans-serif";
let fotoPerfilUrl = null;
let fotoPerfilLocal = null; // Nueva variable para la URL local
let fotoPerfilId = null;
const IMGBB_API_KEY = '7fbfd4fd0883d7aa649035d839b12e43';

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarDatos();
    cargarCVsGuardados();
    configurarPersonalizacion();
    
    // Configurar el input de foto
    document.getElementById('FotoPerfil').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
        // Crear URL local para mostrar al instante
        fotoPerfilLocal = URL.createObjectURL(file);
            
        // Mostrar vista previa local con formato 1:1
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
            
            // Subir a ImgBB en segundo plano (para cuando se guarde)
            subirFotoABackground(file);
        } else {
            fotoPerfilLocal = null;
            fotoPerfilUrl = null;
            document.getElementById('fotoPreviewContainer').style.display = 'none';
        }
    });
});

// Función para subir foto en segundo plano
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

// Configuración de selectores de personalización
function configurarPersonalizacion() {
    // Selectores de color
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            colorPrincipal = this.getAttribute('data-color');
            actualizarEstilos();
        });
    });

    // Selectores de fuente
    document.querySelectorAll('.font-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.font-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            fuenteSeleccionada = this.getAttribute('data-font');
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

// Función para mostrar/ocultar agenda
function toggleAgenda() {
    const agendaPanel = document.getElementById('agendaPanel');
    const agendaBtn = document.querySelector('.agenda-btn');
    
    agendaPanel.classList.toggle('open');
    document.getElementById('agendaOverlay').classList.toggle('open');
    
    // Mover el botón cuando la agenda está abierta
    if (agendaPanel.classList.contains('open')) {
        agendaBtn.style.left = '360px';
    } else {
        agendaBtn.style.left = '10px';
    }
}

// Actualizar opciones de estado civil según sexo
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
}

// Agregar campos dinámicos
function agregarCampo(id) {
    const div = id === "EducacionSuperior" 
        ? document.getElementById("EducacionSuperiorCampos") 
        : document.getElementById(id);

    const input = document.createElement("input");
    input.type = "text";
    input.style.marginTop = "5px";
    
    // Placeholders según sección
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
    };

    div.appendChild(input);
    div.appendChild(removeBtn);
    div.appendChild(document.createElement("br"));
}

// Limpiar formulario
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
}

// Generar currículum y mostrar vista previa
function generarCurriculum() {
    const nombres = document.getElementById("Nombres").value;
    const apellidos = document.getElementById("Apellidos").value;
    
    if (!nombres || !apellidos) {
        alert("Por favor ingresa al menos tu nombre y apellido");
        return;
    }
    
    // Guardar automáticamente en la agenda (en segundo plano)
    guardarDatos(false);
    
    // Mostrar vista previa
    mostrarVistaPrevia();
}

// Mostrar vista previa del currículum
async function mostrarVistaPrevia() {
    const nombres = document.getElementById("Nombres").value;
    const apellidos = document.getElementById("Apellidos").value;
    
    if (!nombres || !apellidos) {
        alert("Por favor ingresa al menos tu nombre y apellido");
        return;
    }

    // Usar la foto local si está disponible (más rápido)
    if (fotoPerfilLocal) {
        try {
            await precargarImagen(fotoPerfilLocal);
        } catch (error) {
            console.error("Error al cargar la foto local:", error);
            // Continuar sin foto si falla
        }
    }

    const previewContent = document.getElementById('printPreviewContent');
    previewContent.innerHTML = generarHTMLCV();
    document.getElementById('printPreviewOverlay').classList.add('active');
    document.body.classList.add('preview-active');
}

// Función para precargar la imagen y evitar retrasos
function precargarImagen(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = resolve;
        img.onerror = reject;
    });
}

// Cerrar vista previa
function cerrarVistaPrevia() {
    document.getElementById('printPreviewOverlay').classList.remove('active');
    document.body.classList.remove('preview-active');
    resetearEstilos();
}

// Resetear estilos al cerrar vista previa
function resetearEstilos() {
    colorPrincipal = '#3498db';
    fuenteSeleccionada = "'Poppins', sans-serif";
    
    // Resetear selectores de personalización
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.toggle('selected', opt.getAttribute('data-color') === colorPrincipal);
    });
    
    document.querySelectorAll('.font-option').forEach(opt => {
        opt.classList.toggle('selected', opt.getAttribute('data-font') === fuenteSeleccionada);
    });
    
    actualizarEstilos();
}

// Imprimir currículum
function imprimirCurriculum() {
    const originalContent = document.getElementById('printPreviewContent').innerHTML;
    const printContent = originalContent.replace(/<div class="print-preview-actions.*?<\/div>/gs, '');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Imprimir CV</title>
            <style>
                body { margin: 0; padding: 0; }
                @page { size: auto; margin: 0mm; }
            </style>
        </head>
        <body>
            ${printContent}
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.close();
                    }, 200);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Descargar PDF
async function descargarPDF() {
    const nombres = document.getElementById("Nombres").value;
    const apellidos = document.getElementById("Apellidos").value;
    
    try {
        // Crear elemento temporal
        const element = document.createElement('div');
        element.className = 'cv-template';
        
        // Obtener el HTML del CV
        let cvHTML = generarHTMLCV();
        
        // Si hay foto de perfil, usar la local si está disponible (más rápido)
        if (fotoPerfilLocal) {
            try {
                const base64Image = await convertirImagenABase64(fotoPerfilLocal);
                cvHTML = cvHTML.replace(fotoPerfilLocal, base64Image);
            } catch (error) {
                console.error("Error al convertir la imagen local:", error);
                // Intentar con la de ImgBB si hay
                if (fotoPerfilUrl) {
                    try {
                        const base64Image = await convertirImagenABase64(fotoPerfilUrl);
                        cvHTML = cvHTML.replace(fotoPerfilUrl, base64Image);
                    } catch (error) {
                        console.error("Error al convertir la imagen de ImgBB:", error);
                        // Continuar sin la imagen si hay error
                    }
                }
            }
        } else if (fotoPerfilUrl) {
            try {
                const base64Image = await convertirImagenABase64(fotoPerfilUrl);
                cvHTML = cvHTML.replace(fotoPerfilUrl, base64Image);
            } catch (error) {
                console.error("Error al convertir la imagen:", error);
                // Continuar sin la imagen si hay error
            }
        }
        
        element.innerHTML = cvHTML;
        document.body.appendChild(element);

        // Configuración de html2pdf
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

        // Generar y descargar PDF
        await html2pdf().set(opt).from(element).save();
        
        // Eliminar elemento temporal
        document.body.removeChild(element);
        
    } catch (error) {
        console.error("Error al generar PDF:", error);
        alert("Ocurrió un error al generar el PDF. Por favor, inténtalo de nuevo.");
    }
}

// Función para convertir imagen URL a Base64
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
            
            // Convertir a base64
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            resolve(dataURL);
        };
        
        img.onerror = error => {
            reject(error);
        };
        
        img.src = url;
    });
}

// Generar HTML para el CV
function generarHTMLCV() {
    const formato = document.getElementById("FormatoCV").value;
    
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

// Función para generar el HTML de la foto de perfil
function generarFotoPerfilHTML() {
    // Usar la foto local si está disponible (más rápido), sino usar la de ImgBB
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


// Nuevo formato profesional
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
            <title>Currículum Vitae</title>
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
                .photo-placeholder {
                    width: 120px;
                    height: 120px;
                    background: #f5f5f5;
                    border: 2px solid ${colorPrincipal};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    font-size: 14px;
                }
                h1 {
                    color: ${colorPrincipal};
                    margin: 0;
                    font-size: 32px;
                    font-weight: 700;
                }
                .title {
                    color: #666;
                    font-size: 18px;
                    margin-top: 5px;
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
                    text-align: center;
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
                    letter-spacing: 1px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 5px;
                }
                .section-content {
                    font-size: 14px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 150px 1fr;
                    gap: 15px;
                }
                .info-label {
                    font-weight: bold;
                    color: #555;
                }
                .info-value {
                    color: #333;
                }
                ul {
                    padding-left: 20px;
                    margin: 10px 0;
                }
                li {
                    margin-bottom: 8px;
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
                .experience-item {
                    margin-bottom: 20px;
                }
                .experience-title {
                    font-weight: 600;
                    display: flex;
                    justify-content: space-between;
                }
                .experience-date {
                    color: #666;
                    font-size: 13px;
                }
                @media print {
                    body {
                        padding: 0;
                        background: white;
                    }
                    .cv-container {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="cv-container">
                ${fotoPerfil}
                <div class="header">
                    <div class="name-title">
                        <h1>${document.getElementById('Nombres').value} ${document.getElementById('Apellidos').value}</h1>
                        <div class="title">Profesional</div>
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
                            `<div class="experience-item">
                                <div class="experience-content">${item.replace('</li>', '')}</div>
                            </div>`
                        ).join('')}
                    </div>
                </div>` : ''}
                
                ${habilidades ? `<div class="section">
                    <div class="section-title">Habilidades</div>
                    <div class="section-content">
                        <div class="skills-container">
                            ${habilidades.split('<li>').filter(item => item).map(item => 
                                `<div class="skill-item">${item.replace('</li>', '')}</div>`
                            ).join('')}
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

// Nuevo formato minimalista
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
            <title>Currículum Vitae</title>
            <style>
                body {
                    font-family: ${fuenteSeleccionada};
                    margin: 0;
                    padding: 0;
                    color: #333;
                    line-height: 1.8;
                    background: #f9f9f9;
                }
                .cv-container {
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 40px;
                    background: white;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
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
                    letter-spacing: 2px;
                }
                .subtitle {
                    color: #999;
                    font-size: 16px;
                    margin-top: 10px;
                    letter-spacing: 1px;
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
                    color: #666;
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
                    letter-spacing: 3px;
                }
                .section-content {
                    font-size: 15px;
                    color: #555;
                    line-height: 1.8;
                }
                .info-item {
                    margin-bottom: 15px;
                }
                .info-item strong {
                    display: block;
                    color: #333;
                    margin-bottom: 5px;
                }
                ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
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
                .education-item {
                    margin-bottom: 20px;
                }
                .education-item:last-child {
                    margin-bottom: 0;
                }
                .skills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .skill {
                    padding: 5px 15px;
                    background: ${colorPrincipal}10;
                    color: ${colorPrincipal};
                    font-size: 14px;
                }
                @media print {
                    body {
                        padding: 0;
                        background: white;
                    }
                    .cv-container {
                        box-shadow: none;
                        padding: 30px;
                    }
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
                    <div class="section-content">
                        ${datosBasicos}
                    </div>
                </div>` : ''}
                
                ${estudios ? `<div class="section">
                    <div class="section-title">Educación</div>
                    <div class="section-content">
                        ${estudios}
                    </div>
                </div>` : ''}
                
                ${experiencia ? `<div class="section">
                    <div class="section-title">Experiencia</div>
                    <div class="section-content">
                        <ul>${experiencia}</ul>
                    </div>
                </div>` : ''}
                
                ${habilidades ? `<div class="section">
                    <div class="section-title">Habilidades</div>
                    <div class="section-content">
                        <div class="skills">
                            ${habilidades.split('<li>').filter(item => item).map(item => 
                                `<div class="skill">${item.replace('</li>', '')}</div>`
                            ).join('')}
                        </div>
                    </div>
                </div>` : ''}
                
                ${cursos ? `<div class="section">
                    <div class="section-title">Cursos</div>
                    <div class="section-content">
                        <ul>${cursos}</ul>
                    </div>
                </div>` : ''}
            </div>
        </body>
        </html>
    `;
}

// Formato Creativo (predeterminado)
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
            <title>Currículum Vitae</title>
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
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                    border-radius: 10px;
                    position: relative;
                    overflow: hidden;
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
                    position: relative;
                }
                .header::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100px;
                    height: 3px;
                    background: ${colorPrincipal};
                }
                h1 {
                    color: ${colorPrincipal};
                    margin: 0;
                    font-size: 36px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
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
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }
                .section-title {
                    color: ${colorPrincipal};
                    border-bottom: 2px solid ${colorPrincipal};
                    padding-bottom: 5px;
                    font-size: 22px;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                }
                .section-title i {
                    margin-right: 10px;
                    font-size: 20px;
                }
                ul {
                    padding-left: 20px;
                }
                li {
                    margin-bottom: 10px;
                    position: relative;
                }
                li::before {
                    content: "•";
                    color: ${colorPrincipal};
                    font-weight: bold;
                    display: inline-block;
                    width: 1em;
                    margin-left: -1em;
                }
                .personal-info {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 15px;
                }
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 10px;
                    white-space: nowrap;
                }
                .info-item i {
                    color: ${colorPrincipal};
                }
                .education-item {
                    margin-bottom: 15px;
                }
                .education-item:last-child {
                    margin-bottom: 0;
                }
                @media print {
                    body {
                        padding: 0;
                        background: white;
                    }
                    .cv-container {
                        box-shadow: none;
                        padding: 15px;
                    }
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
                    <div class="personal-info">
                        ${datosBasicos}
                    </div>
                </div>` : ''}
                
                ${estudios ? `<div class="section">
                    <div class="section-title"><i class="fas fa-graduation-cap"></i> Formación Académica</div>
                    <div class="education-items">
                        ${estudios}
                    </div>
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
                    <div class="section-title"><i class="fas fa-certificate"></i> Cursos y Certificaciones</div>
                    <ul>${cursos}</ul>
                </div>` : ''}
            </div>
        </body>
        </html>
    `;
}

// Formato Moderno
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
            <title>Currículum Vitae</title>
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
                    box-shadow: 0 0 20px rgba(0,0,0,0.05);
                    position: relative;
                }
                .header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid ${colorPrincipal};
                }
                .name-container {
                    flex-grow: 1;
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
                    width: 20px;
                    text-align: center;
                }
                .two-columns {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 30px;
                }
                .left-column {
                    border-right: 1px solid #eee;
                    padding-right: 20px;
                }
                .section {
                    margin-bottom: 25px;
                }
                .section-title {
                    color: ${colorPrincipal};
                    font-size: 20px;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .section-content {
                    font-size: 14px;
                }
                .info-item {
                    margin-bottom: 10px;
                }
                .info-item strong {
                    display: block;
                    color: #444;
                }
                ul {
                    padding-left: 20px;
                    margin: 10px 0;
                }
                li {
                    margin-bottom: 8px;
                }
                .skills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .skill {
                    background: ${colorPrincipal}22;
                    color: ${colorPrincipal};
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 13px;
                }
                .education-item {
                    margin-bottom: 15px;
                }
                .education-item:last-child {
                    margin-bottom: 0;
                }
                @media print {
                    body {
                        padding: 0;
                        background: white;
                    }
                    .cv-container {
                        box-shadow: none;
                        padding: 15px;
                    }
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
                            <div class="section-content">
                                ${datosBasicos}
                            </div>
                        </div>` : ''}
                        
                        ${habilidades ? `<div class="section">
                            <div class="section-title">Habilidades</div>
                            <div class="section-content">
                                <div class="skills">
                                    ${habilidades.split('<li>').filter(item => item).map(item => 
                                        `<div class="skill">${item.replace('</li>', '')}</div>`
                                    ).join('')}
                                </div>
                            </div>
                        </div>` : ''}
                    </div>
                    
                    <div class="right-column">
                        ${estudios ? `<div class="section">
                            <div class="section-title">Educación</div>
                            <div class="section-content">
                                <div class="education-items">
                                    ${estudios}
                                </div>
                            </div>
                        </div>` : ''}
                        
                        ${experiencia ? `<div class="section">
                            <div class="section-title">Experiencia</div>
                            <div class="section-content">
                                <ul>${experiencia}</ul>
                            </div>
                        </div>` : ''}
                        
                        ${cursos ? `<div class="section">
                            <div class="section-title">Cursos</div>
                            <div class="section-content">
                                <ul>${cursos}</ul>
                            </div>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Formato Clásico
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
            <title>Currículum Vitae</title>
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
                    border: 1px solid #ddd;
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
                .info-row {
                    display: flex;
                    margin-bottom: 12px;
                }
                .info-label {
                    font-weight: bold;
                    width: 150px;
                }
                .info-value {
                    flex-grow: 1;
                }
                ul {
                    padding-left: 20px;
                    margin: 10px 0;
                }
                li {
                    margin-bottom: 8px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 10px 0;
                }
                table td {
                    padding: 8px;
                    border: 1px solid #ddd;
                    vertical-align: top;
                }
                table tr:first-child td {
                    font-weight: bold;
                    background: #f5f5f5;
                }
                .education-item {
                    margin-bottom: 15px;
                }
                .education-item:last-child {
                    margin-bottom: 0;
                }
                @media print {
                    body {
                        padding: 0;
                        background: white;
                    }
                    .cv-container {
                        border: none;
                        padding: 15px;
                    }
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
                    <div class="section-content">
                        ${datosBasicos}
                    </div>
                </div>` : ''}
                
                ${estudios ? `<div class="section">
                    <div class="section-title">Formación Académica</div>
                    <div class="section-content">
                        <div class="education-items">
                            ${estudios}
                        </div>
                    </div>
                </div>` : ''}
                
                ${experiencia ? `<div class="section">
                    <div class="section-title">Experiencia Laboral</div>
                    <div class="section-content">
                        <ul>${experiencia}</ul>
                    </div>
                </div>` : ''}
                
                ${habilidades ? `<div class="section">
                    <div class="section-title">Habilidades</div>
                    <div class="section-content">
                        <ul>${habilidades}</ul>
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

// Obtener datos básicos formateados
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
                const fecha = new Date(valor);
                valorMostrar = fecha.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'});
            }
            html += `<div class="info-item"><i class="fas fa-${campo.icono}"></i> <strong>${campo.nombre}:</strong> ${valorMostrar}</div>`;
        }
    });

    return html || null;
}

// Obtener estudios formateados
function obtenerEstudios() {
    let html = '';
    const estudios = [
        { id: 'EducacionPrimaria', nombre: 'Educación Primaria', icono: 'school' },
        { id: 'EducacionSecundaria', nombre: 'Educación Secundaria', icono: 'graduation-cap' }
    ];

    // Educación primaria y secundaria
    estudios.forEach(estudio => {
        const valor = document.getElementById(estudio.id).value;
        if (valor) {
            html += `<div class="education-item"><i class="fas fa-${estudio.icono}"></i> <strong>${estudio.nombre}:</strong> ${valor}</div>`;
        }
    });

    // Educación superior (solo mostrar el título una vez)
    const educacionSuperior = document.getElementById('EducacionSuperior').value;
    if (educacionSuperior) {
        html += `<div class="education-item"><i class="fas fa-university"></i> <strong>Educación Superior:</strong> ${educacionSuperior}</div>`;
    }

    // Campos adicionales de educación superior (sin título)
    const inputsSuperior = document.getElementById('EducacionSuperiorCampos').getElementsByTagName('input');
    for (let i = 0; i < inputsSuperior.length; i++) {
        if (inputsSuperior[i].value) {
            html += `<div class="education-item"><i class="fas fa-university"></i> ${inputsSuperior[i].value}</div>`;
        }
    }

    return html || null;
}

// Obtener sección dinámica formateada
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

// Guardar datos en Firebase e ImgBB
async function guardarDatos(mostrarAlerta = true) {
    const nombres = document.getElementById("Nombres").value;
    const apellidos = document.getElementById("Apellidos").value;
    
    if (!nombres || !apellidos) {
        return false;
    }

    // Si ya tenemos la URL de ImgBB (subida en segundo plano), usarla
    // Si no, pero tenemos foto local, subirla ahora
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

    // Guardar campos estáticos
    document.querySelectorAll('#cvForm input, #cvForm select').forEach(campo => {
        if (campo.id && campo.id !== 'FotoPerfil') datos.campos[campo.id] = campo.value;
    });

    // Guardar campos dinámicos
    ['EducacionSuperiorCampos', 'Habilidades', 'Experiencia', 'Cursos'].forEach(id => {
        datos.campos[id] = [];
        const inputs = document.getElementById(id).getElementsByTagName('input');
        for (let input of inputs) {
            datos.campos[id].push(input.value);
        }
    });

    // Guardar en Firebase
    try {
        const db = firebase.firestore();
        let docRef;
        
        // Buscar si ya existe un CV con el mismo nombre y apellido
        const querySnapshot = await db.collection('curriculums')
            .where('nombres', '==', nombres)
            .where('apellidos', '==', apellidos)
            .limit(1)
            .get();
        
        if (!querySnapshot.empty) {
            // Actualizar documento existente
            docRef = querySnapshot.docs[0].ref;
            await docRef.update(datos);
        } else {
            // Crear nuevo documento
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

// Cargar CVs guardados desde Firebase
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

// Eliminar CV de Firebase
// Eliminar CV de Firebase
async function eliminarCV(id, event) {
    event.stopPropagation();
    
    const codigoConfirmacion = prompt('Ingrese el código de confirmación para eliminar este currículum:');
    
    if (codigoConfirmacion === null) {
        return; // El usuario canceló
    }
    
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

// Cargar un CV específico desde Firebase
async function cargarCV(id) {
    try {
        const doc = await firebase.firestore().collection('curriculums').doc(id).get();
        
        if (!doc.exists) {
            alert("El currículum no existe");
            return;
        }
        
        const cv = doc.data();
        
        // Limpiar formulario
        limpiarFormulario();
        
        // Cargar datos básicos
        document.getElementById('Nombres').value = cv.nombres || '';
        document.getElementById('Apellidos').value = cv.apellidos || '';
        
        // Cargar otros campos
        for (const id in cv.campos) {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = cv.campos[id] || '';
            }
        }
        
        // Cargar campos dinámicos
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
                        };
                        
                        div.appendChild(input);
                        div.appendChild(removeBtn);
                        div.appendChild(document.createElement('br'));
                    }
                });
            }
        });
        
        // Cargar personalización
        colorPrincipal = cv.colorPrincipal || '#3498db';
        fuenteSeleccionada = cv.fuenteSeleccionada || "'Poppins', sans-serif";
        fotoPerfilUrl = cv.fotoPerfilUrl || null;
        fotoPerfilLocal = null; // Resetear la foto local al cargar desde la base de datos
        fotoPerfilId = cv.fotoPerfilId || null;
        
        // Mostrar foto si existe
        if (fotoPerfilUrl) {
            document.getElementById('fotoPreview').src = fotoPerfilUrl;
            document.getElementById('fotoPreviewContainer').style.display = 'block';
        }
        
        actualizarEstilos();
        
        // Actualizar selectores
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.toggle('selected', opt.getAttribute('data-color') === colorPrincipal);
        });
        
        document.querySelectorAll('.font-option').forEach(opt => {
            opt.classList.toggle('selected', opt.getAttribute('data-font') === fuenteSeleccionada);
        });
        
        toggleAgenda();
    } catch (error) {
        console.error("Error al cargar CV:", error);
        alert("Error al cargar el currículum");
    }
}

// Formateador de cédula
document.getElementById('Cedula').addEventListener('input', function(e) {
    const input = e.target;
    const startPos = input.selectionStart;
    const cursorWasAtEnd = (startPos === input.value.length);
    
    // Obtener valor sin el "V-" inicial
    let value = input.value.replace(/^V-/, '').replace(/\./g, '');
    
    // Solo permitir números
    value = value.replace(/\D/g, '');
    
    // Agregar separadores de miles
    if (value.length > 3) {
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    // Reconstruir el valor con "V-" y mantener la posición del cursor
    input.value = value ? 'V-' + value : '';
    
    if (!cursorWasAtEnd) {
        // Ajustar posición del cursor si no estaba al final
        const adjustedPos = startPos - (input.value.length - e.target.value.length);
        input.setSelectionRange(adjustedPos, adjustedPos);
    }
});

// Validación al perder el foco
document.getElementById('Cedula').addEventListener('blur', function(e) {
    if (e.target.value && !/^V-\d{1,3}(?:\.\d{3})*$/.test(e.target.value)) {
        alert('Formato de cédula inválido. Ejemplo correcto: V-1.234.567');
        e.target.focus();
    }
});