/* ====================== 基本設定 ====================== */
const BASE = '/api/faq';        // 後端 Flask 端點（同網域可用相對路徑）
const catEl = document.getElementById('category-bar');
const faqEl = document.getElementById('faq-list');

/* ---- 若後端、DB 都還沒接通時的假資料 ---- */
const DUMMY_CATS  = ['中承府','問事','收驚','手工香'];
const DUMMY_FAQ   = cat => [{
  category:cat,
  question:`${cat} 範例問題？`,
  answer:`${cat} 範例答案：\n- Step 1\n- Step 2`,
  link:[], pics:''
}];

/* ====================== 取得類別 ====================== */
axios.get(`${BASE}/categories`)
  .then(res=>{
    const cats = res.data.length ? res.data : DUMMY_CATS;
    buildCategoryBar(cats);
    changeCategory(cats[0]);             // 預設載入第一個
  })
  .catch(()=>{
    buildCategoryBar(DUMMY_CATS);
    changeCategory(DUMMY_CATS[0]);
  });

/* ------------------ 建立分類按鈕 ------------------ */
function buildCategoryBar(cats){
  catEl.innerHTML='';
  cats.forEach(c=>{
    const btn=document.createElement('button');
    btn.className='category-btn';
    btn.textContent=c; btn.dataset.cat=c;
    btn.onclick=()=>changeCategory(c);
    catEl.appendChild(btn);
  });
}

/* ------------------ 切換分類 ------------------ */
function changeCategory(cat){
  document.querySelectorAll('.category-btn')
    .forEach(b=>b.classList.toggle('active',b.dataset.cat===cat));

  axios.get(`${BASE}?category=${encodeURIComponent(cat)}`)
    .then(r=>{
      const list = r.data.length ? r.data : DUMMY_FAQ(cat);
      renderFaq(list);
    })
    .catch(()=>renderFaq(DUMMY_FAQ(cat)));
}

/* ------------------ FAQ 畫面 ------------------ */
function renderFaq(list){
  faqEl.innerHTML='';
  list.forEach(item=>{
    /* 卡片外層 */
    const card=document.createElement('div');
    card.className='faq-card';                // ★ 新 class

    /* 問題列 */
    const q=document.createElement('div');
    q.className='question';
    q.innerHTML=`<span>Q: ${item.question}</span><span class="toggle">＋</span>`;
    q.onclick=()=>card.classList.toggle('open');
    card.appendChild(q);

    /* 答案列 */
    const a=document.createElement('div');
    a.className='answer';
    a.textContent=item.answer;

    /* 參考連結（有才顯示） */
    if(item.link?.length){
      const links=document.createElement('div');
      links.style.marginTop='.6rem';
      item.link.forEach((url,i)=>{
        const l=document.createElement('a');
        l.href=url; l.target='_blank'; l.rel='noopener';
        l.textContent=item['link-string']?.[i] || `參考 ${i+1}`;
        l.style.display='block';
        links.appendChild(l);
      });
      a.appendChild(links);
    }

    /* 圖片（有才顯示） */
    if(item.pics){
      item.pics.split(',').forEach(p=>{
        if(!p.trim()) return;
        const img=document.createElement('img');
        img.src=p.trim();
        img.style='max-width:100%;margin-top:.6rem';
        a.appendChild(img);
      });
    }

    card.appendChild(a);
    faqEl.appendChild(card);
  });
}

/* ------------------ TOP 平滑滾動 ------------------ */
document.getElementById('to-top').onclick=e=>{
  e.preventDefault();
  window.scrollTo({top:0,behavior:'smooth'});
};

/* ------------------ FAQ 搜尋 ------------------ */
const faqs=[
  {q:"請問收驚要準備什麼？",a:"...",tags:["收驚","準備","供品"]},
  {q:"手工香可以宅配嗎？",a:"...",tags:["手工香","宅配"]},
];
const listEl=document.querySelector("#faq-list");
function render(data){
  listEl.innerHTML='';
  data.forEach(item=>{
    const card=document.createElement('div');
    card.className='faq-card';
    const q=document.createElement('div');
    q.className='question';
    q.innerHTML=`<span>Q: ${item.q}</span><span class="toggle">＋</span>`;
    q.onclick=()=>card.classList.toggle('open');
    const a=document.createElement('div');
    a.className='answer';
    a.textContent=item.a;
    card.appendChild(q);
    card.appendChild(a);
    listEl.appendChild(card);
  });
}
document.getElementById("searchInput").addEventListener("input",e=>{
  const kw=e.target.value.trim();
  if(!kw){render(faqs);return;}
  const filtered=faqs.filter(f=>f.tags.some(t=>t.includes(kw)));
  render(filtered);
});
render(faqs);
