import { parseArgs } from "@std/cli";
import { build, emptyDir } from "@deno/dnt";
import { Err, Ok, Result } from "@fp-utils/result";
import { minify_sync } from "terser";

type Args = { mod?: string };

type DenoJSON = {
  name: string;
  version: string;
  description: string;
  keywords: string[];
  homepage: string;
  publishConfig: { access: string };
  bugs: { url: string };
  license: string;
  author: string;
  repository: { type: string; url: string };
};

const decoder = new TextDecoder("utf-8");

const parseModuleDir = (args: string[]) =>
  Result.from(() => parseArgs<Args>(args))
    .flatMap(({ mod }) =>
      mod && typeof mod === "string" ? Ok(mod) : Err(
        "No module directory provided, please provide a module directory using `--mod <module_dir>`",
      )
    );

const loadDenoJSON = (moduleDir: string): Promise<Result<DenoJSON, unknown>> =>
  Result.from(async () => {
    const { default: { exports: _exports, exclude: _exclude, ...denoJson } } =
      await import(`./${moduleDir}/deno.json`, { with: { type: "json" } });
    return denoJson;
  });

async function buildModule(args: string[]) {
  const moduleDir = parseModuleDir(args)
    .expect("The required `--mod` option is missing");

  const denoJson = await loadDenoJSON(moduleDir).then(
    Result.expect(`Unable to load \`deno.json\` file from ${moduleDir}`),
  );

  const outDir = `./${moduleDir}/dist`;

  const copyLicense = () => Deno.copyFileSync("LICENSE", `${outDir}/LICENSE`);

  const copyReadme = () =>
    Deno.copyFileSync(`./${moduleDir}/README.md`, `${outDir}/README.md`);

  const readFile = (filepath: string) =>
    Result.from(() => decoder.decode(Deno.readFileSync(filepath)));

  const replace = (from: string, to: string) => (content: string) =>
    content.replaceAll(from, to);

  const minifyFile = (filepath: string) => (content: string) =>
    minify_sync(content, {
      ecma: 2020,
      module: filepath.includes("esm"),
    }).code ?? "";

  const minify = (filepath: string) => {
    const minifiedContent = readFile(filepath)
      .map(minifyFile(filepath))
      .expect(`Could not read file in ${filepath}`);

    Deno.writeTextFileSync(
      filepath,
      minifiedContent,
    );
  };

  const replaceDenoSymbols = (filepath: string) => {
    const replacedContent = readFile(filepath)
      .map(replace("Deno.customInspect", "nodejs.util.inspect.custom"))
      .expect(`Could not read file in ${filepath}`);

    Deno.writeTextFileSync(
      filepath,
      replacedContent,
    );
  };

  await emptyDir(outDir);

  await build({
    entryPoints: [`./${moduleDir}/mod.ts`],
    outDir,
    shims: {},
    // Separate type declarations
    declaration: "separate",
    // Do not include test files in the artifact
    test: false,
    package: denoJson,
    compilerOptions: {
      target: "ES2022",
    },
    postBuild: () => {
      copyLicense();
      copyReadme();

      const files = [
        `${outDir}/esm/mod.js`,
        `${outDir}/esm/${moduleDir}.js`,
        `${outDir}/script/mod.js`,
        `${outDir}/script/${moduleDir}.js`,
      ];

      files.forEach((filepath) => {
        replaceDenoSymbols(filepath);
        minify(filepath);
      });
    },
  });
}

buildModule(Deno.args);
