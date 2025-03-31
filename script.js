// Variables globales
const { jsPDF } = window.jspdf;
let colorPrincipal = '#3498db';
let fuenteSeleccionada = "'Poppins', sans-serif";


// Seleccionar Poppins por defecto
document.querySelectorAll('.font-option').forEach(opt => {
    opt.classList.remove('selected');
    if (opt.getAttribute('data-font') === "'Poppins', sans-serif") {
        opt.classList.add('selected');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    actualizarDatos();
    cargarCVsGuardados();
    configurarPersonalizacion();
    
    // Eliminé la selección específica de Poppins aquí porque ahora está en configurarPersonalizacion()
});

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarDatos();
    cargarCVsGuardados();
    configurarPersonalizacion();
    
    // Seleccionar Poppins por defecto
    document.querySelectorAll('.font-option').forEach(opt => {
        if (opt.getAttribute('data-font') === "'Poppins', sans-serif") {
            opt.classList.add('selected');
        }
    });
});

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
// Modifica la función toggleAgenda()
function toggleAgenda() {
    const agendaPanel = document.getElementById('agendaPanel');
    const agendaBtn = document.querySelector('.agenda-btn');
    
    agendaPanel.classList.toggle('open');
    document.getElementById('agendaOverlay').classList.toggle('open');
    
    // Mover el botón cuando la agenda está abierta
    if (agendaPanel.classList.contains('open')) {
        agendaBtn.style.left = '360px'; // Ajusta este valor según el ancho de tu panel
    } else {
        agendaBtn.style.left = '10px'; // Vuelve a la posición original
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
}

// Generar currículum y mostrar vista previa
function generarCurriculum() {
    const nombres = document.getElementById("Nombres").value;
    const apellidos = document.getElementById("Apellidos").value;
    
    
    if (!nombres || !apellidos) {
        alert("Por favor ingresa al menos tu nombre y apellido");
        return;
        
    }
    

    // Guardar automáticamente en la agenda
    guardarDatos(false);
    
    // Mostrar vista previa
    mostrarVistaPrevia();
}

// Mostrar vista previa del currículum
function mostrarVistaPrevia() {
    const previewContent = document.getElementById('printPreviewContent');
    previewContent.innerHTML = generarHTMLCV();
    document.getElementById('printPreviewOverlay').classList.add('active');
    document.body.classList.add('preview-active');
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
        element.innerHTML = generarHTMLCV();
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
                scrollY: 0
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

// Nuevo formato profesional
function generarFormatoProfesional() {
    const datosBasicos = obtenerDatosBasicos();
    const estudios = obtenerEstudios();
    const experiencia = obtenerSeccion('Experiencia', true);
    const habilidades = obtenerSeccion('Habilidades', true);
    const cursos = obtenerSeccion('Cursos', true);

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

// Guardar datos en localStorage
function guardarDatos(mostrarAlerta = true) {
    const nombres = document.getElementById("Nombres").value;
    const apellidos = document.getElementById("Apellidos").value;
    
    if (!nombres || !apellidos) {
        return false;
    }

    const datos = {
        nombres,
        apellidos,
        colorPrincipal,
        fuenteSeleccionada,
        campos: {}
    };

    // Guardar campos estáticos
    document.querySelectorAll('#cvForm input, #cvForm select').forEach(campo => {
        if (campo.id) datos.campos[campo.id] = campo.value;
    });

    // Guardar campos dinámicos
    ['EducacionSuperiorCampos', 'Habilidades', 'Experiencia', 'Cursos'].forEach(id => {
        datos.campos[id] = [];
        const inputs = document.getElementById(id).getElementsByTagName('input');
        for (let input of inputs) {
            datos.campos[id].push(input.value);
        }
    });

    // Guardar en localStorage
    const cvsGuardados = JSON.parse(localStorage.getItem('cvsGuardados')) || [];
    const indexExistente = cvsGuardados.findIndex(cv => 
        cv.nombres === nombres && cv.apellidos === apellidos);
    
    if (indexExistente !== -1) {
        cvsGuardados[indexExistente] = datos;
    } else {
        cvsGuardados.push(datos);
    }

    localStorage.setItem('cvsGuardados', JSON.stringify(cvsGuardados));
    
    if (mostrarAlerta) {
        alert(`CV de ${nombres} ${apellidos} guardado correctamente`);
    }
    
    cargarCVsGuardados();
    return true;
}

// Modificar la función cargarCVsGuardados
function cargarCVsGuardados() {
    const cvsGuardados = JSON.parse(localStorage.getItem('cvsGuardados')) || [];
    const lista = document.getElementById('savedCvsList');
    
    lista.innerHTML = cvsGuardados.length === 0 
        ? '<p style="text-align: center; color: #666;">No hay CVs guardados</p>'
        : cvsGuardados.map((cv, index) => `
            <div class="saved-cv-item">
                <div class="saved-cv-content" onclick="cargarCV(${index})">
                    <strong>${cv.nombres} ${cv.apellidos}</strong>
                    <div>${cv.campos['Cedula'] || 'Sin cédula registrada'}</div>
                </div>
                <button class="cv-delete-btn" onclick="eliminarCV(${index}, event)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
}

// Modificar la función eliminarCV para incluir confirmación
function eliminarCV(index, event) {
    event.stopPropagation();
    
    if (confirm('¿Estás seguro que deseas eliminar este currículum? Esta acción no se puede deshacer.')) {
        const cvsGuardados = JSON.parse(localStorage.getItem('cvsGuardados')) || [];
        
        if (index >= 0 && index < cvsGuardados.length) {
            const cv = cvsGuardados[index];
            cvsGuardados.splice(index, 1);
            localStorage.setItem('cvsGuardados', JSON.stringify(cvsGuardados));
            cargarCVsGuardados();
        }
    }
}

// Cargar un CV específico
function cargarCV(index) {
    const cvsGuardados = JSON.parse(localStorage.getItem('cvsGuardados')) || [];
    
    if (index >= 0 && index < cvsGuardados.length) {
        const cv = cvsGuardados[index];
        
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
        actualizarEstilos();
        
        // Actualizar selectores
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.toggle('selected', opt.getAttribute('data-color') === colorPrincipal);
        });
        
        document.querySelectorAll('.font-option').forEach(opt => {
            opt.classList.toggle('selected', opt.getAttribute('data-font') === fuenteSeleccionada);
        });
        
        toggleAgenda();
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
