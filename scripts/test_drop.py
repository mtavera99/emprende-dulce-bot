import subprocess
import json
import base64

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

# Let's read a small PDF or dummy file to test
js = """
(() => {
    const main = document.querySelector('#main') || document.body;
    
    // Create a mock PDF file
    const content = "%PDF-1.4\\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\\n3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\\nxref\\n0 4\\n0000000000 65535 f\\n0000000010 00000 n\\n0000000053 00000 n\\n0000000102 00000 n\\ntrailer<</Size 4/Root 1 0 R>>\\nstartxref\\n149\\n%%EOF";
    const blob = new Blob([content], { type: 'application/pdf' });
    const file = new File([blob], 'test_recetario.pdf', { type: 'application/pdf', lastModified: Date.now() });

    const dt = new DataTransfer();
    dt.items.add(file);

    // Fire dragenter, dragover, drop
    ['dragenter', 'dragover', 'drop'].forEach(type => {
        const evt = new DragEvent(type, {
            bubbles: true,
            cancelable: true,
            dataTransfer: dt,
            view: window
        });
        main.dispatchEvent(evt);
    });

    return JSON.stringify({
        dispatched: true,
        dialogs: Array.from(document.querySelectorAll('[role="dialog"], [data-animate-modal-popup="true"]')).map(d => d.innerText.substring(0, 100))
    });
})()
"""
print(run_js(js))
