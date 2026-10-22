import { validateForm, vueltaVisible, primerCampoInvalido, resumenErrores, intercambiar } from "./validation.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-vuelos");
  const salida = document.getElementById("resultado");
  const boton = form.querySelector("button[type='submit']");
  const swapBtn = document.getElementById("swap-btn");
  const labelVuelta = document.getElementById("label-vuelta");
  const errorSummary = document.getElementById("error-summary");
  const errorList = document.getElementById("error-list");
  const ayuda = document.getElementById("ayuda");

  // Referencias a los inputs
  const origen = document.getElementById("origen");
  const destino = document.getElementById("destino");
  const ida = document.getElementById("ida");
  const vuelta = document.getElementById("vuelta");
  const tipoViajeInputs = document.querySelectorAll("input[name='tipo-viaje']");



  // Estado inicial
  boton.disabled = true;
  salida.textContent = "";

  // Obtener tipo de viaje seleccionado
  const getTipoViaje = () => {
    return document.querySelector("input[name='tipo-viaje']:checked").value;
  };

  // Mostrar/ocultar campo de vuelta basado en tipo de viaje
  const actualizarVuelta = () => {
    const tipo = getTipoViaje();
    if (vueltaVisible(tipo)) {
      labelVuelta.style.display = "block";
      vuelta.style.display = "block";
      vuelta.required = true;
    } else {
      labelVuelta.style.display = "none";
      vuelta.style.display = "none";
      vuelta.required = false;
      vuelta.value = "";
      limpiarError("vuelta");
      // Limpiar resumen al cambiar tipo
      errorSummary.classList.remove("visible");
      errorList.innerHTML = "";
    }
    actualizarBoton();
  };

  // Limpiar error de un campo
  const limpiarError = (campo) => {
    const errorDiv = document.getElementById(`error-${campo}`);
    if (errorDiv) {
      errorDiv.textContent = "";
      // Actualizar aria-invalid
      const input = document.getElementById(campo);
      if (input) {
        input.setAttribute("aria-invalid", "false");
      }
    }
  };

  // Mostrar error en un campo específico
  const mostrarError = (campo, mensaje) => {
    const errorDiv = document.getElementById(`error-${campo}`);
    if (errorDiv) {
      errorDiv.textContent = mensaje;
      // Actualizar aria-invalid
      const input = document.getElementById(campo);
      if (input) {
        input.setAttribute("aria-invalid", "true");
      }
    }
  };

  // Actualizar estado del botón
  const actualizarBoton = () => {
    const tipo = getTipoViaje();
    const camposBasicos = origen.value.trim() && destino.value.trim() && ida.value;
    const ok = tipo === "ida" ? camposBasicos : camposBasicos && vuelta.value;
    boton.disabled = !ok;
  };

  // Validar e intentar enviar
  const validarYEnviar = (e) => {
    e.preventDefault();

    // Limpiar errores previos
    document.querySelectorAll(".error-field").forEach(div => {
      div.textContent = "";
    });
    document.querySelectorAll("input[type='text'], input[type='date']").forEach(input => {
      input.setAttribute("aria-invalid", "false");
    });
    errorSummary.classList.remove("visible");
    errorList.innerHTML = "";
    salida.textContent = "";

    // Preparar datos del formulario
    const formData = {
      tipoViaje: getTipoViaje(),
      origen: origen.value,
      destino: destino.value,
      ida: ida.value,
      vuelta: vuelta.value
    };

    // Validar
    const errores = validateForm(formData);

    if (Object.keys(errores).length > 0) {
      // Mostrar errores por campo
      Object.entries(errores).forEach(([campo, mensaje]) => {
        mostrarError(campo, mensaje);
      });

      // Mostrar resumen de errores
      const resumen = resumenErrores(errores);
      resumen.forEach(mensaje => {
        const li = document.createElement("li");
        li.textContent = mensaje;
        errorList.appendChild(li);
      });
      errorSummary.classList.add("visible");

      // Llevar foco al primer campo inválido
      const primerCampo = primerCampoInvalido(errores);
      const inputPrimero = document.getElementById(primerCampo);
      if (inputPrimero) {
        inputPrimero.focus();
      }

      return;
    }

    // Si no hay errores, simular búsqueda
    salida.textContent =
      `🔎 Buscando vuelos desde ${origen.value} a ${destino.value} ` +
      `(ida: ${ida.value}${vuelta.value ? ", vuelta: " + vuelta.value : ""})...`;
  };

  // Intercambiar origen y destino
  const intercambiarUbicaciones = (e) => {
    e.preventDefault();
    const { origen: nuevoOrigen, destino: nuevoDestino } = intercambiar(origen.value, destino.value);
    origen.value = nuevoOrigen;
    destino.value = nuevoDestino;
    
    // Limpiar errores después de intercambiar
    limpiarError("origen");
    limpiarError("destino");
    errorSummary.classList.remove("visible");
    errorList.innerHTML = "";
    
    actualizarBoton();
  };

  // Event listeners
  tipoViajeInputs.forEach(input => {
    input.addEventListener("change", actualizarVuelta);
  });

  form.addEventListener("input", actualizarBoton);
  form.addEventListener("submit", validarYEnviar);
  swapBtn.addEventListener("click", intercambiarUbicaciones);

  // Inicializar
  actualizarVuelta();
});
