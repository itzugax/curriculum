// Variables globales
const { jsPDF } = window.jspdf;
let colorPrincipal = '#3498db';
let fuenteSeleccionada = "'Poppins', sans-serif";
let fotoPerfilBase64 = null;
const IMGBB_API_KEY = '7fbfd4fd0883d7aa649035d839b12e43';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCEGy5745n-6ZPXW1oPX3p6O_Gpz19a824",
    authDomain: "generador-898e9.firebaseapp.com",
    projectId: "generador-898e9",
    storageBucket: "generador-898e9.appspot.com",
    messagingSenderId: "10684061843",
    appId: "1:10684061843:web:58d9e8a5b8c8b8d5a8b9c3"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarDatos();
    cargarCVsGuardados();
    configurarPersonalizacion();
    
    // Configurar evento para la foto de perfil
    document.getElementById('fotoPerfil').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Verificar tamaño (máximo 1MB)
            if (file.size > 1000000) {
                alert('La imagen es demasiado grande. Use una imagen menor a 1MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                // Comprimir imagen
                const img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    // Redimensionar a máximo 300px
                    const MAX_WIDTH = 300;
                    const MAX_HEIGHT = 300;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convertir a Base64 con calidad reducida
                    fotoPerfilBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    
                    const preview = document.getElementById('photoPreview');
                    preview.innerHTML = `<img src="${fotoPerfilBase64}" alt="Foto de perfil">`;
                    preview.style.display = 'block';
                };
            };
            reader.readAsDataURL(file);
        }
    });
    
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
            actualizarEstilos();
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
    document.getElementById("photoPreview").innerHTML = "";
    document.getElementById("photoPreview").style.display = "none";
    fotoPerfilBase64 = null;
}

// Función para subir imagen a ImgBB
async function subirImagenAIimgBB(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Error en la respuesta de ImgBB');
        }
        
        const data = await response.json();
        return data.data.url; // Devuelve la URL de la imagen
    } catch (error) {
        console.error("Error subiendo a ImgBB:", error);
        throw error;
    }
}

