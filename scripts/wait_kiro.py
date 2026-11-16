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

for i in range(12):
    time.sleep(3)
    js = """
    (() => {
        const stopBtn = document.querySelector('button[aria-label*="Stop"], button[title*="Stop"]');
        const prose = Array.from(document.querySelectorAll('.prose, [class*="prose"], [class*="markdown"]'));
        const lastMsg = prose.length > 0 ? prose[prose.length - 1].innerText : "";
        return JSON.stringify({
            isGenerating: !!stopBtn,
            length: lastMsg.length,
            preview: lastMsg.substring(lastMsg.length - 300)
        });
    })()
    """
    res_str = run_js(js)
    try:
        data = json.loads(res_str)
        print(f"[{i+1}] Generating: {data['isGenerating']}, Length: {data['length']}")
        if not data['isGenerating']:
            print("Done! Last text preview:")
            print(data['preview'])
            break
    except Exception as e:
        print(f"Parse error: {e}")
