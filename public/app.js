/* ====================== FAQ 渲染 & 搜尋 功能 ====================== */
const faqEl = document.getElementById('faq-list');
let allFaqsAll = [];             // 用來存放「所有分類」的 FAQ，供跨分類搜尋
let currentCategoryFaqs = [];     // 用來存放「目前選定分類」的 FAQ
const categoryCache = {};         // 快取各分類抓取結果，避免重複 API 請求

/* ===== －－－－－－ 動態載入分類按鈕函式 －－－－－－ ===== */
const categoryBar = document.getElementById('category-bar');

async function loadCategories() {
  try {
    // 1. 向後端拿所有分類
    const res = await axios.get('/api/faq/categories');
    const categories = res.data;  // e.g. ["中承府","問事","收驚","手工香"]

    // 清空 <nav> 裡的內容
    categoryBar.innerHTML = '';

    if (Array.isArray(categories) && categories.length > 0) {
      categories.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = cat;
        btn.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');

        // 第一個分類預設為 active
        if (index === 0) {
          btn.classList.add('active');
        }

        // 綁定點擊事件：切換標籤並載入該分類的 FAQ
        btn.addEventListener('click', () => {
          document.querySelectorAll('.category-btn').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('active');
          btn.setAttribute('aria-pressed', 'true');
          loadFaqByCategory(cat);
        });

        categoryBar.appendChild(btn);
      });

      // 4. 預設載入「第一個分類」的 FAQ
      loadFaqByCategory(categories[0]);
    } else {
      // 如果根本沒分類，就顯示空畫面
      renderFaq([]);
      currentCategoryFaqs = [];
    }

    // 5. 再去拿一次「全部」的 FAQ，存到 allFaqsAll（用於跨分類搜尋）
    try {
      const allRes = await axios.get('/api/faq');
      allFaqsAll = allRes.data;
    } catch (errAll) {
      console.error('載入所有 FAQ 失敗', errAll);
      allFaqsAll = [];
    }
  } catch (err) {
    console.error('載入分類失敗', err);
    renderFaq([]);
    currentCategoryFaqs = [];
    allFaqsAll = [];
  }
}

// 依據「某個分類名稱」載該分類的 FAQ
function loadFaqByCategory(categoryName) {
  // 如果快取裡已經有，就直接用快取
  if (categoryCache[categoryName]) {
    currentCategoryFaqs = categoryCache[categoryName];
    renderFaq(currentCategoryFaqs);
    return;
  }

  axios
    .get(`/api/faq?category=${encodeURIComponent(categoryName)}`)
    .then(resp => {
      const faqs = resp.data;
      categoryCache[categoryName] = faqs;  // 快取
      currentCategoryFaqs = faqs;
      renderFaq(faqs);
    })
    .catch(err => {
      console.error(`載入分類 ${categoryName} 的 FAQ 失敗`, err);
      currentCategoryFaqs = [];
      renderFaq([]);
    });
}

/* ===== －－－－－－ 產生 FAQ 卡片 & 渲染 －－－－－－ ===== */
function renderFaq(list) {
  faqEl.innerHTML = ''; // 先清空

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

    // ─── 問題列（用 textContent 以防 XSS） ───
    const qWrap = document.createElement('div');
    qWrap.className = 'question';
    const qText = document.createElement('span');
    qText.textContent = `Q: ${item.question}`;
    const toggle = document.createElement('span');
    toggle.className = 'toggle';
    toggle.textContent = '＋';
    qWrap.append(qText, toggle);
    qWrap.onclick = () => {
      const isOpen = card.classList.toggle('open');
      // 這裡如果要無障礙進階，可加上 aria-expanded:
      qWrap.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };
    qWrap.setAttribute('role', 'button');
    qWrap.setAttribute('aria-expanded', 'false');
    card.appendChild(qWrap);

    // ─── 答案列 ───
    const a = document.createElement('div');
    a.className = 'answer';
    a.textContent = item.answer || '';

    // ─── 參考連結 (如果有陣列 item.link，且裡面每個元素都有 text 與 url) ───
    if (Array.isArray(item.link) && item.link.length > 0) {
      const linksContainer = document.createElement('div');
      linksContainer.className = 'link-group';

      item.link.forEach(linkObj => {
        if (!linkObj || !linkObj.url || !linkObj.text) return;
        const l = document.createElement('a');
        l.href = linkObj.url;
        l.target = '_blank';
        l.rel = 'noopener';
        l.textContent = linkObj.text;
        l.className = 'link-btn';
        linksContainer.appendChild(l);
      });

      a.appendChild(linksContainer);
    }

    // 圖片部分已移除

    card.appendChild(a);
    faqEl.appendChild(card);
  });
}

/* ===== －－－－－－ TOP 平滑滾動 －－－－－－ ===== */
document.getElementById('to-top').addEventListener('click', e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== －－－－－－ 搜尋框 (Client-side 跨分類搜尋, 加 Debounce) －－－－－－ ===== */
const searchInput = document.getElementById("searchInput");
let debounceTimer = null;
searchInput.addEventListener("input", e => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const kw = e.target.value.trim().toLowerCase();
    if (!kw) {
      // 如果搜尋欄為空，回復「顯示目前分類的所有問答」
      renderFaq(currentCategoryFaqs);
      return;
    }
    // 篩選 allFaqsAll：question 或 tags 包含關鍵字
    const filtered = allFaqsAll.filter(f => {
      const inQuestion = f.question && f.question.toLowerCase().includes(kw);
      const inTags = Array.isArray(f.tags) && f.tags.some(t => t.toLowerCase().includes(kw));
      return inQuestion || inTags;
    });
    renderFaq(filtered);
  }, 300); // 300ms debounce
});

// 頁面載入後，先取得分類按鈕與 FAQ
loadCategories();
