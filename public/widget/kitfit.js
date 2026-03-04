"use strict";(()=>{var g=Object.defineProperty;var b=(n,a,d)=>a in n?g(n,a,{enumerable:!0,configurable:!0,writable:!0,value:d}):n[a]=d;var f=(n,a,d)=>b(n,typeof a!="symbol"?a+"":a,d);(function(){let n={apiUrl:"https://kitfit.app",buttonText:"Try it on your bike \u2192"},a=`
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

    @media (max-width: 480px) {
      .kf-modal { padding: 20px; margin: 8px; }
      .kf-scene-grid { grid-template-columns: 1fr; }
    }
  `,d=[{id:"alpine",name:"Alpine",desc:"Mountain road, sunny"},{id:"coastal",name:"Coastal",desc:"Ocean road, bright"},{id:"forest",name:"Forest",desc:"Tree-lined, dappled light"},{id:"urban",name:"Urban",desc:"City streets, dawn"}];class p{constructor(e,t){f(this,"config");f(this,"root");f(this,"personFile",null);f(this,"bikeFile",null);f(this,"selectedScene","alpine");this.config={...n,...t},this.root=e.attachShadow({mode:"open"}),this.render()}render(){let e=document.createElement("style");e.textContent=a,this.root.appendChild(e);let t=document.createElement("button");t.className="kf-trigger",t.innerHTML=`
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12l2 2 4-4"/>
        </svg>
        ${this.config.buttonText}
      `,this.root.appendChild(t);let o=document.createElement("div");o.className="kf-overlay",o.innerHTML=this.modalHTML(),this.root.appendChild(o),t.addEventListener("click",()=>this.open()),o.addEventListener("click",r=>{r.target===o&&this.close()}),this.bindEvents()}modalHTML(){return`
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

            <div class="kf-upload-area" id="kf-bike-upload">
              <input type="file" accept="image/*" id="kf-bike-input">
              <div class="kf-upload-label"><strong>Upload your bike</strong> (optional)</div>
              <div class="kf-upload-hint">Side view works best</div>
            </div>

            <div class="kf-scene-label">Choose your scene</div>
            <div class="kf-scene-grid">
              ${d.map(e=>`
                <button class="kf-scene-btn${e.id==="alpine"?" selected":""}" data-scene="${e.id}">
                  <div class="kf-scene-name">${e.name}</div>
                  <div class="kf-scene-desc">${e.desc}</div>
                </button>
              `).join("")}
            </div>

            <div id="kf-error" class="kf-error" style="display:none"></div>

            <button class="kf-generate-btn" id="kf-generate" disabled>Generate Try-On</button>
          </div>

          <div id="kf-loading" class="kf-loading" style="display:none">
            <div class="kf-spinner"></div>
            <div class="kf-loading-text">Generating your try-on image...</div>
            <div class="kf-upload-hint" style="margin-top:8px">This usually takes 10-15 seconds</div>
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
      `}bindEvents(){let e=i=>this.root.querySelector(i),t=i=>this.root.querySelector(i);e(".kf-close").addEventListener("click",()=>this.close());let o=e("#kf-person-upload"),r=t("#kf-person-input");o.addEventListener("click",()=>r.click()),o.addEventListener("dragover",i=>{i.preventDefault(),o.classList.add("dragover")}),o.addEventListener("dragleave",()=>o.classList.remove("dragover")),o.addEventListener("drop",i=>{i.preventDefault(),o.classList.remove("dragover");let l=i.dataTransfer?.files[0];l&&this.setPersonFile(l)}),r.addEventListener("change",()=>{r.files?.[0]&&this.setPersonFile(r.files[0])});let s=e("#kf-bike-upload"),c=t("#kf-bike-input");s.addEventListener("click",()=>c.click()),s.addEventListener("dragover",i=>{i.preventDefault(),s.classList.add("dragover")}),s.addEventListener("dragleave",()=>s.classList.remove("dragover")),s.addEventListener("drop",i=>{i.preventDefault(),s.classList.remove("dragover");let l=i.dataTransfer?.files[0];l&&this.setBikeFile(l)}),c.addEventListener("change",()=>{c.files?.[0]&&this.setBikeFile(c.files[0])}),this.root.querySelectorAll(".kf-scene-btn").forEach(i=>{i.addEventListener("click",()=>{this.root.querySelectorAll(".kf-scene-btn").forEach(l=>l.classList.remove("selected")),i.classList.add("selected"),this.selectedScene=i.dataset.scene})}),e("#kf-generate").addEventListener("click",()=>this.generate()),e("#kf-download").addEventListener("click",()=>this.download()),e("#kf-retry").addEventListener("click",()=>this.reset())}setPersonFile(e){this.personFile=e;let t=this.root.querySelector("#kf-person-upload");t.classList.add("has-file"),t.querySelector(".kf-upload-label").innerHTML=`<strong>${e.name}</strong>`,this.updateGenerateButton()}setBikeFile(e){this.bikeFile=e;let t=this.root.querySelector("#kf-bike-upload");t.classList.add("has-file"),t.querySelector(".kf-upload-label").innerHTML=`<strong>${e.name}</strong>`}updateGenerateButton(){let e=this.root.querySelector("#kf-generate");e.disabled=!this.personFile}async fetchGarmentImage(){let e=this.config.garmentImageUrl;if(!e)return null;try{let o=await(await fetch(e)).blob();return new File([o],"garment.jpg",{type:o.type})}catch{return null}}async generate(){let e=t=>this.root.querySelector(t);if(this.personFile){e("#kf-form").style.display="none",e("#kf-loading").style.display="block",e("#kf-error").style.display="none";try{let t=await this.fetchGarmentImage();if(!t)throw new Error("Could not load the product image. Please try again.");let o=new FormData;o.append("api_key",this.config.apiKey),o.append("scene_preset",this.selectedScene),o.append("person_image",this.personFile),o.append("garment_image",t),this.config.productId&&o.append("product_id",this.config.productId),this.bikeFile&&o.append("bike_image",this.bikeFile);let r=await fetch(`${this.config.apiUrl}/api/tryon`,{method:"POST",body:o});if(!r.ok){let c=await r.json();throw new Error(c.error||"Generation failed")}let s=await r.json();e("#kf-loading").style.display="none",e("#kf-result").style.display="block",this.root.querySelector("#kf-result-img").src=s.result_image_url}catch(t){let o=t instanceof Error?t.message:"Something went wrong";e("#kf-loading").style.display="none",e("#kf-form").style.display="block";let r=e("#kf-error");r.textContent=o,r.style.display="block"}}}download(){let e=this.root.querySelector("#kf-result-img"),t=document.createElement("a");t.href=e.src,t.download="kitfit-tryon.jpg",t.click()}reset(){let e=r=>this.root.querySelector(r);e("#kf-result").style.display="none",e("#kf-form").style.display="block",this.personFile=null,this.bikeFile=null;let t=this.root.querySelector("#kf-person-upload");t.classList.remove("has-file"),t.querySelector(".kf-upload-label").innerHTML="<strong>Upload your photo</strong>";let o=this.root.querySelector("#kf-bike-upload");o.classList.remove("has-file"),o.querySelector(".kf-upload-label").innerHTML="<strong>Upload your bike</strong> (optional)",this.updateGenerateButton()}open(){this.root.querySelector(".kf-overlay").classList.add("open")}close(){this.root.querySelector(".kf-overlay").classList.remove("open")}}function u(){document.querySelectorAll("[data-kitfit]").forEach(k=>{let e=k;if(e.shadowRoot)return;let t={apiKey:e.dataset.kitfitKey||"",apiUrl:e.dataset.kitfitApi||n.apiUrl,productId:e.dataset.kitfitProduct||void 0,garmentImageUrl:e.dataset.kitfitGarment||void 0,buttonText:e.dataset.kitfitButton||n.buttonText};new p(e,t)})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",u):u(),window.KitFitWidget=p})();})();
//# sourceMappingURL=kitfit.js.map