// Guardar datos en Firebase con imagen en ImgBB
async function guardarDatos(mostrarAlerta = true) {
    const nombres = document.getElementById("Nombres").value;
    const apellidos = document.getElementById("Apellidos").value;
    
    if (!nombres || !apellidos) {
        if (mostrarAlerta) {
            alert("Por favor ingresa al menos tu nombre y apellido");
        }
        return false;
    }
  
    // Mostrar loader
    const saveButton = document.querySelector('button[onclick="guardarDatos()"]');
    const originalText = saveButton.innerHTML;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    saveButton.disabled = true;

    try {
        // 1. Preparar objeto de datos
        const datos = {
            nombres,
            apellidos,
            colorPrincipal,
            fuenteSeleccionada,
            campos: {},
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        // 2. Recopilar todos los campos del formulario
        document.querySelectorAll('#cvForm input, #cvForm select').forEach(campo => {
            if (campo.id && campo.id !== 'fotoPerfil') {
                datos.campos[campo.id] = campo.value;
            }
        });

        // 3. Manejo de la imagen (si existe)
        const fileInput = document.getElementById('fotoPerfil');
        if (fileInput.files[0]) {
            // Subir imagen a ImgBB
            const imageUrl = await subirImagenAIimgBB(fileInput.files[0]);
            datos.fotoUrl = imageUrl;
            
            // Guardar referencia en Firebase
            const docRef = await db.collection("curriculums").add(datos);
            
            // Actualizar documento con el ID de referencia
            await db.collection("curriculums").doc(docRef.id).update({
                docId: docRef.id
            });
            
            console.log("Documento guardado con ID:", docRef.id);
        } else {
            // Guardar sin imagen
            await db.collection("curriculums").add(datos);
        }

        if (mostrarAlerta) {
            alert(`✅ CV de ${nombres} ${apellidos} guardado exitosamente`);
        }
        
        cargarCVsGuardados();
        return true;
        
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("❌ Error al guardar el currículum. Por favor intenta nuevamente.");
        return false;
    } finally {
        // Restaurar botón
        saveButton.innerHTML = originalText;
        saveButton.disabled = false;
    }
}

// Cargar CVs guardados desde Firebase
async function cargarCVsGuardados() {
    try {
        const querySnapshot = await db.collection("curriculums").orderBy("timestamp", "desc").get();
        const savedCvsList = document.getElementById('savedCvsList');
        savedCvsList.innerHTML = '';
        
        if (querySnapshot.empty) {
            savedCvsList.innerHTML = '<p style="text-align: center; color: #666;">No hay currículums guardados</p>';
            return;
        }
        
        querySnapshot.forEach(doc => {
            const cv = doc.data();
            const cvItem = document.createElement('div');
            cvItem.className = 'saved-cv-item';
            cvItem.onclick = () => cargarCV(doc.id);
            
            cvItem.innerHTML = `
            <div class="saved-cv-content">
                <strong>${cv.nombres || 'Sin nombre'} ${cv.apellidos || 'Sin apellido'}</strong>
                <div>${cv.Email || cv.campos?.Email || 'Sin email'} • ${cv.timestamp?.toDate()?.toLocaleDateString() || 'Sin fecha'}</div>
                <button class="cv-delete-btn" onclick="eliminarCV('${doc.id}', event)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

            
            
            savedCvsList.appendChild(cvItem);
        });
    } catch (error) {
        console.error("Error al cargar CVs:", error);
        document.getElementById('savedCvsList').innerHTML = '<p style="text-align: center; color: #ff4444;">Error al cargar currículums</p>';
    }
}

// Cargar un CV específico desde Firebase
async function cargarCV(id) {
    try {
        const doc = await db.collection("curriculums").doc(id).get();
        if (!doc.exists) {
            throw new Error("El currículum no existe");
        }
        
        const cv = doc.data();
        
        // Limpiar formulario
        limpiarFormulario();
        
        // Cargar datos básicos
        document.getElementById('Nombres').value = cv.nombres || '';
        document.getElementById('Apellidos').value = cv.apellidos || '';
        
        // Cargar otros campos
        for (const campoId in cv.campos) {
            const elemento = document.getElementById(campoId);
            if (elemento) {
                elemento.value = cv.campos[campoId] || '';
            }
        }
        
        // Cargar foto desde ImgBB si existe
        if (cv.fotoUrl) {
            try {
                fotoPerfilBase64 = cv.fotoUrl;
                const preview = document.getElementById('photoPreview');
                preview.innerHTML = `<img src="${cv.fotoUrl}" alt="Foto de perfil">`;
                preview.style.display = 'block';
            } catch (e) {
                console.error("Error al cargar foto:", e);
            }
        }
        
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
    } catch (error) {
        console.error("Error al cargar CV:", error);
        alert("Error al cargar el currículum. Por favor intente nuevamente.");
    }
}

// Eliminar CV de Firebase
async function eliminarCV(id, event) {
    event.stopPropagation();
    if (confirm('¿Eliminar este currículum permanentemente?')) {
        try {
            await db.collection("curriculums").doc(id).delete();
            cargarCVsGuardados();
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Error al eliminar el currículum");
        }
    }
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
                    display: flex;
                    flex-direction: column;
                    align-items: center;
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
                .photo-container {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    overflow: hidden;
                    margin-bottom: 20px;
                    border: 4px solid ${colorPrincipal};
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
                .photo-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
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
                    ${fotoPerfilBase64 ? `
                    <div class="photo-container">
                        <img src="${fotoPerfilBase64}" alt="Foto de perfil">
                    </div>
                    ` : ''}
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
                const partes = valor.split('-');
                if (partes.length === 3) {
                    valorMostrar = `${partes[2]}/${partes[1]}/${partes[0]}`;
                }
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

// Formateador de cédula
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

// Validación al perder el foco
document.getElementById('Cedula').addEventListener('blur', function(e) {
    if (e.target.value && !/^V-\d{1,3}(?:\.\d{3})*$/.test(e.target.value)) {
        alert('Formato de cédula inválido. Ejemplo correcto: V-1.234.567');
        e.target.focus();
    }
});

