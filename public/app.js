/* ====================== FAQ 渲染 & 搜尋 功能 ====================== */
const faqEl = document.getElementById('faq-list');
let allFaqs = []; // 用來存放從後端抓到的所有 FAQ 資料

/* ===== －－－－－－ 動態載入分類按鈕函式 －－－－－－ ===== */
const categoryBar = document.getElementById('category-bar');

// 1. 取得分類清單，並且動態產生按鈕、綁定事件
async function loadCategories() {
  try {
    // 從後端拿所有分類（array of strings）
    const res = await axios.get('/api/faq/categories');
    const categories = res.data; // 比如 ["中承府","問事","收驚","手工香"]

    // 先把原本 <nav> 裡的一切清空
    categoryBar.innerHTML = '';

    // 有取得分類才做事
    if (Array.isArray(categories) && categories.length > 0) {
      categories.forEach((cat, index) => {
        // 2. 為每個分類建立一個 <button>
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = cat;

        // 第一個分類預設加 .active
        if (index === 0) {
          btn.classList.add('active');
        }

        // 3. 綁定點擊事件：點後端抓該分類的 FAQ、並且切換 active 樣式
        btn.addEventListener('click', () => {
          // 切換按鈕樣式：先把所有 .category-btn 都移除 active
          document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          // 用這個分類名稱去後端請求對應的 FAQ
          axios
            .get(`/api/faq?category=${encodeURIComponent(cat)}`)
            .then(resp => {
              renderFaq(resp.data);
              allFaqs = resp.data;
            })
            .catch(() => {
              renderFaq([]);
              allFaqs = [];
            });
        });

        // 把按鈕加到 <nav id="category-bar">
        categoryBar.appendChild(btn);
      });

      // 4. 預設畫面：先去抓第一個分類的 FAQ
      const defaultCat = categories[0];
      axios
        .get(`/api/faq?category=${encodeURIComponent(defaultCat)}`)
        .then(resp => {
          renderFaq(resp.data);
          allFaqs = resp.data;
        })
        .catch(() => {
          renderFaq([]);
          allFaqs = [];
        });
    } else {
      // 如果根本沒分類，就清空 FAQ
      renderFaq([]);
    }

  } catch (err) {
    console.error('載入分類失敗', err);
    renderFaq([]);
  }
}

/* 產生 FAQ 卡片的函式 */
function renderFaq(list) {
  faqEl.innerHTML = ''; // 清空

  if (!Array.isArray(list) || list.length === 0) {
    const empty = document.createElement('div');
    empty.textContent = '找不到相關問題';
    empty.style = 'text-align:center; margin:2rem 0; color:#999;';
    faqEl.appendChild(empty);
    return;
  }

  list.forEach(item => {
    // 外層卡片
    const card = document.createElement('div');
    card.className = 'faq-card';

    // 問題列
    const q = document.createElement('div');
    q.className = 'question';
    q.innerHTML = `<span>Q: ${item.question}</span><span class="toggle">＋</span>`;
    q.onclick = () => {
      card.classList.toggle('open');
    };
    card.appendChild(q);

    // 答案列
    const a = document.createElement('div');
    a.className = 'answer';
    a.textContent = item.answer || '';

    // 參考連結 (如果有陣列 item.link)
    if (Array.isArray(item.link) && item.link.length > 0) {
      const links = document.createElement('div');
      links.style.marginTop = '.6rem';
      item.link.forEach((url, idx) => {
        if (!url) return;
        const l = document.createElement('a');
        l.href = url;
        l.target = '_blank';
        l.rel = 'noopener';
        l.textContent = Array.isArray(item['link-string'])
          ? (item['link-string'][idx] || `參考 ${idx + 1}`)
          : `參考 ${idx + 1}`;
        l.style.display = 'block';
        links.appendChild(l);
      });
      a.appendChild(links);
    }

    // 圖片 (如果有 ansphoto 字串)
    if (typeof item.ansphoto === 'string' && item.ansphoto.trim()) {
      item.ansphoto.split(',').forEach(p => {
        const src = p.trim();
        if (!src) return;
        const img = document.createElement('img');
        img.src = `FAQphoto/${src}`;
        img.style = 'max-width:100%; margin-top:.6rem; border-radius:6px;';
        a.appendChild(img);
      });
    }

    card.appendChild(a);
    faqEl.appendChild(card);
  });
}


/* －－－－－－ TOP 平滑滾動 －－－－－－ */
document.getElementById('to-top').addEventListener('click', e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* －－－－－－ 搜尋框 (Client-side 搜尋 on allFaqs) －－－－－－ */
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", e => {
  const kw = e.target.value.trim();
  if (!kw) {
    // 如果搜尋欄為空，就清空 FAQ 列表
    faqEl.innerHTML = '';
    return;
  }
  // 篩選 allFaqs：只要 question 或 tags 其中一個包含關鍵字，就顯示
  const filtered = allFaqs.filter(f =>
    (Array.isArray(f.tags) && f.tags.some(t => t.includes(kw))) ||
    (f.question && f.question.includes(kw))
  );
  renderFaq(filtered);
});

// －－－－－－ 頁面載入後先取得分類與 FAQ
loadCategories();
