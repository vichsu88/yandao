from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='../public', static_url_path='')
CORS(app)  # 允許跨域

# === MongoDB 連線 ===
# backend/app.py（取代原先 “MongoClient(MONGO_URI)” 的部分）
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# ---------- 連線設定（直接把 Atlas 帳號/密碼寫在這裡） ----------
mongo_user = "yuanshuai260"
mongo_pwd  = "yandaoyuanshuai"
mongo_host = "yandaocluster.k1dgdxx.mongodb.net"

uri = (
    f"mongodb+srv://{mongo_user}:{mongo_pwd}@"
    f"{mongo_host}/"
    f"?retryWrites=true&w=majority&appName=yandaoCluster"
)

client = MongoClient(uri, server_api=ServerApi('1'))

# ---------- Ping 測試，確認連線是否成功 ----------
try:
    client.admin.command('ping')
    print("Pinged your Atlas cluster. 連線成功！")
except Exception as e:
    print("Ping 失敗，錯誤訊息：", e)

# ---------- 指定使用的資料庫與 Collection ----------
db  = client['temple_db']
col = db['faq']

# ===== API =====
@app.route('/api/faq/categories')
def categories():
    tops = list(col.find({'is_top':True}).distinct('category'))
    rest = [c for c in col.distinct('category') if c not in tops]
    return jsonify(tops + rest)

@app.route('/api/faq')
def faq():
    cat = request.args.get('category')
    q = {'category': cat} if cat else {}
    docs = list(col.find(q, {'_id':0}))   # 去掉 _id
    return jsonify(docs)

# ===== 前端靜態檔 (方便開發) =====
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'faq.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
