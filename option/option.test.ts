import { std } from "dev_deps";
import * as Option from "./mod.ts";

const { assertThrows, assertEquals } = std.assert;
const { mock } = std.testing;
const { test } = Deno;

test("Option.some passing null or undefined throws", () => {
  [null, undefined].forEach((value) => {
    assertThrows(
      // @ts-expect-error testing purposes
      () => Option.some(value),
      "Trying to pass nullable value to Some",
    );
  });
});

test("Option.isSome", () => {
  const tests: [Option.Type<unknown>, boolean][] = [
    [Option.some(0), true],
    [Option.none(), false],
  ];

  tests.forEach(([input, expected]) => {
    assertEquals(Option.isSome(input), expected);
  });
});

test("Option.isNone", () => {
  const tests: [Option.Type<unknown>, boolean][] = [
    [Option.some(0), false],
    [Option.none(), true],
  ];

  tests.forEach(([input, expected]) => {
    assertEquals(Option.isNone(input), expected);
  });
});

test("Option.unwrap on Some returns Option value", () => {
  assertEquals(Option.unwrap(Option.some(0)), 0);
});

test("Option.unwrap on None throws", () => {
  assertThrows(() => Option.unwrap(Option.none()), "Called unwrap on None");
});

test("Option.unwrapOr on Some returns Option value", () => {
  assertEquals(Option.unwrapOr(1)(Option.some(0)), 0);
});

test("Option.unwrapOr on None returns or value", () => {
  assertEquals(Option.unwrapOr(1)(Option.none()), 1);
});

test("Option.inspect", () => {
  const mapSpy = mock.spy((value: number) => value + 1);
  const actual = Option.inspect(mapSpy)(Option.some(0));
  mock.assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Option.some(0));
});

test("Option.inspect on None does not execute", () => {
  const mapSpy = mock.spy((value: number) => value + 1);
  const actual = Option.inspect(mapSpy)(Option.none());
  mock.assertSpyCalls(mapSpy, 0);
  assertEquals(actual, Option.none());
});

test("Option.map", () => {
  const mapSpy = mock.spy((value: number) => value + 1);
  const actual = Option.map(mapSpy)(Option.some(0));
  mock.assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Option.some(1));
});

test("Option.map on None does not execute", () => {
  const mapSpy = mock.spy((value: number) => value + 1);
  const actual = Option.map(mapSpy)(Option.none());

  mock.assertSpyCalls(mapSpy, 0);
  assertEquals(actual, Option.none());
});

test("Option.bind", () => {
  const mapSpy = mock.spy((value: number) => Option.some(value + 1));
  const actual = Option.bind(mapSpy)(Option.some(0));
  mock.assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Option.some(1));
});

test("Option.bind on None does not execute", () => {
  const mapSpy = mock.spy((value: number) => Option.some(value + 1));
  const actual = Option.bind(mapSpy)(Option.none());
  mock.assertSpyCalls(mapSpy, 0);
  assertEquals(actual, Option.none());
});

test("Option.match Some", () => {
  const actual = Option.match(() => "No value", (some) => `${some}`)(
    Option.some(0),
  );
  assertEquals(actual, "0");
});

test("Option.match None", () => {
  const actual = Option.match(() => "No value", (some) => `${some}`)(
    Option.none(),
  );
  assertEquals(actual, "No value");
});

test("Option.fromNullable", () => {
  type FromNullableTableTests = [
    number | string | null | undefined,
    Option.Type<unknown>,
  ][];

  const tests: FromNullableTableTests = [
    [0, Option.some(0)],
    [null, Option.none()],
    ["", Option.some("")],
    [undefined, Option.none()],
  ];

  tests.forEach(([input, expected]) => {
    const actual = Option.fromNullable(input);
    assertEquals(actual, expected);
  });
});
