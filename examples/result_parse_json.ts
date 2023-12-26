// Demonstrates how the Result type can be used with existing JSON.parse
// functionality.
import * as Result from "../result/mod.ts";

const parseJSON = <R extends Record<string, unknown>>(rawJson: string) =>
  Result.fromThrowable<R, SyntaxError>(() => JSON.parse(rawJson))
    .mapErr((err) => err.message);

type JSONWithProperty = { property: number };

const invalidJSON = parseJSON<JSONWithProperty>("");

console.log(invalidJSON.unwrapErr());

const validateJSON = (json: Record<string, unknown>) => {
  const isJSONWithProperty = (
    value: Record<string, unknown>,
  ): value is JSONWithProperty => "property" in value;

  if (isJSONWithProperty(json)) return json;

  throw new Error(
    `Wrong type of json, expected "property" field, got "${Object.keys(json)}"`,
  );
};

const invalidJSONContent = parseJSON('{ "prop": 42 }').flatMap((json) =>
  Result.fromThrowable(() => validateJSON(json))
);

console.log(invalidJSONContent.unwrapErr());

const validJSONContent = parseJSON('{ "property": 42 }').flatMap((json) =>
  Result.fromThrowable(() => validateJSON(json))
);

console.log(validJSONContent.unwrap());
