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

def ensure_hijo_amado_active():
    check_js = """
    (() => {
        const header = document.querySelector('#main header');
        return header ? header.innerText : "";
    })()
    """
    header_text = run_js(check_js)
    if "Hijo Amado" in header_text:
        print("Hijo Amado is already active in chat header.")
        return True

    print("Activating Hijo Amado...")
    click_js = """
    (() => {
        const span = document.querySelector('span[title="Hijo Amado"]');
        if (!span) return JSON.stringify({ error: "span not found" });

        const rect = span.getBoundingClientRect();
        const x = rect.left + 10;
        const y = rect.top + 10;
        const target = document.elementFromPoint(x, y);

        ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evtType => {
            let evt = evtType.startsWith('pointer') ? 
                new PointerEvent(evtType, { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0, isPrimary: true, pointerId: 1, pointerType: 'mouse' }) :
                new MouseEvent(evtType, { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0 });
            target.dispatchEvent(evt);
        });

        return JSON.stringify({ success: true });
    })()
    """
    res = run_js(click_js)
    print("Click result:", res)
    time.sleep(1.5)
    
    header_text = run_js(check_js)
    print("Active header:", header_text)
    return "Hijo Amado" in header_text

def upload_file_to_memory(file_path, var_name, mime_type):
    print(f"Uploading {os.path.basename(file_path)} to browser memory as {var_name}...")
    with open(file_path, "rb") as f:
        data = f.read()
    b64_str = base64.b64encode(data).decode("utf-8")
    fname = os.path.basename(file_path)

    run_js(f"window.__temp_chunks = [];")
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
    print(f"Loaded: {res}")
    return res

if __name__ == "__main__":
    activate_chrome_tab()
    if not ensure_hijo_amado_active():
        print("Failed to ensure Hijo Amado is active!")
        exit(1)
        
    print("Ready to process files.")
