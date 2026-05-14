import requests

def test_api():
    base = "https://hosting.glonasssoft.ru"
    paths = [
        "/api/v3/help",
        "/api/help",
        "/swagger/v1/swagger.json",
        "/swagger/index.html",
        "/api/swagger.json",
        "/api/docs",
        "/docs"
    ]
    
    for p in paths:
        url = f"{base}{p}"
        try:
            r = requests.get(url, timeout=5)
            print(f"[{r.status_code}] GET {p}")
            if r.status_code == 200:
                print(r.text[:200])
        except Exception as e:
            print(f"[Error] GET {p} -> {e}")

if __name__ == "__main__":
    test_api()
