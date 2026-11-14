import {MARKUP as entryMarkup,CSS as entryCSS} from './entry-template.mjs';
import {MARKUP as ordersMarkup,CSS as ordersCSS} from './orders-template.mjs';

// Entry-only sizing trial: retain the QR visual center and the close hit area.
const entrySizingCSS=`
.screen.variant-D.dashboard .topbar>.qr-slot{left:1102.5px;top:26.984375px;width:60px;height:67px}
.screen.variant-D.dashboard .topbar .qr{width:60px;height:60px;--ops-matte-radius:19.166667px}
.screen.variant-D.dashboard .topbar .qr svg{width:48.333333px;height:48.333333px}
.screen.variant-D.dashboard .topbar>.close svg{width:25px;height:25px}
`;

const mount=document.querySelector('#workspace');
const states=['incoming','ready','completed','refund'];
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
 qa('.order-state-tabs .page-tab').forEach(tab=>{const selected=tab.dataset.state===state;tab.classList.toggle('selected',selected);tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&focus)tab.focus();});
 qa('.selected-tab-paint').forEach(path=>path.setAttribute('display',path.dataset.state===state?'block':'none'));
 qa('.state-panel').forEach(panel=>panel.hidden=panel.dataset.state!==state);
 history.replaceState(null,'','#orders/'+state);filterCards();
}
function filterCards(){const query=q('#order-search').value.trim().replace(/^#/,'');qa('.order-card').forEach(card=>card.hidden=Boolean(query&&!card.dataset.number.includes(query)));}
function wireOrders(){
 const tabs=qa('.order-state-tabs .page-tab');tabs.forEach(tab=>tab.addEventListener('click',()=>activateState(tab.dataset.state)));keyboardTabs(tabs,(i,focus)=>activateState(states[i],focus));
 q('.page-two-close').addEventListener('click',()=>location.hash='entry');q('.page-two-close').setAttribute('aria-label','入口へ戻る');
 q('.search').addEventListener('submit',e=>{e.preventDefault();filterCards();});q('#order-search').addEventListener('input',e=>{if(!e.target.value)filterCards();});
 qa('.segment-page-arrow').forEach(button=>{button.disabled=false;button.classList.add('preview-page-arrow');pending(button);button.addEventListener('click',e=>e.preventDefault());});
 pending(q('.qr'));qa('.order-card').forEach(pending);
 activateState(location.hash.split('/')[1]||'incoming');
}
function route(){const kind=location.hash.startsWith('#orders')?'orders':'entry';if(host?.dataset.page===kind){if(kind==='orders')activateState(location.hash.split('/')[1]);return;}build(kind);}
window.addEventListener('hashchange',route);route();
