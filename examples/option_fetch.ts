// This simple example demonstrates the differences between writing TypeScript
// without the Option type and with the Option type. Both success and failure
// cases are demonstrated.
//
// We "fetch" the deno information from the "API" and then try to format the
// deno information.
//
// This option example demonstrates how easy it is to attach options to
// existing TypeScript functionality and how options can ultimately compress
// the lines of code by making the logic into one sequence.
import { std } from "dev_deps";
import {
  fetchFailure,
  fetchSuccess,
  format,
  InfoResponse,
  notFound,
} from "./fetch_common.ts";
import { Option } from "../option/mod.ts";

const { assert } = std;

// deno-lint-ignore no-namespace
export namespace Native {
  const tryGetInfo = (fetch: () => Promise<InfoResponse>) =>
    fetch()
      .then((response) => response.json())
      .catch(() => {
        throw Error("Unexpected error");
      });

  export const infoSuccess = async () => {
    const info = await tryGetInfo(fetchSuccess);
    if (info) return format(info);
    else return notFound();
  };

  export const infoFailure = async () => {
    try {
      const denoInfo = await tryGetInfo(fetchFailure);
      if (denoInfo) return format(denoInfo);
      else return notFound();
    } catch (_err) {
      return notFound();
    }
  };
}

// deno-lint-ignore no-namespace
export namespace WithOption {
  const tryGetInfo = (fetch: () => Promise<InfoResponse>) =>
    Option.fromPromise(fetch);

  export const infoSuccess = async () =>
    (await tryGetInfo(fetchSuccess))
      .map((response) => response.json())
      .match(
        format,
        notFound,
      );

  export const infoFailure = async () =>
    (await tryGetInfo(fetchFailure))
      .map((response) => response.json())
      .match(
        format,
        notFound,
      );
}

assert.assertEquals(
  `Deno
 | 2018
 | Deno is a runtime for JavaScript, TypeScript, and WebAssembly. Deno was co-created by Ryan Dahl, who also created Node.js.`,
  await Native.infoSuccess(),
);

assert.assertEquals(
  "No info found",
  await Native.infoFailure(),
);

assert.assertEquals(
  `Deno
 | 2018
 | Deno is a runtime for JavaScript, TypeScript, and WebAssembly. Deno was co-created by Ryan Dahl, who also created Node.js.`,
  await WithOption.infoSuccess(),
);

assert.assertEquals(
  "No info found",
  await WithOption.infoFailure(),
);
