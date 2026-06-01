"use strict";(()=>{var H=Object.defineProperty;var R=(f,l,c)=>l in f?H(f,l,{enumerable:!0,configurable:!0,writable:!0,value:c}):f[l]=c;var p=(f,l,c)=>R(f,typeof l!="symbol"?l+"":l,c);(function(){let f={apiUrl:"https://kitfit.app",buttonText:"Try it on your bike \u2192"},l="kf-pending-job",c="kf-completed-job",T=3e3,b=300*1e3,U=`
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
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      margin-bottom: 16px;
    }
    .kf-upload-area:hover, .kf-upload-area.dragover {
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
      .kf-modal { padding: 20px; margin: 8px; }
      .kf-scene-grid { grid-template-columns: 1fr; }
    }
  `,C=[{id:"alpine",name:"Alpine",desc:"Mountain road, sunny"},{id:"coastal",name:"Coastal",desc:"Ocean road, bright"},{id:"forest",name:"Forest",desc:"Tree-lined, dappled light"},{id:"urban",name:"Urban",desc:"City streets, dawn"}],v="kf-person-photos",y="kf-bike-photos",F=3;function x(r){try{return JSON.parse(sessionStorage.getItem(r)||"[]")}catch{return[]}}function w(r,e){let t=x(r).filter(o=>o.name!==e.name);t.unshift(e),t.length>F&&t.pop();try{sessionStorage.setItem(r,JSON.stringify(t))}catch{t.pop();try{sessionStorage.setItem(r,JSON.stringify(t))}catch{}}}function E(r,e=1600,t=.85){return new Promise((o,i)=>{let n=new Image;n.onload=()=>{let{width:a,height:s}=n;(a>e||s>e)&&(a>s?(s=s/a*e,a=e):(a=a/s*e,s=e));let d=document.createElement("canvas");d.width=a,d.height=s,d.getContext("2d").drawImage(n,0,0,a,s),URL.revokeObjectURL(n.src),o(d.toDataURL("image/jpeg",t))},n.onerror=()=>{URL.revokeObjectURL(n.src),i(new Error("Failed to load image for compression"))},n.src=URL.createObjectURL(r)})}function M(r,e){let[t,o]=r.split(","),i=t.match(/:(.*?);/)?.[1]||"image/jpeg",n=atob(o),a=new Uint8Array(n.length);for(let s=0;s<n.length;s++)a[s]=n.charCodeAt(s);return new File([a],e,{type:i})}function j(){if(document.getElementById("kf-toast-styles"))return;let r=document.createElement("style");r.id="kf-toast-styles",r.textContent=`
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
    `,document.head.appendChild(r)}function k(r,e){h(),j();let t=document.createElement("div");t.id="kf-toast-notification",t.innerHTML=`
      <img src="${r.resultImage}" alt="Try-on result">
      <div class="kf-toast-body">
        <div class="kf-toast-title">Your try-on is ready!</div>
        <div class="kf-toast-subtitle">Click to view your image</div>
      </div>
      <button class="kf-toast-close">&times;</button>
    `,t.addEventListener("click",o=>{if(o.target.closest(".kf-toast-close")){h();return}h(),e?e():r.pageUrl&&r.pageUrl!==window.location.href&&(window.location.href=r.pageUrl)}),document.body.appendChild(t),setTimeout(()=>h(),3e4)}function h(){let r=document.getElementById("kf-toast-notification");r&&(r.style.animation="kf-toast-out 0.3s ease-in forwards",setTimeout(()=>r.remove(),300))}let m=!1;function J(){if(m)return;let r=localStorage.getItem(l);if(!r)return;let e;try{e=JSON.parse(r)}catch{localStorage.removeItem(l);return}if(Date.now()-e.startedAt>b){localStorage.removeItem(l);return}m=!0,S(e)}async function S(r){let{jobId:e,apiUrl:t}=r;for(;m;){try{let o=await fetch(`${t}/api/tryon/jobs/${e}`);if(!o.ok)break;let i=await o.json();if(i.status==="completed"&&i.resultImage){let n={jobId:e,resultImage:i.resultImage,pageUrl:r.pageUrl,completedAt:Date.now()};localStorage.setItem(c,JSON.stringify(n)),localStorage.removeItem(l),m=!1,document.dispatchEvent(new CustomEvent("kf-job-complete",{detail:n}));return}if(i.status==="failed"){localStorage.removeItem(l),m=!1,document.dispatchEvent(new CustomEvent("kf-job-error",{detail:{jobId:e,error:i.error||"Generation failed"}}));return}if(Date.now()-r.startedAt>b){localStorage.removeItem(l),m=!1;return}}catch{}await new Promise(o=>setTimeout(o,T))}}class L{constructor(e,t){p(this,"config");p(this,"root");p(this,"personFile",null);p(this,"bikeFile",null);p(this,"selectedScene","alpine");p(this,"complements",[]);p(this,"selectedComplement",null);p(this,"activeJobId",null);p(this,"modalOpen",!1);this.config={...f,...t},this.config.apiUrl.endsWith("/")&&(this.config.apiUrl=this.config.apiUrl.slice(0,-1)),this.root=e.attachShadow({mode:"open"}),this.render(),this.listenForJobEvents(),this.checkForCompletedResult()}listenForJobEvents(){document.addEventListener("kf-job-complete",(e=>{let t=e.detail;this.onJobComplete(t)})),document.addEventListener("kf-job-error",(e=>{let{jobId:t,error:o}=e.detail;this.activeJobId===t&&this.onJobError(o)}))}checkForCompletedResult(){let e=localStorage.getItem(c);if(!e)return;let t;try{t=JSON.parse(e)}catch{localStorage.removeItem(c);return}t.pageUrl===window.location.href?(localStorage.removeItem(c),this.open(),this.showResult(t.resultImage)):k(t)}onJobComplete(e){this.modalOpen&&this.activeJobId===e.jobId?(this.showResult(e.resultImage),localStorage.removeItem(c)):e.pageUrl===window.location.href?k(e,()=>{localStorage.removeItem(c),this.open(),this.showResult(e.resultImage)}):k(e),this.activeJobId=null}onJobError(e){this.activeJobId=null;let t=o=>this.root.querySelector(o);if(this.modalOpen){t("#kf-loading").style.display="none",t("#kf-form").style.display="block";let o=t("#kf-error");o.textContent=e,o.style.display="block"}}showResult(e){let t=o=>this.root.querySelector(o);t("#kf-loading").style.display="none",t("#kf-form").style.display="none",t("#kf-result").style.display="block",this.root.querySelector("#kf-result-img").src=e}render(){let e=document.createElement("style");e.textContent=U,this.root.appendChild(e);let t=document.createElement("button");t.className="kf-trigger",t.innerHTML=`
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12l2 2 4-4"/>
        </svg>
        ${this.config.buttonText}
      `,this.root.appendChild(t);let o=document.createElement("div");o.className="kf-overlay",o.innerHTML=this.modalHTML(),this.root.appendChild(o),t.addEventListener("click",()=>this.open()),o.addEventListener("click",i=>{i.target===o&&this.close()}),this.bindEvents(),this.renderSavedPhotos()}modalHTML(){return`
        <div class="kf-modal">
          <button class="kf-close">&times;</button>
          <div class="kf-title">Virtual Try-On</div>
          <div class="kf-subtitle">See yourself in this kit on your bike</div>

          <div id="kf-form">
            <div class="kf-upload-area" id="kf-person-upload">
              <input type="file" accept="image/*" id="kf-person-input">
              <div class="kf-upload-label"><strong>Upload your photo</strong></div>
              <div class="kf-upload-hint">Full body, well-lit preferred</div>
            </div>
            <div class="kf-saved-photos" id="kf-person-saved" style="display:none"></div>

            <div class="kf-upload-area" id="kf-bike-upload">
              <input type="file" accept="image/*" id="kf-bike-input">
              <div class="kf-upload-label"><strong>Upload your bike</strong> (optional)</div>
              <div class="kf-upload-hint">Side view works best</div>
            </div>
            <div class="kf-saved-photos" id="kf-bike-saved" style="display:none"></div>

            <div class="kf-scene-label">Choose your scene</div>
            <div class="kf-scene-grid">
              ${C.map(e=>`
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
      `}bindEvents(){let e=s=>this.root.querySelector(s),t=s=>this.root.querySelector(s);e(".kf-close").addEventListener("click",()=>this.close());let o=e("#kf-person-upload"),i=t("#kf-person-input");o.addEventListener("click",()=>i.click()),o.addEventListener("dragover",s=>{s.preventDefault(),o.classList.add("dragover")}),o.addEventListener("dragleave",()=>o.classList.remove("dragover")),o.addEventListener("drop",s=>{s.preventDefault(),o.classList.remove("dragover");let d=s.dataTransfer?.files[0];d&&this.setPersonFile(d)}),i.addEventListener("change",()=>{i.files?.[0]&&this.setPersonFile(i.files[0])});let n=e("#kf-bike-upload"),a=t("#kf-bike-input");n.addEventListener("click",()=>a.click()),n.addEventListener("dragover",s=>{s.preventDefault(),n.classList.add("dragover")}),n.addEventListener("dragleave",()=>n.classList.remove("dragover")),n.addEventListener("drop",s=>{s.preventDefault(),n.classList.remove("dragover");let d=s.dataTransfer?.files[0];d&&this.setBikeFile(d)}),a.addEventListener("change",()=>{a.files?.[0]&&this.setBikeFile(a.files[0])}),this.root.querySelectorAll(".kf-scene-btn").forEach(s=>{s.addEventListener("click",()=>{this.root.querySelectorAll(".kf-scene-btn").forEach(d=>d.classList.remove("selected")),s.classList.add("selected"),this.selectedScene=s.dataset.scene})}),e("#kf-generate").addEventListener("click",()=>this.generate()),e("#kf-dismiss-btn").addEventListener("click",()=>this.close()),e("#kf-download").addEventListener("click",()=>this.download()),e("#kf-retry").addEventListener("click",()=>this.reset())}setPersonFile(e,t=!1){this.personFile=e;let o=this.root.querySelector("#kf-person-upload");o.classList.add("has-file"),o.querySelector(".kf-upload-label").innerHTML=`<strong>${e.name}</strong>`;let i=o.querySelector(".kf-upload-preview");i||(i=document.createElement("img"),i.className="kf-upload-preview",o.appendChild(i)),i.src=URL.createObjectURL(e),t||E(e).then(n=>{w(v,{name:e.name,dataUrl:n,ts:Date.now()}),this.renderSavedPhotos()}),this.updateGenerateButton()}setBikeFile(e,t=!1){this.bikeFile=e;let o=this.root.querySelector("#kf-bike-upload");o.classList.add("has-file"),o.querySelector(".kf-upload-label").innerHTML=`<strong>${e.name}</strong>`;let i=o.querySelector(".kf-upload-preview");i||(i=document.createElement("img"),i.className="kf-upload-preview",o.appendChild(i)),i.src=URL.createObjectURL(e),t||E(e).then(n=>{w(y,{name:e.name,dataUrl:n,ts:Date.now()}),this.renderSavedPhotos()})}updateGenerateButton(){let e=this.root.querySelector("#kf-generate");e.disabled=!this.personFile}async fetchGarmentImage(){return this.config.garmentImageUrl?this.fetchImageFromUrl(this.config.garmentImageUrl,"garment.jpg"):null}async generate(){let e=t=>this.root.querySelector(t);if(this.personFile){e("#kf-form").style.display="none",e("#kf-loading").style.display="block",e("#kf-error").style.display="none",e("#kf-dismiss-hint").style.display="none",setTimeout(()=>{let t=this.root.querySelector("#kf-dismiss-hint");t&&this.activeJobId&&(t.style.display="block")},3e3);try{let t=await this.fetchGarmentImage();if(!t)throw new Error("Could not load the product image. Please try again.");let o=null;this.selectedComplement&&(o=await this.fetchImageFromUrl(this.selectedComplement.imageUrl,"complement.jpg"));let i=crypto.randomUUID();this.activeJobId=i;let n=new FormData;n.append("api_key",this.config.apiKey),n.append("scene_preset",this.selectedScene),n.append("person_image",this.personFile),n.append("garment_image",t),n.append("job_id",i),o&&n.append("complement_image",o),this.config.productId&&n.append("product_id",this.config.productId),this.bikeFile&&n.append("bike_image",this.bikeFile);let a={jobId:i,apiUrl:this.config.apiUrl,pageUrl:window.location.href,startedAt:Date.now()};localStorage.setItem(l,JSON.stringify(a)),m=!0,S(a);let s;try{s=await fetch(`${this.config.apiUrl}/api/tryon`,{method:"POST",body:n})}catch{return}if(this.activeJobId!==i)return;if(!s.ok){let u="Generation failed";try{u=(await s.json()).error||u}catch{}throw new Error(u)}let g=(await s.json()).result_image;this.activeJobId=null,m=!1,localStorage.removeItem(l),this.modalOpen?this.showResult(g):k({jobId:i,resultImage:g,pageUrl:window.location.href,completedAt:Date.now()},()=>{this.open(),this.showResult(g)})}catch(t){this.activeJobId=null,m=!1,localStorage.removeItem(l);let o=t instanceof Error?t.message:"Something went wrong";if(this.modalOpen){e("#kf-loading").style.display="none",e("#kf-form").style.display="block";let i=e("#kf-error");i.textContent=o,i.style.display="block"}}}}download(){let t=this.root.querySelector("#kf-result-img").src;if(t.startsWith("data:")){let o=document.createElement("a");o.href=t,o.download="kitfit-tryon.jpg",o.click()}else fetch(t).then(o=>o.blob()).then(o=>{let i=URL.createObjectURL(o),n=document.createElement("a");n.href=i,n.download="kitfit-tryon.jpg",n.click(),URL.revokeObjectURL(i)}).catch(()=>{window.open(t,"_blank")})}reset(){let e=a=>this.root.querySelector(a);e("#kf-result").style.display="none",e("#kf-form").style.display="block",this.personFile=null,this.bikeFile=null,this.activeJobId=null;let t=this.root.querySelector("#kf-person-upload");t.classList.remove("has-file"),t.querySelector(".kf-upload-label").innerHTML="<strong>Upload your photo</strong>";let o=t.querySelector(".kf-upload-preview");o&&o.remove();let i=this.root.querySelector("#kf-bike-upload");i.classList.remove("has-file"),i.querySelector(".kf-upload-label").innerHTML="<strong>Upload your bike</strong> (optional)";let n=i.querySelector(".kf-upload-preview");n&&n.remove(),this.root.querySelectorAll(".kf-saved-thumb").forEach(a=>a.classList.remove("selected")),this.updateGenerateButton(),this.renderSavedPhotos()}renderSavedPhotos(){this.renderSavedSection("kf-person-saved",v,"person"),this.renderSavedSection("kf-bike-saved",y,"bike")}renderSavedSection(e,t,o){let i=this.root.querySelector(`#${e}`);if(!i)return;let n=x(t);if(n.length===0){i.style.display="none";return}i.style.display="block",i.innerHTML=`
        <div class="kf-saved-label">Recent photos</div>
        <div class="kf-saved-grid">
          ${n.map((a,s)=>`
            <div class="kf-saved-thumb" data-saved-type="${o}" data-saved-idx="${s}">
              <img src="${n[s].dataUrl}" alt="${n[s].name}">
            </div>
          `).join("")}
        </div>
      `,i.querySelectorAll(".kf-saved-thumb").forEach(a=>{a.addEventListener("click",()=>{let s=parseInt(a.dataset.savedIdx,10),d=n[s];if(!d)return;let g=M(d.dataUrl,d.name);o==="person"?this.setPersonFile(g,!0):this.setBikeFile(g,!0),i.querySelectorAll(".kf-saved-thumb").forEach(u=>u.classList.remove("selected")),a.classList.add("selected")})})}async fetchComplements(){if(!(!this.config.productId||!this.config.apiUrl))try{let e=await fetch(`${this.config.apiUrl}/api/products/${this.config.productId}/complements`);if(!e.ok)return;let t=await e.json();this.complements=t.complements||[],this.selectedComplement=this.complements.find(o=>o.isDefault)||null,this.renderComplements()}catch{}}renderComplements(){let e=this.root.querySelector("#kf-complements"),t=this.root.querySelector("#kf-complements-grid");if(!(!e||!t)){if(this.complements.length===0){e.style.display="none";return}e.style.display="block",t.innerHTML=this.complements.map(o=>`
        <div class="kf-complement-card${this.selectedComplement?.id===o.id?" selected":""}" data-complement-id="${o.id}">
          <img src="${o.imageUrl}" alt="${o.name}">
          <div class="kf-complement-name">${o.name}</div>
          ${o.isDefault?'<div class="kf-complement-default">recommended</div>':""}
        </div>
      `).join(""),t.querySelectorAll(".kf-complement-card").forEach(o=>{o.addEventListener("click",()=>{let i=o.dataset.complementId,n=this.complements.find(a=>a.id===i);n&&(this.selectedComplement?.id===n.id?this.selectedComplement=null:this.selectedComplement=n,this.renderComplements())})})}}async fetchImageFromUrl(e,t){try{let i=await(await fetch(e)).blob();return new File([i],t,{type:i.type})}catch{return null}}open(){this.root.querySelector(".kf-overlay").classList.add("open"),this.modalOpen=!0,this.complements.length===0&&this.fetchComplements()}close(){this.root.querySelector(".kf-overlay").classList.remove("open"),this.modalOpen=!1}}function I(){document.querySelectorAll("[data-kitfit]").forEach(r=>{let e=r;if(e.shadowRoot)return;let t={apiKey:e.dataset.kitfitKey||"",apiUrl:e.dataset.kitfitApi||f.apiUrl,productId:e.dataset.kitfitProduct||void 0,garmentImageUrl:e.dataset.kitfitGarment||void 0,buttonText:e.dataset.kitfitButton||f.buttonText};new L(e,t)}),J()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",I):I(),window.KitFitWidget=L})();})();
//# sourceMappingURL=kitfit.js.map
