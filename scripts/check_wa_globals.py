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
(() => {
    const keys = Object.keys(window).filter(k => 
        k.toLowerCase().includes('store') || 
        k.toLowerCase().includes('module') || 
        k.toLowerCase().includes('webpack') || 
        k.toLowerCase().includes('require') ||
        k.toLowerCase().includes('wa')
    );
    return JSON.stringify({
        keys,
        hasRequire: typeof window.require !== 'undefined',
        hasWebpackChunk: typeof window.webpackChunkwhatsapp_web_client !== 'undefined'
    });
})()
"""
print(run_js(js))
