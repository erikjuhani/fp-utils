// This simple example demonstrates the differences between writing TypeScript
// without the Option type and with the Option type. Both success and failure
// cases are demonstrated.
//
// We "fetch" the deno information from the "API" and then try to format the
// deno information.
//
// The option example demonstrates how easy it is to attach options to existing
// TypeScript functionality and how options can ultimately compress the lines
// of code by making the logic into one sequence.
import * as Option from "../option/mod.ts";
import { std } from "dev_deps";

const { assert } = std;

// deno-lint-ignore no-namespace
namespace WithoutOption {
  const tryGetDenoInfoSuccess = () =>
    fetchDenoInfoSuccess()
      .then((response) => response.json())
      .catch(() => undefined);

  export const formatDenoInfoSuccess = async () => {
    const denoInfo = await tryGetDenoInfoSuccess();
    if (denoInfo) return formatDenoInfo(denoInfo);
    else return notFound();
  };

  const tryGetDenoInfoFailure = () =>
    fetchDenoInfoFailure()
      .then((response) => response.json())
      .catch(() => undefined);

  export const formatDenoInfoFailure = async () => {
    const denoInfo = await tryGetDenoInfoFailure();
    if (denoInfo) return formatDenoInfo(denoInfo);
    else return notFound();
  };
}

// deno-lint-ignore no-namespace
namespace WithOption {
  const tryGetDenoInfoSuccess = Option.fromPromise(fetchDenoInfoSuccess);

  export const formatDenoInfoSuccess = async () =>
    (await tryGetDenoInfoSuccess)
      .map((response) => response.json())
      .match(
        notFound,
        formatDenoInfo,
      );

  const tryGetDenoInfoFailure = Option.fromPromise(fetchDenoInfoFailure);

  export const formatDenoInfoFailure = async () =>
    (await tryGetDenoInfoFailure)
      .map((response) => response.json())
      .match(
        notFound,
        formatDenoInfo,
      );
}

assert.assertEquals(
  `Deno
 | 2018
 | Deno is a runtime for JavaScript, TypeScript, and WebAssembly. Deno was co-created by Ryan Dahl, who also created Node.js.`,
  await WithoutOption.formatDenoInfoSuccess(),
);

assert.assertEquals(
  "No info found",
  await WithoutOption.formatDenoInfoFailure(),
);

assert.assertEquals(
  `Deno
 | 2018
 | Deno is a runtime for JavaScript, TypeScript, and WebAssembly. Deno was co-created by Ryan Dahl, who also created Node.js.`,
  await WithOption.formatDenoInfoSuccess(),
);

assert.assertEquals(
  "No info found",
  await WithOption.formatDenoInfoFailure(),
);

function notFound(): string {
  return "No info found";
}

function formatDenoInfo(denoInfo: DenoInfo): string {
  return `${denoInfo.name}\n | ${denoInfo.initialRelease}\n | ${denoInfo.description}`;
}

type DenoInfo = {
  name: string;
  initialRelease: number;
  description: string;
};

function fetchDenoInfoSuccess(): Promise<{ json: () => DenoInfo }> {
  const denoInfoResponse = {
    json: () => ({
      name: "Deno",
      initialRelease: 2018,
      description:
        "Deno is a runtime for JavaScript, TypeScript, and WebAssembly. Deno was co-created by Ryan Dahl, who also created Node.js.",
    }),
  };

  return Promise.resolve(denoInfoResponse);
}

function fetchDenoInfoFailure(): Promise<{ json: () => DenoInfo }> {
  return Promise.reject();
}
