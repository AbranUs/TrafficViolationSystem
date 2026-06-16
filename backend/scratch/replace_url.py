import os

def main():
    pages_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "src", "pages")
    files = [
        "UploadVideo.jsx",
        "Report.jsx",
        "Login.jsx",
        "InfractionHistory.jsx",
        "DashboardStats.jsx",
        "CitizenSearch.jsx",
        "CamerasRegistry.jsx",
        "AuditControl.jsx"
    ]
    
    for filename in files:
        filepath = os.path.join(pages_dir, filename)
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            continue
            
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        old_str = "const BACKEND_URL = 'http://localhost:8000'"
        new_str = "const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'"
        
        if old_str in content:
            updated_content = content.replace(old_str, new_str)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(updated_content)
            print(f"Updated: {filename}")
        else:
            print(f"Target string not found in: {filename}")

if __name__ == "__main__":
    main()
