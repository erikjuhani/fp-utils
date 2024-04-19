// Demonstrates how the Result type can be used with existing JSON.parse
// functionality.
import { assertEquals } from "@std/assert";
import { Result } from "@fp-utils/result";

type JSONWithProperty = { property: number };

const validateJSON = (json: Record<string, unknown>) => {
  const isJSONWithProperty = (
    value: Record<string, unknown>,
  ): value is JSONWithProperty => "property" in value;

  if (isJSONWithProperty(json)) return json;

  throw Error(
    `Wrong type of json, expected "property" field, got "${Object.keys(json)}"`,
  );
};

// deno-lint-ignore no-namespace
export namespace Native {
  export const parseJSON = <R extends Record<string, unknown>>(
    rawJson: string,
  ) => {
    try {
      return JSON.parse(rawJson) as R;
    } catch (err) {
      throw err as SyntaxError;
    }
  };

  export const invalidJSON = () => {
    try {
      return JSON.stringify(parseJSON(""));
    } catch (err) {
      return (err as Error).message;
    }
  };

  export const invalidJSONContent = () => {
    try {
      const json = parseJSON('{ "prop": 42 }');
      return JSON.stringify(validateJSON(json));
    } catch (err) {
      return (err as Error).message;
    }
  };

  export const validJSONContent = () => {
    try {
      const json = parseJSON('{ "property": 42 }');
      return JSON.stringify(validateJSON(json));
    } catch (err) {
      return (err as Error).message;
    }
  };
}

// deno-lint-ignore no-namespace
export namespace WithResult {
  export const parseJSON = <R extends Record<string, unknown>>(
    rawJson: string,
  ) => Result.from<R, SyntaxError>(() => JSON.parse(rawJson));

  export const invalidJSON = () =>
    parseJSON("")
      .mapErr((err) => err.message);

  export const invalidJSONContent = () =>
    parseJSON('{ "prop": 42 }')
      .flatMap((json) =>
        Result.from(() => validateJSON(json), (err: Error) => err.message)
      )
      .map(JSON.stringify);

  export const validJSONContent = () =>
    parseJSON('{ "property": 42 }')
      .flatMap((json) =>
        Result.from(() => validateJSON(json), (err: Error) => err.message)
      )
      .map(JSON.stringify);
}

assertEquals(
  "Unexpected end of JSON input",
  Native.invalidJSON(),
);

assertEquals(
  "Unexpected end of JSON input",
  WithResult.invalidJSON().unwrapErr(),
);

assertEquals(
  'Wrong type of json, expected "property" field, got "prop"',
  Native.invalidJSONContent(),
);

assertEquals(
  'Wrong type of json, expected "property" field, got "prop"',
  WithResult.invalidJSONContent().unwrapErr(),
);

assertEquals(
  '{"property":42}',
  Native.validJSONContent(),
);

assertEquals(
  '{"property":42}',
  WithResult.validJSONContent().unwrap(),
);
