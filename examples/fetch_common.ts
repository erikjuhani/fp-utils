export type Info = {
  name: string;
  initialRelease: number;
  description: string;
};

export type InfoResponse = {
  json: () => Promise<Info>;
};

export function notFound(): string {
  return "No info found";
}

export function format(info: Info): string {
  return `${info.name}\n | ${info.initialRelease}\n | ${info.description}`;
}

export function fetchSuccess(): Promise<InfoResponse> {
  const infoResponse = {
    json: () =>
      Promise.resolve({
        name: "Deno",
        initialRelease: 2018,
        description:
          "Deno is a runtime for JavaScript, TypeScript, and WebAssembly. Deno was co-created by Ryan Dahl, who also created Node.js.",
      }),
  };

  return Promise.resolve(infoResponse);
}

export function fetchFailure(): Promise<InfoResponse> {
  return Promise.reject();
}

export function fetchJsonFailure(): Promise<InfoResponse> {
  const infoResponse = {
    json: () => Promise.reject(),
  };

  return Promise.resolve(infoResponse);
}
