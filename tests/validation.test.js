import { describe, it, expect } from "bun:test";
import { validateForm, validar, hasErrors, normalizar, primerCampoInvalido, resumenErrores, vueltaVisible, intercambiar } from "../src/js/validation.js";

describe("Validación de formulario de búsqueda de viajes", () => {
  // Tests de validateForm (función principal)
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

  // Tests de helpers
  it("hasErrors: debe retornar true si hay errores", () => {
    const errores = { destino: "Error" };
    expect(hasErrors(errores)).toBe(true);
  });

  it("hasErrors: debe retornar false si no hay errores", () => {
    const errores = {};
    expect(hasErrors(errores)).toBe(false);
  });

  it("normalizar: debe convertir a uppercase y trim", () => {
    expect(normalizar(" scl  ")).toBe("SCL");
    expect(normalizar("BCN")).toBe("BCN");
  });

  it("primerCampoInvalido: debe retornar el campo en orden de prioridad", () => {
    const errores = { origen: "error", destino: "error" };
    expect(primerCampoInvalido(errores)).toBe("destino");
  });

  it("resumenErrores: debe retornar array de mensajes", () => {
    const errores = { destino: "Msg 1", vuelta: "Msg 2" };
    const resumen = resumenErrores(errores);
    expect(resumen.length).toBe(2);
    expect(resumen).toContain("Msg 1");
  });

  it("vueltaVisible: debe retornar true para ida-vuelta", () => {
    expect(vueltaVisible("ida-vuelta")).toBe(true);
    expect(vueltaVisible("ida")).toBe(false);
  });

  it("intercambiar: debe intercambiar origen y destino", () => {
    const { origen, destino } = intercambiar("SCL", "BCN");
    expect(origen).toBe("BCN");
    expect(destino).toBe("SCL");
  });

  it("validar (alias): debe funcionar igual que validateForm", () => {
    const formData = {
      tipoViaje: "ida",
      origen: "SCL",
      destino: "BCN",
      ida: "2026-11-15",
      vuelta: ""
    };
    const errores = validar(formData);
    expect(Object.keys(errores).length).toBe(0);
  });
});
