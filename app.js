// ----- Libro: mostrar / ocultar más ejemplos -----
const btnLibro = document.getElementById("btn-libro");
const masEjemplos = document.getElementById("mas-ejemplos");

btnLibro.addEventListener("click", () => {
  const estaAbierto = btnLibro.getAttribute("aria-expanded") === "true";
  btnLibro.setAttribute("aria-expanded", String(!estaAbierto));
  masEjemplos.hidden = estaAbierto;
});

// ----- Audio: aquí enchufarás la voz más adelante -----
function reproducir(texto, idioma) {
  // Por ahora no hace nada. Después aquí irá la lectura en voz alta.
  console.log(`Audio pendiente (${idioma}):`, texto);
}

document.querySelectorAll(".btn-audio").forEach((boton) => {
  boton.addEventListener("click", () => {
    reproducir(boton.dataset.texto, boton.dataset.idioma);
  });
});
