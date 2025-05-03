import * as esbuild from "esbuild";
import path from "path";
import pkg from "package.json";

const externalDeps = pkg.dependencies ? Object.keys(pkg.dependencies) : [];

const isWatchMode = process.argv.includes("--watch");

/** @type {esbuild.SameShape<esbuild.BuildOptions, esbuild.BuildOptions>} */
const options = {
  entryPoints: ["src/index.ts"],
  outfile: "lib/index.js",
  bundle: true,
  write: true,
  treeShaking: true,
  minify: !isWatchMode,
  // minifyWhitespace: true,
  // minifyIdentifiers: true,
  // minifySyntax: true,
  sourcemap: true,
  platform: "node",
  target: "ES2022",
  format: "esm",
  resolveExtensions: [".js", ".ts"],
  alias: {
    "@freedmen-s-trucking/types": path.resolve(__dirname, "../../common/types/src/index.ts"),
  },
  external: externalDeps,
};

if (isWatchMode) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
} else {
  await esbuild.build(options);
}
