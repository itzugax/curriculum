// Variables globales
const { jsPDF } = window.jspdf;
let colorPrincipal = '#3498db';
let fuenteSeleccionada = "'Poppins', sans-serif";

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
function toggleAgenda() {
    document.getElementById('agendaPanel').classList.toggle('open');
    document.getElementById('agendaOverlay').classList.toggle('open');
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
    previewContent.innerHTML = `
        <style>
            :root {
                --color-principal: ${colorPrincipal};
            }
            .print-preview-content {
                padding: 20px;
                background: white;
                border-radius: 10px;
            }
        </style>
        ${generarHTMLCV()}
    `;
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

// Descargar PDF
async function descargarPDF() {
    const nombres = document.getElementById("Nombres").value;
    const apellidos = document.getElementById("Apellidos").value;
    
    try {
        const element = document.createElement('div');
        element.className = 'cv-template';
        element.innerHTML = `
            <style>
                :root {
                    --color-principal: ${colorPrincipal};
                }
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
                
                body { 
                    font-family: ${fuenteSeleccionada}; 
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .fa, .fas { 
                    font-family: 'Font Awesome 5 Free' !important; 
                    font-weight: 900 !important; 
                }
                @page { 
                    size: letter; 
                    margin: 15mm; 
                }
            </style>
            ${generarHTMLCV()}
        `;
        
        document.body.appendChild(element);

        const opt = {
            margin: [15, 15],
            filename: `${nombres}_${apellidos}_CV.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { 
                scale: 2,
                letterRendering: true,
                useCORS: true,
                allowTaint: true,
                logging: true
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'letter',
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

// Generar HTML para el CV
function generarHTMLCV() {
    const formato = document.getElementById("FormatoCV").value;
    
    switch(formato) {
        case 'clasico':
            return generarFormatoClasico();
        case 'moderno':
            return generarFormatoModerno();
        case 'creativo':
        default:
            return generarFormatoCreativo();
    }
}

// Formato Creativo (predeterminado)
function generarFormatoCreativo() {
    const datosBasicos = `
        <div style="display: flex; gap: 20px; margin-bottom: 10px;">
            ${document.getElementById('Cedula').value ? `<div class="info-item"><i class="fas fa-id-card"></i> <strong>Cédula:</strong> ${document.getElementById('Cedula').value}</div>` : ''}
            ${document.getElementById('FechaNacimiento').value ? `<div class="info-item"><i class="fas fa-birthday-cake"></i> <strong>Fecha Nac.:</strong> ${new Date(document.getElementById('FechaNacimiento').value).toLocaleDateString('es-ES')}</div>` : ''}
        </div>
        ${document.getElementById('Sexo').value ? `<div class="info-item"><i class="fas fa-venus-mars"></i> <strong>Sexo:</strong> ${document.getElementById('Sexo').value}</div>` : ''}
        ${document.getElementById('EstadoCivil').value ? `<div class="info-item"><i class="fas fa-heart"></i> <strong>Estado Civil:</strong> ${document.getElementById('EstadoCivil').value}</div>` : ''}
    `;

    const estudios = obtenerEstudios();
    const experiencia = obtenerSeccion('Experiencia', true);
    const habilidades = obtenerSeccion('Habilidades', true);
    const cursos = obtenerSeccion('Cursos', true);

    return `
        <div class="cv-preview">
            <div class="cv-header">
                <h1>${document.getElementById('Nombres').value} ${document.getElementById('Apellidos').value}</h1>
                <div class="contact-info">
                    ${document.getElementById('Email').value ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${document.getElementById('Email').value}</div>` : ''}
                    ${document.getElementById('Telefono').value ? `<div class="contact-item"><i class="fas fa-phone"></i> ${document.getElementById('Telefono').value}</div>` : ''}
                    ${document.getElementById('Direccion').value ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${document.getElementById('Direccion').value}</div>` : ''}
                </div>
            </div>
            
            <div class="cv-section">
                <h2><i class="fas fa-user"></i> Datos Personales</h2>
                <div class="personal-info">
                    ${datosBasicos}
                </div>
            </div>
            
            ${estudios ? `<div class="cv-section">
                <h2><i class="fas fa-graduation-cap"></i> Formación Académica</h2>
                <div class="education-items">
                    ${estudios}
                </div>
            </div>` : ''}
            
            ${experiencia ? `<div class="cv-section">
                <h2><i class="fas fa-briefcase"></i> Experiencia Laboral</h2>
                <ul class="experience-list">${experiencia}</ul>
            </div>` : ''}
            
            ${habilidades ? `<div class="cv-section">
                <h2><i class="fas fa-star"></i> Habilidades</h2>
                <ul class="skills-list">${habilidades}</ul>
            </div>` : ''}
            
            ${cursos ? `<div class="cv-section">
                <h2><i class="fas fa-certificate"></i> Cursos y Certificaciones</h2>
                <ul class="courses-list">${cursos}</ul>
            </div>` : ''}
        </div>
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
        <div class="cv-preview modern">
            <div class="cv-header">
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
                    ${datosBasicos ? `<div class="cv-section">
                        <h2>Datos Personales</h2>
                        <div class="section-content">
                            ${datosBasicos}
                        </div>
                    </div>` : ''}
                    
                    ${habilidades ? `<div class="cv-section">
                        <h2>Habilidades</h2>
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
                    ${estudios ? `<div class="cv-section">
                        <h2>Educación</h2>
                        <div class="section-content">
                            <div class="education-items">
                                ${estudios}
                            </div>
                        </div>
                    </div>` : ''}
                    
                    ${experiencia ? `<div class="cv-section">
                        <h2>Experiencia</h2>
                        <div class="section-content">
                            <ul>${experiencia}</ul>
                        </div>
                    </div>` : ''}
                    
                    ${cursos ? `<div class="cv-section">
                        <h2>Cursos</h2>
                        <div class="section-content">
                            <ul>${cursos}</ul>
                        </div>
                    </div>` : ''}
                </div>
            </div>
        </div>
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
        <div class="cv-preview classic">
            <div class="cv-header">
                <h1>${document.getElementById('Nombres').value} ${document.getElementById('Apellidos').value}</h1>
                <div class="contact-info">
                    ${document.getElementById('Email').value ? `<span>${document.getElementById('Email').value}</span> | ` : ''}
                    ${document.getElementById('Telefono').value ? `<span>${document.getElementById('Telefono').value}</span> | ` : ''}
                    ${document.getElementById('Direccion').value ? `<span>${document.getElementById('Direccion').value}</span>` : ''}
                </div>
            </div>
            
            ${datosBasicos ? `<div class="cv-section">
                <h2>Datos Personales</h2>
                <div class="section-content">
                    ${datosBasicos}
                </div>
            </div>` : ''}
            
            ${estudios ? `<div class="cv-section">
                <h2>Formación Académica</h2>
                <div class="section-content">
                    <div class="education-items">
                        ${estudios}
                    </div>
                </div>
            </div>` : ''}
            
            ${experiencia ? `<div class="cv-section">
                <h2>Experiencia Laboral</h2>
                <div class="section-content">
                    <ul>${experiencia}</ul>
                </div>
            </div>` : ''}
            
            ${habilidades ? `<div class="cv-section">
                <h2>Habilidades</h2>
                <div class="section-content">
                    <ul>${habilidades}</ul>
                </div>
            </div>` : ''}
            
            ${cursos ? `<div class="cv-section">
                <h2>Cursos y Certificaciones</h2>
                <div class="section-content">
                    <ul>${cursos}</ul>
                </div>
            </div>` : ''}
        </div>
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

// Cargar CVs guardados
function cargarCVsGuardados() {
    const cvsGuardados = JSON.parse(localStorage.getItem('cvsGuardados')) || [];
    const lista = document.getElementById('savedCvsList');
    
    lista.innerHTML = cvsGuardados.length === 0 
        ? '<p style="text-align: center; color: #666;">No hay CVs guardados</p>'
        : cvsGuardados.map((cv, index) => `
            <div class="saved-cv-item">
                <div class="saved-cv-item-content" onclick="cargarCV(${index})">
                    <strong>${cv.nombres} ${cv.apellidos}</strong>
                    <div>${cv.campos['Email'] || 'Sin email'} • ${cv.campos['Telefono'] || 'Sin teléfono'}</div>
                </div>
                <button class="delete-cv-btn" onclick="eliminarCV(${index}, event)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
}

// Eliminar CV guardado
function eliminarCV(index, event) {
    event.stopPropagation();
    const cvsGuardados = JSON.parse(localStorage.getItem('cvsGuardados')) || [];
    
    if (index >= 0 && index < cvsGuardados.length) {
        const cv = cvsGuardados[index];
        cvsGuardados.splice(index, 1);
        localStorage.setItem('cvsGuardados', JSON.stringify(cvsGuardados));
        cargarCVsGuardados();
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