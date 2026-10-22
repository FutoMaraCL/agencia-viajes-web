/**
 * Lógica pura de validación para el formulario de búsqueda de viajes.
 * No manipula el DOM directamente. Exporta helpers reutilizables.
 */

function validateForm(formData) {
  const errors = {};

  // Validación: origen y destino no pueden ser iguales (ignorando mayúsculas y espacios externos)
  const origenNormalizado = (formData.origen || "").trim().toUpperCase();
  const destinoNormalizado = (formData.destino || "").trim().toUpperCase();

  if (origenNormalizado && destinoNormalizado && origenNormalizado === destinoNormalizado) {
    errors.destino = "El destino no puede ser igual al origen.";
  }

  // Validación de fechas
  if (formData.tipoViaje === "ida-vuelta" && formData.ida && formData.vuelta) {
    const fechaIda = new Date(formData.ida);
    const fechaVuelta = new Date(formData.vuelta);
    if (fechaVuelta < fechaIda) {
      errors.vuelta = "La fecha de vuelta no puede ser anterior a la de ida.";
    }
  }

  // Validación: vuelta es obligatoria si tipo es "ida-vuelta"
  if (formData.tipoViaje === "ida-vuelta" && !formData.vuelta) {
    errors.vuelta = "La fecha de vuelta es obligatoria para viajes de ida y vuelta.";
  }

  return errors;
}

function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

// Alias para compatibilidad (el Analista lo nombró "validar")
const validar = validateForm;

// Helper: Normalizar ubicación (trim + uppercase)
function normalizar(ubicacion) {
  return (ubicacion || "").trim().toUpperCase();
}

// Helper: Identificar primer campo inválido
function primerCampoInvalido(errors) {
  const orden = ["destino", "ida", "vuelta", "origen"];
  for (const campo of orden) {
    if (errors[campo]) {
      return campo;
    }
  }
  return null;
}

// Helper: Generar resumen de errores (array de mensajes)
function resumenErrores(errors) {
  return Object.values(errors);
}

// Helper: Determinar si Vuelta debe estar visible
function vueltaVisible(tipoViaje) {
  return tipoViaje === "ida-vuelta";
}

// Helper: Intercambiar valores de origen y destino
function intercambiar(origen, destino) {
  return { origen: destino, destino: origen };
}

// Exportar para uso en otros módulos
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validateForm,
    validar,
    hasErrors,
    normalizar,
    primerCampoInvalido,
    resumenErrores,
    vueltaVisible,
    intercambiar
  };
}

// También disponible como global TripValidation para uso en navegador sin módulos ES
if (typeof window !== "undefined") {
  window.TripValidation = {
    validateForm,
    validar,
    hasErrors,
    normalizar,
    primerCampoInvalido,
    resumenErrores,
    vueltaVisible,
    intercambiar
  };
}
