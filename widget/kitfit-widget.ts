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
  `;

  const SCENES = [
    { id: "alpine", name: "Alpine", desc: "Mountain road, sunny" },
    { id: "coastal", name: "Coastal", desc: "Ocean road, bright" },
    { id: "forest", name: "Forest", desc: "Tree-lined, dappled light" },
    { id: "urban", name: "Urban", desc: "City streets, dawn" },
  ];

  class KitFitWidget {
    private config: KitFitConfig & typeof DEFAULTS;
    private root: ShadowRoot;
    private personFile: File | null = null;
    private bikeFile: File | null = null;
    private selectedScene: string = "alpine";

    constructor(el: HTMLElement, config: KitFitConfig) {
      this.config = { ...DEFAULTS, ...config };
      this.root = el.attachShadow({ mode: "open" });
      this.render();
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

            <div class="kf-upload-area" id="kf-bike-upload">
              <input type="file" accept="image/*" id="kf-bike-input">
              <div class="kf-upload-label"><strong>Upload your bike</strong> (optional)</div>
              <div class="kf-upload-hint">Side view works best</div>
            </div>

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

      // Result actions
      $("#kf-download").addEventListener("click", () => this.download());
      $("#kf-retry").addEventListener("click", () => this.reset());
    }

    private setPersonFile(file: File) {
      this.personFile = file;
      const area = this.root.querySelector(
        "#kf-person-upload"
      ) as HTMLElement;
      area.classList.add("has-file");
      area.querySelector(".kf-upload-label")!.innerHTML =
        `<strong>${file.name}</strong>`;
      this.updateGenerateButton();
    }

    private setBikeFile(file: File) {
      this.bikeFile = file;
      const area = this.root.querySelector("#kf-bike-upload") as HTMLElement;
      area.classList.add("has-file");
      area.querySelector(".kf-upload-label")!.innerHTML =
        `<strong>${file.name}</strong>`;
    }

    private updateGenerateButton() {
      const btn = this.root.querySelector(
        "#kf-generate"
      ) as HTMLButtonElement;
      btn.disabled = !this.personFile;
    }

    private async fetchGarmentImage(): Promise<File | null> {
      const url = this.config.garmentImageUrl;
      if (!url) return null;
      try {
        const resp = await fetch(url);
        const blob = await resp.blob();
        return new File([blob], "garment.jpg", { type: blob.type });
      } catch {
        return null;
      }
    }

    private async generate() {
      const $ = (sel: string) => this.root.querySelector(sel) as HTMLElement;

      if (!this.personFile) return;

      // Show loading
      $("#kf-form").style.display = "none";
      $("#kf-loading").style.display = "block";
      $("#kf-error").style.display = "none";

      try {
        let garmentFile = await this.fetchGarmentImage();
        if (!garmentFile) {
          throw new Error(
            "Could not load the product image. Please try again."
          );
        }

        const formData = new FormData();
        formData.append("api_key", this.config.apiKey);
        formData.append("scene_preset", this.selectedScene);
        formData.append("person_image", this.personFile);
        formData.append("garment_image", garmentFile);
        if (this.config.productId) {
          formData.append("product_id", this.config.productId);
        }
        if (this.bikeFile) {
          formData.append("bike_image", this.bikeFile);
        }

        const resp = await fetch(
          `${this.config.apiUrl}/api/tryon`,
          { method: "POST", body: formData }
        );

        if (!resp.ok) {
          let message = "Generation failed";
          try {
            const err = await resp.json();
            message = err.error || message;
          } catch {
            // Response body may be empty (e.g. timeout)
          }
          throw new Error(message);
        }

        const data = await resp.json();

        // Show result — image is a base64 data URL, lives only in the browser
        $("#kf-loading").style.display = "none";
        $("#kf-result").style.display = "block";
        (
          this.root.querySelector("#kf-result-img") as HTMLImageElement
        ).src = data.result_image;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        $("#kf-loading").style.display = "none";
        $("#kf-form").style.display = "block";
        const errorEl = $("#kf-error");
        errorEl.textContent = message;
        errorEl.style.display = "block";
      }
    }

    private download() {
      const img = this.root.querySelector(
        "#kf-result-img"
      ) as HTMLImageElement;
      const a = document.createElement("a");
      a.href = img.src;
      a.download = "kitfit-tryon.jpg";
      a.click();
    }

    private reset() {
      const $ = (sel: string) => this.root.querySelector(sel) as HTMLElement;
      $("#kf-result").style.display = "none";
      $("#kf-form").style.display = "block";
      this.personFile = null;
      this.bikeFile = null;

      const personArea = this.root.querySelector(
        "#kf-person-upload"
      ) as HTMLElement;
      personArea.classList.remove("has-file");
      personArea.querySelector(".kf-upload-label")!.innerHTML =
        '<strong>Upload your photo</strong>';

      const bikeArea = this.root.querySelector(
        "#kf-bike-upload"
      ) as HTMLElement;
      bikeArea.classList.remove("has-file");
      bikeArea.querySelector(".kf-upload-label")!.innerHTML =
        '<strong>Upload your bike</strong> (optional)';

      this.updateGenerateButton();
    }

    private open() {
      (this.root.querySelector(".kf-overlay") as HTMLElement).classList.add(
        "open"
      );
    }

    private close() {
      (
        this.root.querySelector(".kf-overlay") as HTMLElement
      ).classList.remove("open");
    }
  }

  // Auto-init: find all <div data-kitfit> elements and initialize
  function init() {
    document.querySelectorAll("[data-kitfit]").forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.shadowRoot) return; // Already initialized

      const config: KitFitConfig = {
        apiKey: htmlEl.dataset.kitfitKey || "",
        apiUrl: htmlEl.dataset.kitfitApi || DEFAULTS.apiUrl,
        productId: htmlEl.dataset.kitfitProduct || undefined,
        garmentImageUrl: htmlEl.dataset.kitfitGarment || undefined,
        buttonText: htmlEl.dataset.kitfitButton || DEFAULTS.buttonText,
      };

      new KitFitWidget(htmlEl, config);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for manual initialization
  (window as unknown as Record<string, unknown>).KitFitWidget = KitFitWidget;
})();
