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

message = """¡Hola Opus 5.5! Traigo feedback directo y prioritario del usuario:

1. FEEDBACK DEL USUARIO:
"Ya me gustó el tema de las imágenes que incorporó para los productos, pero me gustaría mejorar muchísimo más el diseño de la portada de los PDF para que se vea muchísimo más gráfica, muchísimo más profesional tipo ebook profesional de alta gama / bestseller, metiéndole a los colores y composición visual".

En la plantilla actual (`portada` en plantilla.js), la portada es solo texto sobre un fondo plano con marco dorado fino, sin elementos gráficos. Necesitamos que las portadas tengan impacto visual de publicación editorial premium:
- Composición con fotografía hero gastronómica en portada.
- Jerarquía tipográfica imponente y moderna (estilo revista/ebook bestseller).
- Badges gráficos comerciales de alto valor: "Edición Emprendedores 2026", "100% Fórmulas Probadas y Costeadas", "Incluye Plantilla de Costeo Colombia", sello de calidad "Colección Emprende Dulce".
- Fondos con gradientes profundos, contraste cinematográfico y acabados de lujo según el libro (Borgoña/Oro para Postres, Azul Marino/Chocolate/Cacao para Helados, Verde Pino/Rojo Navidad/Dorado para Recetario Navideño).

Por favor, rediseña el módulo `portada(l)` en `plantilla.js` y las reglas en `estilos.css` con esta nueva estructura gráfica.

2. AJUSTE DE RECETAS A LAS FOTOS:
Excelente observación sobre las fotos. Vamos a sincronizar los textos del libro para que coincidan 100% con las fotos reales que el cliente ve en el PDF:
- Pie de Limón: especificar que lleva el clásico merengue suizo dorado con soplete.
- Helados: titular "Helado de Chocolate Intenso / Fudge" y paleta artesanal con cobertura de chocolate y crocante de maní.
- Recetario Navideño: natilla tradicional con toque de panela y arequipe.

3. RESPUESTAS A TUS DUDAS DE FASE 2:
- Aprobación: Mantener AUTO_APROBAR=0 por seguridad para iniciar con revisión manual desde WhatsApp como lo estructuraste.
- Kits de Upsell: Sí, por favor diseña de una vez el contenido y estructura de los dos kits (Kit de Etiquetas/Tarjetas Navideñas $5.000 y Kit Navidad Pro $15.000).

¡Adelante con el rediseño gráfico de las portadas y los ajustes!"""

js_send = f"""
(() => {{
    const ta = document.querySelector('textarea');
    if (!ta) return JSON.stringify({{ error: "no textarea" }});

    // Set value with native setter
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    nativeSetter.call(ta, {json.dumps(message)});
    
    ta.dispatchEvent(new Event('input', {{ bubbles: true }}));
    ta.dispatchEvent(new Event('change', {{ bubbles: true }}));

    // Find submit button
    const btn = document.querySelector('button._chatInputSubmitButton_z5y3t_177') ||
                document.querySelector('button[aria-label="Send"]') ||
                document.querySelector('form button[type="submit"]');

    if (!btn) return JSON.stringify({{ error: "no submit btn", valLength: ta.value.length }});

    // Wait a tiny bit and click
    setTimeout(() => {{
        btn.click();
    }}, 100);

    return JSON.stringify({{ success: true, textLength: ta.value.length, btnDisabled: btn.disabled }});
}})()
"""

print(run_js(js_send))
time.sleep(1)

# Check if sending started
js_verify = """
(() => {
    const stopBtn = document.querySelector('button[aria-label*="Stop"], button[title*="Stop"]');
    const ta = document.querySelector('textarea');
    return JSON.stringify({
        isGenerating: !!stopBtn,
        textareaValue: ta ? ta.value : null
    });
})()
"""
print("State after click:", run_js(js_verify))
