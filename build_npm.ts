import { dnt, std } from "dev_deps";

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

const parseArgs = () => {
  const { mod } = std.flags.parse<Args>(Deno.args);
  if (!mod || typeof mod !== "string") {
    throw Error(
      "No module directory provided, please provide a module directory using `--mod <module_name>`",
    );
  }

  return { mod };
};

const loadDenoJSON = async (mod: string): Promise<DenoJSON> => {
  const { default: { exports: _exports, exclude: _exclude, ...denoJson } } =
    await import(`./${mod}/deno.json`, { with: { type: "json" } });
  return denoJson;
};

const commentsRegex = /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm;

const { mod } = parseArgs();
const denoJson = await loadDenoJSON(mod);

async function build(module: string) {
  const outDir = `./${module}/dist`;

  const copyReadme = () => Deno.copyFileSync("LICENSE", `${outDir}/LICENSE`);

  const copyLicense = () =>
    Deno.copyFileSync(`./${module}/README.md`, `${outDir}/README.md`);

  const stripCommentsFromJSFiles = (...filepaths: string[]) => {
    const decoder = new TextDecoder("utf-8");

    filepaths.forEach((filepath) => {
      const file = decoder.decode(Deno.readFileSync(filepath));
      Deno.writeTextFileSync(
        filepath,
        file.replace(commentsRegex, ""),
      );
    });
  };

  await dnt.emptyDir(outDir);

  await dnt.build({
    entryPoints: [`./${module}/mod.ts`],
    outDir,
    shims: {},
    // Separate type declarations
    declaration: "separate",
    // Do not include test files in the artifact
    test: false,
    package: denoJson,
    postBuild: () => {
      copyLicense();
      copyReadme();
      stripCommentsFromJSFiles(
        `${outDir}/esm/mod.js`,
        `${outDir}/script/mod.js`,
      );
    },
  });
}

build(mod);
