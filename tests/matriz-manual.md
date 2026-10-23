# Matriz de Pruebas Manuales — Búsqueda de Viajes

Pruebas de DOM y comportamiento de interfaz (no automatizadas en bun test).

## Precondiciones
- Abrir `public/index.html` en navegador
- Verificar que no hay errores en consola

## Pruebas

### 1. Visibilidad condicional de Vuelta
**Pasos:**
1. Cargar página. Campo "Vuelta" debe estar oculto.
2. Seleccionar "Ida y vuelta".
3. Campo "Vuelta" debe aparecer y ser obligatorio.
4. Seleccionar "Solo ida".
5. Campo "Vuelta" debe ocultarse, limpiarse y no ser obligatorio.

**Resultado esperado:** Campo mostrado/ocultado según tipo, vacío al ocultar.

---

### 2. Foco en primer campo inválido
**Pasos:**
1. Seleccionar "Ida".
2. Ingresar Origen: "SCL", Destino: "SCL", Ida: "2026-11-15".
3. Presionar "Buscar".
4. Verificar que el foco está en "Destino" (error de igualdad).

**Resultado esperado:** El cursor está en el campo "Destino".

---

### 3. Atributos ARIA (aria-invalid, aria-describedby)
**Pasos:**
1. Ingresar Origen: "BCN", Destino: "SCL", Ida: "2026-11-15".
2. Presionar "Buscar". Sin errores, ningún campo tiene `aria-invalid="true"`.
3. Seleccionar "Ida y vuelta".
4. Presionar "Buscar" (Vuelta vacía).
5. Inspeccionar "Vuelta" en DevTools: `aria-invalid="true"`, `aria-describedby="error-vuelta"`.
6. El div `error-vuelta` contiene el mensaje.

**Resultado esperado:** Atributos ARIA se actualizan correctamente.

---

### 4. Resumen de errores (error-summary)
**Pasos:**
1. Ingresar Origen: "SCL", Destino: "SCL", Ida: "2026-11-15".
2. Presionar "Buscar".
3. Un div rojo debe aparecer con "Errores encontrados:" y un bullet "El destino no puede ser igual al origen."

**Resultado esperado:** Resumen visible con todos los mensajes de error.

---

### 5. Intercambio de valores y limpieza de errores
**Pasos:**
1. Ingresar Origen: "SCL", Destino: "SCL".
2. Presionar "Buscar". Error visible.
3. Presionar "⇄ Intercambiar".
4. Ambos campos deben intercambiarse: Origen="SCL", Destino="SCL" (sin cambio visual pero internamente intercambiados al revés).
5. Los errores previos deben desaparecer.
6. El resumen de errores debe ocultarse.

**Resultado esperado:** Valores intercambiados, errores limpios.

---

### 6. Cambio de tipo de viaje limpia errores y vacía Vuelta
**Pasos:**
1. Seleccionar "Ida y vuelta".
2. Ingresar Origen: "SCL", Destino: "BCN", Ida: "2026-11-15", Vuelta: "2026-11-10" (inválida).
3. Presionar "Buscar". Error en Vuelta.
4. Seleccionar "Solo ida".
5. Campo "Vuelta" debe ocultarse, vaciarse.
6. Error de "Vuelta" debe desaparecer.
7. Resumen de errores debe ocultarse.

**Resultado esperado:** Al cambiar tipo, Vuelta se limpia y errores desaparecen.

---

### 7. Envío válido sin errores
**Pasos:**
1. Ingresar Origen: "SCL", Destino: "BCN", Ida: "2026-11-15".
2. Presionar "Buscar".
3. No debe haber errores visibles.
4. El div `resultado` debe mostrar: "🔎 Buscando vuelos desde SCL a BCN (ida: 2026-11-15)..."

**Resultado esperado:** Mensaje de búsqueda aparece sin errores.

---

### 8. Validación de fechas (vuelta >= ida)
**Pasos:**
1. Seleccionar "Ida y vuelta".
2. Ingresar Ida: "2026-11-15", Vuelta: "2026-11-10".
3. Presionar "Buscar".
4. Error en "Vuelta": "La fecha de vuelta no puede ser anterior a la de ida."

**Resultado esperado:** Error rechaza vuelta anterior.

---

### 9. Validación: Origen ≠ Destino (espacios y mayúsculas ignorados)
**Pasos:**
1. Ingresar Origen: " SCL ", Destino: "scl".
2. Presionar "Buscar".
3. Error en "Destino": "El destino no puede ser igual al origen."

**Resultado esperado:** Error detecta igualdad ignorando espacios y mayúsculas.

---

### 10. Habilitación del botón "Buscar"
**Pasos:**
1. Cargar página. Botón debe estar deshabilitado (gris).
2. Ingresar solo Origen. Botón sigue deshabilitado.
3. Ingresar Origen + Destino + Ida (Tipo="Ida"). Botón se habilita.
4. Seleccionar "Ida y vuelta". Botón se deshabilita (Vuelta requerida).
5. Ingresar Vuelta. Botón se habilita.

**Resultado esperado:** Botón responde a cambios de validez.

---

## Notas
- Todas las pruebas asumen navegador moderno (Chrome, Firefox, Safari).
- Los atributos ARIA pueden inspeccionarse en DevTools → Elements.
- Los estilos CSS esperados: campos con error tienen `border-color: #d32f2f` y fondo `#ffebee`.
