import{t as o,l as A,D as S,S as f,V as h,a as u,A as E,g as L,i as T,e as c,b as g,c as k,F as y,s as C}from"./panels--zrEvQ1m.js";import"./sentry-BRlqSVDP.js";import"./d3-A6Y4oGMQ.js";import"./i18n-CFymt8jw.js";function _(i,e){if(i==="runtime-config")return o("modals.runtimeConfig.title");const d=`panels.${i.replace(/-([a-z])/g,(r,n)=>n.toUpperCase())}`,l=o(d);return l===d?e:l}function W(){var r;const i=document.getElementById("app");if(!i)return;document.title=`${o("header.settings")} - World Monitor`;const e=A(f.panels,S),m=new Set(h[u]??[]);for(const n of Object.keys(E))n in e||(e[n]={...L(n,u),enabled:m.has(n)});const d=T();function l(){const b=Object.entries(e).filter(([t])=>(t!=="runtime-config"||d)&&(!t.startsWith("cw-")||g())).map(([t,s])=>`
        <div class="panel-toggle-item ${s.enabled?"active":""}" data-panel="${c(t)}">
          <div class="panel-toggle-checkbox">${s.enabled?"✓":""}</div>
          <span class="panel-toggle-label">${c(_(t,s.name))}</span>
        </div>
      `).join(""),p=document.getElementById("panelToggles");p&&(p.innerHTML=b,p.querySelectorAll(".panel-toggle-item").forEach(t=>{t.addEventListener("click",()=>{const s=t.dataset.panel,a=e[s];if(a){if(!a.enabled&&!k(s,E[s]??a,g())||!a.enabled&&!g()&&Object.entries(e).filter(([v,w])=>w.enabled&&!v.startsWith("cw-")).length>=y)return;a.enabled=!a.enabled,C(f.panels,e),l()}})}))}i.innerHTML=`
    <div class="settings-window-shell">
      <div class="settings-window-header">
        <div class="settings-window-header-text">
          <span class="settings-window-title">${c(o("header.settings"))}</span>
          <p class="settings-window-caption">${c(o("header.panelDisplayCaption"))}</p>
        </div>
        <button type="button" class="modal-close" id="settingsWindowClose">×</button>
      </div>
      <div class="panel-toggle-grid" id="panelToggles"></div>
    </div>
  `,(r=document.getElementById("settingsWindowClose"))==null||r.addEventListener("click",()=>{window.close()}),l()}export{W as initSettingsWindow};
