"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SCENES = [
  { id: "alpine", name: "Alpine", desc: "Mountain road, sunny" },
  { id: "coastal", name: "Coastal", desc: "Ocean road, bright" },
  { id: "forest", name: "Forest", desc: "Tree-lined, dappled light" },
  { id: "urban", name: "Urban", desc: "City streets, dawn" },
] as const;

interface DemoTryOnProps {
  apiKey: string;
  appUrl: string;
}

function UploadBox({
  label,
  hint,
  file,
  onFile,
  required,
}: {
  label: string;
  hint: string;
  file: File | null;
  onFile: (f: File) => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
        file
          ? "border-green-400 bg-green-50"
          : dragOver
            ? "border-blue-400 bg-blue-50"
            : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <p className="text-sm font-medium text-slate-600">
        {file ? file.name : label}
        {required && !file && <span className="text-red-400 ml-1">*</span>}
      </p>
      <p className="text-xs text-slate-400 mt-1">{hint}</p>
      {file && (
        <img
          src={URL.createObjectURL(file)}
          alt="preview"
          className="mx-auto mt-3 max-h-28 rounded-lg"
        />
      )}
    </div>
  );
}

export function DemoTryOn({ apiKey, appUrl }: DemoTryOnProps) {
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [bikeFile, setBikeFile] = useState<File | null>(null);
  const [scene, setScene] = useState("alpine");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const canGenerate = personFile && garmentFile && apiKey;

  async function handleGenerate() {
    if (!personFile || !garmentFile || !apiKey) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("api_key", apiKey);
      formData.append("person_image", personFile);
      formData.append("garment_image", garmentFile);
      formData.append("scene_preset", scene);
      if (bikeFile) {
        formData.append("bike_image", bikeFile);
      }

      const res = await fetch(`${appUrl}/api/tryon`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "Generation failed";
        try {
          const err = await res.json();
          message = err.error || message;
        } catch {
          // Response body may be empty (e.g. timeout)
        }
        throw new Error(message);
      }

      const data = await res.json();
      setResultImage(data.result_image);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  function handleReset() {
    setPersonFile(null);
    setGarmentFile(null);
    setBikeFile(null);
    setScene("alpine");
    setStatus("idle");
    setResultImage(null);
    setErrorMsg("");
  }

  if (!apiKey) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-slate-500">
            No API key found. Please sign up first to generate an API key.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left: Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadBox
            label="Upload your photo"
            hint="Full body, well-lit preferred"
            file={personFile}
            onFile={setPersonFile}
            required
          />
          <UploadBox
            label="Upload garment / jersey image"
            hint="The kit you want to try on"
            file={garmentFile}
            onFile={setGarmentFile}
            required
          />
          <UploadBox
            label="Upload your bike (optional)"
            hint="Side view works best"
            file={bikeFile}
            onFile={setBikeFile}
          />

          <div>
            <p className="text-sm font-semibold text-slate-900 mb-2">Choose a scene</p>
            <div className="grid grid-cols-2 gap-2">
              {SCENES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScene(s.id)}
                  className={`text-left p-3 rounded-lg border-2 transition-colors ${
                    scene === s.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {errorMsg}
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={!canGenerate || status === "loading"}
            onClick={handleGenerate}
          >
            {status === "loading" ? "Generating..." : "Generate Try-On"}
          </Button>
        </CardContent>
      </Card>

      {/* Right: Result */}
      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-sm text-slate-500">Generating your try-on image...</p>
              <p className="text-xs text-slate-400 mt-1">This usually takes 10-15 seconds</p>
            </div>
          )}

          {status === "done" && resultImage && (
            <div className="space-y-4">
              <img
                src={resultImage}
                alt="Try-on result"
                className="w-full rounded-xl"
              />
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = resultImage;
                    a.download = "kitfit-tryon.jpg";
                    a.click();
                  }}
                >
                  Download
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm text-slate-500 mb-4">Generation failed. Check the error and try again.</p>
              <Button variant="outline" onClick={() => setStatus("idle")}>
                Dismiss
              </Button>
            </div>
          )}

          {status === "idle" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-4xl mb-3">
                <svg className="w-12 h-12 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
              </div>
              <p className="text-sm text-slate-400">
                Upload your images and hit generate to see the result here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
