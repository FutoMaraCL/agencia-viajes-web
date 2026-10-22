/**
 * Lógica pura de validación para el formulario de búsqueda de viajes.
 * No manipula el DOM directamente.
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
