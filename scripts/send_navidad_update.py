import subprocess
import json
import base64
import time
import os

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

def activate_chrome_tab():
    as_script = '''
tell application "Google Chrome"
    activate
    set active tab index of window 1 to 8
end tell
'''
    subprocess.run(["osascript", "-e", as_script])
    time.sleep(0.5)

def ensure_chat_hijo_amado():
    js_ensure = """
    (() => {
        const h = document.querySelector("#main header");
        if (h && h.innerText.includes("Hijo Amado")) {
            return "Already in Hijo Amado";
        }
        const span = document.querySelector('span[title*="Hijo Amado"]');
        if (!span) return "Span Hijo Amado not found";
        const rect = span.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const el = document.elementFromPoint(x, y);
        let curr = el;
        while (curr && curr !== document.body) {
            curr.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: x, clientY: y, view: window }));
            curr.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, clientX: x, clientY: y, view: window }));
            curr.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, clientX: x, clientY: y, view: window }));
            curr = curr.parentElement;
        }
        return "Clicked Hijo Amado";
    })()
    """
    res = run_js(js_ensure)
    print("Ensure chat result:", res)
    time.sleep(1)

def ensure_clean_state():
    run_js("""
    (() => {
        const removeBtns = Array.from(document.querySelectorAll('div[aria-label="Quitar archivo adjunto"]'));
        removeBtns.forEach(b => b.click());
        const closeBtns = Array.from(document.querySelectorAll('[aria-label="Cerrar"], [data-icon="x"]'));
        closeBtns.forEach(b => b.click());
    })()
    """)
    time.sleep(0.5)

def upload_file_to_browser(file_path, var_name, mime_type):
    print(f"Uploading {os.path.basename(file_path)} ({os.path.getsize(file_path):,} bytes)...")
    with open(file_path, "rb") as f:
        data = f.read()
    b64_str = base64.b64encode(data).decode("utf-8")
    fname = os.path.basename(file_path)

    run_js("window.__temp_chunks = [];")
    chunk_size = 400000
    for i in range(0, len(b64_str), chunk_size):
        chunk = b64_str[i:i + chunk_size]
        run_js(f"window.__temp_chunks.push({json.dumps(chunk)});")

    js_assemble = f"""
    (() => {{
        const fullB64 = window.__temp_chunks.join('');
        const binary = atob(fullB64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {{
            bytes[i] = binary.charCodeAt(i);
        }}
        const blob = new Blob([bytes], {{ type: {json.dumps(mime_type)} }});
        window[{json.dumps(var_name)}] = new File([blob], {json.dumps(fname)}, {{ type: {json.dumps(mime_type)}, lastModified: Date.now() }});
        delete window.__temp_chunks;
        return JSON.stringify({{
            name: window[{json.dumps(var_name)}].name,
            size: window[{json.dumps(var_name)}].size
        }});
    }})()
    """
    res = run_js(js_assemble)
    print(f"Uploaded: {res}")

def send_loaded_files(var_names):
    print(f"Pasting files into chat: {var_names}...")
    js_paste = f"""
    (() => {{
        const composeBox = document.querySelector('div[contenteditable="true"][data-testid="conversation-compose-box-input"]') || 
                           document.querySelector('footer div[contenteditable="true"]');
        if (!composeBox) return JSON.stringify({{ error: "no compose box" }});
        
        composeBox.focus();
        const dt = new DataTransfer();
        const varList = {json.dumps(var_names)};
        varList.forEach(v => {{
            if (window[v]) dt.items.add(window[v]);
        }});
        
        const pasteEvent = new ClipboardEvent('paste', {{
            clipboardData: dt,
            bubbles: true,
            cancelable: true
        }});
        
        const dispatched = composeBox.dispatchEvent(pasteEvent);
        return JSON.stringify({{ dispatched, count: dt.items.length }});
    }})()
    """
    res = run_js(js_paste)
    print("Paste result:", res)
    time.sleep(3.0)

    # Check preview tray
    js_check = """
    (() => {
        const thumbs = Array.from(document.querySelectorAll('[data-testid="media-editor-attachment-thumb"]'));
        const sendBtn = document.querySelector('div[role="button"][aria-label^="Enviar"]');
        return JSON.stringify({
            thumbCount: thumbs.length,
            sendBtnLabel: sendBtn ? sendBtn.getAttribute('aria-label') : null,
            hasSendBtn: !!sendBtn
        });
    })()
    """
    check_res = json.loads(run_js(js_check))
    print("Preview check:", check_res)
    
    if not check_res.get("hasSendBtn"):
        print("Error: Send button not found!")
        return False

    print("Clicking Send button...")
    js_click_send = """
    (() => {
        const sendBtn = document.querySelector('div[role="button"][aria-label^="Enviar"]');
        if (!sendBtn) return "no sendBtn";
        sendBtn.click();
        return "clicked send";
    })()
    """
    click_res = run_js(js_click_send)
    print("Click send result:", click_res)
    time.sleep(4)
    return True

