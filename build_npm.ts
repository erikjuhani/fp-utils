import { dnt, std } from "dev_deps";

type Args = { version?: string; mod?: string };

const { version: parsedVersion, mod } = std.flags.parse<Args>(Deno.args);

const commentsRegex = /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm;

if (!mod || typeof mod !== "string") {
  throw Error(
    "No mod provided, please provide a module directory using `--mod <module_name>`",
  );
}

const { default: packageJson } = await import(`./${mod}/pkg.json`, {
  with: { type: "json" },
});

const git = new Deno.Command("git", { args: ["rev-parse", "HEAD"] })
  .outputSync();

const version = parsedVersion ??
  `0.0.0-${new TextDecoder().decode(git.stdout).slice(0, 7)}`;

async function build() {
  const outDir = `./${mod}/dist`;

  const copyReadme = () => Deno.copyFileSync("LICENSE", `${outDir}/LICENSE`);

  const copyLicense = () =>
    Deno.copyFileSync(`./${mod}/README.md`, `${outDir}/README.md`);

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
    entryPoints: [`./${mod}/mod.ts`],
    outDir,
    shims: {},
    // Separate type declarations
    declaration: "separate",
    // Do not include test files in the artifact
    test: false,
    package: { ...packageJson, version },
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

build();
