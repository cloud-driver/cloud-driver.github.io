from pathlib import Path

folder = Path(".")
html_files = sorted([
    file for file in folder.glob("*.html")
    if file.name != "index.html"
])

links = "\n".join(
    f'<a class="card" href="{file.name}">{file.stem}</a>'
    for file in html_files
)

html = f"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HTML 檔案列表</title>
  <style>
    body {{
      font-family: Arial, "Noto Sans TC", sans-serif;
      background: #f5f5f5;
      margin: 0;
      padding: 40px;
    }}

    h1 {{
      text-align: center;
      margin-bottom: 30px;
    }}

    .container {{
      max-width: 800px;
      margin: 0 auto;
      display: grid;
      gap: 16px;
    }}

    .card {{
      display: block;
      padding: 18px 22px;
      background: white;
      color: #222;
      text-decoration: none;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: 0.2s;
    }}

    .card:hover {{
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.12);
      color: #0066cc;
    }}

    .empty {{
      text-align: center;
      color: #777;
    }}
  </style>
</head>
<body>
  <h1>HTML 檔案列表</h1>

  <div class="container">
    {links if links else '<p class="empty">目前沒有其他 HTML 檔案</p>'}
  </div>
</body>
</html>
"""

Path("index.html").write_text(html, encoding="utf-8")

print("index.html 已產生完成")