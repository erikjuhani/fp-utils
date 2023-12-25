import { std } from "dev_deps";
import * as Result from "./mod.ts";

const { assertThrows, assertEquals } = std.assert;
const { mock } = std.testing;
const { test } = Deno;

test("Result.isOk", () => {
  const tests: [Result.Type<unknown, unknown>, boolean][] = [
    [Result.ok(0), true],
    [Result.err(0), false],
  ];

  tests.forEach(([input, expected]) => {
    assertEquals(Result.isOk(input), expected);
  });
});

test("Result.isErr", () => {
  const tests: [Result.Type<unknown, unknown>, boolean][] = [
    [Result.ok(0), false],
    [Result.err(0), true],
  ];

  tests.forEach(([input, expected]) => {
    assertEquals(Result.isErr(input), expected);
  });
});

test("Result.unwrap on Ok returns Ok value", () => {
  assertEquals(Result.unwrap(Result.ok(0)), 0);
});

test("Result.unwrap on Err throws", () => {
  assertThrows(() => Result.unwrap(Result.err(0)), "Called unwrap on Err");
});

test("Result.unwrapErr on Err returns Err value", () => {
  assertEquals(Result.unwrapErr(Result.err(0)), 0);
});

test("Result.unwrapErr on Ok throws", () => {
  assertThrows(() => Result.unwrapErr(Result.ok(0)), "Called unwrap on Ok");
});

test("Result.unwrapOr on Ok returns Ok value", () => {
  assertEquals(Result.unwrapOr(1)(Result.ok(0)), 0);
});

test("Result.unwrapOr on Err returns or value", () => {
  assertEquals(Result.unwrapOr(1)(Result.err(0)), 1);
});

test("Result.inspect", () => {
  const mapSpy = mock.spy((value: number) => value + 1);
  const actual = Result.inspect(mapSpy)(Result.ok(0));
  mock.assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Result.ok(0));
});

test("Result.inspect on Err does not execute", () => {
  const mapSpy = mock.spy((value: number) => value + 1);
  const actual = Result.inspect(mapSpy)(Result.err(0));
  mock.assertSpyCalls(mapSpy, 0);
  assertEquals(actual, Result.err(0));
});

test("Result.inspectErr", () => {
  const mapSpy = mock.spy((value: number) => value + 1);
  const actual = Result.inspectErr(mapSpy)(Result.err(0));
  mock.assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Result.err(0));
});

test("Result.inspectErr on Ok does not execute", () => {
  const mapSpy = mock.spy((value: number) => value + 1);
  const actual = Result.inspectErr(mapSpy)(Result.ok(0));
  mock.assertSpyCalls(mapSpy, 0);
  assertEquals(actual, Result.ok(0));
});

test("Result.map", () => {
  const mapSpy = mock.spy((value: number) => value + 1);
  const actual = Result.map(mapSpy)(Result.ok(0));
  mock.assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Result.ok(1));
});

test("Result.map on Err does not execute", () => {
  const mapSpy = mock.spy((value: number) => value + 1);
  const actual = Result.map(mapSpy)(Result.err(0));

  mock.assertSpyCalls(mapSpy, 0);
  assertEquals(actual, Result.err(0));
});

test("Result.mapErr", () => {
  const mapSpy = mock.spy((value: number) => value + 1);
  const actual = Result.mapErr(mapSpy)(Result.err(0));
  mock.assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Result.err(1));
});

test("Result.mapErr on Ok does not execute", () => {
  const mapSpy = mock.spy((value: number) => value + 1);
  const actual = Result.mapErr(mapSpy)(Result.ok(0));

  mock.assertSpyCalls(mapSpy, 0);
  assertEquals(actual, Result.ok(0));
});

test("Result.flatMap", () => {
  const mapSpy = mock.spy((value: number) => Result.ok(value + 1));
  const actual = Result.flatMap(mapSpy)(Result.ok(0));
  mock.assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Result.ok(1));
});

test("Result.flatMap on Err does not execute", () => {
  const mapSpy = mock.spy((value: number) => Result.ok(value + 1));
  const actual = Result.flatMap(mapSpy)(Result.err(0));
  mock.assertSpyCalls(mapSpy, 0);
  assertEquals(actual, Result.err(0));
});

test("Result.match Ok", () => {
  const actual = Result.match((err) => `${err}`, (ok) => `${ok}`)(
    Result.ok(0),
  );
  assertEquals(actual, "0");
});

test("Result.match Err", () => {
  const actual = Result.match(() => "error", (ok) => `${ok}`)(
    Result.err("error"),
  );
  assertEquals(actual, "error");
});

test("Result.fromThrowable when function does not throw return Ok<T>", () => {
  const actual = Result.fromThrowable(() => 0);
  assertEquals(actual, Result.ok(0));
});

test("Result.fromThrowable when function does throw return Err<T>", () => {
  const actual = Result.fromThrowable(() => {
    throw new Error("error");
  });
  assertEquals(actual, Result.err(new Error("error")));
});

test("Result.fromPromise", async () => {
  type FromPromiseTableTests = [
    Promise<unknown>,
    Result.Type<unknown, unknown>,
  ][];

  const tests: FromPromiseTableTests = [
    [Promise.resolve(0), Result.ok(0)],
    [Promise.resolve(), Result.err("error")],
    [Promise.reject("rejected"), Result.err("error")],
    [Promise.reject(), Result.err("error")],
  ];

  for (const [input, expected] of tests) {
    const actual = await Result.fromPromise(input, "error");
    assertEquals(actual, expected);
  }

  type FromPromiseFnTableTests = [
    () => Promise<unknown>,
    Result.Type<unknown, unknown>,
  ][];

  const testsFn: FromPromiseFnTableTests = [
    [() => Promise.resolve(0), Result.ok(0)],
    [() => Promise.resolve(), Result.err("error")],
    [() => Promise.reject("error"), Result.err("error")],
    [() => Promise.reject(), Result.err("error")],
  ];

  for (const [input, expected] of testsFn) {
    const actual = await Result.fromPromise(input, "error");
    assertEquals(actual, expected);
  }
});
