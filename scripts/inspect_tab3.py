import subprocess
import json

js = '''
(() => {
    try {
        return JSON.stringify({
            title: document.title,
            textSample: document.body.innerText.slice(0, 1500)
        });
    } catch(e) {
        return JSON.stringify({ error: e.toString() });
    }
})()
'''

as_script = f'''
tell application "Google Chrome"
    tell tab 3 of window 1
        return execute javascript {json.dumps(js)}
    end tell
end tell
'''

res = subprocess.run(["osascript", "-e", as_script], capture_output=True, text=True)
data = json.loads(res.stdout) if res.stdout.strip() else {}
print("Title:", data.get("title"))
print("Sample:\n", data.get("textSample"))
