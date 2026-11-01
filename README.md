# 🏝️ 學不完知識島｜V3.1 RWD + PWA

「學不完．教不停．用不盡」部落格的互動式 3D 文章探索網站，含 **334 篇文章、六大主題館、規則式智慧推薦、六條學習路徑、RWD 與 PWA**。

原始部落格：https://vocus.cc/salon/isvincent

## 專案結構

```text
/
├── index.html                 # 首頁：3D 與響應式介面
├── manifest.webmanifest       # PWA 名稱、圖示、安裝設定
├── sw.js                      # Service Worker 離線快取
├── .nojekyll                  # GitHub Pages 不經 Jekyll 處理
├── README.md                  # 本說明
├── assets/
│   └── icons/
│       ├── icon-192.png       # PWA 小圖示
│       └── icon-512.png       # PWA 大圖示
├── data/
│   └── articles.json          # 334 篇文章（含 URL、館別、標籤）
└── src/
    ├── main.js               # Three.js 場景、文章列表、收藏
    ├── smart.js              # 規則式推薦與學習路徑、JSON 驗證
    └── pwa.js                # SW 註冊及可用時的安裝按鈕
```

## 在本機測試

先安裝 Python 3，於專案根目錄執行：

```bash
python -m http.server 8000
```

瀏覽 http://localhost:8000/ ，不要雙擊 `index.html`，避免瀏覽器阻擋 JSON 請求。PWA 在 `localhost` 或 HTTPS 下才能正常使用。

## 上傳 GitHub 並部署 GitHub Pages

1. 在 GitHub 建立公開儲存庫，例如 `knowledge-island`。
2. **上傳專案根目錄內所有檔案和子資料夾**，確保 `index.html` 位於儲存庫根目錄，保留 `.nojekyll`。不要只上傳 ZIP。
3. 開啟 **Settings → Pages → Build and deployment**，Source 選 `Deploy from a branch`，Branch 選 `main`，Folder 選 `/ (root)`，儲存。
4. 公開網址通常是 `https://<使用者名稱>.github.io/knowledge-island/`。專案使用相對路徑，因此不需要手動修改程式內的根路徑。
5. 使用 HTTPS 網址檢查 334 篇文章、六館導覽、智慧探索、手機排版，並於支援的瀏覽器測試「安裝 App」。

若使用 Git 命令：

```bash
git init
git add .
git commit -m "Release knowledge island V3.1 PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/knowledge-island.git
git push -u origin main
```

請將 `YOUR_USERNAME` 換成你的 GitHub 使用者名稱。

## PWA 行為與限制

- `manifest.webmanifest` 設定獨立視窗顯示、繁體中文與 192/512 圖示。
- `sw.js` 預先快取同網域的首頁、程式、文章索引、圖示；成功載入一次後，可離線查閱文章標題、搜尋及本機規則式推薦。
- 3D 場景依賴外部 Three.js CDN。**離線時不保證 3D 可用**，但載入失敗會顯示 2D 主題館備援。
- 「閱讀原文」連至外部方格子，離線時**無法閱讀原始文章內文**。
- PWA 安裝按鈕僅在瀏覽器提供安裝事件時出現；iOS Safari 通常需用分享選單的「加入主畫面」。
- Service Worker 更新需要重新整理，已開啟的舊分頁可能使用舊版快取。
- 未提供伺服器端帳號登入、跨裝置同步或真正 LLM 問答；收藏存在目前瀏覽器 localStorage。

## 更新文章

直接更新 `data/articles.json` 並重新提交至 GitHub。主要欄位：`id`（正整數）、`title`（文章名稱）、`url`（方格子文章連結）、`zone`（六館其一）、`tags`（字串陣列）。「智慧探索 → 資料維護」能匯入 JSON 做預覽與驗證；匯入不會直接修改 GitHub 檔案。

更新資料時，若安裝版仍顯示舊資料，請重新開啟網站並連線更新快取。

## 功能驗收清單

- [ ] 桌機 / 平板 / 手機可以正常排版、操作選單
- [ ] 六座建築可點擊，鏡頭可旋轉縮放
- [ ] 334 篇文章清單與六館分類正確
- [ ] 搜尋、分類、收藏與文章外連運作
- [ ] 智慧推薦與六條學習路徑運作
- [ ] HTTPS 環境可註冊 Service Worker
- [ ] 安裝圖示及獨立視窗正常
- [ ] 首次在線載入後，離線模式仍可使用文章索引與 2D 備援

## 注意

建議先在測試用 GitHub Pages 網址驗收所有功能，再正式對外公開。依瀏覽器和裝置不同，PWA 安裝流程與 3D 效能會有差異。
