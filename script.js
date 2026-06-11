// Variables globales
let colorPrincipal = '#3498db';
let fuenteSeleccionada = "'Poppins', sans-serif";
let fotoPerfilUrl = null;
let fotoPerfilLocal = null;
let fotoPerfilId = null;
let cropperInstance = null;
let fotoUploadPromise = null;
let fotoBase64 = null;
let cvActualDocId = null;
let fotoPosicion = 'right';
let fotoForma = 'cuadrado';
let escalaFuente = 0.9;
let espaciadoSecciones = 0.6;
const IMGBB_API_KEY = '7fbfd4fd0883d7aa649035d839b12e43';
let suggestionsMap = {};

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
// ─── Sugerencias y Autocompletado ────────────────────────────────
function normalizarTexto(txt) {
    return txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const FIELD_SUGGESTIONS_MAP = {
    'Direccion': 'Direccion',
    'EducacionPrimaria': 'EducacionPrimaria',
    'EducacionSecundaria': 'EducacionSecundaria',
    'EducacionSuperior': 'EducacionSuperior',
    'Experiencia': 'Experiencia',
    'Habilidades': 'Habilidades',
    'Cursos': 'Cursos'
};

async function buildSuggestions() {
    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('curriculums').get();

        suggestionsMap = {};
        Object.keys(FIELD_SUGGESTIONS_MAP).forEach(k => suggestionsMap[k] = []);

        snapshot.forEach(doc => {
            const cv = doc.data();
            if (cv.campos) {
                Object.keys(FIELD_SUGGESTIONS_MAP).forEach(k => {
                    if (k === 'EducacionSuperior' || k === 'Experiencia' || k === 'Habilidades' || k === 'Cursos') return;
                    if (cv.campos[k]) suggestionsMap[k].push(cv.campos[k]);
                });
                ['EducacionSuperiorCampos', 'EducacionPrimariaCampos', 'EducacionSecundariaCampos', 'Experiencia', 'Habilidades', 'Cursos'].forEach(arrKey => {
                    const mapKey = arrKey === 'EducacionSuperiorCampos' ? 'EducacionSuperior' : arrKey === 'EducacionPrimariaCampos' ? 'EducacionPrimaria' : arrKey === 'EducacionSecundariaCampos' ? 'EducacionSecundaria' : arrKey;
                    if (cv.campos[arrKey] && Array.isArray(cv.campos[arrKey])) {
                        cv.campos[arrKey].forEach(v => { if (v && v.trim()) suggestionsMap[mapKey].push(v.trim()); });
                    }
                });
            }
        });

        Object.keys(suggestionsMap).forEach(k => {
            suggestionsMap[k] = [...new Set(suggestionsMap[k])].filter(Boolean);
        });
        setupAutocomplete();
    } catch (e) {
        console.warn('No se pudieron cargar sugerencias:', e);
    }
}

function crearDatalist(input, fieldKey) {
    const listId = 'dl-' + fieldKey;
    let dl = document.getElementById(listId);
    if (!dl) {
        dl = document.createElement('datalist');
        dl.id = listId;
        document.body.appendChild(dl);
    }
    input.setAttribute('list', listId);
    actualizarDatalist(dl, suggestionsMap[fieldKey] || []);
}

function actualizarDatalist(dl, values) {
    dl.innerHTML = '';
    values.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        dl.appendChild(opt);
    });
}

function configurarCorreccion(input, fieldKey) {
    if (fieldKey === 'Nombres' || fieldKey === 'Apellidos' || fieldKey === 'Cedula' || fieldKey === 'Email' || fieldKey === 'Telefono') return;
    input.addEventListener('keydown', function() { this.dataset.userModified = 'true'; });
    input.addEventListener('blur', function() {
        let val = this.value.trim();
        if (!val) return;
        let changed = false;
        if (val.length > 0) {
            const capped = val.charAt(0).toUpperCase() + val.slice(1);
            if (capped !== val) { val = capped; changed = true; }
        }
        const suggestions = suggestionsMap[fieldKey] || [];
        if (suggestions.length) {
            const norm = normalizarTexto(val);
            for (const s of suggestions) {
                if (normalizarTexto(s) === norm && s !== val) { val = s; changed = true; break; }
            }
        }
        if (changed) {
            this.value = val;
            this.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
}

function configurarAutocompletadoInput(input, fieldKey) {
    if (!input || input.hasAttribute('list')) return;
    crearDatalist(input, fieldKey);
    configurarCorreccion(input, fieldKey);
}

function setupAutocomplete() {
    Object.keys(FIELD_SUGGESTIONS_MAP).forEach(fieldKey => {
        const input = document.getElementById(fieldKey);
        if (input && input.tagName === 'INPUT') configurarAutocompletadoInput(input, fieldKey);
    });
    document.querySelectorAll('#EducacionSuperiorCampos input, #EducacionPrimariaCampos input, #EducacionSecundariaCampos input, #Experiencia input, #Habilidades input, #Cursos input').forEach(inp => {
        const container = inp.closest('[id]');
        if (!container) return;
        const mapKey = container.id === 'EducacionSuperiorCampos' ? 'EducacionSuperior' : container.id === 'EducacionPrimariaCampos' ? 'EducacionPrimaria' : container.id === 'EducacionSecundariaCampos' ? 'EducacionSecundaria' : container.id;
        configurarAutocompletadoInput(inp, mapKey);
    });
}

function actualizarSugerenciasLocales(datos) {
    const textFields = ['Direccion', 'EducacionPrimaria', 'EducacionSecundaria'];
    textFields.forEach(k => {
        const v = datos.campos?.[k];
        if (v && v.trim() && !suggestionsMap[k]?.includes(v.trim())) {
            suggestionsMap[k].push(v.trim());
            const dl = document.getElementById('dl-' + k);
            if (dl) actualizarDatalist(dl, suggestionsMap[k]);
        }
    });
    [['EducacionSuperiorCampos', 'EducacionSuperior'], ['EducacionPrimariaCampos', 'EducacionPrimaria'], ['EducacionSecundariaCampos', 'EducacionSecundaria'], ['Experiencia', 'Experiencia'], ['Habilidades', 'Habilidades'], ['Cursos', 'Cursos']].forEach(([arrKey, mapKey]) => {
        if (datos.campos?.[arrKey] && Array.isArray(datos.campos[arrKey])) {
            datos.campos[arrKey].forEach(v => {
                if (v && v.trim() && !suggestionsMap[mapKey]?.includes(v.trim())) {
                    suggestionsMap[mapKey].push(v.trim());
                    const dl = document.getElementById('dl-' + mapKey);
                    if (dl) actualizarDatalist(dl, suggestionsMap[mapKey]);
                }
            });
        }
    });
}

// ─── Autoguardado ─────────────────────────────────────────────────
function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function contarCamposLlenos() {
    let count = 0;
    document.querySelectorAll('#cvForm input, #cvForm select').forEach(campo => {
        if (campo.id && campo.id !== 'FotoPerfil' && campo.value.trim()) count++;
    });
    ['EducacionSuperiorCampos', 'EducacionPrimariaCampos', 'EducacionSecundariaCampos', 'Habilidades', 'Experiencia', 'Cursos'].forEach(id => {
        const inputs = document.getElementById(id).getElementsByTagName('input');
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].value.trim()) count++;
        }
    });
    return count;
}

