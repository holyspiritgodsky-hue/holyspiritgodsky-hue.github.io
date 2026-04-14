(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))u(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const s of t.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&u(s)}).observe(document,{childList:!0,subtree:!0});function d(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function u(e){if(e.ep)return;e.ep=!0;const t=d(e);fetch(e.href,t)}})();const M="modulepreload",q=function(i,o){return new URL(i,o).href},h={},T=function(o,d,u){let e=Promise.resolve();if(d&&d.length>0){let s=function(n){return Promise.all(n.map(l=>Promise.resolve(l).then(m=>({status:"fulfilled",value:m}),m=>({status:"rejected",reason:m}))))};const a=document.getElementsByTagName("link"),c=document.querySelector("meta[property=csp-nonce]"),v=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));e=s(d.map(n=>{if(n=q(n,u),n in h)return;h[n]=!0;const l=n.endsWith(".css"),m=l?'[rel="stylesheet"]':"";if(!!u)for(let p=a.length-1;p>=0;p--){const g=a[p];if(g.href===n&&(!l||g.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${n}"]${m}`))return;const r=document.createElement("link");if(r.rel=l?"stylesheet":M,l||(r.as="script"),r.crossOrigin="",r.href=n,v&&r.setAttribute("nonce",v),document.head.appendChild(r),l)return new Promise((p,g)=>{r.addEventListener("load",p),r.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${n}`)))})}))}function t(s){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=s,window.dispatchEvent(a),!a.defaultPrevented)throw s}return e.then(s=>{for(const a of s||[])a.status==="rejected"&&t(a.reason);return o().catch(t)})},E=document.querySelector("#app");if(!(E instanceof HTMLDivElement))throw new Error("Map app root not found.");E.innerHTML=`
  <div class="layout">
    <aside class="sidebar">
      <section>
        <h1 class="headline">地球online</h1>
      </section>

      <section class="panel">
        <h2>视角预设</h2>
        <div class="preset-grid" id="preset-grid"></div>
      </section>

      <section class="panel">
        <h2>图层开关</h2>
        <div class="toggle-list" id="toggle-list"></div>
      </section>

      <section class="panel">
        <h2>图例</h2>
        <div class="legend-list">
          <div class="legend-item"><span class="legend-swatch" style="background:#74d2de"></span>热点与水道</div>
          <div class="legend-item"><span class="legend-swatch" style="background:#ff6b6b"></span>冲突区域</div>
          <div class="legend-item"><span class="legend-swatch" style="background:#8dd694"></span>军事基地</div>
          <div class="legend-item"><span class="legend-swatch" style="background:#00b4d8"></span>海底电缆</div>
          <div class="legend-item"><span class="legend-swatch" style="background:#f7b267"></span>管道</div>
        </div>
      </section>
    </aside>

    <main class="map-shell">
      <div class="map-frame">
        <div id="map" class="map"></div>
        <div id="map-loading" class="map-loading" aria-live="polite">
          <div class="map-loading-card">
            <div class="map-loading-spinner"></div>
            <p class="map-loading-title">地图加载中</p>
            <p id="map-status" class="map-loading-copy">准备地图模块...</p>
          </div>
        </div>
      </div>
    </main>
  </div>
`;const L=document.querySelector("#map"),w=document.querySelector("#preset-grid"),b=document.querySelector("#toggle-list"),S=document.querySelector("#map-loading"),P=document.querySelector("#map-status");if(!(L instanceof HTMLDivElement)||!(w instanceof HTMLDivElement)||!(b instanceof HTMLDivElement)||!(S instanceof HTMLDivElement)||!(P instanceof HTMLParagraphElement))throw new Error("Map UI mount points not found.");const O=L,C=w,H=b,y=S,_=P;k();function k(){f("页面已就绪，等待首屏稳定..."),requestAnimationFrame(()=>{requestAnimationFrame(()=>{window.setTimeout(()=>{A()},420)})})}async function A(){try{f("加载地图引擎...");const{initMap:i}=await T(async()=>{const{initMap:o}=await import("./map-app-CVbWV8Jb.js");return{initMap:o}},[],import.meta.url);f("连接在线底图..."),await i({mapContainer:O,presetGridElement:C,toggleListElement:H,setStatus:f}),y.classList.add("is-hidden")}catch(i){console.error("[map] Failed to initialize.",i),y.classList.add("is-error"),f("地图加载失败，请稍后刷新重试")}}function f(i){_.textContent=i}
