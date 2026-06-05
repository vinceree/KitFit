"use strict";(()=>{var P=Object.defineProperty;var A=(g,p,f)=>p in g?P(g,p,{enumerable:!0,configurable:!0,writable:!0,value:f}):g[p]=f;var m=(g,p,f)=>A(g,typeof p!="symbol"?p+"":p,f);(function(){let g={apiUrl:"https://kitfit.app",buttonText:"Try it on your bike \u2192"},p="kf-pending-job",f="kf-completed-job",U=3e3,y=300*1e3,F=`
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .kf-trigger {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: #0f172a;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .kf-trigger:hover { background: #1e293b; }

    .kf-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
    }
    .kf-overlay.open { opacity: 1; visibility: visible; }

    .kf-modal {
      background: #fff;
      border-radius: 16px;
      width: 90vw;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 32px;
      position: relative;
      box-shadow: 0 25px 50px rgba(0,0,0,0.25);
    }

    .kf-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #64748b;
      line-height: 1;
    }
    .kf-close:hover { color: #0f172a; }

    .kf-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .kf-subtitle {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 24px;
    }

    .kf-upload-area {
      border: 2px dashed #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      transition: border-color 0.2s, background 0.2s;
      margin-bottom: 16px;
    }
    .kf-upload-area.dragover {
      border-color: #3b82f6;
      background: #f0f9ff;
    }
    .kf-upload-area.has-file {
      border-color: #22c55e;
      background: #f0fdf4;
    }
    .kf-upload-area input { display: none; }
    .kf-upload-label {
      font-size: 14px;
      color: #475569;
      font-weight: 500;
    }
    .kf-upload-label strong { color: #3b82f6; }
    .kf-upload-hint {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }
    .kf-upload-preview {
      max-width: 120px;
      max-height: 120px;
      border-radius: 8px;
      margin-top: 8px;
    }
    .kf-upload-buttons {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-top: 10px;
    }
    .kf-upload-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #fff;
      color: #0f172a;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .kf-upload-btn:hover { background: #f8fafc; border-color: #94a3b8; }
    .kf-upload-btn svg { flex-shrink: 0; }

    .kf-scene-label {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .kf-scene-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 24px;
    }
    .kf-scene-btn {
      padding: 10px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      text-align: left;
      transition: border-color 0.2s;
    }
    .kf-scene-btn:hover { border-color: #94a3b8; }
    .kf-scene-btn.selected { border-color: #3b82f6; background: #f0f9ff; }
    .kf-scene-name {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
    }
    .kf-scene-desc {
      font-size: 11px;
      color: #64748b;
    }

    .kf-generate-btn {
      width: 100%;
      padding: 14px;
      background: #3b82f6;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .kf-generate-btn:hover { background: #2563eb; }
    .kf-generate-btn:disabled {
      background: #94a3b8;
      cursor: not-allowed;
    }

    .kf-loading {
      text-align: center;
      padding: 40px 0;
    }
    .kf-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: kf-spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes kf-spin { to { transform: rotate(360deg); } }
    .kf-loading-text {
      font-size: 14px;
      color: #64748b;
    }

    .kf-dismiss-hint {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      animation: kf-fade-in 0.3s ease-out;
    }
    @keyframes kf-fade-in { from { opacity: 0; } to { opacity: 1; } }
    .kf-dismiss-text {
      font-size: 14px;
      color: #475569;
      font-weight: 500;
    }
    .kf-dismiss-subtext {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }
    .kf-dismiss-btn {
      margin-top: 12px;
      padding: 10px 24px;
      background: #f1f5f9;
      color: #0f172a;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .kf-dismiss-btn:hover { background: #e2e8f0; }

    .kf-result { text-align: center; }
    .kf-result-img {
      width: 100%;
      border-radius: 12px;
      margin-bottom: 16px;
    }
    .kf-actions {
      display: flex;
      gap: 8px;
    }
    .kf-actions button {
      flex: 1;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }
    .kf-download-btn {
      background: #0f172a;
      color: #fff;
    }
    .kf-download-btn:hover { background: #1e293b; }
    .kf-retry-btn {
      background: #f1f5f9;
      color: #0f172a;
    }
    .kf-retry-btn:hover { background: #e2e8f0; }

    .kf-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 12px;
      color: #dc2626;
      font-size: 13px;
      margin-bottom: 16px;
      text-align: center;
    }

    .kf-powered {
      text-align: center;
      margin-top: 16px;
      font-size: 11px;
      color: #94a3b8;
    }
    .kf-powered a { color: #64748b; text-decoration: none; }
    .kf-powered a:hover { text-decoration: underline; }

    .kf-complements { margin-bottom: 20px; }
    .kf-complements-label {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .kf-complements-grid {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .kf-complement-card {
      flex-shrink: 0;
      width: 80px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
      background: #fff;
    }
    .kf-complement-card:hover { border-color: #94a3b8; }
    .kf-complement-card.selected { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.3); }
    .kf-complement-card img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      display: block;
    }
    .kf-complement-card .kf-complement-name {
      font-size: 10px;
      font-weight: 500;
      color: #475569;
      padding: 4px;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .kf-complement-card .kf-complement-default {
      font-size: 9px;
      color: #3b82f6;
      text-align: center;
      padding-bottom: 4px;
    }

    .kf-saved-photos { margin-bottom: 12px; }
    .kf-saved-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .kf-saved-grid {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .kf-saved-thumb {
      flex-shrink: 0;
      width: 56px;
      height: 56px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid #e2e8f0;
      transition: border-color 0.2s;
    }
    .kf-saved-thumb:hover { border-color: #94a3b8; }
    .kf-saved-thumb.selected { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.3); }
    .kf-saved-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    @media (max-width: 480px) {
      .kf-modal { padding: 16px; margin: 8px; }
      .kf-scene-grid { grid-template-columns: 1fr 1fr; }
      .kf-upload-area { padding: 16px; }
      .kf-upload-btn { padding: 10px 16px; font-size: 14px; }
      .kf-trigger { width: 100%; justify-content: center; padding: 14px 24px; }
      .kf-title { font-size: 18px; }
      .kf-generate-btn { padding: 16px; font-size: 16px; }
    }
  `,M=[{id:"alpine",name:"Alpine",desc:"Mountain road, sunny"},{id:"coastal",name:"Coastal",desc:"Ocean road, bright"},{id:"forest",name:"Forest",desc:"Tree-lined, dappled light"},{id:"urban",name:"Urban",desc:"City streets, dawn"}],x="kf-person-photos",w="kf-bike-photos",H=3;function E(l){try{return JSON.parse(sessionStorage.getItem(l)||"[]")}catch{return[]}}function L(l,e){let t=E(l).filter(o=>o.name!==e.name);t.unshift(e),t.length>H&&t.pop();try{sessionStorage.setItem(l,JSON.stringify(t))}catch{t.pop();try{sessionStorage.setItem(l,JSON.stringify(t))}catch{}}}function S(l,e=1600,t=.85){return new Promise((o,n)=>{let i=new Image;i.onload=()=>{let{width:s,height:r}=i;(s>e||r>e)&&(s>r?(r=r/s*e,s=e):(s=s/r*e,r=e));let d=document.createElement("canvas");d.width=s,d.height=r,d.getContext("2d").drawImage(i,0,0,s,r),URL.revokeObjectURL(i.src),o(d.toDataURL("image/jpeg",t))},i.onerror=()=>{URL.revokeObjectURL(i.src),n(new Error("Failed to load image for compression"))},i.src=URL.createObjectURL(l)})}function j(l,e){let[t,o]=l.split(","),n=t.match(/:(.*?);/)?.[1]||"image/jpeg",i=atob(o),s=new Uint8Array(i.length);for(let r=0;r<i.length;r++)s[r]=i.charCodeAt(r);return new File([s],e,{type:n})}function J(){if(document.getElementById("kf-toast-styles"))return;let l=document.createElement("style");l.id="kf-toast-styles",l.textContent=`
      #kf-toast-notification {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 360px;
        cursor: pointer;
        animation: kf-toast-in 0.4s ease-out;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border: 1px solid #e2e8f0;
      }
      #kf-toast-notification img {
        width: 56px;
        height: 56px;
        border-radius: 8px;
        object-fit: cover;
        flex-shrink: 0;
      }
      #kf-toast-notification .kf-toast-body { flex: 1; }
      #kf-toast-notification .kf-toast-title {
        font-size: 14px;
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 2px;
      }
      #kf-toast-notification .kf-toast-subtitle {
        font-size: 12px;
        color: #64748b;
      }
      #kf-toast-notification .kf-toast-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        color: #94a3b8;
        line-height: 1;
        padding: 4px;
      }
      #kf-toast-notification .kf-toast-close:hover { color: #0f172a; }
      @keyframes kf-toast-in {
        from { transform: translateY(80px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes kf-toast-out {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(80px); opacity: 0; }
      }
    `,document.head.appendChild(l)}function k(l,e){h(),J();let t=document.createElement("div");t.id="kf-toast-notification",t.innerHTML=`
      <img src="${l.resultImage}" alt="Try-on result">
      <div class="kf-toast-body">
        <div class="kf-toast-title">Your try-on is ready!</div>
        <div class="kf-toast-subtitle">Click to view your image</div>
      </div>
      <button class="kf-toast-close">&times;</button>
    `,t.addEventListener("click",o=>{if(o.target.closest(".kf-toast-close")){h();return}h(),e?e():l.pageUrl&&l.pageUrl!==window.location.href&&(window.location.href=l.pageUrl)}),document.body.appendChild(t),setTimeout(()=>h(),3e4)}function h(){let l=document.getElementById("kf-toast-notification");l&&(l.style.animation="kf-toast-out 0.3s ease-in forwards",setTimeout(()=>l.remove(),300))}let u=null;function b(){u?.abort(),u=null}function I(l){b(),u=new AbortController,R(l,u.signal)}function q(){if(u&&!u.signal.aborted)return;let l=localStorage.getItem(p);if(!l)return;let e;try{e=JSON.parse(l)}catch{localStorage.removeItem(p);return}if(Date.now()-e.startedAt>y){localStorage.removeItem(p);return}I(e)}async function R(l,e){let{jobId:t,apiUrl:o}=l;for(;!e.aborted;){try{let n=await fetch(`${o}/api/tryon/jobs/${t}`,{signal:e});if(!n.ok)break;let i=await n.json();if(i.status==="completed"&&i.resultImage){let s={jobId:t,resultImage:i.resultImage,pageUrl:l.pageUrl,completedAt:Date.now()};localStorage.setItem(f,JSON.stringify(s)),localStorage.removeItem(p),document.dispatchEvent(new CustomEvent("kf-job-complete",{detail:s}));return}if(i.status==="failed"){localStorage.removeItem(p),document.dispatchEvent(new CustomEvent("kf-job-error",{detail:{jobId:t,error:i.error||"Generation failed"}}));return}if(Date.now()-l.startedAt>y){localStorage.removeItem(p);return}}catch{if(e.aborted)return}await new Promise(n=>setTimeout(n,U))}}class T{constructor(e,t){m(this,"config");m(this,"root");m(this,"personFile",null);m(this,"bikeFile",null);m(this,"selectedScene","alpine");m(this,"complements",[]);m(this,"selectedComplement",null);m(this,"activeJobId",null);m(this,"lastResultImage",null);m(this,"modalOpen",!1);this.config={...g,...t},this.config.apiUrl.endsWith("/")&&(this.config.apiUrl=this.config.apiUrl.slice(0,-1)),this.root=e.attachShadow({mode:"open"}),this.render(),this.listenForJobEvents(),this.checkForCompletedResult()}listenForJobEvents(){document.addEventListener("kf-job-complete",(e=>{let t=e.detail;this.onJobComplete(t)})),document.addEventListener("kf-job-error",(e=>{let{jobId:t,error:o}=e.detail;this.activeJobId===t&&this.onJobError(o)}))}checkForCompletedResult(){let e=localStorage.getItem(f);if(!e)return;let t;try{t=JSON.parse(e)}catch{localStorage.removeItem(f);return}t.pageUrl===window.location.href?(localStorage.removeItem(f),this.open(),this.showResult(t.resultImage)):k(t)}onJobComplete(e){v=!0,this.lastResultImage=e.resultImage,this.modalOpen&&this.activeJobId===e.jobId?(this.showResult(e.resultImage),localStorage.removeItem(f)):e.pageUrl===window.location.href?k(e,()=>{localStorage.removeItem(f),this.open(),this.showResult(e.resultImage)}):k(e),this.activeJobId=null}onJobError(e){this.activeJobId=null;let t=o=>this.root.querySelector(o);if(this.modalOpen){t("#kf-loading").style.display="none",t("#kf-form").style.display="block";let o=t("#kf-error");o.textContent=e,o.style.display="block"}}showResult(e){let t=o=>this.root.querySelector(o);t("#kf-loading").style.display="none",t("#kf-form").style.display="none",t("#kf-result").style.display="block",this.root.querySelector("#kf-result-img").src=e}render(){let e=document.createElement("style");e.textContent=F,this.root.appendChild(e);let t=document.createElement("button");t.className="kf-trigger",t.innerHTML=`
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12l2 2 4-4"/>
        </svg>
        ${this.config.buttonText}
      `,this.root.appendChild(t);let o=document.createElement("div");o.className="kf-overlay",o.innerHTML=this.modalHTML(),this.root.appendChild(o),t.addEventListener("click",()=>this.open()),o.addEventListener("click",n=>{n.target===o&&this.close()}),this.bindEvents(),this.renderSavedPhotos()}modalHTML(){return`
        <div class="kf-modal">
          <button class="kf-close">&times;</button>
          <div class="kf-title">Virtual Try-On</div>
          <div class="kf-subtitle">See yourself in this kit on your bike</div>

          <div id="kf-form">
            <div class="kf-upload-area" id="kf-person-upload">
              <input type="file" accept="image/*" id="kf-person-input">
              <input type="file" accept="image/*" capture="user" id="kf-person-camera">
              <div class="kf-upload-label"><strong>Your photo</strong></div>
              <div class="kf-upload-hint">A clear, well-lit photo of yourself</div>
              <div class="kf-upload-buttons" id="kf-person-buttons">
                <button type="button" class="kf-upload-btn" id="kf-person-pick-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                  Choose photo
                </button>
                <button type="button" class="kf-upload-btn" id="kf-person-camera-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  Take selfie
                </button>
              </div>
            </div>
            <div class="kf-saved-photos" id="kf-person-saved" style="display:none"></div>

            <div class="kf-upload-area" id="kf-bike-upload">
              <input type="file" accept="image/*" id="kf-bike-input">
              <input type="file" accept="image/*" capture="environment" id="kf-bike-camera">
              <div class="kf-upload-label"><strong>Your bike</strong> (optional)</div>
              <div class="kf-upload-hint">Side view, good lighting. A photo from online may give sharper results.</div>
              <div class="kf-upload-buttons" id="kf-bike-buttons">
                <button type="button" class="kf-upload-btn" id="kf-bike-pick-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                  Choose photo
                </button>
                <button type="button" class="kf-upload-btn" id="kf-bike-camera-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  Take photo
                </button>
              </div>
            </div>
            <div class="kf-saved-photos" id="kf-bike-saved" style="display:none"></div>

            <div class="kf-scene-label">Choose your scene</div>
            <div class="kf-scene-grid">
              ${M.map(e=>`
                <button class="kf-scene-btn${e.id==="alpine"?" selected":""}" data-scene="${e.id}">
                  <div class="kf-scene-name">${e.name}</div>
                  <div class="kf-scene-desc">${e.desc}</div>
                </button>
              `).join("")}
            </div>

            <div id="kf-complements" class="kf-complements" style="display:none">
              <div class="kf-complements-label">Complete the look</div>
              <div class="kf-complements-grid" id="kf-complements-grid"></div>
            </div>

            <div id="kf-error" class="kf-error" style="display:none"></div>

            <button class="kf-generate-btn" id="kf-generate" disabled>Generate Try-On</button>
          </div>

          <div id="kf-loading" class="kf-loading" style="display:none">
            <div class="kf-spinner"></div>
            <div class="kf-loading-text">Generating your try-on image...</div>
            <div class="kf-upload-hint" style="margin-top:8px">This usually takes 10-20 seconds</div>
            <div class="kf-dismiss-hint" id="kf-dismiss-hint" style="display:none">
              <div class="kf-dismiss-text">You can close this and keep browsing.</div>
              <div class="kf-dismiss-subtext">We'll notify you when your image is ready.</div>
              <button class="kf-dismiss-btn" id="kf-dismiss-btn">Continue Browsing</button>
            </div>
          </div>

          <div id="kf-result" class="kf-result" style="display:none">
            <img class="kf-result-img" id="kf-result-img" src="" alt="Try-on result">
            <div class="kf-actions">
              <button class="kf-download-btn" id="kf-download">Download</button>
              <button class="kf-retry-btn" id="kf-retry">Try Again</button>
            </div>
          </div>

          <div class="kf-powered">Powered by <a href="https://kitfit.app" target="_blank">KitFit</a></div>
        </div>
      `}bindEvents(){let e=a=>this.root.querySelector(a),t=a=>this.root.querySelector(a);e(".kf-close").addEventListener("click",()=>this.close());let o=e("#kf-person-upload"),n=t("#kf-person-input"),i=t("#kf-person-camera");e("#kf-person-pick-btn").addEventListener("click",a=>{a.stopPropagation(),n.click()}),e("#kf-person-camera-btn").addEventListener("click",a=>{a.stopPropagation(),i.click()}),o.addEventListener("dragover",a=>{a.preventDefault(),o.classList.add("dragover")}),o.addEventListener("dragleave",()=>o.classList.remove("dragover")),o.addEventListener("drop",a=>{a.preventDefault(),o.classList.remove("dragover");let c=a.dataTransfer?.files[0];c&&this.setPersonFile(c)}),n.addEventListener("change",()=>{n.files?.[0]&&this.setPersonFile(n.files[0])}),i.addEventListener("change",()=>{i.files?.[0]&&this.setPersonFile(i.files[0])});let s=e("#kf-bike-upload"),r=t("#kf-bike-input"),d=t("#kf-bike-camera");e("#kf-bike-pick-btn").addEventListener("click",a=>{a.stopPropagation(),r.click()}),e("#kf-bike-camera-btn").addEventListener("click",a=>{a.stopPropagation(),d.click()}),s.addEventListener("dragover",a=>{a.preventDefault(),s.classList.add("dragover")}),s.addEventListener("dragleave",()=>s.classList.remove("dragover")),s.addEventListener("drop",a=>{a.preventDefault(),s.classList.remove("dragover");let c=a.dataTransfer?.files[0];c&&this.setBikeFile(c)}),r.addEventListener("change",()=>{r.files?.[0]&&this.setBikeFile(r.files[0])}),d.addEventListener("change",()=>{d.files?.[0]&&this.setBikeFile(d.files[0])}),this.root.querySelectorAll(".kf-scene-btn").forEach(a=>{a.addEventListener("click",()=>{this.root.querySelectorAll(".kf-scene-btn").forEach(c=>c.classList.remove("selected")),a.classList.add("selected"),this.selectedScene=a.dataset.scene})}),e("#kf-generate").addEventListener("click",()=>this.generate()),e("#kf-dismiss-btn").addEventListener("click",()=>this.close()),e("#kf-download").addEventListener("click",()=>this.download()),e("#kf-retry").addEventListener("click",()=>this.reset())}setPersonFile(e,t=!1){this.personFile=e;let o=this.root.querySelector("#kf-person-upload");o.classList.add("has-file"),o.querySelector(".kf-upload-label").innerHTML=`<strong>${e.name}</strong>`;let n=o.querySelector("#kf-person-buttons");n&&(n.style.display="none");let i=o.querySelector(".kf-upload-hint");i&&(i.style.display="none");let s=o.querySelector(".kf-upload-preview");s||(s=document.createElement("img"),s.className="kf-upload-preview",o.appendChild(s)),s.src=URL.createObjectURL(e),t||S(e).then(r=>{L(x,{name:e.name,dataUrl:r,ts:Date.now()}),this.renderSavedPhotos()}),this.updateGenerateButton()}setBikeFile(e,t=!1){this.bikeFile=e;let o=this.root.querySelector("#kf-bike-upload");o.classList.add("has-file"),o.querySelector(".kf-upload-label").innerHTML=`<strong>${e.name}</strong>`;let n=o.querySelector("#kf-bike-buttons");n&&(n.style.display="none");let i=o.querySelector(".kf-upload-hint");i&&(i.style.display="none");let s=o.querySelector(".kf-upload-preview");s||(s=document.createElement("img"),s.className="kf-upload-preview",o.appendChild(s)),s.src=URL.createObjectURL(e),t||S(e).then(r=>{L(w,{name:e.name,dataUrl:r,ts:Date.now()}),this.renderSavedPhotos()})}updateGenerateButton(){let e=this.root.querySelector("#kf-generate");e.disabled=!this.personFile}async fetchGarmentImages(){if(this.config.productId&&this.config.apiUrl)try{let t=await fetch(`${this.config.apiUrl}/api/products/${this.config.productId}/reference-images`);if(t.ok){let n=(await t.json()).referenceImages;if(n&&n.length>0){let s=(await Promise.all(n.map((r,d)=>this.fetchImageFromUrl(r.image_url,`garment-${d}.jpg`)))).filter(Boolean);if(s.length>0)return s}}}catch{}if(!this.config.garmentImageUrl)return[];let e=await this.fetchImageFromUrl(this.config.garmentImageUrl,"garment.jpg");return e?[e]:[]}async generate(){let e=t=>this.root.querySelector(t);if(this.personFile){e("#kf-form").style.display="none",e("#kf-loading").style.display="block",e("#kf-error").style.display="none",e("#kf-dismiss-hint").style.display="none",setTimeout(()=>{let t=this.root.querySelector("#kf-dismiss-hint");t&&this.activeJobId&&(t.style.display="block")},500);try{let t=await this.fetchGarmentImages();if(t.length===0)throw new Error("Could not load the product image. Please try again.");let o=null;this.selectedComplement&&(o=await this.fetchImageFromUrl(this.selectedComplement.imageUrl,"complement.jpg"));let n=crypto.randomUUID();this.activeJobId=n;let i=new FormData;i.append("api_key",this.config.apiKey),i.append("scene_preset",this.selectedScene),i.append("person_image",this.personFile),t.forEach(c=>i.append("garment_image",c)),i.append("job_id",n),o&&i.append("complement_image",o),this.config.productId&&i.append("product_id",this.config.productId),this.bikeFile&&i.append("bike_image",this.bikeFile);let s={jobId:n,apiUrl:this.config.apiUrl,pageUrl:window.location.href,startedAt:Date.now()};localStorage.setItem(p,JSON.stringify(s)),I(s);let r;try{r=await fetch(`${this.config.apiUrl}/api/tryon`,{method:"POST",body:i})}catch{return}if(this.activeJobId!==n)return;if(!r.ok){let c="Generation failed";try{c=(await r.json()).error||c}catch{}throw new Error(c)}let a=(await r.json()).result_image;this.activeJobId=null,b(),localStorage.removeItem(p),this.lastResultImage=a,this.modalOpen?this.showResult(a):(localStorage.setItem(f,JSON.stringify({jobId:n,resultImage:a,pageUrl:window.location.href,completedAt:Date.now()})),k({jobId:n,resultImage:a,pageUrl:window.location.href,completedAt:Date.now()},()=>{localStorage.removeItem(f),this.open(),this.showResult(a)}))}catch(t){this.activeJobId=null,b(),localStorage.removeItem(p);let o=t instanceof Error?t.message:"Something went wrong";if(this.modalOpen){e("#kf-loading").style.display="none",e("#kf-form").style.display="block";let n=e("#kf-error");n.textContent=o,n.style.display="block"}}}}download(){let t=this.root.querySelector("#kf-result-img").src;if(t.startsWith("data:")){let o=document.createElement("a");o.href=t,o.download="kitfit-tryon.jpg",o.click()}else fetch(t).then(o=>o.blob()).then(o=>{let n=URL.createObjectURL(o),i=document.createElement("a");i.href=n,i.download="kitfit-tryon.jpg",i.click(),URL.revokeObjectURL(n)}).catch(()=>{window.open(t,"_blank")})}reset(){let e=c=>this.root.querySelector(c);e("#kf-result").style.display="none",e("#kf-form").style.display="block",this.personFile=null,this.bikeFile=null,this.activeJobId=null,this.lastResultImage=null;let t=this.root.querySelector("#kf-person-upload");t.classList.remove("has-file"),t.querySelector(".kf-upload-label").innerHTML="<strong>Your photo</strong>";let o=t.querySelector(".kf-upload-preview");o&&o.remove();let n=t.querySelector("#kf-person-buttons");n&&(n.style.display="flex");let i=t.querySelector(".kf-upload-hint");i&&(i.style.display="block");let s=this.root.querySelector("#kf-bike-upload");s.classList.remove("has-file"),s.querySelector(".kf-upload-label").innerHTML="<strong>Your bike</strong> (optional)";let r=s.querySelector(".kf-upload-preview");r&&r.remove();let d=s.querySelector("#kf-bike-buttons");d&&(d.style.display="flex");let a=s.querySelector(".kf-upload-hint");a&&(a.style.display="block"),this.root.querySelectorAll(".kf-saved-thumb").forEach(c=>c.classList.remove("selected")),this.updateGenerateButton(),this.renderSavedPhotos()}renderSavedPhotos(){this.renderSavedSection("kf-person-saved",x,"person"),this.renderSavedSection("kf-bike-saved",w,"bike")}renderSavedSection(e,t,o){let n=this.root.querySelector(`#${e}`);if(!n)return;let i=E(t);if(i.length===0){n.style.display="none";return}n.style.display="block",n.innerHTML=`
        <div class="kf-saved-label">Recent photos</div>
        <div class="kf-saved-grid">
          ${i.map((s,r)=>`
            <div class="kf-saved-thumb" data-saved-type="${o}" data-saved-idx="${r}">
              <img src="${i[r].dataUrl}" alt="${i[r].name}">
            </div>
          `).join("")}
        </div>
      `,n.querySelectorAll(".kf-saved-thumb").forEach(s=>{s.addEventListener("click",()=>{let r=parseInt(s.dataset.savedIdx,10),d=i[r];if(!d)return;let a=j(d.dataUrl,d.name);o==="person"?this.setPersonFile(a,!0):this.setBikeFile(a,!0),n.querySelectorAll(".kf-saved-thumb").forEach(c=>c.classList.remove("selected")),s.classList.add("selected")})})}async fetchComplements(){if(!(!this.config.productId||!this.config.apiUrl))try{let e=await fetch(`${this.config.apiUrl}/api/products/${this.config.productId}/complements`);if(!e.ok)return;let t=await e.json();this.complements=t.complements||[],this.selectedComplement=this.complements.find(o=>o.isDefault)||null,this.renderComplements()}catch{}}renderComplements(){let e=this.root.querySelector("#kf-complements"),t=this.root.querySelector("#kf-complements-grid");if(!(!e||!t)){if(this.complements.length===0){e.style.display="none";return}e.style.display="block",t.innerHTML=this.complements.map(o=>`
        <div class="kf-complement-card${this.selectedComplement?.id===o.id?" selected":""}" data-complement-id="${o.id}">
          <img src="${o.imageUrl}" alt="${o.name}">
          <div class="kf-complement-name">${o.name}</div>
          ${o.isDefault?'<div class="kf-complement-default">recommended</div>':""}
        </div>
      `).join(""),t.querySelectorAll(".kf-complement-card").forEach(o=>{o.addEventListener("click",()=>{let n=o.dataset.complementId,i=this.complements.find(s=>s.id===n);i&&(this.selectedComplement?.id===i.id?this.selectedComplement=null:this.selectedComplement=i,this.renderComplements())})})}}async fetchImageFromUrl(e,t){try{let n=await(await fetch(e)).blob();return new File([n],t,{type:n.type})}catch{return null}}open(){if(this.root.querySelector(".kf-overlay").classList.add("open"),this.modalOpen=!0,this.lastResultImage){this.showResult(this.lastResultImage),localStorage.removeItem(f);return}this.complements.length===0&&this.fetchComplements()}close(){this.root.querySelector(".kf-overlay").classList.remove("open"),this.modalOpen=!1}}let v=!1;document.addEventListener("kf-job-complete",(l=>{v=!1,queueMicrotask(()=>{if(!v){let e=l.detail;k(e)}})}));function C(){document.querySelectorAll("[data-kitfit]").forEach(l=>{let e=l;if(e.shadowRoot)return;let t={apiKey:e.dataset.kitfitKey||"",apiUrl:e.dataset.kitfitApi||g.apiUrl,productId:e.dataset.kitfitProduct||void 0,garmentImageUrl:e.dataset.kitfitGarment||void 0,buttonText:e.dataset.kitfitButton||g.buttonText};new T(e,t)}),q()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",C):C(),window.KitFitWidget=T})();})();
//# sourceMappingURL=kitfit.js.map
