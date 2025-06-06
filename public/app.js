/* ====================== FAQ 渲染 & 搜尋 功能 ====================== */
const faqEl = document.getElementById('faq-list');
let allFaqsAll = [];
let currentCategoryFaqs = [];
const categoryCache = {};

/* ===== 分類按鈕 ===== */
const categoryBar = document.getElementById('category-bar');

async function loadCategories() {
  try {
    const res = await axios.get('/api/faq/categories');
    const categories = res.data;
    categoryBar.innerHTML = '';

    if (Array.isArray(categories) && categories.length > 0) {
      categories.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = cat;
        btn.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
        if (index === 0) btn.classList.add('active');

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
      loadFaqByCategory(categories[0]);   // 預設載入第一個分類
    } else {
      renderFaq([]);
      currentCategoryFaqs = [];
    }

    // 取得全部 FAQ 供跨分類搜尋
    try {
      const allRes = await axios.get('/api/faq');
      allFaqsAll = allRes.data;
    } catch {
      allFaqsAll = [];
    }
  } catch (err) {
    console.error('載入分類失敗', err);
    renderFaq([]);
    currentCategoryFaqs = [];
    allFaqsAll = [];
  }
}

function loadFaqByCategory(catName) {
  if (categoryCache[catName]) {
    currentCategoryFaqs = categoryCache[catName];
    renderFaq(currentCategoryFaqs);
    return;
  }
  axios.get(`/api/faq?category=${encodeURIComponent(catName)}`)
    .then(resp => {
      categoryCache[catName] = resp.data;
      currentCategoryFaqs = resp.data;
      renderFaq(resp.data);
    })
    .catch(err => {
      console.error(`載入分類 ${catName} 失敗`, err);
      currentCategoryFaqs = [];
      renderFaq([]);
    });
}

/* ===== 產生 FAQ 卡片 ===== */
function renderFaq(list) {
  faqEl.innerHTML = '';
  if (!Array.isArray(list) || list.length === 0) {
    const empty = document.createElement('div');
    empty.textContent = '找不到相關問題';
    empty.style = 'text-align:center; margin:2rem 0; color:#999;';
    faqEl.appendChild(empty);
    return;
  }

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'faq-card';

    const qWrap = document.createElement('div');
    qWrap.className = 'question';
    const qText = document.createElement('span');
    qText.textContent = `Q: ${item.question}`;
    const toggle = document.createElement('span');
    toggle.className = 'toggle';
    toggle.textContent = '＋';
    qWrap.append(qText, toggle);
    qWrap.onclick = () => {
      const open = card.classList.toggle('open');
      qWrap.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    qWrap.setAttribute('role', 'button');
    qWrap.setAttribute('aria-expanded', 'false');
    card.appendChild(qWrap);

    const a = document.createElement('div');
    a.className = 'answer';
    a.textContent = item.answer || '';

    if (Array.isArray(item.link) && item.link.length) {
      const linkGroup = document.createElement('div');
      item.link.forEach(l => {
        if (!l || !l.text || !l.url) return;
        const linkNode = document.createElement('a');
        linkNode.href = l.url;
        linkNode.target = '_blank';
        linkNode.rel = 'noopener';
        linkNode.textContent = l.text;
        linkNode.className = 'link-btn';
        linkGroup.appendChild(linkNode);
      });
      a.appendChild(linkGroup);
    }

    card.appendChild(a);
    faqEl.appendChild(card);
  });
}

/* ===== TOP 滾動 ===== */
document.getElementById('to-top').addEventListener('click', e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== 搜尋（跨分類）===== */
const searchInput = document.getElementById('searchInput');
let timer = null;
searchInput.addEventListener('input', e => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const kw = e.target.value.trim().toLowerCase();
    if (!kw) {
      renderFaq(currentCategoryFaqs);
      return;
    }
    const filtered = allFaqsAll.filter(f => {
      const inQ = f.question?.toLowerCase().includes(kw);
      const inTags = Array.isArray(f.tags) && f.tags.some(t => t.toLowerCase().includes(kw));
      return inQ || inTags;
    });
    renderFaq(filtered);
  }, 300);
});

loadCategories();
