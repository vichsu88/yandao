/* ====================== FAQ 渲染 & 搜尋 功能 ====================== */
const faqEl = document.getElementById('faq-list');
let allFaqs = []; // 用來存放從後端抓到的所有 FAQ 資料

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

/* －－－－－－ 分類按鈕 －－－－－－ */
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // 切換按鈕樣式
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cat = btn.textContent.trim();

    // 從後端抓該分類的 FAQ
    axios
      .get(`/api/faq?category=${encodeURIComponent(cat)}`)
      .then(r => {
        renderFaq(r.data);
      })
      .catch(() => {
        renderFaq([]); 
      });
  });
});

// 首次載入，先抓全部 FAQ 存到 allFaqs，再觸發第一個分類按鈕
function fetchAllFaqsAndInit() {
  axios
    .get('/api/faq')
    .then(r => {
      allFaqs = r.data;
      // 如果頁面有第一個 category 按鈕標記為 active，就自動觸發一次點擊
      document.querySelector('.category-btn.active')?.click();
    })
    .catch(() => {
      allFaqs = [];
      // 依然觸發 active 按鈕，畫面顯示「找不到相關問題」
      document.querySelector('.category-btn.active')?.click();
    });
}

fetchAllFaqsAndInit();

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
