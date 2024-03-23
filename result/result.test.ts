import { std } from "../dev_deps.ts";
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

test("Result.from", () => {
  const predicate = (x: number) => x >= 5;
  const tests: [Result<number, unknown>, boolean][] = [
    [Result.err(10), false],
    [Result.ok(2), false],
    [Result.ok(42), true],
  ];

  for (const [input, expected] of tests) {
    const actual = Result.filter(predicate)(input);
    assertEquals(actual, expected);
  }
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
  const flatMapSpy = mock.spy((value: number) => Result.ok(value + 1));
  const actual = Result.flatMap(flatMapSpy)(Result.err(0));
  mock.assertSpyCalls(flatMapSpy, 0);
  assertEquals(actual, Result.err(0));
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

test("Result.flatMap union Ok<undefined> | Ok<ConcreteType> | Err<string>", async () => {
  // deno-lint-ignore require-await
  const asyncGetUnionResult = async (flag: 0 | 1 | 2) => {
    if (flag === 1) return Result.ok();
    return flag === 2 ? Result.ok(42) : Result.err("Got zero value");
  };

  const tests: [flag: 0 | 1 | 2, expected: Result<void, string>][] = [
    [0, Result.err("Got zero value")],
    [1, Result.err("Got unit value")],
    [2, Result.ok()],
  ];

  await Promise.all(tests.map(async ([input, expected]) => {
    const actual = await asyncGetUnionResult(input).then(
      Result.flatMap((value) => {
        if (value) return Result.ok();
        else return Result.err("Got unit value");
      }),
    );
    assertEquals(actual, expected);
  }));
});

test("Result.from", async () => {
  const tests: [unknown, Result<unknown, unknown>][] = [
    [Promise.resolve(0), Result.ok(0)],
    [Promise.resolve(), Result.ok()],
    [Promise.reject("rejected"), Result.err("error")],
    [Promise.reject(), Result.err("error")],
    [() => Promise.resolve(0), Result.ok(0)],
    [() => Promise.resolve(), Result.ok()],
    [() => Promise.reject("error"), Result.err("error")],
    [() => Promise.reject(), Result.err("error")],
    // Custom PromiseLike successful
    [
      {
        then: (onfulfilled?: (value?: unknown) => unknown) => onfulfilled?.(42),
      },
      Result.ok(42),
    ],
    // Custom PromiseLike failure
    [
      {
        then: (
          _onfulfilled?: (value?: unknown) => unknown,
          onrejected?: (value?: unknown) => unknown,
        ) => onrejected?.(),
      },
      Result.err("error"),
    ],
    [0, Result.ok(0)],
    [null, Result.ok(null)],
    ["", Result.ok("")],
    [undefined, Result.ok()],
    [() => 0, Result.ok(0)],
    [() => null, Result.ok(null)],
    [() => {}, Result.ok()],
    [() => () => 0, Result.ok(0)],
    [() => {
      throw Error("error");
    }, Result.err("error")],
  ];

  for (const [input, expected] of tests) {
    const actual = await Result.from(input, "error");
    assertEquals(actual, expected);
  }
});
