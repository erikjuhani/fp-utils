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
import * as Option from "option";
import { assertEquals } from "std:assert";

// deno-lint-ignore no-namespace
namespace WithoutOption {
  const tryGetDenoInfoSuccess = () =>
    Shared.fetchDenoInfoSuccess()
      .then((response) => response.json())
      .catch(() => undefined);

  export const formatDenoInfoSuccess = async () => {
    const denoInfo = await tryGetDenoInfoSuccess();
    if (denoInfo) return Shared.formatDenoInfo(denoInfo);
    else return Shared.notFound();
  };

  const tryGetDenoInfoFailure = () =>
    Shared.fetchDenoInfoFailure()
      .then((response) => response.json())
      .catch(() => undefined);

  export const formatDenoInfoFailure = async () => {
    const denoInfo = await tryGetDenoInfoFailure();
    if (denoInfo) return Shared.formatDenoInfo(denoInfo);
    else return Shared.notFound();
  };
}

// deno-lint-ignore no-namespace
namespace WithOption {
  const tryGetDenoInfoSuccess = () =>
    Shared.fetchDenoInfoSuccess()
      .then((response) => response.json())
      .then(Option.some)
      .catch(Option.none);

  export const formatDenoInfoSuccess = async () =>
    (await tryGetDenoInfoSuccess()).match(
      Shared.notFound,
      Shared.formatDenoInfo,
    );

  const tryGetDenoInfoFailure = () =>
    Shared.fetchDenoInfoFailure()
      .then(Option.some)
      .then(Option.map((response) => response.json()))
      .catch(Option.none);

  export const formatDenoInfoFailure = async () =>
    (await tryGetDenoInfoFailure()).match(
      Shared.notFound,
      Shared.formatDenoInfo,
    );
}

assertEquals(
  `Deno
 | 2018
 | Deno is a runtime for JavaScript, TypeScript, and WebAssembly. Deno was co-created by Ryan Dahl, who also created Node.js.`,
  await WithoutOption.formatDenoInfoSuccess(),
);

assertEquals(
  "No info found",
  await WithoutOption.formatDenoInfoFailure(),
);

assertEquals(
  `Deno
 | 2018
 | Deno is a runtime for JavaScript, TypeScript, and WebAssembly. Deno was co-created by Ryan Dahl, who also created Node.js.`,
  await WithOption.formatDenoInfoSuccess(),
);

assertEquals(
  "No info found",
  await WithOption.formatDenoInfoFailure(),
);

// deno-lint-ignore no-namespace
namespace Shared {
  export const notFound = (): string => "No info found";

  export const formatDenoInfo = (denoInfo: DenoInfo): string =>
    `${denoInfo.name}\n | ${denoInfo.initialRelease}\n | ${denoInfo.description}`;

  type DenoInfo = {
    name: string;
    initialRelease: number;
    description: string;
  };

  const denoInfoResponse = {
    json: () => ({
      name: "Deno",
      initialRelease: 2018,
      description:
        "Deno is a runtime for JavaScript, TypeScript, and WebAssembly. Deno was co-created by Ryan Dahl, who also created Node.js.",
    }),
  };

  export const fetchDenoInfoSuccess = (): Promise<typeof denoInfoResponse> =>
    Promise.resolve(denoInfoResponse);

  export const fetchDenoInfoFailure = (): Promise<typeof denoInfoResponse> =>
    Promise.reject();
}
