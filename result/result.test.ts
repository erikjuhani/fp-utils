import { std } from "dev_deps";
import { Result } from "./mod.ts";

const { assertThrows, assertEquals } = std.assert;
const { mock } = std.testing;
const { test } = Deno;

test("Result.isOk", () => {
  const tests: [Result<unknown, unknown>, boolean][] = [
    [Result.ok(), true],
    [Result.err(), false],
  ];

  tests.forEach(([input, expected]) => {
    assertEquals(Result.isOk(input), expected);
  });
});

test("Result.isErr", () => {
  const tests: [Result<unknown, unknown>, boolean][] = [
    [Result.ok(), false],
    [Result.err(), true],
  ];

  tests.forEach(([input, expected]) => {
    assertEquals(Result.isErr(input), expected);
  });
});

test("Result.ok returns unit if no value is applied", () => {
  assertEquals(Result.ok().unwrap(), undefined);
});

test("Result.err returns unit if no value is applied", () => {
  assertEquals(Result.err().unwrapErr(), undefined);
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

test("Result.map with promise value", async () => {
  const mapSpy = mock.spy((value: number) => value + 1);
  const actual = Result.map(mapSpy)(Result.ok(Promise.resolve(0)));
  mock.assertSpyCalls(mapSpy, 0);
  assertEquals(await actual.unwrap(), 1);
  mock.assertSpyCalls(mapSpy, 1);
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
  const flatMapSpy = mock.spy((value: number) => Result.ok(value + 1));
  const actual = Result.flatMap(flatMapSpy)(Result.ok(0));
  mock.assertSpyCalls(flatMapSpy, 1);
  assertEquals(actual, Result.ok(1));
});

test("Result.flatMap with promise value to promise chain", async () => {
  const flatMapPromiseSpy = mock.spy((value: number) =>
    Promise.resolve(Result.ok(value + 1))
  );

  const flatMapPromiseChainSpy = mock.spy((value: number) =>
    Promise.resolve(Result.ok(`${value}`))
  );

  const actual = Result.flatMap(flatMapPromiseSpy)(Result.ok(0))
    .then(Result.flatMap(flatMapPromiseChainSpy));

  mock.assertSpyCalls(flatMapPromiseSpy, 1);
  mock.assertSpyCalls(flatMapPromiseChainSpy, 0);
  assertEquals(await actual, Result.ok("1"));
  mock.assertSpyCalls(flatMapPromiseChainSpy, 1);
});

test("Result.flatMap example", () => {
  type TryParse = (input: string) => Result<number, string>;

  const tryParse: TryParse = (input: string) => {
    const value = parseInt(input);
    return isNaN(value) ? Result.err("could not parse") : Result.ok(value);
  };

  const tests: [Result<string, string>, Result<number, string>][] = [
    [Result.ok("42"), Result.ok(42)],
    [Result.err("error"), Result.err("error")],
    [Result.ok("Forty-two"), Result.err("could not parse")],
  ];

  tests.forEach(([input, expected]) => {
    assertEquals(input.flatMap(tryParse), expected);
  });
});

test("Result.flatMap on Err does not execute", () => {
  const mapSpy = mock.spy((value: number) => Result.ok(value + 1));
  const actual = Result.flatMap(mapSpy)(Result.err(0));
  mock.assertSpyCalls(mapSpy, 0);
  assertEquals<Result<number, number>>(actual, Result.err(0));
});

test("Result.match promise resolve", async () => {
  const actual = Result.match((ok) => `${ok}-ok`, (err) => `${err}-error`)(
    Result.ok(Promise.resolve("value")),
  );
  assertEquals(await actual, "value-ok");
});

test("Result.match promise reject", async () => {
  const actual = Result.match((ok) => `${ok}-ok`, (err) => `${err}-error`)(
    Result.ok(Promise.reject("failed")),
  );
  assertEquals(await actual, "failed-error");
});

test("Result.match Ok", () => {
  const actual = Result.match((ok) => `${ok}-ok`, (err) => `${err}-error`)(
    Result.ok("value"),
  );
  assertEquals(actual, "value-ok");
});

test("Result.match Err", () => {
  const actual = Result.match((ok) => `${ok}-ok`, (err) => `${err}-error`)(
    Result.err("failed"),
  );
  assertEquals(actual, "failed-error");
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
    Result<unknown, unknown>,
  ][];

  const tests: FromPromiseTableTests = [
    [Promise.resolve(0), Result.ok(0)],
    [Promise.resolve(), Result.ok()],
    [Promise.reject("rejected"), Result.err("error")],
    [Promise.reject(), Result.err("error")],
  ];

  for (const [input, expected] of tests) {
    const actual = await Result.fromPromise(input, "error");
    assertEquals(actual, expected);
  }

  type FromPromiseFnTableTests = [
    () => Promise<unknown>,
    Result<unknown, unknown>,
  ][];

  const testsFn: FromPromiseFnTableTests = [
    [() => Promise.resolve(0), Result.ok(0)],
    [() => Promise.resolve(), Result.ok()],
    [() => Promise.reject("error"), Result.err("error")],
    [() => Promise.reject(), Result.err("error")],
  ];

  for (const [input, expected] of testsFn) {
    const actual = await Result.fromPromise(input, "error");
    assertEquals(actual, expected);
  }
});