def send_text_message(message_text):
    print(f"Sending message text: {message_text[:40]}...")
    js_send_text = f"""
    (() => {{
        const composeBox = document.querySelector('div[contenteditable="true"][data-testid="conversation-compose-box-input"]') || 
                           document.querySelector('footer div[contenteditable="true"]');
        if (!composeBox) return "no compose box";
        
        composeBox.focus();
        document.execCommand('insertText', false, {json.dumps(message_text)});
        
        // Find send button
        setTimeout(() => {{
            const sendBtn = document.querySelector('button[aria-label="Enviar"]') || 
                            document.querySelector('span[data-icon="send"]')?.closest('button') ||
                            document.querySelector('div[role="button"][aria-label="Enviar"]');
            if (sendBtn) sendBtn.click();
        }}, 300);
        return "inserted";
    }})()
    """
    run_js(js_send_text)
    time.sleep(2)
    # Also press Enter just in case
    run_js("""
    (() => {
        const composeBox = document.querySelector('div[contenteditable="true"][data-testid="conversation-compose-box-input"]') || 
                           document.querySelector('footer div[contenteditable="true"]');
        if (composeBox) {
            const enterEvt = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 });
            composeBox.dispatchEvent(enterEvt);
        }
    })()
    """)
    time.sleep(1)

if __name__ == "__main__":
    activate_chrome_tab()
    ensure_chat_hijo_amado()
    ensure_clean_state()

    base_dir = "/Users/santiagotavera/Desktop/Trabajos/lowticket-bot/dist_pdfs"
    pdf3 = os.path.join(base_dir, "03_Recetario_Navideno_Postres_y_Cajas_Regalo.pdf")
    zip_file = os.path.join(base_dir, "Emprende_Dulce_Pack_Completo_2026.zip")

    # Step 1: Send updated Christmas book
    print("--- STEP 1: Sending Updated Recetario Navideño (with all photos) ---")
    upload_file_to_browser(pdf3, "__pdf3", "application/pdf")
    success_pdf = send_loaded_files(["__pdf3"])
    if not success_pdf:
        print("Failed to send Christmas book!")
        exit(1)

    print("Christmas book sent! Waiting 5s before sending bundle zip...")
    time.sleep(5)

    # Step 2: Send updated Pack ZIP
    print("--- STEP 2: Sending Updated Complete Pack ZIP ---")
    upload_file_to_browser(zip_file, "__zip1", "application/zip")
    success_zip = send_loaded_files(["__zip1"])
    if not success_zip:
        print("Failed to send zip bundle!")
        exit(1)

    time.sleep(3)
    # Step 3: Confirmation text
    msg = "¡Listo! Aquí tienes el Recetario Navideño actualizado con las fotografías profesionales de estudio de todas las recetas (buñuelos, vaso novena, brevas con arequipe, trufas, galletas, cocadas, torta negra y chocolate en frasco), además del ZIP con el pack completo de la colección Emprende Dulce 2026."
    send_text_message(msg)

    print("--- ALL ASSETS DELIVERED SUCCESSFULLY TO HIJO AMADO ---")
