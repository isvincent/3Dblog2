// PWA scope resolves relative to GitHub Pages repository paths.
(()=>{
 const install=document.getElementById('installApp');let pending=null;
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();pending=e;install.hidden=false});
 install?.addEventListener('click',async()=>{if(!pending)return;pending.prompt();try{await pending.userChoice}catch{}pending=null;install.hidden=true});
 window.addEventListener('appinstalled',()=>{pending=null;install.hidden=true});
 if(!('serviceWorker' in navigator))return;
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(e=>console.warn('PWA service worker registration unavailable:',e)));
})();