function mostrarAutoguardado(mostrar) {
    const el = document.getElementById('autoSaveIndicator');
    if (el) el.style.display = mostrar ? 'flex' : 'none';
}

async function autoGuardar() {
    const nombres = document.getElementById("Nombres").value.trim();
    const apellidos = document.getElementById("Apellidos").value.trim();
    if (!nombres || !apellidos) {
        mostrarAutoguardado(false);
        return;
    }
    if (contarCamposLlenos() >= 3) {
        await guardarDatos(false);
    }
    mostrarAutoguardado(false);
}

const autoGuardarDebounced = debounce(autoGuardar, 2000);

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarDatos();
    cargarCVsGuardados();
    buildSuggestions();
    configurarPersonalizacion();
    actualizarVistaPrevia();
    animarTitulo(); // Iniciar animación del título
    
    document.getElementById('toggleAvanzado').addEventListener('click', function() {
        const panel = document.getElementById('avanzadoOpciones');
        const arrow = document.getElementById('avanzadoArrow');
        const isOpen = panel.style.display !== 'none';
        panel.style.display = isOpen ? 'none' : 'block';
        arrow.textContent = isOpen ? '▸' : '▾';
    });
    document.getElementById('fontSizeSlider').addEventListener('input', function() {
        escalaFuente = this.value / 100;
        document.getElementById('fontSizeLabel').textContent = this.value + '%';
        actualizarVistaPrevia();
    });
    document.getElementById('spacingSlider').addEventListener('input', function() {
        espaciadoSecciones = this.value / 100;
        document.getElementById('spacingLabel').textContent = this.value + '%';
        actualizarVistaPrevia();
    });

    // Restaurar estado del Filtro Mágico si ya fue descargado antes
    if (localStorage.getItem('ia_descargada') === '1') {
        const btn = document.getElementById('btnPreloadModel');
        const status = document.getElementById('preloadStatus');
        if (btn) btn.style.display = 'none';
        if (status) status.style.display = 'block';
        // Pre-calentar la IA en segundo plano sin bloquear la UI
        setTimeout(() => _preCentientarIASilencio(), 2000);
    }
    
    // Configurar el input de foto
    document.getElementById('FotoPerfil').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                abrirCropModal(event.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            fotoPerfilLocal = null;
            fotoPerfilUrl = null;
            const previewContainer = document.getElementById('fotoPreviewContainer');
            if (previewContainer) previewContainer.style.display = 'none';
            actualizarVistaPrevia();
        }
    });

    // Configurar posición de la foto
    document.querySelectorAll('.pos-option').forEach(opt => {
        opt.addEventListener('click', function() {
            document.querySelectorAll('.pos-option').forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');
            fotoPosicion = this.getAttribute('data-pos');
            actualizarVistaPrevia();
        });
    });

    // Configurar forma de la foto
    document.querySelectorAll('.shape-option').forEach(opt => {
        opt.addEventListener('click', function() {
            document.querySelectorAll('.shape-option').forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');
            fotoForma = this.getAttribute('data-shape');
            document.documentElement.style.setProperty('--preview-border-radius', fotoForma === 'circulo' ? '50%' : '16px');
            actualizarVistaPrevia();
        });
    });

    // Configurar slider de zoom en el modal de recorte
    const zoomSlider = document.getElementById('zoomSlider');
    if (zoomSlider) {
        zoomSlider.addEventListener('input', function() {
            if (cropperInstance) {
                cropperInstance.zoomTo(parseFloat(this.value));
            }
        });
    }

    // Formatear cédula automáticamente
    const cedulaInput = document.getElementById('Cedula');
    if (cedulaInput) {
        cedulaInput.addEventListener('input', function() {
            let val = this.value.replace(/[^\d]/g, '');
            if (val) {
                const parts = [];
                while (val.length > 3) { parts.unshift(val.slice(-3)); val = val.slice(0, -3); }
                if (val) parts.unshift(val);
                this.value = parts.join('.');
            }
        });
    }

    // Escuchar cambios en el formulario para vista previa en tiempo real
    document.getElementById('cvForm').addEventListener('input', function() {
        actualizarVistaPrevia();
        const nombres = document.getElementById("Nombres").value.trim();
        const apellidos = document.getElementById("Apellidos").value.trim();
        if (nombres && apellidos && contarCamposLlenos() >= 3) {
            mostrarAutoguardado(true);
        }
        autoGuardarDebounced();
    });
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
    } finally {
        fotoUploadPromise = null;
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
    const divMap = {
        "EducacionSuperior": "EducacionSuperiorCampos",
        "EducacionPrimaria": "EducacionPrimariaCampos",
        "EducacionSecundaria": "EducacionSecundariaCampos"
    };
    const div = divMap[id] ? document.getElementById(divMap[id]) : document.getElementById(id);

    const input = document.createElement("input");
    input.type = "text";
    
    if (id === "Habilidades") {
        input.placeholder = "Ej: Liderazgo, Trabajo en equipo...";
    } else if (id === "Experiencia") {
        input.placeholder = "Ej: Asistente administrativo en Empresa X (2020-2022)";
    } else if (id === "Cursos") {
        input.placeholder = "Ej: Curso de Marketing Digital - Instituto Y (2021)";
    } else {
        input.placeholder = `Ingrese ${id.toLowerCase()}`;
    }

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-btn";
    removeBtn.innerHTML = '<i class="fas fa-minus"></i>';
    removeBtn.onclick = function() {
        row.remove();
        actualizarVistaPrevia();
    };

    const row = document.createElement("div");
    row.className = "field-row";
    input.addEventListener('input', actualizarVistaPrevia);
    const mapKey = id === "EducacionSuperior" ? "EducacionSuperior" : id;
    configurarAutocompletadoInput(input, mapKey);

    row.appendChild(input);
    row.appendChild(removeBtn);
    div.appendChild(row);
    actualizarVistaPrevia();
}

