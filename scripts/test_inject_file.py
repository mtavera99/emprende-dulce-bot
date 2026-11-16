import subprocess
import json
import base64
import time

def run_js(js_code):
    as_script = f'''
tell application "Google Chrome"
    tell tab 8 of window 1
        execute javascript {json.dumps(js_code)}
    end tell
end tell
'''
    res = subprocess.run(["osascript", "-e", as_script], capture_output=True, text=True)
    return res.stdout.strip()

# Read the first PDF as base64
pdf_path = "/Users/santiagotavera/Desktop/Trabajos/lowticket-bot/dist_pdfs/01_Helados_Artesanales_Guia_Maestra.pdf"
with open(pdf_path, "rb") as f:
    b64_data = base64.b64encode(f.read()).decode("utf-8")

# Let's test with base64 data
js = f"""
(() => {{
    const input = document.querySelector('#main footer input[type="file"]');
    if (!input) return JSON.stringify({{ error: "no input" }});
    
    // Save original accept
    const origAccept = input.accept;
    input.accept = "*";
    
    // Convert b64 to byte array
    const b64 = "{b64_data}";
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {{
        bytes[i] = binary.charCodeAt(i);
    }}
    
    const blob = new Blob([bytes], {{ type: 'application/pdf' }});
    const file = new File([blob], '01_Helados_Artesanales_Guia_Maestra.pdf', {{ type: 'application/pdf', lastModified: Date.now() }});
    
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    
    input.dispatchEvent(new Event('change', {{ bubbles: true }}));
    
    return JSON.stringify({{ success: true, fileName: file.name, fileSize: file.size }});
}})()
"""

print(run_js(js))
time.sleep(2)

js_dialog = """
(() => {
    // Check if attachment preview or send dialog appeared
    const dialogs = Array.from(document.querySelectorAll('[role="dialog"], [data-animate-modal-popup="true"]'));
    const sendBtns = Array.from(document.querySelectorAll('span[data-icon="send"], div[aria-label="Enviar"], button[aria-label="Enviar"]'));
    return JSON.stringify({
        dialogCount: dialogs.length,
        dialogTexts: dialogs.map(d => d.innerText.substring(0, 150)),
        hasSendBtn: sendBtns.length > 0
    });
})()
"""
print(run_js(js_dialog))
