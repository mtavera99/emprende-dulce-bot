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
    if res.returncode != 0:
        print("AppleScript Error:", res.stderr)
        return None
    return res.stdout.strip()

def send_file_to_browser(file_path):
    with open(file_path, "rb") as f:
        data = f.read()
    b64_str = base64.b64encode(data).decode("utf-8")
    
    # Initialize array
    run_js("window.__file_chunks = []; window.__file_name = " + json.dumps(file_path.split("/")[-1]) + ";")
    
    # Send in 200KB chunks
    chunk_size = 200000
    for i in range(0, len(b64_str), chunk_size):
        chunk = b64_str[i:i + chunk_size]
        js_push = f"window.__file_chunks.push({json.dumps(chunk)});"
        run_js(js_push)
        
    # Reassemble and create File/Blob
    js_assemble = """
    (() => {
        const fullB64 = window.__file_chunks.join('');
        const binary = atob(fullB64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        window.__loaded_file = new File([blob], window.__file_name, { type: 'application/pdf', lastModified: Date.now() });
        return JSON.stringify({
            name: window.__loaded_file.name,
            size: window.__loaded_file.size,
            type: window.__loaded_file.type
        });
    })()
    """
    res = run_js(js_assemble)
    return res

if __name__ == "__main__":
    t0 = time.time()
    pdf_path = "/Users/santiagotavera/Desktop/Trabajos/lowticket-bot/dist_pdfs/01_Helados_Artesanales_Guia_Maestra.pdf"
    res = send_file_to_browser(pdf_path)
    print("Loaded in browser:", res, f"in {time.time() - t0:.2f}s")
