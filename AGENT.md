# Codex Agent 任務說明｜煙島元帥 FAQ 畫面

**目標**  
將 `public/faq.html` + `public/style.css` + `app.js` 完全符合下圖版型（iPhone 14，390 × 844）。

> （可選）若有 PNG／Figma 圖檔，放至 `/design/faq_design.png` 供參考。

---

## 專案結構（重點）

public/
faq.html # FAQ 頁面 HTML
style.css # 樣式
FAQphoto/
searchIcon.png
app.js # FAQ 展開 / 搜尋功能
issues.txt # Codex 任務清單

yaml
複製
編輯

---

## 目前進度

| 編號 | 任務            | 狀態 | 備註 |
|------|-----------------|------|------|
| #1   | 漢堡 icon 調整   | ✅   | 第 3 條線 2/3 長 |
| #2   | Logo 區域對位    | ✅   | 放大置中 |
| #3   | 常見問題標題對位 | 🔜   | 與 logo 重疊，需下移 |
| #4   | 搜尋框顯示與功能 | 🔜   | 位置 + 樣式 + JS |
| #5   | 分類按鈕對齊    | 🔜   | 左右留白 20 px |
| #6   | Profile icon 對位| 🔜   | 仍須靠右 20 px |

> **交辦方法**  
> 每次只貼一句：「請完成 `issues.txt` #N」。等 Codex 回傳 diff → Review → Merge → 下一項。
