# yandao Web System

本專案目標：  
1. 完成 FAQ 系統 ➜ 由前端呼叫後端 API / MongoDB 取得 FAQ 資料並渲染  
2. 後續擴充：收驚訂單管理、LINE OAuth 等（暫不實作）

## 專案架構
/backend        # Flask (API)
/public
  ├─ faq.html   # FAQ 頁面
  ├─ app.js     # 前端 JS
  └─ style.css  # 樣式
/README.md
/issues.txt     # 臨時待辦清單（見下）
/requirements.txt

## 快速啟動
git clone https://github.com/vichsu88/yandao.git
cd yandao
# 前端測試（僅靜態檔）
python3 -m http.server 8080

# ↓ 之後加：Flask + MongoDB 啟動方式