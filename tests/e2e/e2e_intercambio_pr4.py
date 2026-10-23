#!/usr/bin/env python3
"""
Prueba E2E específica: Intercambio de origen/destino (PR #4)
Valida que el botón ⇄ (intercambiar) funciona correctamente.

Dependencias:
- Python 3.8+
- Playwright: pip install playwright
- Chromium: playwright install chromium
"""

import os
import sys
from pathlib import Path
from threading import Thread, Event

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("❌ Playwright no instalado.")
    print("   Instalar con: pip install playwright")
    print("   Luego: playwright install chromium")
    sys.exit(1)


def start_http_server(directory=None):
    """Inicia servidor HTTP en puerto dinámico."""
    if directory is None:
        directory = Path(__file__).parent.parent.parent
    
    actual_port = [None]
    port_ready = Event()
    
    def run_server():
        import http.server
        import socketserver
        os.chdir(directory)
        handler = http.server.SimpleHTTPRequestHandler
        with socketserver.TCPServer(("127.0.0.1", 0), handler) as httpd:
            actual_port[0] = httpd.server_address[1]
            port_ready.set()
            print(f"🌐 Servidor HTTP en puerto {actual_port[0]}")
            httpd.serve_forever()
    
    server_thread = Thread(target=run_server, daemon=True)
    server_thread.start()
    port_ready.wait()
    return actual_port[0]


def test_intercambio():
    """Prueba: Intercambiar origen/destino con el botón ⇄"""
    
    port = start_http_server()
    base_url = f"http://localhost:{port}"
    
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"{base_url}/public/index.html")
        
        print("\n📊 Prueba E2E: Intercambio de origen/destino\n")
        
        # Paso 1: Ingresar origen y destino
        print("1️⃣ Ingresando origen=SCL, destino=BCN...")
        page.fill("#origen", "SCL")
        page.fill("#destino", "BCN")
        page.fill("#ida", "2026-11-15")
        
        origen_antes = page.locator("#origen").input_value()
        destino_antes = page.locator("#destino").input_value()
        print(f"   Antes: origen={origen_antes}, destino={destino_antes}")
        
        # Paso 2: Pulsar botón intercambiar
        print("2️⃣ Pulsando botón ⇄ intercambiar...")
        page.click("#swap-btn")
        page.wait_for_timeout(100)
        
        # Paso 3: Verificar intercambio
        origen_despues = page.locator("#origen").input_value()
        destino_despues = page.locator("#destino").input_value()
        print(f"   Después: origen={origen_despues}, destino={destino_despues}")
        
        # Paso 4: Validar
        success = (origen_despues == "BCN" and destino_despues == "SCL")
        
        if success:
            print("\n✅ PRUEBA PASADA: Intercambio funcionando correctamente")
            print(f"   origen: SCL → BCN ✓")
            print(f"   destino: BCN → SCL ✓")
        else:
            print("\n❌ PRUEBA FALLIDA: Intercambio no funcionó")
            print(f"   Esperado: origen=BCN, destino=SCL")
            print(f"   Obtenido: origen={origen_despues}, destino={destino_despues}")
        
        browser.close()
        return success


if __name__ == "__main__":
    try:
        success = test_intercambio()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Error durante ejecución: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
