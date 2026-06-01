/**
 * KitFit Virtual Try-On Widget
 * Embeddable vanilla JS widget that works on any website.
 * Uses Shadow DOM to avoid CSS conflicts with host site.
 */

interface KitFitConfig {
  apiKey: string;
  apiUrl?: string;
  productId?: string;
  garmentImageUrl?: string;
  buttonText?: string;
}

(function () {
  const DEFAULTS = {
    apiUrl: "https://kitfit.app",
    buttonText: "Try it on your bike →",
  };

  // ── LocalStorage keys ──────────────────────────────────────────
  const STORAGE_PENDING = "kf-pending-job";
  const STORAGE_RESULT = "kf-completed-job";
  const POLL_INTERVAL = 3000;
  const JOB_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  interface PendingJob {
    jobId: string;
    apiUrl: string;
    pageUrl: string;
    startedAt: number;
  }

  interface CompletedJob {
    jobId: string;
    resultImage: string;
    pageUrl: string;
    completedAt: number;
  }

  const STYLES = `
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
  `;

  const SCENES = [
    { id: "alpine", name: "Alpine", desc: "Mountain road, sunny" },
    { id: "coastal", name: "Coastal", desc: "Ocean road, bright" },
    { id: "forest", name: "Forest", desc: "Tree-lined, dappled light" },
    { id: "urban", name: "Urban", desc: "City streets, dawn" },
  ];

  // ── Session photo cache ──────────────────────────────────────────
  const SESSION_PERSON = "kf-person-photos";
  const SESSION_BIKE = "kf-bike-photos";
  const MAX_SAVED = 3;

  interface SavedPhoto {
    name: string;
    dataUrl: string;
    ts: number;
  }

  function loadSaved(key: string): SavedPhoto[] {
    try {
      return JSON.parse(sessionStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  }

  function saveTo(key: string, photo: SavedPhoto) {
    const photos = loadSaved(key).filter((p) => p.name !== photo.name);
    photos.unshift(photo);
    if (photos.length > MAX_SAVED) photos.pop();
    try {
      sessionStorage.setItem(key, JSON.stringify(photos));
    } catch {
      photos.pop();
      try {
        sessionStorage.setItem(key, JSON.stringify(photos));
      } catch {
        /* storage full — silently skip */
      }
    }
  }

  function compressImage(
    file: File,
    maxDim = 1600,
    quality = 0.85
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }
        const c = document.createElement("canvas");
        c.width = width;
        c.height = height;
        c.getContext("2d")!.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(img.src);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Failed to load image for compression"));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  function dataUrlToFile(dataUrl: string, name: string): File {
    const [header, b64] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
    const bytes = atob(b64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new File([arr], name, { type: mime });
  }

  interface Complement {
    id: string;
    name: string;
    imageUrl: string;
    category: string | null;
    isDefault: boolean;
  }

  // ── Notification toast (injected into host page, outside Shadow DOM) ──

  function injectToastStyles() {
    if (document.getElementById("kf-toast-styles")) return;
    const style = document.createElement("style");
    style.id = "kf-toast-styles";
    style.textContent = `
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
    `;
    document.head.appendChild(style);
  }

  function showToast(result: CompletedJob, onClick?: () => void) {
    dismissToast();
    injectToastStyles();

    const toast = document.createElement("div");
    toast.id = "kf-toast-notification";
    toast.innerHTML = `
      <img src="${result.resultImage}" alt="Try-on result">
      <div class="kf-toast-body">
        <div class="kf-toast-title">Your try-on is ready!</div>
        <div class="kf-toast-subtitle">Click to view your image</div>
      </div>
      <button class="kf-toast-close">&times;</button>
    `;

    toast.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest(".kf-toast-close")) {
        dismissToast();
        return;
      }
      dismissToast();
      if (onClick) {
        onClick();
      } else if (result.pageUrl && result.pageUrl !== window.location.href) {
        window.location.href = result.pageUrl;
      }
    });

    document.body.appendChild(toast);

    // Auto-dismiss after 30 seconds
    setTimeout(() => dismissToast(), 30000);
  }

  function dismissToast() {
    const existing = document.getElementById("kf-toast-notification");
    if (existing) {
      existing.style.animation = "kf-toast-out 0.3s ease-in forwards";
      setTimeout(() => existing.remove(), 300);
    }
  }

  // ── Global background polling for pending jobs ──────────────────

  let globalPollingActive = false;

  function checkPendingJobs() {
    if (globalPollingActive) return;

    const pendingJson = localStorage.getItem(STORAGE_PENDING);
    if (!pendingJson) return;

    let pending: PendingJob;
    try {
      pending = JSON.parse(pendingJson);
    } catch {
      localStorage.removeItem(STORAGE_PENDING);
      return;
    }

    if (Date.now() - pending.startedAt > JOB_TIMEOUT) {
      localStorage.removeItem(STORAGE_PENDING);
      return;
    }

    globalPollingActive = true;
    pollJob(pending);
  }

  async function pollJob(pending: PendingJob) {
    const { jobId, apiUrl } = pending;

    while (globalPollingActive) {
      try {
        const resp = await fetch(`${apiUrl}/api/tryon/jobs/${jobId}`);
        if (!resp.ok) break;
        const data = await resp.json();

        if (data.status === "completed" && data.resultImage) {
          const result: CompletedJob = {
            jobId,
            resultImage: data.resultImage,
            pageUrl: pending.pageUrl,
            completedAt: Date.now(),
          };
          localStorage.setItem(STORAGE_RESULT, JSON.stringify(result));
          localStorage.removeItem(STORAGE_PENDING);
          globalPollingActive = false;

          // Dispatch event for widget instances to pick up
          document.dispatchEvent(
            new CustomEvent("kf-job-complete", { detail: result })
          );
          return;
        }

        if (data.status === "failed") {
          localStorage.removeItem(STORAGE_PENDING);
          globalPollingActive = false;
          document.dispatchEvent(
            new CustomEvent("kf-job-error", {
              detail: { jobId, error: data.error || "Generation failed" },
            })
          );
          return;
        }

        // Still processing/pending — check for timeout
        if (Date.now() - pending.startedAt > JOB_TIMEOUT) {
          localStorage.removeItem(STORAGE_PENDING);
          globalPollingActive = false;
          return;
        }
      } catch {
        // Network error — retry on next interval
      }

      await new Promise((r) => setTimeout(r, POLL_INTERVAL));
    }
  }

  // ── Widget class ───────────────────────────────────────────────
  class KitFitWidget {
    private config: KitFitConfig & typeof DEFAULTS;
    private root: ShadowRoot;
    private personFile: File | null = null;
    private bikeFile: File | null = null;
    private selectedScene: string = "alpine";
    private complements: Complement[] = [];
    private selectedComplement: Complement | null = null;
    private activeJobId: string | null = null;
    private modalOpen = false;

    constructor(el: HTMLElement, config: KitFitConfig) {
      this.config = { ...DEFAULTS, ...config };
      if (this.config.apiUrl.endsWith("/")) {
        this.config.apiUrl = this.config.apiUrl.slice(0, -1);
      }
      this.root = el.attachShadow({ mode: "open" });
      this.render();
      this.listenForJobEvents();
      this.checkForCompletedResult();
    }

    private listenForJobEvents() {
      document.addEventListener("kf-job-complete", ((e: CustomEvent) => {
        const result = e.detail as CompletedJob;
        this.onJobComplete(result);
      }) as EventListener);

      document.addEventListener("kf-job-error", ((e: CustomEvent) => {
        const { jobId, error } = e.detail;
        if (this.activeJobId === jobId) {
          this.onJobError(error);
        }
      }) as EventListener);
    }

    private checkForCompletedResult() {
      const resultJson = localStorage.getItem(STORAGE_RESULT);
      if (!resultJson) return;

      let result: CompletedJob;
      try {
        result = JSON.parse(resultJson);
      } catch {
        localStorage.removeItem(STORAGE_RESULT);
        return;
      }

      if (result.pageUrl === window.location.href) {
        localStorage.removeItem(STORAGE_RESULT);
        this.open();
        this.showResult(result.resultImage);
      } else {
        showToast(result);
      }
    }

    private onJobComplete(result: CompletedJob) {
      if (this.modalOpen && this.activeJobId === result.jobId) {
        // Modal is open on the same page — show result directly
        this.showResult(result.resultImage);
        localStorage.removeItem(STORAGE_RESULT);
      } else if (result.pageUrl === window.location.href) {
        // Same page but modal closed — show toast that re-opens widget
        showToast(result, () => {
          localStorage.removeItem(STORAGE_RESULT);
          this.open();
          this.showResult(result.resultImage);
        });
      } else {
        // Different page — show toast with navigation link
        showToast(result);
      }
      this.activeJobId = null;
    }

    private onJobError(error: string) {
      this.activeJobId = null;
      const $ = (sel: string) => this.root.querySelector(sel) as HTMLElement;
      if (this.modalOpen) {
        $("#kf-loading").style.display = "none";
        $("#kf-form").style.display = "block";
        const errorEl = $("#kf-error");
        errorEl.textContent = error;
        errorEl.style.display = "block";
      }
    }

    private showResult(imageUrl: string) {
      const $ = (sel: string) => this.root.querySelector(sel) as HTMLElement;
      $("#kf-loading").style.display = "none";
      $("#kf-form").style.display = "none";
      $("#kf-result").style.display = "block";
      (this.root.querySelector("#kf-result-img") as HTMLImageElement).src =
        imageUrl;
    }

    private render() {
      const style = document.createElement("style");
      style.textContent = STYLES;
      this.root.appendChild(style);

      const trigger = document.createElement("button");
      trigger.className = "kf-trigger";
      trigger.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12l2 2 4-4"/>
        </svg>
        ${this.config.buttonText}
      `;
      this.root.appendChild(trigger);

      const overlay = document.createElement("div");
      overlay.className = "kf-overlay";
      overlay.innerHTML = this.modalHTML();
      this.root.appendChild(overlay);

      trigger.addEventListener("click", () => this.open());
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) this.close();
      });

      this.bindEvents();
      this.renderSavedPhotos();
    }

    private modalHTML(): string {
      return `
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
              ${SCENES.map(
                (s) => `
                <button class="kf-scene-btn${s.id === "alpine" ? " selected" : ""}" data-scene="${s.id}">
                  <div class="kf-scene-name">${s.name}</div>
                  <div class="kf-scene-desc">${s.desc}</div>
                </button>
              `
              ).join("")}
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
      `;
    }

    private bindEvents() {
      const $ = (sel: string) => this.root.querySelector(sel) as HTMLElement;
      const $input = (sel: string) =>
        this.root.querySelector(sel) as HTMLInputElement;

      $(".kf-close").addEventListener("click", () => this.close());

      // Person upload
      const personArea = $("#kf-person-upload");
      const personInput = $input("#kf-person-input");
      personArea.addEventListener("click", () => personInput.click());
      personArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        personArea.classList.add("dragover");
      });
      personArea.addEventListener("dragleave", () =>
        personArea.classList.remove("dragover")
      );
      personArea.addEventListener("drop", (e) => {
        e.preventDefault();
        personArea.classList.remove("dragover");
        const file = (e as DragEvent).dataTransfer?.files[0];
        if (file) this.setPersonFile(file);
      });
      personInput.addEventListener("change", () => {
        if (personInput.files?.[0]) this.setPersonFile(personInput.files[0]);
      });

      // Bike upload
      const bikeArea = $("#kf-bike-upload");
      const bikeInput = $input("#kf-bike-input");
      bikeArea.addEventListener("click", () => bikeInput.click());
      bikeArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        bikeArea.classList.add("dragover");
      });
      bikeArea.addEventListener("dragleave", () =>
        bikeArea.classList.remove("dragover")
      );
      bikeArea.addEventListener("drop", (e) => {
        e.preventDefault();
        bikeArea.classList.remove("dragover");
        const file = (e as DragEvent).dataTransfer?.files[0];
        if (file) this.setBikeFile(file);
      });
      bikeInput.addEventListener("change", () => {
        if (bikeInput.files?.[0]) this.setBikeFile(bikeInput.files[0]);
      });

      // Scene selection
      this.root.querySelectorAll(".kf-scene-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.root
            .querySelectorAll(".kf-scene-btn")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
          this.selectedScene = (btn as HTMLElement).dataset.scene!;
        });
      });

      // Generate
      $("#kf-generate").addEventListener("click", () => this.generate());

      // Continue Browsing (dismiss during loading)
      $("#kf-dismiss-btn").addEventListener("click", () => this.close());

      // Result actions
      $("#kf-download").addEventListener("click", () => this.download());
      $("#kf-retry").addEventListener("click", () => this.reset());
    }

    private setPersonFile(file: File, fromCache = false) {
      this.personFile = file;
      const area = this.root.querySelector(
        "#kf-person-upload"
      ) as HTMLElement;
      area.classList.add("has-file");
      area.querySelector(".kf-upload-label")!.innerHTML =
        `<strong>${file.name}</strong>`;

      let preview = area.querySelector(
        ".kf-upload-preview"
      ) as HTMLImageElement;
      if (!preview) {
        preview = document.createElement("img");
        preview.className = "kf-upload-preview";
        area.appendChild(preview);
      }
      preview.src = URL.createObjectURL(file);

      if (!fromCache) {
        compressImage(file).then((dataUrl) => {
          saveTo(SESSION_PERSON, {
            name: file.name,
            dataUrl,
            ts: Date.now(),
          });
          this.renderSavedPhotos();
        });
      }

      this.updateGenerateButton();
    }

    private setBikeFile(file: File, fromCache = false) {
      this.bikeFile = file;
      const area = this.root.querySelector("#kf-bike-upload") as HTMLElement;
      area.classList.add("has-file");
      area.querySelector(".kf-upload-label")!.innerHTML =
        `<strong>${file.name}</strong>`;

      let preview = area.querySelector(
        ".kf-upload-preview"
      ) as HTMLImageElement;
      if (!preview) {
        preview = document.createElement("img");
        preview.className = "kf-upload-preview";
        area.appendChild(preview);
      }
      preview.src = URL.createObjectURL(file);

      if (!fromCache) {
        compressImage(file).then((dataUrl) => {
          saveTo(SESSION_BIKE, {
            name: file.name,
            dataUrl,
            ts: Date.now(),
          });
          this.renderSavedPhotos();
        });
      }
    }

    private updateGenerateButton() {
      const btn = this.root.querySelector(
        "#kf-generate"
      ) as HTMLButtonElement;
      btn.disabled = !this.personFile;
    }

    private async fetchGarmentImage(): Promise<File | null> {
      if (!this.config.garmentImageUrl) return null;
      return this.fetchImageFromUrl(this.config.garmentImageUrl, "garment.jpg");
    }

    private async generate() {
      const $ = (sel: string) => this.root.querySelector(sel) as HTMLElement;

      if (!this.personFile) return;

      // Show loading state
      $("#kf-form").style.display = "none";
      $("#kf-loading").style.display = "block";
      $("#kf-error").style.display = "none";
      $("#kf-dismiss-hint").style.display = "none";

      // Show "continue browsing" option after 3 seconds
      setTimeout(() => {
        const hint = this.root.querySelector("#kf-dismiss-hint") as HTMLElement;
        if (hint && this.activeJobId) {
          hint.style.display = "block";
        }
      }, 3000);

      try {
        const garmentFile = await this.fetchGarmentImage();
        if (!garmentFile) {
          throw new Error(
            "Could not load the product image. Please try again."
          );
        }

        let complementFile: File | null = null;
        if (this.selectedComplement) {
          complementFile = await this.fetchImageFromUrl(
            this.selectedComplement.imageUrl,
            "complement.jpg"
          );
        }

        // Generate a job ID for async tracking
        const jobId = crypto.randomUUID();
        this.activeJobId = jobId;

        const formData = new FormData();
        formData.append("api_key", this.config.apiKey);
        formData.append("scene_preset", this.selectedScene);
        formData.append("person_image", this.personFile);
        formData.append("garment_image", garmentFile);
        formData.append("job_id", jobId);
        if (complementFile) {
          formData.append("complement_image", complementFile);
        }
        if (this.config.productId) {
          formData.append("product_id", this.config.productId);
        }
        if (this.bikeFile) {
          formData.append("bike_image", this.bikeFile);
        }

        // Store pending job in localStorage so that if the user navigates to
        // another page, the script there can resume polling and notify them.
        const pendingJob: PendingJob = {
          jobId,
          apiUrl: this.config.apiUrl,
          pageUrl: window.location.href,
          startedAt: Date.now(),
        };
        localStorage.setItem(STORAGE_PENDING, JSON.stringify(pendingJob));

        // Start background polling as the CROSS-PAGE fallback. If the user
        // navigates away, the script on the next page picks up STORAGE_PENDING
        // and keeps polling until the server finishes and the result appears.
        globalPollingActive = true;
        pollJob(pendingJob);

        // Meanwhile, await the direct response. As long as we're still on this
        // page (whether the modal is open or the user clicked "Continue
        // browsing"), this resolves with the image directly — no dependency on
        // the database or storage. If the user navigates away, this fetch is
        // aborted and the polling fallback above takes over on the next page.
        let resp: Response;
        try {
          resp = await fetch(`${this.config.apiUrl}/api/tryon`, {
            method: "POST",
            body: formData,
          });
        } catch {
          // Aborted by navigation, or a network error. If we're still here,
          // let the polling fallback continue; otherwise this code is gone.
          return;
        }

        // Ignore if this job was superseded (e.g. user hit "Try Again").
        if (this.activeJobId !== jobId) return;

        if (!resp.ok) {
          let message = "Generation failed";
          try {
            const err = await resp.json();
            message = err.error || message;
          } catch {
            /* empty body (e.g. timeout) */
          }
          throw new Error(message);
        }

        const data = await resp.json();
        const resultImage: string = data.result_image;

        // We have the result directly — stop the polling fallback and clear the
        // pending marker so it doesn't trigger a duplicate notification.
        this.activeJobId = null;
        globalPollingActive = false;
        localStorage.removeItem(STORAGE_PENDING);

        if (this.modalOpen) {
          // User is watching — show the result inline.
          this.showResult(resultImage);
        } else {
          // User clicked "Continue browsing" but stayed on this page — notify
          // them with a toast that re-opens the widget showing their image.
          showToast(
            {
              jobId,
              resultImage,
              pageUrl: window.location.href,
              completedAt: Date.now(),
            },
            () => {
              this.open();
              this.showResult(resultImage);
            }
          );
        }
      } catch (err: unknown) {
        this.activeJobId = null;
        globalPollingActive = false;
        localStorage.removeItem(STORAGE_PENDING);
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        // Only surface the error if the user is still looking at the modal.
        if (this.modalOpen) {
          $("#kf-loading").style.display = "none";
          $("#kf-form").style.display = "block";
          const errorEl = $("#kf-error");
          errorEl.textContent = message;
          errorEl.style.display = "block";
        }
      }
    }

    private download() {
      const img = this.root.querySelector(
        "#kf-result-img"
      ) as HTMLImageElement;
      const src = img.src;

      if (src.startsWith("data:")) {
        // Base64 data URL — direct download
        const a = document.createElement("a");
        a.href = src;
        a.download = "kitfit-tryon.jpg";
        a.click();
      } else {
        // External URL — fetch as blob for download
        fetch(src)
          .then((r) => r.blob())
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "kitfit-tryon.jpg";
            a.click();
            URL.revokeObjectURL(url);
          })
          .catch(() => {
            // Fallback: open in new tab
            window.open(src, "_blank");
          });
      }
    }

    private reset() {
      const $ = (sel: string) => this.root.querySelector(sel) as HTMLElement;
      $("#kf-result").style.display = "none";
      $("#kf-form").style.display = "block";
      this.personFile = null;
      this.bikeFile = null;
      this.activeJobId = null;

      const personArea = this.root.querySelector(
        "#kf-person-upload"
      ) as HTMLElement;
      personArea.classList.remove("has-file");
      personArea.querySelector(".kf-upload-label")!.innerHTML =
        '<strong>Upload your photo</strong>';
      const personPreview = personArea.querySelector(".kf-upload-preview");
      if (personPreview) personPreview.remove();

      const bikeArea = this.root.querySelector(
        "#kf-bike-upload"
      ) as HTMLElement;
      bikeArea.classList.remove("has-file");
      bikeArea.querySelector(".kf-upload-label")!.innerHTML =
        '<strong>Upload your bike</strong> (optional)';
      const bikePreview = bikeArea.querySelector(".kf-upload-preview");
      if (bikePreview) bikePreview.remove();

      this.root
        .querySelectorAll(".kf-saved-thumb")
        .forEach((t) => t.classList.remove("selected"));

      this.updateGenerateButton();
      this.renderSavedPhotos();
    }

    private renderSavedPhotos() {
      this.renderSavedSection("kf-person-saved", SESSION_PERSON, "person");
      this.renderSavedSection("kf-bike-saved", SESSION_BIKE, "bike");
    }

    private renderSavedSection(
      containerId: string,
      sessionKey: string,
      type: "person" | "bike"
    ) {
      const container = this.root.querySelector(
        `#${containerId}`
      ) as HTMLElement;
      if (!container) return;

      const photos = loadSaved(sessionKey);
      if (photos.length === 0) {
        container.style.display = "none";
        return;
      }

      container.style.display = "block";
      container.innerHTML = `
        <div class="kf-saved-label">Recent photos</div>
        <div class="kf-saved-grid">
          ${photos
            .map(
              (_, i) => `
            <div class="kf-saved-thumb" data-saved-type="${type}" data-saved-idx="${i}">
              <img src="${photos[i].dataUrl}" alt="${photos[i].name}">
            </div>
          `
            )
            .join("")}
        </div>
      `;

      container.querySelectorAll(".kf-saved-thumb").forEach((thumb) => {
        thumb.addEventListener("click", () => {
          const idx = parseInt(
            (thumb as HTMLElement).dataset.savedIdx!,
            10
          );
          const photo = photos[idx];
          if (!photo) return;
          const file = dataUrlToFile(photo.dataUrl, photo.name);
          if (type === "person") {
            this.setPersonFile(file, true);
          } else {
            this.setBikeFile(file, true);
          }
          container
            .querySelectorAll(".kf-saved-thumb")
            .forEach((t) => t.classList.remove("selected"));
          thumb.classList.add("selected");
        });
      });
    }

    private async fetchComplements() {
      if (!this.config.productId || !this.config.apiUrl) return;
      try {
        const resp = await fetch(
          `${this.config.apiUrl}/api/products/${this.config.productId}/complements`
        );
        if (!resp.ok) return;
        const data = await resp.json();
        this.complements = data.complements || [];
        this.selectedComplement =
          this.complements.find((c) => c.isDefault) || null;
        this.renderComplements();
      } catch {
        /* silently skip — complements are optional */
      }
    }

    private renderComplements() {
      const container = this.root.querySelector(
        "#kf-complements"
      ) as HTMLElement;
      const grid = this.root.querySelector(
        "#kf-complements-grid"
      ) as HTMLElement;
      if (!container || !grid) return;

      if (this.complements.length === 0) {
        container.style.display = "none";
        return;
      }

      container.style.display = "block";
      grid.innerHTML = this.complements
        .map(
          (c) => `
        <div class="kf-complement-card${this.selectedComplement?.id === c.id ? " selected" : ""}" data-complement-id="${c.id}">
          <img src="${c.imageUrl}" alt="${c.name}">
          <div class="kf-complement-name">${c.name}</div>
          ${c.isDefault ? '<div class="kf-complement-default">recommended</div>' : ""}
        </div>
      `
        )
        .join("");

      grid.querySelectorAll(".kf-complement-card").forEach((card) => {
        card.addEventListener("click", () => {
          const id = (card as HTMLElement).dataset.complementId;
          const comp = this.complements.find((c) => c.id === id);
          if (comp) {
            if (this.selectedComplement?.id === comp.id) {
              this.selectedComplement = null;
            } else {
              this.selectedComplement = comp;
            }
            this.renderComplements();
          }
        });
      });
    }

    private async fetchImageFromUrl(url: string, name: string): Promise<File | null> {
      try {
        const resp = await fetch(url);
        const blob = await resp.blob();
        return new File([blob], name, { type: blob.type });
      } catch {
        return null;
      }
    }

    private open() {
      (this.root.querySelector(".kf-overlay") as HTMLElement).classList.add(
        "open"
      );
      this.modalOpen = true;
      if (this.complements.length === 0) {
        this.fetchComplements();
      }
    }

    private close() {
      (
        this.root.querySelector(".kf-overlay") as HTMLElement
      ).classList.remove("open");
      this.modalOpen = false;
    }
  }

  // ── Auto-init ───────────────────────────────────────────────────
  function init() {
    document.querySelectorAll("[data-kitfit]").forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.shadowRoot) return;

      const config: KitFitConfig = {
        apiKey: htmlEl.dataset.kitfitKey || "",
        apiUrl: htmlEl.dataset.kitfitApi || DEFAULTS.apiUrl,
        productId: htmlEl.dataset.kitfitProduct || undefined,
        garmentImageUrl: htmlEl.dataset.kitfitGarment || undefined,
        buttonText: htmlEl.dataset.kitfitButton || DEFAULTS.buttonText,
      };

      new KitFitWidget(htmlEl, config);
    });

    // Check for pending jobs from previous pages (handles cross-page navigation)
    checkPendingJobs();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  (window as unknown as Record<string, unknown>).KitFitWidget = KitFitWidget;
})();
