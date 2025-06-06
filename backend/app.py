import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# ▼ 靜態檔路徑：指向「上層的 public 資料夾」
app = Flask(__name__, static_folder='../public', static_url_path='')
CORS(app)

# === MongoDB 連線設定 ===
mongo_user = "yuanshuai260"
mongo_pwd  = "yandaoyuanshuai"
mongo_host = "yandaocluster.k1dgdxx.mongodb.net"
uri = (
    f"mongodb+srv://{mongo_user}:{mongo_pwd}@"
    f"{mongo_host}/"
    f"?retryWrites=true&w=majority&appName=yandaoCluster"
)
client = MongoClient(uri, server_api=ServerApi('1'))
try:
    client.admin.command('ping')
    print("Pinged your Atlas cluster. 連線成功！")
except Exception as e:
    print("Ping 失敗：", e)

db  = client['yandao']
col = db['FAQ']

# === API ===
@app.route('/api/faq/categories')
def categories():
    tops = list(col.find({'is_top': True}).distinct('category'))
    rest = [c for c in col.distinct('category') if c not in tops]
    return jsonify(tops + rest)

@app.route('/api/faq')
def faq():
    cat = request.args.get('category')
    q = {'category': cat} if cat else {}
    docs = list(col.find(q, {'_id': 0}))
    return jsonify(docs)

# === 首頁（回傳 FAQ 頁面）===
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'faq.html')

if __name__ == '__main__':
    # ▼ Render 會自動給 PORT；本機沒設時預設 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