function limpiarFormulario() {
    document.getElementById("cvForm").reset();
    document.querySelectorAll("#EducacionSuperiorCampos, #EducacionPrimariaCampos, #EducacionSecundariaCampos, #Habilidades, #Experiencia, #Cursos").forEach(div => {
        div.innerHTML = "";
    });
    document.getElementById("EstadoCivil").innerHTML = "";
    document.getElementById("fotoPreviewContainer").style.display = "none";
    fotoPerfilUrl = null;
    fotoPerfilLocal = null;
    fotoPerfilId = null;
    fotoBase64 = null;
    fotoUploadPromise = null;
    cvActualDocId = null;
    fotoPosicion = 'right';
    fotoForma = 'cuadrado';
    document.querySelectorAll('.pos-option').forEach(el => el.classList.toggle('selected', el.getAttribute('data-pos') === fotoPosicion));
    document.querySelectorAll('.shape-option').forEach(el => el.classList.toggle('selected', el.getAttribute('data-shape') === fotoForma));
    document.documentElement.style.setProperty('--preview-border-radius', fotoForma === 'circulo' ? '50%' : '16px');
    actualizarVistaPrevia();
}

async function generarCurriculum() {
    const nombres = document.getElementById("Nombres").value;
    const apellidos = document.getElementById("Apellidos").value;
    
    if (!nombres || !apellidos) {
        alert("Por favor ingresa al menos tu nombre y apellido");
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'carga-overlay show';
    overlay.innerHTML = `
        <div class="carga-card">
            <div class="carga-spinner">
                <div class="spinner-ring-border"></div>
                <span class="carga-icon"><i class="fas fa-file-alt"></i></span>
            </div>
            <p class="carga-texto" id="cargaTexto">Generando...</p>
        </div>
    `;
    document.body.appendChild(overlay);

    await guardarDatos(false);
    await descargarPDF();

    const texto = document.getElementById('cargaTexto');
    texto.textContent = '¡CV listo!';
    texto.className = 'carga-texto carga-exito';
    overlay.querySelector('.carga-spinner').classList.add('completo');

    await new Promise(r => setTimeout(r, 800));
    overlay.classList.remove('show');
    setTimeout(() => document.body.removeChild(overlay), 300);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mostrarToast('¡CV descargado con éxito!');
    reiniciarTodo();
    actualizarVistaPrevia();
}

function mostrarToast(mensaje) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Nueva función para reiniciar todo
function reiniciarTodo() {
    // Limpiar formulario
    limpiarFormulario();

    escalaFuente = 0.9;
    espaciadoSecciones = 0.6;
    const fsS = document.getElementById('fontSizeSlider');
    if (fsS) { fsS.value = 90; document.getElementById('fontSizeLabel').textContent = '90%'; }
    const spS = document.getElementById('spacingSlider');
    if (spS) { spS.value = 60; document.getElementById('spacingLabel').textContent = '60%'; }

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

async function descargarPDF() {
    const nombres = document.getElementById("Nombres").value;
    const apellidos = document.getElementById("Apellidos").value;

    const element = document.createElement('div');
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
        margin: [8, 8],
        filename: `${nombres}_${apellidos}_CV.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
            scale: 3,
            letterRendering: true,
            useCORS: true,
            scrollX: 0,
            scrollY: 0,
            allowTaint: true
        },
        jsPDF: {
            unit: 'mm',
            format: 'letter',
            orientation: 'portrait'
        }
    };

    await html2pdf().set(opt).from(element).save();
    document.body.removeChild(element);
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
            const dataURL = canvas.toDataURL('image/jpeg', 0.95);
            resolve(dataURL);
        };
        img.onerror = error => reject(error);
        img.src = url;
    });
}

function generarHTMLCV(formato = document.getElementById('PreviewFormatoCV').value) {
    let html;
    switch(formato) {
        case 'clasico': html = generarFormatoClasico(); break;
        case 'moderno': html = generarFormatoModerno(); break;
        case 'profesional': html = generarFormatoProfesional(); break;
        case 'minimalista': html = generarFormatoMinimalista(); break;
        default: html = generarFormatoCreativo(); break;
    }
    if (escalaFuente !== 1.0) {
        html = html.replace(/font-size:\s*(\d+)px/g, (m, px) => 'font-size:' + Math.round(parseInt(px) * escalaFuente) + 'px');
    }
    if (espaciadoSecciones !== 1.0) {
        html = html.replace(/(margin-bottom|padding-bottom):\s*(\d+)px/g, (m, prop, val) => prop + ':' + Math.round(parseInt(val) * espaciadoSecciones) + 'px');
    }
    return html;
}

function generarFotoPerfilHTML(tamano = 120) {
    const fotoParaMostrar = fotoPerfilLocal || fotoPerfilUrl;
    if (!fotoParaMostrar) return '';
    
    const borderRadius = fotoForma === 'circulo' ? '50%' : `${tamano * 0.12}px`;
    
    return `
        <div style="width: ${tamano}px; height: ${tamano}px; border-radius: ${borderRadius}; 
                    border: 3px solid ${colorPrincipal}; 
                    overflow: hidden;
                    flex-shrink: 0;">
            <img src="${fotoParaMostrar}" 
                 style="width: 100%; height: 100%; object-fit: cover; border-radius: ${borderRadius}; display: block;"
                 crossorigin="anonymous">
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
                    align-items: center;
                    gap: 24px;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid ${colorPrincipal};
                }
                .name-title {
                    flex: 1;
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
                .experience-item::before {
                    content: "•";
                    color: ${colorPrincipal};
                    font-weight: bold;
                    margin-right: 8px;
                }
            </style>
        </head>
        <body>
            <div class="cv-container">
                <div style="text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid ${colorPrincipal};">
                    <h2 style="color: ${colorPrincipal}; margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 3px;">Síntesis Curricular</h2>
                </div>
                <div class="header" style="flex-direction: ${fotoPosicion === 'right' ? 'row-reverse' : 'row'};">
                    ${fotoPerfil}
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
                    display: flex;
                    align-items: center;
                    gap: 24px;
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
                <div style="text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid ${colorPrincipal};">
                    <h2 style="color: ${colorPrincipal}; margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 3px;">Síntesis Curricular</h2>
                </div>
                <div class="header" style="flex-direction: ${fotoPosicion === 'right' ? 'row-reverse' : 'row'};">
                    ${fotoPerfil}
                    <div>
                        <h1>${document.getElementById('Nombres').value} ${document.getElementById('Apellidos').value}</h1>
                        <div class="contact-info">
                            ${document.getElementById('Email').value ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${document.getElementById('Email').value}</div>` : ''}
                            ${document.getElementById('Telefono').value ? `<div class="contact-item"><i class="fas fa-phone"></i> ${document.getElementById('Telefono').value}</div>` : ''}
                            ${document.getElementById('Direccion').value ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${document.getElementById('Direccion').value}</div>` : ''}
                        </div>
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
    return resultado;
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
                    display: flex;
                    align-items: center;
                    gap: 24px;
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
                <div style="text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid ${colorPrincipal};">
                    <h2 style="color: ${colorPrincipal}; margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 3px;">Síntesis Curricular</h2>
                </div>
                <div class="header" style="flex-direction: ${fotoPosicion === 'right' ? 'row-reverse' : 'row'};">
                    ${fotoPerfil}
                    <div>
                        <h1>${document.getElementById('Nombres').value} ${document.getElementById('Apellidos').value}</h1>
                        <div class="contact-info">
                            ${document.getElementById('Email').value ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${document.getElementById('Email').value}</div>` : ''}
                            ${document.getElementById('Telefono').value ? `<div class="contact-item"><i class="fas fa-phone"></i> ${document.getElementById('Telefono').value}</div>` : ''}
                            ${document.getElementById('Direccion').value ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${document.getElementById('Direccion').value}</div>` : ''}
                        </div>
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
                <div style="text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid ${colorPrincipal};">
                    <h2 style="color: ${colorPrincipal}; margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 3px;">Síntesis Curricular</h2>
                </div>
                <div class="left-column">
                    <div style="text-align: center; margin-bottom: 20px;">
                        ${fotoPerfil}
                    </div>
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
    return resultado;
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
                    display: flex;
                    align-items: center;
                    gap: 24px;
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
                <div style="text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid ${colorPrincipal};">
                    <h2 style="color: ${colorPrincipal}; margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 3px;">Síntesis Curricular</h2>
                </div>
                <div class="header" style="flex-direction: ${fotoPosicion === 'right' ? 'row-reverse' : 'row'};">
                    ${fotoPerfil}
                    <div>
                        <h1>${document.getElementById('Nombres').value} ${document.getElementById('Apellidos').value}</h1>
                        <div class="contact-info">
                            ${document.getElementById('Email').value ? `<span>${document.getElementById('Email').value}</span> | ` : ''}
                            ${document.getElementById('Telefono').value ? `<span>${document.getElementById('Telefono').value}</span> | ` : ''}
                            ${document.getElementById('Direccion').value ? `<span>${document.getElementById('Direccion').value}</span>` : ''}
                        </div>
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
        { id: 'EducacionPrimaria', nombre: 'Educación Primaria', icono: 'school', contenedor: 'EducacionPrimariaCampos' },
        { id: 'EducacionSecundaria', nombre: 'Educación Secundaria', icono: 'graduation-cap', contenedor: 'EducacionSecundariaCampos' }
    ];

    estudios.forEach(estudio => {
        const valor = document.getElementById(estudio.id).value;
        if (valor) {
            html += `<div class="education-item"><i class="fas fa-${estudio.icono}"></i> <strong>${estudio.nombre}:</strong> ${valor}</div>`;
        }
        const inputsExtra = document.getElementById(estudio.contenedor).getElementsByTagName('input');
        for (let i = 0; i < inputsExtra.length; i++) {
            if (inputsExtra[i].value) {
                html += `<div class="education-item"><i class="fas fa-${estudio.icono}"></i> ${inputsExtra[i].value}</div>`;
            }
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

    if (!fotoPerfilUrl) {
        if (fotoUploadPromise) {
            try {
                await fotoUploadPromise;
            } catch (e) {
                console.error("Error esperando subida de foto:", e);
            }
        }
        if (!fotoPerfilUrl && fotoBase64) {
            try {
                const res = await fetch(fotoBase64);
                const blob = await res.blob();
                const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                const formData = new FormData();
                formData.append('image', file);
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
    }

    const datos = {
        nombres,
        apellidos,
        colorPrincipal,
        fuenteSeleccionada,
        fotoPerfilUrl,
        fotoPerfilId,
        fotoBase64,
        fotoPosicion,
        fotoForma,
        campos: {},
        fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
    };

    document.querySelectorAll('#cvForm input, #cvForm select').forEach(campo => {
        if (campo.id && campo.id !== 'FotoPerfil') datos.campos[campo.id] = campo.value;
    });

    ['EducacionSuperiorCampos', 'EducacionPrimariaCampos', 'EducacionSecundariaCampos', 'Habilidades', 'Experiencia', 'Cursos'].forEach(id => {
        datos.campos[id] = [];
        const inputs = document.getElementById(id).getElementsByTagName('input');
        for (let input of inputs) {
            datos.campos[id].push(input.value);
        }
    });

    try {
        const db = firebase.firestore();
        let docRef;
        
        if (cvActualDocId) {
            docRef = db.collection('curriculums').doc(cvActualDocId);
            await docRef.update(datos);
        } else {
            const querySnapshot = await db.collection('curriculums')
                .where('nombres', '==', nombres)
                .where('apellidos', '==', apellidos)
                .limit(1)
                .get();
            
            if (!querySnapshot.empty) {
                docRef = querySnapshot.docs[0].ref;
                cvActualDocId = docRef.id;
                await docRef.update(datos);
            } else {
                docRef = await db.collection('curriculums').add(datos);
                cvActualDocId = docRef.id;
            }
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
    
    actualizarSugerenciasLocales(datos);
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
        cvs.forEach((cv, i) => {
            html += `
                <div class="saved-cv-item">
                    <span class="cv-number">${cvs.length - i}</span>
                    <div class="saved-cv-content" onclick="cargarCV('${cv.id}')">
                        <strong>${cv.nombres} ${cv.apellidos}</strong>
                        <div>${cv.cedula || 'Sin cédula'}</div>
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
        cvActualDocId = id;
        
        document.getElementById('Nombres').value = cv.nombres || '';
        document.getElementById('Apellidos').value = cv.apellidos || '';
        
        for (const id in cv.campos) {
            const elemento = document.getElementById(id);
            if (elemento && elemento.type !== 'file' && typeof cv.campos[id] !== 'object') {
                elemento.value = cv.campos[id] || '';
            }
        }
        
    ['EducacionSuperiorCampos', 'EducacionPrimariaCampos', 'EducacionSecundariaCampos', 'Habilidades', 'Experiencia', 'Cursos'].forEach(id => {
            const div = document.getElementById(id);
            if (div && Array.isArray(cv.campos[id])) {
                div.innerHTML = '';
                cv.campos[id].forEach(valor => {
                    if (valor) {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.value = valor;
                        
                        const removeBtn = document.createElement('button');
                        removeBtn.type = 'button';
                        removeBtn.className = 'remove-btn';
                        removeBtn.innerHTML = '<i class="fas fa-minus"></i>';
                        removeBtn.onclick = function() {
                            row.remove();
                            actualizarVistaPrevia();
                        };
                        
                        const row = document.createElement('div');
                        row.className = 'field-row';
                        input.addEventListener('input', actualizarVistaPrevia);
                        const mapKey = id === 'EducacionSuperiorCampos' ? 'EducacionSuperior' : id === 'EducacionPrimariaCampos' ? 'EducacionPrimaria' : id === 'EducacionSecundariaCampos' ? 'EducacionSecundaria' : id;
                        configurarAutocompletadoInput(input, mapKey);
                        
                        row.appendChild(input);
                        row.appendChild(removeBtn);
                        div.appendChild(row);
                    }
                });
            }
        });
        
        const previewBorderRadius = (fotoForma === 'circulo') ? '50%' : '16px';
        if (cv.fotoPerfilUrl) {
            fotoPerfilUrl = cv.fotoPerfilUrl;
            fotoPerfilId = cv.fotoPerfilId;
            const previewContainer = document.getElementById('fotoPreviewContainer');
            previewContainer.style.display = 'block';
            previewContainer.innerHTML = `
                <div style="width: 150px; height: 150px; border-radius: ${previewBorderRadius}; 
                            border: 4px solid ${cv.colorPrincipal || colorPrincipal}; overflow: hidden; margin: 0 auto;">
                    <img id="fotoPreview" style="width: 100%; height: 100%; object-fit: cover; border-radius: ${previewBorderRadius}; display: block;" src="${fotoPerfilUrl}">
                </div>
            `;
        } else if (cv.fotoBase64) {
            fotoBase64 = cv.fotoBase64;
            fotoPerfilLocal = cv.fotoBase64;
            const previewContainer = document.getElementById('fotoPreviewContainer');
            previewContainer.style.display = 'block';
            previewContainer.innerHTML = `
                <div style="width: 150px; height: 150px; border-radius: ${previewBorderRadius}; 
                            border: 4px solid ${cv.colorPrincipal || colorPrincipal}; overflow: hidden; margin: 0 auto;">
                    <img id="fotoPreview" style="width: 100%; height: 100%; object-fit: cover; border-radius: ${previewBorderRadius}; display: block;" src="${fotoBase64}">
                </div>
            `;
        }
        
        colorPrincipal = cv.colorPrincipal || '#3498db';
        fuenteSeleccionada = cv.fuenteSeleccionada || "'Poppins', sans-serif";
        fotoPosicion = cv.fotoPosicion || 'left';
        fotoForma = cv.fotoForma || 'circulo';
        document.documentElement.style.setProperty('--preview-border-radius', fotoForma === 'circulo' ? '50%' : '16px');
        
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
        
        document.querySelectorAll('.pos-option').forEach(opt => {
            if (opt.getAttribute('data-pos') === fotoPosicion) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        
        document.querySelectorAll('.shape-option').forEach(opt => {
            if (opt.getAttribute('data-shape') === fotoForma) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        
        const estadoCivilGuardado = cv.campos?.['EstadoCivil'];
        actualizarDatos();
        if (estadoCivilGuardado) {
            document.getElementById('EstadoCivil').value = estadoCivilGuardado;
        }
        actualizarEstilos();
        actualizarVistaPrevia();
        
        toggleAgenda();
        
    } catch (error) {
        console.error("Error al cargar CV:", error);
        alert("Error al cargar el currículum");
    }
}
// Ocultar la pantalla de carga después de 2 segundos
document.addEventListener('DOMContentLoaded', function () {
    const loadingScreen = document.getElementById('loadingScreen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 2000);
});

// Funciones para el recorte de imagen (Cropper.js)
function abrirCropModal(imageUrl) {
    const modal = document.getElementById('cropModal');
    const imageToCrop = document.getElementById('imageToCrop');
    document.documentElement.style.setProperty('--preview-border-radius', fotoForma === 'circulo' ? '50%' : '16px');
    
    imageToCrop.src = imageUrl;
    modal.classList.add('show');
    
    if (cropperInstance) {
        cropperInstance.destroy();
    }
    
    setTimeout(() => {
        cropperInstance = new Cropper(imageToCrop, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: 'move',
            preview: '.crop-preview-circle',
            background: false,
            responsive: true,
            restore: false,
            checkCrossOrigin: true,
            autoCropArea: 0.8,
            cropBoxMovable: false,
            cropBoxResizable: false,
            ready() {
                const slider = document.getElementById('zoomSlider');
                const label = document.getElementById('zoomLevel');
                if (slider) slider.value = 1;
                if (label) label.textContent = '100%';
            },
            zoom(event) {
                const slider = document.getElementById('zoomSlider');
                const label = document.getElementById('zoomLevel');
                if (slider) slider.value = event.detail.ratio;
                if (label) label.textContent = Math.round(event.detail.ratio * 100) + '%';
            }
        });
    }, 150);
}

function cerrarCropModal() {
    const modal = document.getElementById('cropModal');
    modal.classList.remove('show');
    
    if (cropperInstance) {
        cropperInstance.destroy();
        cropperInstance = null;
    }
    
    document.getElementById('FotoPerfil').value = '';
}

function rotarImagen(grados) {
    if (cropperInstance) {
        cropperInstance.rotate(grados);
    }
}

function zoomImagen(factor) {
    if (cropperInstance) {
        cropperInstance.zoom(factor);
    }
}

function obtenerImagenRecortada() {
    if (!cropperInstance) return;
    
    cropperInstance.getCroppedCanvas({
        width: 800,
        height: 800,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    }).toBlob((blob) => {
        if (!blob) return;
        
        if (fotoPerfilLocal && fotoPerfilLocal.startsWith('blob:')) {
            URL.revokeObjectURL(fotoPerfilLocal);
        }
        
        fotoPerfilLocal = URL.createObjectURL(blob);
        
        const previewBorderRadius = fotoForma === 'circulo' ? '50%' : '16px';
        const previewContainer = document.getElementById('fotoPreviewContainer');
        previewContainer.style.display = 'block';
        previewContainer.innerHTML = `
            <div style="width: 150px; height: 150px; border-radius: ${previewBorderRadius}; 
                        border: 4px solid ${colorPrincipal}; overflow: hidden; margin: 0 auto;">
                <img id="fotoPreview" style="width: 100%; height: 100%; object-fit: cover; border-radius: ${previewBorderRadius}; display: block;" src="${fotoPerfilLocal}">
            </div>
        `;
        
        const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        fotoUploadPromise = subirFotoABackground(croppedFile);
        
        const reader = new FileReader();
        reader.onloadend = function() {
            fotoBase64 = reader.result;
        };
        reader.readAsDataURL(blob);
        
        actualizarVistaPrevia();
        cerrarCropModal();
    }, 'image/jpeg', 0.95);
}

// ─── Filtro Mágico con @imgly/background-removal (Local) ───────────────────────

let iaPrendida = localStorage.getItem('ia_descargada') === '1';
let _removeBackgroundFn = null; // Caché en memoria para no re-importar

// Carga la función removeBackground solo una vez y la guarda en memoria
async function _cargarLibreriaIA(onProgress) {
    if (_removeBackgroundFn) return _removeBackgroundFn;
    const mod = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal/+esm');
    _removeBackgroundFn = mod.removeBackground;
    // Precargar el modelo en caché del navegador silenciosamente
    if (mod.preload) {
        await mod.preload({ progress: onProgress || (() => {}) });
    }
    return _removeBackgroundFn;
}

// Se llama al cargar la página si ya fue descargado antes (pre-calienta en silencio)
async function _preCentientarIASilencio() {
    try {
        await _cargarLibreriaIA();
        iaPrendida = true;
    } catch (e) {
        console.warn('Pre-calentamiento de IA falló silenciosamente:', e);
    }
}

async function predescargarIA() {
    const btn = document.getElementById('btnPreloadModel');
    const barContainer = document.getElementById('preloadProgressBarContainer');
    const bar = document.getElementById('preloadProgressBar');
    const text = document.getElementById('preloadProgressText');
    const status = document.getElementById('preloadStatus');

    if (iaPrendida) return;

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparando descarga...';
    barContainer.style.display = 'block';

    try {
        await _cargarLibreriaIA((key, current, total) => {
            if (total > 0) {
                const percentage = Math.round((current / total) * 100);
                bar.style.width = `${percentage}%`;
                text.innerText = `Descargando: ${percentage}% (${(current / 1024 / 1024).toFixed(1)}MB / ${(total / 1024 / 1024).toFixed(1)}MB)`;
            }
        });

        iaPrendida = true;
        localStorage.setItem('ia_descargada', '1');
        btn.style.display = 'none';
        barContainer.style.display = 'none';
        status.style.display = 'block';
    } catch (error) {
        console.error('Error al predescargar la IA:', error);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error al descargar. Reintentar';
        alert('Ocurrió un error al descargar la IA: ' + error.message);
    }
}

async function aplicarMejoraMagica() {
    if (!cropperInstance) return;

    const loadingOverlay = document.getElementById('cropperLoading');
    const loadingText   = document.getElementById('cropperLoadingText');
    loadingOverlay.style.display = 'flex';
    loadingText.innerText = 'Cargando IA local...';

    try {
        // 1. Extraer la imagen actual del cropper como Blob JPEG
        const sourceCanvas = cropperInstance.getCroppedCanvas({
            width: 800,
            height: 800,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        const sourceBlob = await new Promise(res =>
            sourceCanvas.toBlob(res, 'image/jpeg', 0.95)
        );

        loadingText.innerText = iaPrendida ? 'Procesando imagen con IA...' : 'Descargando modelo de IA (primera vez)...';

        // 3. Procesar con la librería (se reutiliza si ya estaba cargada)
        const removeBackground = await _cargarLibreriaIA(
            iaPrendida ? null : (key, current, total) => {
                if (total > 0) {
                    const pct = Math.round((current / total) * 100);
                    loadingText.innerText = `Descargando: ${pct}% (${(current/1024/1024).toFixed(1)}MB)`;
                }
            }
        );

        loadingText.innerText = 'Eliminando fondo con IA...';
        const pngBlob = await removeBackground(sourceBlob);

        // Marcar como descargada
        if (!iaPrendida) {
            iaPrendida = true;
            localStorage.setItem('ia_descargada', '1');
            const btn = document.getElementById('btnPreloadModel');
            const status = document.getElementById('preloadStatus');
            if (btn) btn.style.display = 'none';
            if (status) status.style.display = 'block';
        }

        loadingText.innerText = 'Aplicando fondo blanco e iluminación...';

        // 4. Dibujar la silueta sobre fondo blanco en un canvas
        const pngUrl = URL.createObjectURL(pngBlob);
        const img    = new Image();

        await new Promise((resolve, reject) => {
            img.onload  = resolve;
            img.onerror = reject;
            img.src     = pngUrl;
        });

        const finalCanvas = document.createElement('canvas');
        finalCanvas.width  = img.naturalWidth;
        finalCanvas.height = img.naturalHeight;
        const ctx = finalCanvas.getContext('2d');

        // Fondo blanco puro
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

        // Persona (PNG con transparencia) encima
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(pngUrl);

        // 5. Mejora de iluminación notable (brillo +20, contraste +20%, calidez +10)
        const imgData = ctx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);
        const d       = imgData.data;

        for (let i = 0; i < d.length; i += 4) {
            // Saltar píxeles completamente transparentes o fondo blanco puro
            if (d[i + 3] === 0) continue;
            if (d[i] >= 250 && d[i+1] >= 250 && d[i+2] >= 250) continue;

            for (let c = 0; c < 3; c++) {
                let v = d[i + c];
                v += 20;                       // brillo
                v = (v - 128) * 1.2 + 128;    // contraste +20%
                if (c === 0) v += 10;          // calidez (canal rojo +10)
                if (c === 2) v -= 5;           // reducir azul para calidez
                d[i + c] = Math.max(0, Math.min(255, v));
            }
        }
        ctx.putImageData(imgData, 0, 0);

        // 6. Reemplazar la imagen del cropper con el resultado si el usuario no cerró el modal
        if (cropperInstance) {
            const resultUrl = finalCanvas.toDataURL('image/jpeg', 0.95);
            cropperInstance.replace(resultUrl);
        }

        loadingOverlay.style.display = 'none';

    } catch (err) {
        console.error('Error en Filtro Mágico:', err);
        alert(`✨ Filtro Mágico: ${err.message}`);
        loadingOverlay.style.display = 'none';
    }
}

function obtenerGeminiKey() {
    if (typeof GEMINI_API_KEY_LOCAL !== 'undefined' && GEMINI_API_KEY_LOCAL) return GEMINI_API_KEY_LOCAL;
    return localStorage.getItem('gemini_api_key') || (typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : '');
}

async function extraerDatosConIA() {
    const fileInput = document.getElementById('cvImageInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Por favor selecciona una foto del CV');
        return;
    }

    const apiKey = obtenerGeminiKey();
    if (!apiKey) {
        alert('Por favor ingresa tu API Key de Gemini en el campo correspondiente');
        return;
    }

    limpiarFormulario();

    const btn = document.querySelector('button[onclick="extraerDatosConIA()"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Extrayendo datos...';

    const esperarFrame = () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 12)));

    const charsEscritos = {};
    const camposSimples = ['Nombres', 'Apellidos', 'Cedula', 'FechaNacimiento', 'Direccion', 'Sexo', 'EstadoCivil', 'Email', 'Telefono', 'EducacionPrimaria', 'EducacionSecundaria'];
    const camposArray = ['EducacionSuperior', 'Experiencia', 'Habilidades', 'Cursos'];

    function extraerValor(texto, key) {
        const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]*)`);
        const m = regex.exec(texto);
        return m ? m[1] : null;
    }

    function extraerArray(texto, key) {
        const items = [];
        const regex = new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]*)\\]`);
        const m = regex.exec(texto);
        if (m) {
            const inner = m[1];
            const itemRegex = /"([^"]*)"/g;
            let match;
            while ((match = itemRegex.exec(inner)) !== null) {
                if (match[1].trim()) items.push(match[1]);
            }
        }
        return items;
    }

    function escribirCaracteres(el, textoCompleto) {
        const escritos = charsEscritos[el.id] || 0;
        const nuevos = textoCompleto.slice(escritos);
        if (nuevos.length === 0) return 0;
        el.value = textoCompleto.slice(0, escritos + nuevos.length);
        charsEscritos[el.id] = escritos + nuevos.length;
        return nuevos.length;
    }

    async function escribirNuevos(el, textoCompleto) {
        const escritos = charsEscritos[el.id] || 0;
        const nuevos = textoCompleto.slice(escritos);
        for (const ch of nuevos) {
            el.value += ch;
            charsEscritos[el.id] = (charsEscritos[el.id] || 0) + 1;
            actualizarVistaPrevia();
            await esperarFrame();
        }
    }

    async function procesarChunk(fullText) {
        for (const key of camposSimples) {
            const val = extraerValor(fullText, key);
            if (val !== null) {
                const el = document.getElementById(key);
                if (el) await escribirNuevos(el, val);
            }
        }
        if (extraerValor(fullText, 'Sexo')) {
            actualizarDatos();
            await esperarFrame();
            const ecVal = extraerValor(fullText, 'EstadoCivil');
            if (ecVal !== null) {
                const el = document.getElementById('EstadoCivil');
                if (el) await escribirNuevos(el, ecVal);
            }
        }
        for (const key of camposArray) {
            const items = extraerArray(fullText, key);
            if (key === 'EducacionSuperior') {
                const mainInput = document.getElementById('EducacionSuperior');
                const container = document.getElementById('EducacionSuperiorCampos');
                container.innerHTML = '';
                items.forEach((item, i) => {
                    if (i === 0 && mainInput) {
                        mainInput.value = item;
                    } else {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.value = item;
                        configurarAutocompletadoInput(input, 'EducacionSuperior');
                        const removeBtn = document.createElement('button');
                        removeBtn.type = 'button';
                        removeBtn.className = 'remove-btn';
                        removeBtn.innerHTML = '<i class="fas fa-minus"></i>';
                        const row = document.createElement('div');
                        row.className = 'field-row';
                        removeBtn.onclick = function() { row.remove(); actualizarVistaPrevia(); };
                        input.addEventListener('input', actualizarVistaPrevia);
                        row.appendChild(input);
                        row.appendChild(removeBtn);
                        container.appendChild(row);
                    }
                });
                actualizarVistaPrevia();
            } else {
                const container = document.getElementById(key);
                container.innerHTML = '';
                items.forEach(item => {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = item;
                    configurarAutocompletadoInput(input, key);
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'remove-btn';
                    removeBtn.innerHTML = '<i class="fas fa-minus"></i>';
                    const row = document.createElement('div');
                    row.className = 'field-row';
                    removeBtn.onclick = function() { row.remove(); actualizarVistaPrevia(); };
                    input.addEventListener('input', actualizarVistaPrevia);
                    row.appendChild(input);
                    row.appendChild(removeBtn);
                    container.appendChild(row);
                });
                actualizarVistaPrevia();
            }
        }
    }

    try {
        const reader = new FileReader();
        const imageData = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const prompt = `Extrae toda la información de este currículum y devuélvela como un objeto JSON válido (sin markdown, sin bloques de código, solo el JSON puro). El JSON debe seguir esta estructura exacta:
{
  "Nombres": "",
  "Apellidos": "",
  "Cedula": "",
  "FechaNacimiento": "",
  "Direccion": "",
  "Sexo": "",
  "EstadoCivil": "",
  "Email": "",
  "Telefono": "",
  "EducacionPrimaria": "",
  "EducacionSecundaria": "",
  "EducacionSuperior": [],
  "Experiencia": [],
  "Habilidades": [],
  "Cursos": []
}
Los arrays deben contener strings individuales. Para FechaNacimiento usa formato YYYY-MM-DD. Para Sexo usa exactamente "Femenino", "Masculino" u "Otro". Si un campo no está presente, déjalo como string vacío o array vacío según corresponda.`;

        btn.innerHTML = '<i class="fas fa-magic"></i> Transcribiendo...';

        let fullText = '';
        let exito = false;
        let modoTexto = '';

        const modelos = ['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];

        for (const modelo of modelos) {
            if (exito) break;
            for (const modo of ['normal', 'stream']) {
                if (exito) break;
                for (let intento = 0; intento < 3 && !exito; intento++) {
                    const key = obtenerGeminiKey();
                    if (!key) {
                        if (intento === 0) alert('No hay API keys configuradas');
                        break;
                    }

                    const endpoint = modo === 'stream'
                        ? `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:streamGenerateContent?key=${key}&alt=sse`
                        : `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${key}`;

                    try {
                        const resp = await fetch(endpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [
                                        { text: prompt },
                                        { inline_data: { mime_type: file.type || 'image/jpeg', data: imageData } }
                                    ]
                                }]
                            })
                        });
                        if (!resp.ok) {
                            const errText = await resp.text();
                            if (resp.status === 429 || resp.status >= 500) {
                                const espera = Math.min(1000 * Math.pow(2, intento), 5000);
                                await new Promise(r => setTimeout(r, espera));
                                continue;
                            }
                            throw new Error('Error Gemini: ' + errText);
                        }

                        if (modo === 'stream') {
                            const readerStream = resp.body.getReader();
                            const decoder = new TextDecoder();
                            let buffer = '';
                            fullText = '';

                            while (true) {
                                const { done, value } = await readerStream.read();
                                if (done) break;

                                buffer += decoder.decode(value, { stream: true });
                                const lines = buffer.split('\n');
                                buffer = lines.pop() || '';

                                for (const line of lines) {
                                    if (line.startsWith('data: ')) {
                                        const data = line.slice(6).trim();
                                        if (data === '[DONE]') continue;
                                        try {
                                            const parsed = JSON.parse(data);
                                            const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                                            if (chunk) {
                                                fullText += chunk;
                                                await procesarChunk(fullText);
                                            }
                                        } catch (e) { }
                                    }
                                }
                            }
                            modoTexto = 'stream';
                        } else {
                            const json = await resp.json();
                            fullText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
                            modoTexto = 'normal';
                        }

                        exito = true;

                    } catch (e) {
                        if (intento >= 2) continue;
                        if (e.message && (e.message.includes('429') || e.message.includes('500') || e.message.includes('502') || e.message.includes('503'))) {
                            const espera = Math.min(1000 * Math.pow(2, intento), 5000);
                            await new Promise(r => setTimeout(r, espera));
                            continue;
                        }
                    }
                }
            }
        }
        if (!exito) throw new Error('No se pudo completar la extracción después de varios intentos');

        if (modoTexto === 'normal') {
            let jsonStr = fullText.trim();
            if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.replace(/```(?:json)?\s*/g, '').trim();
            }
            const dataFull = JSON.parse(jsonStr);
            for (const key of camposSimples) {
                const el = document.getElementById(key);
                const v = dataFull[key];
                if (el && v && v.toString().trim()) {
                    el.value = '';
                    charsEscritos[key] = 0;
                    await escribirNuevos(el, v.toString().trim());
                }
            }
            if (dataFull.Sexo) {
                actualizarDatos();
                const ecV = dataFull.EstadoCivil;
                if (ecV) {
                    document.getElementById('EstadoCivil').value = '';
                    charsEscritos['EstadoCivil'] = 0;
                    await escribirNuevos(document.getElementById('EstadoCivil'), ecV.trim());
                }
            }
            const mainInput = document.getElementById('EducacionSuperior');
            const camposContainer = document.getElementById('EducacionSuperiorCampos');
            camposContainer.innerHTML = '';
            const arrSuperior = dataFull['EducacionSuperior'];
            if (arrSuperior && Array.isArray(arrSuperior)) {
                arrSuperior.forEach((item, i) => {
                    if (i === 0 && mainInput && item.trim()) {
                        mainInput.value = item;
                    } else if (item.trim()) {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.value = item;
                        configurarAutocompletadoInput(input, 'EducacionSuperior');
                        const removeBtn = document.createElement('button');
                        removeBtn.type = 'button';
                        removeBtn.className = 'remove-btn';
                        removeBtn.innerHTML = '<i class="fas fa-minus"></i>';
                        const row = document.createElement('div');
                        row.className = 'field-row';
                        removeBtn.onclick = function() { row.remove(); actualizarVistaPrevia(); };
                        input.addEventListener('input', actualizarVistaPrevia);
                        row.appendChild(input);
                        row.appendChild(removeBtn);
                        camposContainer.appendChild(row);
                    }
                });
            }
            actualizarVistaPrevia();
            for (const { id, dataKey } of [{ id: 'Experiencia', dataKey: 'Experiencia' }, { id: 'Habilidades', dataKey: 'Habilidades' }, { id: 'Cursos', dataKey: 'Cursos' }]) {
                const container = document.getElementById(id);
                container.innerHTML = '';
                const items = dataFull[dataKey];
                if (items && Array.isArray(items)) {
                    items.forEach(item => {
                        if (item.trim()) {
                            const input = document.createElement('input');
                            input.type = 'text';
                            input.value = item;
                            configurarAutocompletadoInput(input, id);
                            const removeBtn = document.createElement('button');
                            removeBtn.type = 'button';
                            removeBtn.className = 'remove-btn';
                            removeBtn.innerHTML = '<i class="fas fa-minus"></i>';
                            const row = document.createElement('div');
                            row.className = 'field-row';
                            removeBtn.onclick = function() { row.remove(); actualizarVistaPrevia(); };
                            input.addEventListener('input', actualizarVistaPrevia);
                            row.appendChild(input);
                            row.appendChild(removeBtn);
                            container.appendChild(row);
                        }
                    });
                }
            }
            actualizarVistaPrevia();
            await esperarFrame();
        }

        let jsonStr = fullText.trim();
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```(?:json)?\s*/g, '').trim();
        }
        const dataFinal = JSON.parse(jsonStr);

        const allSimpleOk = camposSimples.every(k => {
            const el = document.getElementById(k);
            const v = dataFinal[k];
            if (el && v && v.toString().trim()) {
                return el.value === v.toString().trim();
            }
            return true;
        });

        if (!allSimpleOk) {
            for (const key of camposSimples) {
                const el = document.getElementById(key);
                const v = dataFinal[key];
                if (el && v && v.toString().trim() && el.value !== v.toString().trim()) {
                    charsEscritos[key] = 0;
                    el.value = '';
                    await escribirNuevos(el, v.toString().trim());
                }
            }
        }

        if (dataFinal.Sexo) {
            actualizarDatos();
            const ecEl = document.getElementById('EstadoCivil');
            const ecV = dataFinal.EstadoCivil;
            if (ecEl && ecV && ecV.trim() && ecEl.value !== ecV.trim()) {
                charsEscritos['EstadoCivil'] = 0;
                ecEl.value = '';
                await escribirNuevos(ecEl, ecV.trim());
            }
        }

        await guardarDatos(false);
        mostrarToast('¡Datos extraídos correctamente!');

    } catch (error) {
        console.error('Error al extraer datos con IA:', error);
        alert('Error al extraer datos: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function mostrarNombreArchivo(inputId, labelId) {
    const input = document.getElementById(inputId);
    const label = document.getElementById(labelId);
    if (input && label) {
        input.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                label.innerHTML = '<i class="fas fa-file"></i> ' + this.files[0].name;
            } else {
                label.innerHTML = label.getAttribute('data-default') || label.innerHTML;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    mostrarNombreArchivo('cvImageInput', 'cvImageLabel');
    mostrarNombreArchivo('FotoPerfil', 'fotoPerfilLabel');
});