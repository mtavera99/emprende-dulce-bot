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

def run_main_world(main_code):
    # Injects script into main world, sets result on a dataset attribute
    js_injector = f"""
    (() => {{
        const s = document.createElement('script');
        s.textContent = `
            try {{
                const res = (() => {{
                    {main_code}
                }})();
                document.documentElement.setAttribute('data-res', JSON.stringify(res));
            }} catch(err) {{
                document.documentElement.setAttribute('data-res', JSON.stringify({{ error: err.toString() }}));
            }}
        `;
        document.documentElement.appendChild(s);
        s.remove();
        const res = document.documentElement.getAttribute('data-res');
        document.documentElement.removeAttribute('data-res');
        return res;
    }})()
    """
    return run_js(js_injector)

if __name__ == "__main__":
    code = """
    const keys = Object.keys(window).filter(k => 
        k.toLowerCase().includes('store') || 
        k.toLowerCase().includes('webpack') || 
        k.toLowerCase().includes('require') ||
        k.toLowerCase().includes('wa')
    );
    const hasWebpack = typeof window.webpackChunkwhatsapp_web_client !== 'undefined';
    return { keys, hasWebpack };
    """
    res = run_main_world(code)
    print("Main world inspection:", res)
