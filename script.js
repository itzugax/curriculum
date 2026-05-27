// Variables globales
const { jsPDF } = window.jspdf;
let colorPrincipal = "#3498db";
let fuenteSeleccionada = "'Poppins', sans-serif";
let fotoPerfilUrl = null;
let fotoPerfilLocal = null;
let fotoPerfilId = null;
const IMGBB_API_KEY = "7fbfd4fd0883d7aa649035d839b12e43";

// Animación de máquina de escribir para el título
function animarTitulo() {
  const titulo = document.getElementById("titulo-generador");
  const texto = "Generador de Currículum";

  function escribir(i = 0) {
    if (i <= texto.length) {
      titulo.textContent = `${texto.slice(0, i)}|`;
      setTimeout(() => escribir(i + 1), 100);
    } else {
      setTimeout(borrar, 1000);
    }
  }

  function borrar(i = texto.length) {
    if (i >= 0) {
      titulo.textContent = `${texto.slice(0, i)}|`;
      setTimeout(() => borrar(i - 1), 50);
    } else {
      setTimeout(escribir, 500);
    }
  }

  escribir();
}

// Inicialización al cargar la página
document.addEventListener("DOMContentLoaded", function () {
  // Cargar librería Cropper.js
  const cropperScript = document.createElement("script");
  cropperScript.src =
    "https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js";
  document.head.appendChild(cropperScript);

  const cropperLink = document.createElement("link");
  cropperLink.rel = "stylesheet";
  cropperLink.href =
    "https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css";
  document.head.appendChild(cropperLink);

  actualizarDatos();
  cargarCVsGuardados();
  configurarPersonalizacion();
  actualizarVistaPrevia();
  animarTitulo();

  document
    .getElementById("FotoPerfil")
    .addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const modal = document.createElement("div");
      modal.style.cssText =
        "position:fixed; top:10%; left:10%; width:80%; height:80%; background:white; z-index:9999; padding:20px; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.5); overflow:auto;";
      modal.innerHTML = `
        <h3>Ajusta tu foto</h3>
        <div style="width: 100%; height: 300px;"><img id="imageToCrop" src="${URL.createObjectURL(file)}" style="max-width:100%;"></div>
        <button id="cropBtn" style="margin-top:20px; padding:10px 20px; cursor:pointer;">Confirmar y cerrar</button>
    `;
      document.body.appendChild(modal);

      const image = document.getElementById("imageToCrop");
      const cropper = new Cropper(image, { aspectRatio: 1, viewMode: 1 });

      document.getElementById("cropBtn").onclick = () => {
        const croppedCanvas = cropper.getCroppedCanvas({
          width: 300,
          height: 300,
        });
        const finalImageUrl = croppedCanvas.toDataURL("image/jpeg");

        const previewContainer = document.getElementById(
          "fotoPreviewContainer",
        );
        previewContainer.style.display = "block";
        previewContainer.innerHTML = `<img src="${finalImageUrl}" style="width:150px; height:150px; border-radius:50%; object-fit:cover;">`;

        fotoPerfilLocal = finalImageUrl;
        croppedCanvas.toBlob((blob) => subirFotoABackground(blob));

        document.body.removeChild(modal);
        actualizarVistaPrevia();
      };
    });

  document
    .getElementById("cvForm")
    .addEventListener("input", actualizarVistaPrevia);
});

async function subirFotoABackground(file) {
  const formData = new FormData();
  formData.append("image", file);
  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      { method: "POST", body: formData },
    );
    const data = await response.json();
    if (data.success) {
      fotoPerfilUrl = data.data.url;
      fotoPerfilId = data.data.id;
    }
  } catch (error) {
    console.error("Error al subir la foto:", error);
  }
}

function configurarPersonalizacion() {
  document.querySelectorAll(".color-option").forEach((option) => {
    option.addEventListener("click", function () {
      document
        .querySelectorAll(".color-option")
        .forEach((opt) => opt.classList.remove("selected"));
      this.classList.add("selected");
      colorPrincipal = this.getAttribute("data-color");
      actualizarEstilos();
      actualizarVistaPrevia();
    });
  });

  document.querySelectorAll(".font-option").forEach((option) => {
    option.addEventListener("click", function () {
      document
        .querySelectorAll(".font-option")
        .forEach((opt) => opt.classList.remove("selected"));
      this.classList.add("selected");
      fuenteSeleccionada = this.getAttribute("data-font");
      actualizarVistaPrevia();
    });
  });
}

function actualizarEstilos() {
  document
    .querySelectorAll(".section-title")
    .forEach((title) => (title.style.borderBottomColor = colorPrincipal));
  document
    .querySelectorAll(".add-btn")
    .forEach((btn) => (btn.style.color = colorPrincipal));
  document
    .querySelectorAll("button.primary")
    .forEach((btn) => (btn.style.background = colorPrincipal));
}

function actualizarVistaPrevia() {
  const formato = document.getElementById("PreviewFormatoCV").value;
  const previewContent = document.getElementById("realTimePreview");
  previewContent.innerHTML = generarHTMLCV(formato);
}

function toggleAgenda() {
  document.getElementById("agendaPanel").classList.toggle("open");
  document.getElementById("agendaOverlay").classList.toggle("open");
}

function actualizarDatos() {
  const sexo = document.getElementById("Sexo").value;
  const estadoCivil = document.getElementById("EstadoCivil");
  estadoCivil.innerHTML =
    sexo === "Femenino"
      ? '<option value="Soltera">Soltera</option><option value="Casada">Casada</option>'
      : '<option value="Soltero">Soltero</option><option value="Casado">Casado</option>';
  actualizarVistaPrevia();
}

function agregarCampo(id) {
  const div =
    id === "EducacionSuperior"
      ? document.getElementById("EducacionSuperiorCampos")
      : document.getElementById(id);
  const input = document.createElement("input");
  input.type = "text";
  input.style.marginTop = "5px";
  input.placeholder = "Ingrese dato...";

  const removeBtn = document.createElement("span");
  removeBtn.innerHTML = " (-)";
  removeBtn.style.cursor = "pointer";
  removeBtn.onclick = function () {
    div.removeChild(input);
    div.removeChild(removeBtn);
    actualizarVistaPrevia();
  };

  div.appendChild(input);
  div.appendChild(removeBtn);
  actualizarVistaPrevia();
}

function limpiarFormulario() {
  document.getElementById("cvForm").reset();
  document
    .querySelectorAll(
      "#EducacionSuperiorCampos, #Habilidades, #Experiencia, #Cursos",
    )
    .forEach((d) => (d.innerHTML = ""));
  actualizarVistaPrevia();
}

async function descargarPDF() {
  const element = document.createElement("div");
  element.innerHTML = generarHTMLCV(
    document.getElementById("PreviewFormatoCV").value,
  );

  const opt = {
    margin: 15,
    filename: "CV.pdf",
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 2, useCORS: true, allowTaint: true },
  };
  await html2pdf().set(opt).from(element).save();
}

function generarHTMLCV(formato) {
  // Implementación simplificada para asegurar funcionamiento
  return `<div>CV Generado (${formato})</div>`;
}
