#!/usr/bin/env python3
"""
Pruebas de smoke (e2e) con Playwright — Búsqueda de viajes
Verifica comportamiento del DOM: visibilidad, foco, ARIA, errores.
"""

import subprocess
import sys
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("⚠️  Playwright no instalado. Instalando...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright"])
    from playwright.sync_api import sync_playwright

def test_dom_smoke():
    """Ejecutar pruebas de smoke en navegador real."""
    repo_root = Path(__file__).parent.parent.parent
    html_path = (repo_root / "public" / "index.html").resolve()
    file_url = f"file://{html_path}"

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(file_url)

        results = []

        # Test 1: Vuelta visible solo para "Ida y vuelta"
        try:
            label_vuelta = page.locator("#label-vuelta")
            assert label_vuelta.evaluate("el => window.getComputedStyle(el).display") == "none", \
                "Vuelta debe estar oculta al inicio"
            
            page.click("input[name='tipo-viaje'][value='ida-vuelta']")
            page.wait_for_timeout(100)
            assert label_vuelta.evaluate("el => window.getComputedStyle(el).display") == "block", \
                "Vuelta debe mostrarse para ida-vuelta"
            
            results.append("✅ Test 1: Visibilidad de Vuelta")
        except Exception as e:
            results.append(f"❌ Test 1: {e}")

        # Test 2: Foco en primer campo inválido
        try:
            page.click("input[name='tipo-viaje'][value='ida']")
            page.fill("#origen", "SCL")
            page.fill("#destino", "SCL")
            page.fill("#ida", "2026-11-15")
            page.click("button[type='submit']")
            page.wait_for_timeout(100)
            
            focused_id = page.evaluate("() => document.activeElement.id")
            assert focused_id == "destino", f"Foco debe estar en destino, está en {focused_id}"
            results.append("✅ Test 2: Foco en primer campo inválido")
        except Exception as e:
            results.append(f"❌ Test 2: {e}")

        # Test 3: aria-invalid y aria-describedby
        try:
            page.fill("#ida", "2026-11-15")
            page.click("button[type='submit']")
            page.wait_for_timeout(100)
            
            destino = page.locator("#destino")
            assert destino.get_attribute("aria-invalid") == "true", "aria-invalid debe ser true"
            assert destino.get_attribute("aria-describedby") == "error-destino", "aria-describedby debe ser error-destino"
            results.append("✅ Test 3: ARIA attributes (aria-invalid, aria-describedby)")
        except Exception as e:
            results.append(f"❌ Test 3: {e}")

        # Test 4: Resumen de errores
        try:
            error_summary = page.locator("#error-summary")
            assert error_summary.get_attribute("class").find("visible") >= 0, "error-summary debe ser visible"
            error_list = page.locator("#error-list li")
            assert error_list.count() > 0, "error-list debe tener items"
            results.append("✅ Test 4: Resumen de errores (error-summary visible)")
        except Exception as e:
            results.append(f"❌ Test 4: {e}")

        # Test 5: Intercambio limpia errores
        try:
            page.click("#swap-btn")
            page.wait_for_timeout(100)
            error_summary = page.locator("#error-summary")
            assert error_summary.get_attribute("class").find("visible") < 0, "error-summary debe ocultarse después de intercambiar"
            results.append("✅ Test 5: Intercambio limpia errores")
        except Exception as e:
            results.append(f"❌ Test 5: {e}")

        # Test 6: Cambio de tipo limpia Vuelta y errores
        try:
            page.click("input[name='tipo-viaje'][value='ida-vuelta']")
            page.fill("#vuelta", "2026-11-10")
            page.click("button[type='submit']")
            page.wait_for_timeout(100)
            
            page.click("input[name='tipo-viaje'][value='ida']")
            page.wait_for_timeout(100)
            vuelta = page.locator("#vuelta")
            assert vuelta.input_value() == "", "Vuelta debe estar vacía después de cambiar tipo"
            error_summary = page.locator("#error-summary")
            assert error_summary.get_attribute("class").find("visible") < 0, "error-summary debe ocultarse"
            results.append("✅ Test 6: Cambio de tipo limpia Vuelta y errores")
        except Exception as e:
            results.append(f"❌ Test 6: {e}")

        # Test 7: Envío válido sin errores
        try:
            page.fill("#origen", "SCL")
            page.fill("#destino", "BCN")
            page.fill("#ida", "2026-11-15")
            page.click("button[type='submit']")
            page.wait_for_timeout(100)
            
            resultado = page.locator("#resultado").inner_text()
            assert "🔎 Buscando" in resultado, "Debe mostrar mensaje de búsqueda"
            error_summary = page.locator("#error-summary")
            assert error_summary.get_attribute("class").find("visible") < 0, "No debe haber resumen de errores"
            results.append("✅ Test 7: Envío válido sin errores")
        except Exception as e:
            results.append(f"❌ Test 7: {e}")

        # Test 8: Validación de fechas (vuelta < ida)
        try:
            page.click("input[name='tipo-viaje'][value='ida-vuelta']")
            page.fill("#ida", "2026-11-15")
            page.fill("#vuelta", "2026-11-10")
            page.click("button[type='submit']")
            page.wait_for_timeout(100)
            
            error_vuelta = page.locator("#error-vuelta").inner_text()
            assert "anterior" in error_vuelta.lower(), "Debe indicar que vuelta es anterior"
            results.append("✅ Test 8: Validación de fechas (vuelta < ida)")
        except Exception as e:
            results.append(f"❌ Test 8: {e}")

        # Test 9: Validación origen=destino (espacios/mayúsculas ignorados)
        try:
            page.fill("#origen", " SCL ")
            page.fill("#destino", "scl")
            page.click("button[type='submit']")
            page.wait_for_timeout(100)
            
            error_destino = page.locator("#error-destino").inner_text()
            assert "igual" in error_destino.lower(), "Debe indicar que destino es igual al origen"
            results.append("✅ Test 9: Validación origen=destino (mayúsculas/espacios ignorados)")
        except Exception as e:
            results.append(f"❌ Test 9: {e}")

        # Test 10: Habilitación del botón Buscar
        try:
            page.reload()
            page.wait_for_timeout(200)
            boton = page.locator("button[type='submit']")
            assert boton.is_disabled(), "Botón debe estar deshabilitado al inicio"
            
            page.fill("#origen", "SCL")
            page.fill("#destino", "BCN")
            page.fill("#ida", "2026-11-15")
            assert not boton.is_disabled(), "Botón debe habilitarse para ida válida"
            
            page.click("input[name='tipo-viaje'][value='ida-vuelta']")
            assert boton.is_disabled(), "Botón debe deshabilitarse sin vuelta"
            
            page.fill("#vuelta", "2026-11-22")
            assert not boton.is_disabled(), "Botón debe habilitarse con vuelta"
            results.append("✅ Test 10: Habilitación del botón Buscar")
        except Exception as e:
            results.append(f"❌ Test 10: {e}")

        # Test 11: Visibilidad de campo vuelta (input también debe ocultarse)
        try:
            page.click("input[name='tipo-viaje'][value='ida']")
            page.wait_for_timeout(100)
            vuelta_input = page.locator("#vuelta")
            assert vuelta_input.evaluate("el => window.getComputedStyle(el).display") == "none", \
                "Input vuelta debe estar oculto para ida"
            page.click("input[name='tipo-viaje'][value='ida-vuelta']")
            page.wait_for_timeout(100)
            assert vuelta_input.evaluate("el => window.getComputedStyle(el).display") != "none", \
                "Input vuelta debe mostrarse para ida-vuelta"
            results.append("✅ Test 11: Visibilidad del input vuelta")
        except Exception as e:
            results.append(f"❌ Test 11: {e}")

        # Test 12: Requiredidad del campo vuelta
        try:
            vuelta_input = page.locator("#vuelta")
            page.click("input[name='tipo-viaje'][value='ida-vuelta']")
            page.wait_for_timeout(100)
            assert vuelta_input.get_attribute("required") is not None, "Vuelta debe ser required para ida-vuelta"
            
            page.click("input[name='tipo-viaje'][value='ida']")
            page.wait_for_timeout(100)
            assert vuelta_input.get_attribute("required") is None, "Vuelta no debe ser required para ida"
            results.append("✅ Test 12: Requiredidad del campo vuelta")
        except Exception as e:
            results.append(f"❌ Test 12: {e}")

        # Test 13: aria-live y aria-atomic en error-summary
        try:
            error_summary = page.locator("#error-summary")
            assert error_summary.get_attribute("aria-live") == "assertive", "error-summary debe tener aria-live=assertive"
            assert error_summary.get_attribute("aria-atomic") == "true", "error-summary debe tener aria-atomic=true"
            results.append("✅ Test 13: ARIA properties en error-summary")
        except Exception as e:
            results.append(f"❌ Test 13: {e}")

        browser.close()

    # Imprimir resultados
    print("\n📊 Resultados de pruebas e2e (Chromium):\n")
    for result in results:
        print(f"  {result}")
    
    passed = sum(1 for r in results if r.startswith("✅"))
    total = len(results)
    print(f"\n🎯 {passed}/{total} pruebas pasaron\n")
    
    return passed == total

if __name__ == "__main__":
    success = test_dom_smoke()
    sys.exit(0 if success else 1)
