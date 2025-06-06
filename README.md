# 煙島元帥 FAQ 專案

這個倉庫包含前端 FAQ 網頁以及提供資料的 Flask 後端。

```
yandao/
├─ backend/     # Flask 應用程式與需求檔
│   ├─ app.py
│   └─ requirements.txt
└─ public/      # FAQ 網站靜態檔案
    ├─ faq.html
    ├─ style.css
    ├─ app.js
    └─ FAQphoto/
```

## 本機開發
1. 建立 Python 環境並安裝依賴：
   ```bash
   pip install -r backend/requirements.txt
   ```
2. 將 MongoDB 帳號、密碼與主機設定為環境變數：
   - `MONGO_USER`
   - `MONGO_PWD`
   - `MONGO_HOST`
3. 在專案根目錄執行：
   ```bash
   python backend/app.py
   ```
   預設會在 `http://127.0.0.1:5000/` 提供服務。

## 部署到 Render
1. 將整個 `yandao/` 資料夾推送至 GitHub。
2. 在 Render 建立新的 **Web Service**，設定：
   - **Root Directory**：`backend`
   - **Start Command**：`python app.py`（或 `gunicorn app:app`）
3. Render 會依照 `backend/requirements.txt` 安裝套件，並自動設定 `PORT` 環境變數。
4. 在 Render 的設定頁面加入與本機相同的環境變數 `MONGO_USER`、`MONGO_PWD`、`MONGO_HOST`。
5. 部署完成後，瀏覽 `https://<專案名稱>.onrender.com/` 即可看到 FAQ 網站。

相對路徑的 API 呼叫（如 `/api/faq`）會自動對應到同一個主機，不需另外指定 127.0.0.1:5000。
