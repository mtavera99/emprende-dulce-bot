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
    return res.stdout.strip()

message = """¡Excelente trabajo Opus! Todo va quedando impecable.

1. Sobre la paleta de fresa: Sí, cambia la receta a "Paleta de Fresa Rellena de Leche Condensada". Es la combinación más vendida en heladerías artesanales en Colombia.

2. Por favor pásame los bloques completos de código de:
- La función `portada(l)` en `plantilla.js`
- Las reglas de CSS de la nueva portada en `estilos.css`
- La nueva receta de la paleta de fresa rellena

Así sincronizo inmediatamente el repositorio local con las fotos reales y compilo los nuevos PDFs con portadas gráficas."""

js_send = f"""
(() => {{
    const ta = document.querySelector('textarea');
    if (!ta) return JSON.stringify({{ error: "no textarea" }});

    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    nativeSetter.call(ta, {json.dumps(message)});
    
    ta.dispatchEvent(new Event('input', {{ bubbles: true }}));
    ta.dispatchEvent(new Event('change', {{ bubbles: true }}));

    const btn = document.querySelector('button._chatInputSubmitButton_z5y3t_177') ||
                document.querySelector('button[aria-label="Send"]') ||
                document.querySelector('form button[type="submit"]');

    if (!btn) return JSON.stringify({{ error: "no submit btn" }});

    setTimeout(() => {{
        btn.click();
    }}, 100);

    return JSON.stringify({{ success: true }});
}})()
"""

print(run_js(js_send))
