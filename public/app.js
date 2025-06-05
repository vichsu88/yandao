/* ====================== FAQ 渲染 & 搜尋 功能 ====================== */
const faqEl = document.getElementById('faq-list');

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

    // 真正串後端時，可以啟用下面這段，並把 demo 範例註解掉：
    /*
    axios
      .get(`/api/faq?category=${encodeURIComponent(cat)}`)
      .then(r => renderFaq(r.data))
      .catch(() => renderFaq([]));
    */

    // Demo：使用假資料，顯示「【分類】範例問題」
    const fake = [{
      question: `【${cat}】範例問題？`,
      answer: `${cat} 範例答案：\n- Step 1\n- Step 2`,
      link: [],
      'link-string': [],
      ansphoto: ''
    }];
    renderFaq(fake);
  });
});

// 首次載入，強制觸發第一顆 active（中承府）
document.querySelector('.category-btn.active')?.click();

/* －－－－－－ TOP 平滑滾動 －－－－－－ */
document.getElementById('to-top').addEventListener('click', e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* －－－－－－ 搜尋框 (Client-side Demo 搜尋) －－－－－－ */
const demoFaqs = [
  { q: "請問收驚要準備什麼？", a: "示範：記得穿衣服穿衣服穿衣服...", tags: ["收驚", "準備", "供品"] },
  { q: "手工香可以宅配嗎？", a: "示範回答：可以透過宅配到府。", tags: ["手工香", "宅配"] },
  { q: "問事服務內容有哪些？", a: "示範：問事可幫你解決各種疑難雜症。", tags: ["問事", "服務"] }
];
const listEl = document.getElementById("faq-list");

function renderSearch(data) {
  listEl.innerHTML = '';
  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'faq-card';
    const q = document.createElement('div');
    q.className = 'question';
    q.innerHTML = `<span>Q: ${item.q}</span><span class="toggle">＋</span>`;
    q.onclick = () => card.classList.toggle('open');
    const a = document.createElement('div');
    a.className = 'answer';
    a.textContent = item.a;
    card.appendChild(q);
    card.appendChild(a);
    listEl.appendChild(card);
  });
}

document.getElementById("searchInput").addEventListener("input", e => {
  const kw = e.target.value.trim();
  if (!kw) {
    renderSearch(demoFaqs);
    return;
  }
  const filtered = demoFaqs.filter(f =>
    f.tags.some(t => t.includes(kw)) || f.q.includes(kw)
  );
  renderSearch(filtered);
});
// 首次載入顯示所有 Demo
renderSearch(demoFaqs);
