# 鄭宸翔｜資訊工程轉學作品集網站

這是一個純靜態網站，不需要安裝 Node.js 或後端。

## 使用方式

1. 解壓縮 `ntut-portfolio-website.zip`
2. 直接打開 `index.html` 即可瀏覽
3. 若要上傳 GitHub Pages / Cloudflare Pages / Netlify，直接上傳整個資料夾

## 建議部署

- GitHub Pages：把資料夾內容推到 repo，Settings → Pages → Deploy from branch
- Cloudflare Pages：連接 GitHub repo，Build command 留空，Output directory 留空或 `/`
- Netlify：直接拖曳整個資料夾

## 網站重點

- `review.html`：評審快速模式，建議放在 PDF 或報名備註中
- `projects/gripmind.html`：主打工程作品之一
- `projects/justus-oj.html`：主打工程作品之一
- `projects/silent-disaster-zone.html`：主打工程作品之一
- `assets/docs/transfer-portfolio.pdf`：完整備審 PDF

## 修改提醒

若要避免網站檔案太大，可以刪除 `assets/docs/transfer-portfolio.pdf`，並把網站中的 PDF 連結改成雲端硬碟連結。
