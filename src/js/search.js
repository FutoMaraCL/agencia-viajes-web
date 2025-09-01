const form = document.getElementById("form-vuelos");
const salida = document.getElementById("resultado");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const origen = document.getElementById("origen").value.trim();
  const destino = document.getElementById("destino").value.trim();
  const ida = document.getElementById("ida").value;
  const vuelta = document.getElementById("vuelta").value;

  if (vuelta && ida && new Date(vuelta) < new Date(ida)) {
    salida.textContent = "⚠️ La fecha de vuelta no puede ser anterior a la de ida.";
    return;
  }

  salida.textContent = `🔎 Buscando vuelos desde ${origen} a ${destino} (ida: ${ida}${vuelta ? ", vuelta: " + vuelta : ""})...`;
});
