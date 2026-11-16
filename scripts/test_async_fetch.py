import subprocess
import json
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

def run_async_js(js_body):
    wrapper = f"""
    (() => {{
        window.__async_done = false;
        window.__async_res = null;
        (async () => {{
            try {{
                {js_body}
            }} catch (err) {{
                window.__async_res = {{ error: err.toString() }};
                window.__async_done = true;
            }}
        }})();
    }})()
    """
    run_js(wrapper)
    for _ in range(20):
        time.sleep(0.3)
        poll = run_js("JSON.stringify({ done: window.__async_done, res: window.__async_res })")
        try:
            data = json.loads(poll)
            if data.get("done"):
                return data.get("res")
        except:
            pass
    return None

if __name__ == "__main__":
    test_code = """
    const res = await fetch('http://localhost:8899/01_Helados_Artesanales_Guia_Maestra.pdf');
    const blob = await res.blob();
    window.__async_res = { ok: res.ok, status: res.status, size: blob.size, type: blob.type };
    window.__async_done = true;
    """
    res = run_async_js(test_code)
    print("Async result:", res)
