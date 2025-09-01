document.addEventListener("DOMContentLoaded", () => {
  const form   = document.getElementById("form-vuelos");
  const salida = document.getElementById("resultado");

  // Referencias a los inputs (no valores)
  const origen  = document.getElementById("origen");
  const destino = document.getElementById("destino");
  const ida     = document.getElementById("ida");
  const vuelta  = document.getElementById("vuelta");
  const boton   = form.querySelector("button");

  // Estado inicial: deshabilitado
  const actualizarBoton = () => {
    const ok = origen.value.trim() && destino.value.trim() && ida.value;
    boton.disabled = !ok;
  };
  boton.disabled = true;
  actualizarBoton();

  // Habilitar/deshabilitar en tiempo real
  form.addEventListener("input", actualizarBoton);

  // Envío del formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (vuelta.value && ida.value && new Date(vuelta.value) < new Date(ida.value)) {
      salida.textContent = "⚠️ La fecha de vuelta no puede ser anterior a la de ida.";
      return;
    }

    salida.textContent =
      `🔎 Buscando vuelos desde ${origen.value} a ${destino.value} ` +
      `(ida: ${ida.value}${vuelta.value ? ", vuelta: " + vuelta.value : ""})...`;
  });
});
