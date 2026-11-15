import {MARKUP as entryMarkup,CSS as entryCSS} from './entry-template.mjs';
import {MARKUP as ordersMarkup,CSS as ordersCSS} from './orders-template.mjs?v=9d72aa68d84e';

// Entry-only close sizing; the QR uses its original template dimensions.
const entrySizingCSS=`
.screen.variant-D.dashboard .topbar>.close svg{width:32px;height:32px}
`;

const mount=document.querySelector('#workspace');
const states=['incoming','ready','completed','refund'];
const stateNames={incoming:'準備中',ready:'準備完了',completed:'受渡済',refund:'返金・キャンセル'};
const orderViews=Object.fromEntries(states.map(state=>[state,{time:'all',page:1,query:''}]));
let orderState='incoming';
const pageSize=12;
const sampleCounts=[1,4,6,8,8,8,7,5,3,0,0,0];
let date='2026-11-14',entryView='order',host,root,observer;
const q=selector=>root.querySelector(selector);
const qa=selector=>[...root.querySelectorAll(selector)];
const pending=element=>{element.dataset.connection='pending';};
function fit(){const scale=Math.min(1,mount.clientWidth/1280);host.style.height=624*scale+'px';q('.scale').style.transform=`scale(${scale})`;}
function build(kind){
 observer?.disconnect();host=document.createElement('exops-ui-screen');host.dataset.page=kind;host.setAttribute('aria-label',kind==='entry'?'注文 入口':'注文一覧');root=host.attachShadow({mode:'open'});
 root.innerHTML=`<style>${kind==='entry'?entryCSS+entrySizingCSS:ordersCSS}
 :host{display:block;position:relative;width:100%;height:624px;overflow:hidden;font-family:"EXOPS Entry Latin","EXOPS Entry Japanese",sans-serif}
 .scale{width:1280px;height:624px;transform-origin:top left}.screen{margin:0!important}
 .state-panel[hidden],.time-tiles[hidden],.order-card[hidden]{display:none!important}
 button:focus-visible,input:focus-visible{outline:2px solid #596c7a;outline-offset:3px}
 </style><div class="scale">${kind==='entry'?entryMarkup:ordersMarkup}</div>`;
 mount.replaceChildren(host);observer=new ResizeObserver(fit);observer.observe(mount);fit();
 // Only adopted page navigation is connected; no old application routes or services.
 if(kind==='entry')wireEntry();else wireOrders();
}
function paintDate(){
 const [y,m,d]=date.split('-').map(Number),day=['日','月','火','水','木','金','土'][new Date(date+'T12:00:00Z').getUTCDay()];
 q('.date-value').innerHTML=`${y}年${m}月${d}日 <small>(${day})</small>`;q('.date').setAttribute('aria-label',`${y}年${m}月${d}日 (${day})`);
}
function setEntryTab(view,focus=false){
 entryView=view;const menu=view==='menu';qa('.page-tab').forEach((tab,i)=>{const selected=i===Number(menu);tab.classList.toggle('selected',selected);tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&focus)tab.focus();});
 const shape=q(`[data-state="entry-${menu?1:0}"]`),paint=q('.active-tab-paint');paint.setAttribute('d',shape.getAttribute('d'));if(shape.hasAttribute('transform'))paint.setAttribute('transform',shape.getAttribute('transform'));else paint.removeAttribute('transform');q('.time-tiles').hidden=menu;
}
function keyboardTabs(tabs,select){
 tabs.forEach((tab,i)=>tab.addEventListener('keydown',event=>{let next;
  if(event.key==='ArrowRight')next=(i+1)%tabs.length;if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;
  if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
  if(next!==undefined){event.preventDefault();select(next,true);}
 }));
}
function wireEntry(){
 paintDate();qa('.date-group .arrow').forEach((arrow,i)=>arrow.addEventListener('click',()=>{const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+(i?1:-1));date=d.toISOString().slice(0,10);paintDate();}));
 q('.page-tabs').setAttribute('role','tablist');q('.page-tabs').setAttribute('aria-label','注文の表示');
 const tabs=qa('.page-tab');tabs.forEach((tab,i)=>{tab.type='button';tab.setAttribute('role','tab');tab.addEventListener('click',()=>setEntryTab(i?'menu':'order'));});keyboardTabs(tabs,(i,focus)=>setEntryTab(i?'menu':'order',focus));setEntryTab(entryView);
 qa('.time-tile').forEach((tile,i)=>{tile.querySelector('.tile-number strong').textContent=sampleCounts[i];tile.setAttribute('aria-label',`${tile.querySelector('.tile-time').textContent} ${sampleCounts[i]}件のお客様一覧`);tile.addEventListener('click',()=>location.hash='orders/incoming');});
 q('.search').addEventListener('submit',e=>e.preventDefault());q('input').maxLength=64;
 for(const selector of ['.date','.qr','.manual-refresh','.close','.search-icon-button'])pending(q(selector));
}
function activateState(state,focus=false){
 if(!states.includes(state))state='incoming';
 orderState=state;
 qa('.order-state-tabs .page-tab').forEach(tab=>{const selected=tab.dataset.state===state;tab.classList.toggle('selected',selected);tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&focus)tab.focus();});
 qa('.selected-tab-paint').forEach(path=>path.setAttribute('display',path.dataset.state===state?'block':'none'));
 qa('.state-panel').forEach(panel=>panel.hidden=panel.dataset.state!==state);
 history.replaceState(null,'','#orders/'+state);
 q('#order-search').value=orderViews[state].query;
 q('#list-heading').textContent=`2-${states.indexOf(state)+1}｜注文一覧：${stateNames[state]}`;
 filterCards();
}
function filterCards(){
 const view=orderViews[orderState];
 const cards=qa(`.state-panel[data-state="${orderState}"] .order-card`);
 const matches=cards.filter(card=>(view.time==='all'||card.dataset.pickup===view.time)&&(!view.query||card.dataset.number.includes(view.query)));
 const pages=Math.max(1,Math.ceil(matches.length/pageSize));
 view.page=Math.max(1,Math.min(pages,view.page));
 const visible=new Set(matches.slice((view.page-1)*pageSize,view.page*pageSize));
 cards.forEach(card=>{card.hidden=!visible.has(card);});
 qa('.time-filter').forEach(button=>{
  const selected=button.dataset.time===view.time;
  button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));
  const count=button.dataset.time==='all'?cards.length:cards.filter(card=>card.dataset.pickup===button.dataset.time).length;
  button.querySelector('.slot-count b').textContent=count;
  button.setAttribute('aria-label',`${button.dataset.time==='all'?'すべて':button.dataset.time+'から'} ${stateNames[orderState]} ${count}件`);
 });
 q('#result-description').textContent=(view.time==='all'?'すべての受取予定時刻':`受取 ${view.time}〜`)+(view.query?` ／ #${view.query}`:'');
 q('.result-total b').textContent=matches.length;
 q('.segment-page-count b').textContent=view.page;q('.segment-page-count>span').textContent='/ '+pages;
 q('.segment-page-count').setAttribute('aria-label',`${pages}ページ中${view.page}ページ`);
 q('#orders-prev').disabled=view.page===1;q('#orders-next').disabled=view.page===pages;
 q(`.state-panel[data-state="${orderState}"] .empty-orders`).hidden=matches.length!==0;
}
function applySearch(){
 const view=orderViews[orderState];view.query=q('#order-search').value.trim().replace(/^#/,'');view.page=1;
 if(view.query)view.time='all';filterCards();
}
function refreshOrders(announce=true){
 const now=new Date();q('#updated-at').textContent=now.toLocaleTimeString('ja-JP',{hour12:false});
 q('#updated-at').dateTime=now.toISOString();filterCards();
 if(announce){
  const button=q('.list-refresh');button.classList.remove('is-refreshing');void button.offsetWidth;button.classList.add('is-refreshing');
  q('.update-announcement').textContent=`${stateNames[orderState]}の一覧を更新しました。${q('#updated-at').textContent}`;
 }
}
function wireOrders(){
 const tabs=qa('.order-state-tabs .page-tab');tabs.forEach(tab=>tab.addEventListener('click',()=>activateState(tab.dataset.state)));keyboardTabs(tabs,(i,focus)=>activateState(states[i],focus));
 q('.page-two-close').addEventListener('click',()=>location.hash='entry');q('.page-two-close').setAttribute('aria-label','入口へ戻る');
 q('#order-search').maxLength=12;
 q('.search').addEventListener('submit',e=>{e.preventDefault();applySearch();});q('#order-search').addEventListener('input',e=>{if(!e.target.value)applySearch();});
 qa('.time-filter').forEach(button=>button.addEventListener('click',()=>{const view=orderViews[orderState];view.time=button.dataset.time;view.page=1;filterCards();}));
 qa('.segment-page-arrow').forEach((button,i)=>{button.classList.add('preview-page-arrow');button.addEventListener('click',()=>{orderViews[orderState].page+=i?1:-1;filterCards();});});
 q('.list-refresh').addEventListener('click',()=>refreshOrders());
 pending(q('.qr'));qa('.order-card').forEach(pending);
 activateState(location.hash.split('/')[1]||'incoming');
 refreshOrders(false);
}
function route(){const kind=location.hash.startsWith('#orders')?'orders':'entry';if(host?.dataset.page===kind){if(kind==='orders')activateState(location.hash.split('/')[1]);return;}build(kind);}
window.addEventListener('hashchange',route);route();

// SRC-308: shared viewport readout from the original OPS shell.
function mountViewportIndicator(){
 if(document.getElementById('viewport-indicator'))return;
 const indicator=document.createElement('output');
 indicator.id='viewport-indicator';
 indicator.className='viewport-indicator';
 indicator.setAttribute('aria-label','ビューポート');
 indicator.setAttribute('aria-live','off');
 indicator.title='ブラウザの表示領域（CSS px）';
 let frame=0;
 const draw=()=>{
  frame=0;
  const viewport=window.visualViewport;
  const width=viewport?.width||window.innerWidth,height=viewport?.height||window.innerHeight;
  const rawZoom=getComputedStyle(document.documentElement).zoom;
  const parsed=Number.parseFloat(rawZoom);
  const zoom=Number.isFinite(parsed)&&parsed>0?(rawZoom.endsWith('%')?parsed/100:parsed):1;
  indicator.textContent='ビューポート'+' '+Math.round(width)+' × '+Math.round(height)+' px';
  indicator.style.left=(((viewport?.offsetLeft||0)+width)/zoom)+'px';
  indicator.style.top=(((viewport?.offsetTop||0)+height)/zoom)+'px';
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(draw);};
 document.body.append(indicator);
 window.addEventListener('resize',schedule,{passive:true});
 window.visualViewport?.addEventListener('resize',schedule,{passive:true});
 window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
 draw();
}
mountViewportIndicator();
