import { describe, it, expect } from "bun:test";

function validateForm(formData) {
  const errors = {};
  const origenNormalizado = (formData.origen || "").trim().toUpperCase();
  const destinoNormalizado = (formData.destino || "").trim().toUpperCase();

  if (origenNormalizado && destinoNormalizado && origenNormalizado === destinoNormalizado) {
    errors.destino = "El destino no puede ser igual al origen.";
  }

  if (formData.tipoViaje === "ida-vuelta" && formData.ida && formData.vuelta) {
    const fechaIda = new Date(formData.ida);
    const fechaVuelta = new Date(formData.vuelta);
    if (fechaVuelta < fechaIda) {
      errors.vuelta = "La fecha de vuelta no puede ser anterior a la de ida.";
    }
  }

  if (formData.tipoViaje === "ida-vuelta" && !formData.vuelta) {
    errors.vuelta = "La fecha de vuelta es obligatoria para viajes de ida y vuelta.";
  }

  return errors;
}

describe("Validación de formulario de búsqueda de viajes", () => {
  it("Debe pasar con datos válidos para viaje de ida", () => {
    const formData = {
      tipoViaje: "ida",
      origen: "SCL",
      destino: "BCN",
      ida: "2026-11-15",
      vuelta: ""
    };
    const errores = validateForm(formData);
    expect(Object.keys(errores).length).toBe(0);
  });

  it("Debe pasar con datos válidos para viaje de ida y vuelta", () => {
    const formData = {
      tipoViaje: "ida-vuelta",
      origen: "SCL",
      destino: "BCN",
      ida: "2026-11-15",
      vuelta: "2026-11-22"
    };
    const errores = validateForm(formData);
    expect(Object.keys(errores).length).toBe(0);
  });

  it("Debe permitir vuelta igual a ida", () => {
    const formData = {
      tipoViaje: "ida-vuelta",
      origen: "SCL",
      destino: "BCN",
      ida: "2026-11-15",
      vuelta: "2026-11-15"
    };
    const errores = validateForm(formData);
    expect(Object.keys(errores).length).toBe(0);
  });

  it("Debe rechazar vuelta anterior a ida", () => {
    const formData = {
      tipoViaje: "ida-vuelta",
      origen: "SCL",
      destino: "BCN",
      ida: "2026-11-15",
      vuelta: "2026-11-10"
    };
    const errores = validateForm(formData);
    expect(errores.vuelta).toBeDefined();
    expect(errores.vuelta).toContain("anterior");
  });

  it("Debe rechazar origen igual a destino (mayúsculas ignoradas)", () => {
    const formData = {
      tipoViaje: "ida",
      origen: "SCL",
      destino: "scl",
      ida: "2026-11-15",
      vuelta: ""
    };
    const errores = validateForm(formData);
    expect(errores.destino).toBeDefined();
  });

  it("Debe rechazar origen igual a destino (espacios ignorados)", () => {
    const formData = {
      tipoViaje: "ida",
      origen: " SCL  ",
      destino: "SCL ",
      ida: "2026-11-15",
      vuelta: ""
    };
    const errores = validateForm(formData);
    expect(errores.destino).toBeDefined();
  });

  it("Debe exigir vuelta para viaje de ida y vuelta sin fecha", () => {
    const formData = {
      tipoViaje: "ida-vuelta",
      origen: "SCL",
      destino: "BCN",
      ida: "2026-11-15",
      vuelta: ""
    };
    const errores = validateForm(formData);
    expect(errores.vuelta).toBeDefined();
    expect(errores.vuelta).toContain("obligatoria");
  });

  it("Debe permitir viaje de ida sin fecha de vuelta", () => {
    const formData = {
      tipoViaje: "ida",
      origen: "SCL",
      destino: "BCN",
      ida: "2026-11-15",
      vuelta: ""
    };
    const errores = validateForm(formData);
    expect(errores.vuelta).toBeUndefined();
  });
});
