import subprocess
import json
import time

def run_js(js_code):
    as_script = f'''
tell application "Google Chrome"
    tell tab 5 of window 1
        execute javascript {json.dumps(js_code)}
    end tell
end tell
'''
    res = subprocess.run(["osascript", "-e", as_script], capture_output=True, text=True)
    if res.returncode != 0:
        print("AppleScript Error:", res.stderr)
        return None
    return res.stdout.strip()

prompt_text = """# CONSTRUCCIÓN DEL BOT DE WHATSAPP PARA PRODUCTOS DIGITALES (INFOPRODUCTOS)
# Nombre de la sesión: Producto Digital

Hola Opus 5.5. Vamos a construir el bot de WhatsApp para nuestro negocio de infoproductos digitales ("Emprende Dulce Colombia", oferta low-ticket de $10.000 COP con pack de 3 eBooks + 3 bonos de repostería y helados artesanales).

## REGLA FUNDAMENTAL DE ARQUITECTURA
Debemos mantener TODOS los parámetros, diseño, estándares de código y funcionalidades que ya operan con éxito en nuestros bots de producción de BikerPro (línea 322) y Novika (línea 310), adaptándolos exclusivamente a la naturaleza de infoproductos:
- Se eliminan por completo los módulos de logística física (no hay fletes, no hay guías de transportadora, no hay envíos contraentrega).
- Se preservan al 100% las funciones comerciales que maximizan la conversión: panel web administrativo (/panel?token=...), visor interactivo de chats, comprobación de pagos Nequi/Daviplata por OCR, entrega automática e inmediata de archivos digitales, manejo de objeciones y motor de seguimiento/recuperación automática de clientes (2h, 24h, 48h).
- El bot se desplegará en Render (render.yaml, Web Service en Node.js/Express) y se conectará a la WhatsApp Cloud API de Meta en una línea telefónica completamente nueva e independiente (tercer número, sin interferir con BikerPro ni Novika).

## ESTRUCTURA DEL SISTEMA A DESARROLLAR:
1. `src/server.js`: Servidor Express, endpoints de webhook (GET verificación handshake Meta, POST recepción de mensajes), rutas del panel administrativo `/panel`, autenticación por token seguro.
2. `src/store.js`: Persistencia local en JSON / base de datos ligera para estados de clientes, pedidos pendientes, ventas confirmadas y métricas.
3. `src/panel.js` & `src/panel-chat.js`: Dashboard web responsive idéntico al de BikerPro (pestañas: Pendientes, Ventas Confirmadas, Chats en vivo, Métricas de venta y conversión, Configuración).
4. `src/conversationFlow.js`: Máquina de estados comerciales para infoproductos:
   - Saludo persuasivo y presentación de la oferta ($10.000 COP).
   - Manejo de preguntas frecuentes y objeciones (acceso inmediato, formato PDF, ingredientes locales).
   - Instrucciones de pago claras (Nequi / Daviplata / Bancolombia / QR).
   - Recepción de comprobante y validación por OCR.
   - Entrega instantánea de los enlaces de descarga y archivos PDF.
   - Upsell del pack premium o asesoría.
5. `src/ocrValidator.js`: Detección inteligente de comprobantes de Nequi/Daviplata (monto $10.000, fecha del día, número de referencia).
6. `src/seguimiento.js`: Disparador de mensajes automáticos de recuperación para prospectos que solicitaron información o datos de pago pero no enviaron comprobante.
7. `render.yaml` y `Dockerfile`: Configuración lista para despliegue continuo en Render.

Comienza presentándome la arquitectura modular completa, el desglose de archivos y el código base del servidor y panel para iniciar la implementación paso a paso."""

def send_prompt():
    print("Preparing to send prompt into Kiro Web (Tab 5)...")
    
    js_inject = f"""
    (() => {{
        const ta = document.querySelector('textarea');
        if (!ta) return JSON.stringify({{ error: "no textarea found" }});
        
        ta.focus();
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeSetter.call(ta, {json.dumps(prompt_text)});
        
        ta.dispatchEvent(new Event('input', {{ bubbles: true }}));
        ta.dispatchEvent(new Event('change', {{ bubbles: true }}));
        
        return JSON.stringify({{ success: true, length: ta.value.length }});
    }})()
    """
    res = run_js(js_inject)
    print("Injection result:", res)
    time.sleep(1)

    js_click = """
    (() => {
        const btn = document.querySelector('button[aria-label="Send message"]') || 
                    document.querySelector('button._chatInputSubmitButton_z5y3t_177') ||
                    document.querySelector('form button[type="submit"]');
        if (!btn) return JSON.stringify({ error: "no submit button found" });
        btn.click();
        return JSON.stringify({ clicked: true, aria: btn.getAttribute("aria-label"), disabled: btn.disabled });
    })()
    """
    click_res = run_js(js_click)
    print("Click submit result:", click_res)

if __name__ == "__main__":
    send_prompt()
