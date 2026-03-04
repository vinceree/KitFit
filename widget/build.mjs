import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["widget/kitfit-widget.ts"],
  bundle: true,
  minify: true,
  outfile: "public/widget/kitfit.js",
  format: "iife",
  target: ["es2020"],
  sourcemap: true,
});

console.log("Widget built → public/widget/kitfit.js");
