# Waterfull - 圖片浮水印工具

Waterfull 是一個使用 Cloudflare Workers 靜態託管的圖片浮水印工具。圖片處理在瀏覽器 Canvas 完成，不需要常駐後端，也不會有 Render 免費方案的休眠問題。

## 本機開發

```powershell
cd D:\waterfull
npm install
npm run dev
```

開啟 Wrangler 顯示的本機網址，通常是 `http://localhost:8787`。

## 部署到 Cloudflare Workers

第一次使用需要先登入 Cloudflare：

```powershell
npx wrangler login
```

部署：

```powershell
npm run deploy
```

`wrangler.jsonc` 會將 `public/` 設為靜態資產，`worker.js` 負責提供這些檔案。浮水印輸出使用原始圖片解析度，支援文字、圖片、位置、透明度、縮放與旋轉。

## 自訂網域

部署完成後，在 Cloudflare Workers 的網域設定中，將 `smartkitbox.com` 和 `www.smartkitbox.com` 綁定到 `waterfull` Worker。

## 注意事項

- 圖片不會上傳到伺服器，會在使用者瀏覽器本機處理。
- 最終文字字型由使用者裝置和瀏覽器提供，CJK 字型會使用系統 fallback。
- 正式使用前仍應設定檔案大小限制，避免瀏覽器因超大圖片耗用過多記憶體。
