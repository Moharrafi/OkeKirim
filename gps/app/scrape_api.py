import requests
import re
from urllib.parse import urljoin

base_url = "https://hosting.glonasssoft.ru"
html = requests.get(base_url, timeout=10).text

js_files = re.findall(r'src="([^"]+\.js)"', html)

for js in js_files:
    js_url = urljoin(base_url, js)
    if 'build-vendors' in js or 'runtime' in js or 'config' in js: continue
    print("Scanning", js_url)
    try:
        content = requests.get(js_url, timeout=10).text
        # Find string literals containing api
        strings = re.findall(r'\"([a-zA-Z0-9_/\-]*api[a-zA-Z0-9_/\-]*)\"', content)
        strings += re.findall(r'\'([a-zA-Z0-9_/\-]*api[a-zA-Z0-9_/\-]*)\'', content)
        # Find string literals containing report
        strings += re.findall(r'\"([a-zA-Z0-9_/\-]*report[a-zA-Z0-9_/\-]*)\"', content)
        
        # also search for messages
        strings += re.findall(r'\"([a-zA-Z0-9_/\-]*messages[a-zA-Z0-9_/\-]*)\"', content)
        strings += re.findall(r'\'([a-zA-Z0-9_/\-]*messages[a-zA-Z0-9_/\-]*)\'', content)
        
        # also search for trips
        strings += re.findall(r'\"([a-zA-Z0-9_/\-]*trips[a-zA-Z0-9_/\-]*)\"', content)
        
        print("Found:", sorted(list(set(strings))))
    except Exception as e:
        print("Failed to download", js_url, e)
