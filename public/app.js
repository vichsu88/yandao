/* ====================== 基本設定 ====================== */
const catEl = document.getElementById('category-bar');
const faqEl = document.getElementById('faq-list');
let allData = [];

/* ====================== 載入 FAQ 資料 ====================== */
fetch('FAQ_Content.json')
  .then(res => res.json())
  .then(data => {
    allData = data;
    const cats = [];
    data.forEach(item => {
      if (!cats.includes(item.category)) cats.push(item.category);
    });
    buildCategoryBar(cats);
    changeCategory(cats[0]); // 預設載入第一個
  })
  .catch(err => {
    console.error('Failed to load FAQ data:', err);
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

  const list = allData.filter(item => item.category === cat);
  renderFaq(list);
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
