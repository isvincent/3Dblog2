// V3.0: transparent, local-only title/tag based recommendation and learning journeys.
const root=document.getElementById('smartPanel');
const shade=document.getElementById('smartShade');
const byId=id=>document.getElementById(id);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ZONES=['AI 工具館','教學創新館','影音創作館','程式實作館','辦公應用館','自動化實驗室'];
let records=[],originalMetadata={};let lastActive=null;
const VALID_URL=/^https:\/\/vocus\.cc\/article\/[a-zA-Z0-9]+\/?(?:\?.*)?$/;
function validate(obj){
 const errors=[];
 if(!obj||!Array.isArray(obj.articles))return {errors:['JSON 必須包含 articles 陣列'],records:[]};
 const ids=new Set(),urls=new Set(),valid=[];
 obj.articles.forEach((a,i)=>{
  if(!a||!Number.isInteger(a.id)||a.id<=0||typeof a.title!=='string'||!a.title.trim()||!VALID_URL.test(a.url||'')||!ZONES.includes(a.zone)||!Array.isArray(a.tags)){
   errors.push(`第 ${i+1} 筆格式不合規格`);return;
  }
  if(ids.has(a.id))errors.push(`重複 ID：${a.id}`);if(urls.has(a.url))errors.push(`重複網址：${a.url}`);
  ids.add(a.id);urls.add(a.url);valid.push({...a,tags:a.tags.filter(t=>typeof t==='string')});
 });
 if(Number.isInteger(obj.count)&&obj.count!==obj.articles.length)errors.push(`宣告文章數 ${obj.count} 與實際 ${obj.articles.length} 不符`);
 return {errors,records:valid};
}
function summary(){const byZone=Object.fromEntries(ZONES.map(z=>[z,records.filter(a=>a.zone===z).length]));byId('smartDataStats').innerHTML=`<div class="smart-summary">目前載入：<b>${records.length}</b> 篇文章 · <b>${new Set(records.map(a=>a.url)).size}</b> 個唯一網址</div><table class="smart-data-table">${ZONES.map(z=>`<tr><td>${safe(z)}</td><td>${byZone[z]} 篇</td></tr>`).join('')}</table>`}
function open(){lastActive=document.activeElement;root.classList.add('open');root.setAttribute('aria-hidden','false');shade.hidden=false;byId('smartQuestion').focus()}
function close(){root.classList.remove('open');root.setAttribute('aria-hidden','true');shade.hidden=true;lastActive?.focus()}
byId('smartBtn').addEventListener('click',open);byId('smartClose').addEventListener('click',close);shade.addEventListener('click',close);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('open')){close();return}if(e.key==='Tab'&&root.classList.contains('open')){const focusables=[...root.querySelectorAll('button:not([disabled]),textarea,input:not([disabled]),a[href]')].filter(x=>x.offsetParent!==null);if(!focusables.length)return;const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
const tabs={guide:'smartGuide',paths:'smartPaths',update:'smartUpdate'};
document.querySelectorAll('[data-smart-tab]').forEach(b=>b.addEventListener('click',()=>{for(const [key,id] of Object.entries(tabs))byId(id).hidden=key!==b.dataset.smartTab;document.querySelectorAll('[data-smart-tab]').forEach(t=>{const active=t===b;t.classList.toggle('current',active);t.setAttribute('aria-selected',String(active))})}));
// Multiword subject aliases: a transparent scoring engine, not an LLM.
const groups=[
 {label:'AI 工具',zone:'AI 工具館',words:['chatgpt','gemini','claude','copilot','notebooklm','ai','人工智慧','模型','提示詞','prompt']},
 {label:'教學設計',zone:'教學創新館',words:['教學','教材','學生','學習','課程','課堂','高中','測驗','學習單','學校']},
 {label:'影音簡報',zone:'影音創作館',words:['影片','影音','短影音','配音','旁白','字幕','動畫','簡報影片','reels','mp4']},
 {label:'程式網站',zone:'程式實作館',words:['網頁','網站','html','程式','javascript','svg','app','codex','vibe coding','互動','3d']},
 {label:'辦公文件',zone:'辦公應用館',words:['excel','pdf','word','powerpoint','試算表','文件','簡報','表單','資料分析']},
 {label:'自動化',zone:'自動化實驗室',words:['自動化','agent','mcp','排程','工作流程','api','apps script','串接','整合']}
];
function tokens(s){return (s.toLocaleLowerCase().match(/[a-z][a-z0-9.+#-]*/g)||[]).concat((s.match(/[\u3400-\u9fff]{2,}/g)||[]).flatMap(part=>{const out=[part];for(let n=2;n<=Math.min(part.length,4);n++)for(let i=0;i<=part.length-n;i++)out.push(part.slice(i,i+n));return out})).filter(x=>x.length>1)}
function classifyQuestion(question){const q=question.toLocaleLowerCase();return groups.map(g=>({...g,matched:g.words.filter(w=>q.includes(w))})).filter(g=>g.matched.length).sort((a,b)=>b.matched.length-a.matched.length)}
function recommend(question,limit=10,zone=null){const q=question.toLocaleLowerCase().trim();const hits=classifyQuestion(q);const qt=new Set(tokens(q));return records.map(a=>{const title=a.title.toLocaleLowerCase();const atags=(a.tags||[]).join(' ').toLocaleLowerCase();let score=0;const reasons=[];for(const g of hits){if(a.zone===g.zone){score+=g.matched.length*4;reasons.push(`${g.label}主題符合`)}if(atags.includes(g.zone))score+=g.matched.length*1.2;for(const w of g.matched)if(title.includes(w)){score+=5;reasons.push(`標題包含「${w}」`)}}
 let termHits=0;for(const term of qt)if(term.length>=2&&title.includes(term)){score+=term.length>=4?2.2:0.5;termHits++}
 if(termHits&&!reasons.length)reasons.push(`標題關鍵字符合 ${termHits} 項`);
 if(zone&&a.zone===zone)score+=5;
 return {...a,_score:score,_why:[...new Set(reasons)].slice(0,3)};
 }).filter(a=>a._score>0).sort((a,b)=>b._score-a._score||a.id-b.id).slice(0,limit)}
function articleCard(a,step){return `<article class="smart-card"><div class="path-step">${step?`<span class="step-num">${step}</span>`:''}<div><small>${safe(a.zone)} · 文章 #${a.id}</small><h4>${safe(a.title)}</h4>${a._why?.length?`<div class="reason">推薦依據：${safe(a._why.join('、'))}</div>`:''}<a href="${safe(a.url)}" target="_blank" rel="noopener noreferrer">閱讀原文 ↗</a></div></div></article>`}
function runGuide(){const q=byId('smartQuestion').value.trim();if(!q){byId('smartGuideNote').textContent='請先輸入想學的主題或要解決的問題。';byId('smartResults').innerHTML='';return}const relevant=classifyQuestion(q),items=recommend(q);let intro=`根據標題與分類，找到 ${items.length} 篇優先推薦文章。`;if(relevant.length)intro+=` 辨識主題：${relevant.slice(0,3).map(g=>g.label).join('、')}。`;byId('smartGuideNote').textContent='推薦根據文字比對與分類加權產生，請以原始文章內容判斷實際適用性。';byId('smartResults').innerHTML=items.length?`<div class="smart-summary">${safe(intro)}<br><small>文章索引不含內文，無法回答文章未提供的細節。</small></div>${items.map(a=>articleCard(a)).join('')}`:'<div class="smart-summary">沒有找到明確的標題／標籤符合項目。請改用具體工具名稱或教學主題，例如「Gemini」「Excel」「影片」。</div>'}
byId('smartAsk').addEventListener('click',runGuide);byId('smartQuestion').addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')runGuide()});byId('smartExamples').querySelectorAll('[data-question]').forEach(b=>b.addEventListener('click',()=>{byId('smartQuestion').value=b.dataset.question;runGuide()}));
const paths=[
 {title:'🤖 AI 工具入門到實作',query:['ChatGPT 入門','Gemini 提示詞','Claude AI 應用','AI 工具 比較'],zone:'AI 工具館'},
 {title:'🎓 教師 AI 教材設計',query:['AI 教學','教材生成','互動 教學 網頁','測驗 教學'],zone:'教學創新館'},
 {title:'🎬 AI 短影音製作',query:['影片 AI','簡報 影片','配音 字幕','短影音 教學'],zone:'影音創作館'},
 {title:'💻 互動網頁實戰',query:['HTML 網頁','SVG 互動','程式 AI','3D 網站'],zone:'程式實作館'},
 {title:'📊 AI 辦公效率提升',query:['Excel','PDF AI','Word 文件','PowerPoint 簡報'],zone:'辦公應用館'},
 {title:'⚙️ Agent 自動化實務',query:['自動化','Agent','MCP','Apps Script'],zone:'自動化實驗室'}
];
byId('pathOptions').innerHTML=paths.map((p,i)=>`<button data-path="${i}">${safe(p.title)}</button>`).join('');
function showPath(i){const p=paths[i],used=new Set(),steps=[];for(const query of p.query){const ranked=recommend(query,70,p.zone);const same=ranked.find(a=>a.zone===p.zone&&!used.has(a.id));const any=ranked.find(a=>!used.has(a.id));const a=same||any;if(a){used.add(a.id);steps.push(a)}}byId('pathOptions').querySelectorAll('button').forEach((b,j)=>b.classList.toggle('selected',i===j));byId('pathResults').innerHTML=`<div class="smart-summary"><b>${safe(p.title)}</b><br>以下是依主題詞與文章標題排序的建議閱讀順序，並非已驗證的課程難度階梯。</div>${steps.length?steps.map((a,j)=>articleCard(a,j+1)).join(''):'目前找不到符合此路徑的文章。'}`}
byId('pathOptions').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>showPath(Number(b.dataset.path))));
function download(data,name){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
byId('smartExport').addEventListener('click',()=>download({...originalMetadata,count:records.length,zones:Object.fromEntries(ZONES.map(z=>[z,records.filter(a=>a.zone===z).length])),articles:records},'knowledge-island-articles.json'));
byId('smartExportFav').addEventListener('click',()=>{let ids=[];try{ids=JSON.parse(localStorage.getItem('knowledge-island-favourites')||'[]')}catch{}download({exported_at:new Date().toISOString(),articles:records.filter(a=>ids.includes(a.id))},'knowledge-island-favourites.json')});
byId('smartFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;const status=byId('smartImportStatus');try{if(file.size>8*1024*1024)throw Error('檔案大於 8MB，請縮小後再匯入');const json=JSON.parse(await file.text());const result=validate(json);if(result.errors.length){status.textContent=`驗證失敗（共 ${result.errors.length} 項）：\n${result.errors.slice(0,12).join('\n')}`;return}records=result.records;originalMetadata=Object.fromEntries(Object.entries(json).filter(([k])=>!['articles','zones','count'].includes(k)));summary();status.textContent=`檢查通過：${records.length} 篇文章、所有 ID 與網址不重複。智慧探索面板已採用新資料。\n注意：原有 V2 文章列表仍使用網站初始檔案。請下載 JSON，取代 data/articles.json 並重新整理網頁，才能讓所有功能同步。`;showPath(0)}catch(err){status.textContent=`讀取失敗：${err.message}`}});
async function init(){try{const response=await fetch('./data/articles.json');if(!response.ok)throw Error(`HTTP ${response.status}`);const json=await response.json();const result=validate(json);if(result.errors.length)throw Error(result.errors.slice(0,3).join('；'));records=result.records;originalMetadata=Object.fromEntries(Object.entries(json).filter(([k])=>!['articles','zones','count'].includes(k)));summary();showPath(0);byId('smartGuideNote').textContent=`已載入 ${records.length} 篇文章的標題、分類、標籤與原文連結。此版不使用外部 AI API。`}catch(e){byId('smartGuideNote').textContent=`資料載入失敗：${e.message}。請透過 HTTP 伺服器開啟。`;byId('smartImportStatus').textContent='仍可上傳正確的 JSON 使用智慧探索。'}}
init();
