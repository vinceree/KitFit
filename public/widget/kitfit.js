"use strict";(()=>{var S=Object.defineProperty;var E=(d,c,f)=>c in d?S(d,c,{enumerable:!0,configurable:!0,writable:!0,value:f}):d[c]=f;var p=(d,c,f)=>E(d,typeof c!="symbol"?c+"":c,f);(function(){let d={apiUrl:"https://kitfit.app",buttonText:"Try it on your bike \u2192"},c=`
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
  `,f=[{id:"alpine",name:"Alpine",desc:"Mountain road, sunny"},{id:"coastal",name:"Coastal",desc:"Ocean road, bright"},{id:"forest",name:"Forest",desc:"Tree-lined, dappled light"},{id:"urban",name:"Urban",desc:"City streets, dawn"}],m="kf-person-photos",g="kf-bike-photos",x=3;function u(l){try{return JSON.parse(sessionStorage.getItem(l)||"[]")}catch{return[]}}function k(l,e){let o=u(l).filter(t=>t.name!==e.name);o.unshift(e),o.length>x&&o.pop();try{sessionStorage.setItem(l,JSON.stringify(o))}catch{o.pop();try{sessionStorage.setItem(l,JSON.stringify(o))}catch{}}}function h(l,e=1600,o=.85){return new Promise((t,i)=>{let n=new Image;n.onload=()=>{let{width:s,height:r}=n;(s>e||r>e)&&(s>r?(r=r/s*e,s=e):(s=s/r*e,r=e));let a=document.createElement("canvas");a.width=s,a.height=r,a.getContext("2d").drawImage(n,0,0,s,r),URL.revokeObjectURL(n.src),t(a.toDataURL("image/jpeg",o))},n.onerror=()=>{URL.revokeObjectURL(n.src),i(new Error("Failed to load image for compression"))},n.src=URL.createObjectURL(l)})}function w(l,e){let[o,t]=l.split(","),i=o.match(/:(.*?);/)?.[1]||"image/jpeg",n=atob(t),s=new Uint8Array(n.length);for(let r=0;r<n.length;r++)s[r]=n.charCodeAt(r);return new File([s],e,{type:i})}class b{constructor(e,o){p(this,"config");p(this,"root");p(this,"personFile",null);p(this,"bikeFile",null);p(this,"selectedScene","alpine");p(this,"complements",[]);p(this,"selectedComplement",null);this.config={...d,...o},this.config.apiUrl.endsWith("/")&&(this.config.apiUrl=this.config.apiUrl.slice(0,-1)),this.root=e.attachShadow({mode:"open"}),this.render()}render(){let e=document.createElement("style");e.textContent=c,this.root.appendChild(e);let o=document.createElement("button");o.className="kf-trigger",o.innerHTML=`
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12l2 2 4-4"/>
        </svg>
        ${this.config.buttonText}
      `,this.root.appendChild(o);let t=document.createElement("div");t.className="kf-overlay",t.innerHTML=this.modalHTML(),this.root.appendChild(t),o.addEventListener("click",()=>this.open()),t.addEventListener("click",i=>{i.target===t&&this.close()}),this.bindEvents(),this.renderSavedPhotos()}modalHTML(){return`
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
              ${f.map(e=>`
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
      `}bindEvents(){let e=r=>this.root.querySelector(r),o=r=>this.root.querySelector(r);e(".kf-close").addEventListener("click",()=>this.close());let t=e("#kf-person-upload"),i=o("#kf-person-input");t.addEventListener("click",()=>i.click()),t.addEventListener("dragover",r=>{r.preventDefault(),t.classList.add("dragover")}),t.addEventListener("dragleave",()=>t.classList.remove("dragover")),t.addEventListener("drop",r=>{r.preventDefault(),t.classList.remove("dragover");let a=r.dataTransfer?.files[0];a&&this.setPersonFile(a)}),i.addEventListener("change",()=>{i.files?.[0]&&this.setPersonFile(i.files[0])});let n=e("#kf-bike-upload"),s=o("#kf-bike-input");n.addEventListener("click",()=>s.click()),n.addEventListener("dragover",r=>{r.preventDefault(),n.classList.add("dragover")}),n.addEventListener("dragleave",()=>n.classList.remove("dragover")),n.addEventListener("drop",r=>{r.preventDefault(),n.classList.remove("dragover");let a=r.dataTransfer?.files[0];a&&this.setBikeFile(a)}),s.addEventListener("change",()=>{s.files?.[0]&&this.setBikeFile(s.files[0])}),this.root.querySelectorAll(".kf-scene-btn").forEach(r=>{r.addEventListener("click",()=>{this.root.querySelectorAll(".kf-scene-btn").forEach(a=>a.classList.remove("selected")),r.classList.add("selected"),this.selectedScene=r.dataset.scene})}),e("#kf-generate").addEventListener("click",()=>this.generate()),e("#kf-download").addEventListener("click",()=>this.download()),e("#kf-retry").addEventListener("click",()=>this.reset())}setPersonFile(e,o=!1){this.personFile=e;let t=this.root.querySelector("#kf-person-upload");t.classList.add("has-file"),t.querySelector(".kf-upload-label").innerHTML=`<strong>${e.name}</strong>`;let i=t.querySelector(".kf-upload-preview");i||(i=document.createElement("img"),i.className="kf-upload-preview",t.appendChild(i)),i.src=URL.createObjectURL(e),o||h(e).then(n=>{k(m,{name:e.name,dataUrl:n,ts:Date.now()}),this.renderSavedPhotos()}),this.updateGenerateButton()}setBikeFile(e,o=!1){this.bikeFile=e;let t=this.root.querySelector("#kf-bike-upload");t.classList.add("has-file"),t.querySelector(".kf-upload-label").innerHTML=`<strong>${e.name}</strong>`;let i=t.querySelector(".kf-upload-preview");i||(i=document.createElement("img"),i.className="kf-upload-preview",t.appendChild(i)),i.src=URL.createObjectURL(e),o||h(e).then(n=>{k(g,{name:e.name,dataUrl:n,ts:Date.now()}),this.renderSavedPhotos()})}updateGenerateButton(){let e=this.root.querySelector("#kf-generate");e.disabled=!this.personFile}async fetchGarmentImage(){return this.config.garmentImageUrl?this.fetchImageFromUrl(this.config.garmentImageUrl,"garment.jpg"):null}async generate(){let e=o=>this.root.querySelector(o);if(this.personFile){e("#kf-form").style.display="none",e("#kf-loading").style.display="block",e("#kf-error").style.display="none";try{let o=await this.fetchGarmentImage();if(!o)throw new Error("Could not load the product image. Please try again.");let t=null;this.selectedComplement&&(t=await this.fetchImageFromUrl(this.selectedComplement.imageUrl,"complement.jpg"));let i=new FormData;i.append("api_key",this.config.apiKey),i.append("scene_preset",this.selectedScene),i.append("person_image",this.personFile),i.append("garment_image",o),t&&i.append("complement_image",t),this.config.productId&&i.append("product_id",this.config.productId),this.bikeFile&&i.append("bike_image",this.bikeFile);let n=await fetch(`${this.config.apiUrl}/api/tryon`,{method:"POST",body:i});if(!n.ok){let r="Generation failed";try{r=(await n.json()).error||r}catch{}throw new Error(r)}let s=await n.json();e("#kf-loading").style.display="none",e("#kf-result").style.display="block",this.root.querySelector("#kf-result-img").src=s.result_image}catch(o){let t=o instanceof Error?o.message:"Something went wrong";e("#kf-loading").style.display="none",e("#kf-form").style.display="block";let i=e("#kf-error");i.textContent=t,i.style.display="block"}}}download(){let e=this.root.querySelector("#kf-result-img"),o=document.createElement("a");o.href=e.src,o.download="kitfit-tryon.jpg",o.click()}reset(){let e=s=>this.root.querySelector(s);e("#kf-result").style.display="none",e("#kf-form").style.display="block",this.personFile=null,this.bikeFile=null;let o=this.root.querySelector("#kf-person-upload");o.classList.remove("has-file"),o.querySelector(".kf-upload-label").innerHTML="<strong>Upload your photo</strong>";let t=o.querySelector(".kf-upload-preview");t&&t.remove();let i=this.root.querySelector("#kf-bike-upload");i.classList.remove("has-file"),i.querySelector(".kf-upload-label").innerHTML="<strong>Upload your bike</strong> (optional)";let n=i.querySelector(".kf-upload-preview");n&&n.remove(),this.root.querySelectorAll(".kf-saved-thumb").forEach(s=>s.classList.remove("selected")),this.updateGenerateButton(),this.renderSavedPhotos()}renderSavedPhotos(){this.renderSavedSection("kf-person-saved",m,"person"),this.renderSavedSection("kf-bike-saved",g,"bike")}renderSavedSection(e,o,t){let i=this.root.querySelector(`#${e}`);if(!i)return;let n=u(o);if(n.length===0){i.style.display="none";return}i.style.display="block",i.innerHTML=`
        <div class="kf-saved-label">Recent photos</div>
        <div class="kf-saved-grid">
          ${n.map((s,r)=>`
            <div class="kf-saved-thumb" data-saved-type="${t}" data-saved-idx="${r}">
              <img src="${n[r].dataUrl}" alt="${n[r].name}">
            </div>
          `).join("")}
        </div>
      `,i.querySelectorAll(".kf-saved-thumb").forEach(s=>{s.addEventListener("click",()=>{let r=parseInt(s.dataset.savedIdx,10),a=n[r];if(!a)return;let y=w(a.dataUrl,a.name);t==="person"?this.setPersonFile(y,!0):this.setBikeFile(y,!0),i.querySelectorAll(".kf-saved-thumb").forEach(L=>L.classList.remove("selected")),s.classList.add("selected")})})}async fetchComplements(){if(!(!this.config.productId||!this.config.apiUrl))try{let e=await fetch(`${this.config.apiUrl}/api/products/${this.config.productId}/complements`);if(!e.ok)return;let o=await e.json();this.complements=o.complements||[],this.selectedComplement=this.complements.find(t=>t.isDefault)||null,this.renderComplements()}catch{}}renderComplements(){let e=this.root.querySelector("#kf-complements"),o=this.root.querySelector("#kf-complements-grid");if(!(!e||!o)){if(this.complements.length===0){e.style.display="none";return}e.style.display="block",o.innerHTML=this.complements.map(t=>`
        <div class="kf-complement-card${this.selectedComplement?.id===t.id?" selected":""}" data-complement-id="${t.id}">
          <img src="${t.imageUrl}" alt="${t.name}">
          <div class="kf-complement-name">${t.name}</div>
          ${t.isDefault?'<div class="kf-complement-default">recommended</div>':""}
        </div>
      `).join(""),o.querySelectorAll(".kf-complement-card").forEach(t=>{t.addEventListener("click",()=>{let i=t.dataset.complementId,n=this.complements.find(s=>s.id===i);n&&(this.selectedComplement?.id===n.id?this.selectedComplement=null:this.selectedComplement=n,this.renderComplements())})})}}async fetchImageFromUrl(e,o){try{let i=await(await fetch(e)).blob();return new File([i],o,{type:i.type})}catch{return null}}open(){this.root.querySelector(".kf-overlay").classList.add("open"),this.complements.length===0&&this.fetchComplements()}close(){this.root.querySelector(".kf-overlay").classList.remove("open")}}function v(){document.querySelectorAll("[data-kitfit]").forEach(l=>{let e=l;if(e.shadowRoot)return;let o={apiKey:e.dataset.kitfitKey||"",apiUrl:e.dataset.kitfitApi||d.apiUrl,productId:e.dataset.kitfitProduct||void 0,garmentImageUrl:e.dataset.kitfitGarment||void 0,buttonText:e.dataset.kitfitButton||d.buttonText};new b(e,o)})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",v):v(),window.KitFitWidget=b})();})();
//# sourceMappingURL=kitfit.js.map
