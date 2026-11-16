import subprocess
import json

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

js = """
(async () => {
    try {
        const res = await fetch('http://localhost:8899/01_Helados_Artesanales_Guia_Maestra.pdf');
        const blob = await res.blob();
        return JSON.stringify({ ok: res.ok, status: res.status, size: blob.size, type: blob.type });
    } catch (e) {
        return JSON.stringify({ error: e.toString() });
    }
})()
"""
print(run_js(js))
