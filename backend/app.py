from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__, static_folder='../public', static_url_path='')
CORS(app)  # 允許跨域

# === MongoDB 連線 ===
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URI)
db  = client['temple_db']
col = db['faq']             # Collection 名稱：faq

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
