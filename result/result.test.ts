import { assertSpyCalls, spy } from "@std/testing/mock";
import { assertEquals, assertThrows } from "@std/assert";
import { Err, Ok, Result } from "@fp-utils/result";

const { test } = Deno;

test("Result.isOk", () => {
  const tests: [Result<unknown, unknown>, boolean][] = [
    [Ok(), true],
    [Err(), false],
  ];

  tests.forEach(([input, expected]) => {
    assertEquals(Result.isOk(input), expected);
  });
});

test("Result.isErr", () => {
  const tests: [Result<unknown, unknown>, boolean][] = [
    [Ok(), false],
    [Err(), true],
  ];

  tests.forEach(([input, expected]) => {
    assertEquals(Result.isErr(input), expected);
  });
});

test("Result.expect", () => {
  assertEquals(Ok(42).expect("Value should exist"), 42);
  assertEquals(Result.expect("Value should exist")(Ok(42)), 42);
  assertThrows(
    () => Err(42).expect("Value should exist"),
    Error,
    "Value should exist",
  );
  assertThrows(
    () => Result.expect("Value should exist")(Err(42)),
    Error,
    "Value should exist",
  );
});

test("Result.expectErr", () => {
  assertEquals(Err(42).expectErr("Value should exist"), 42);
  assertEquals(Result.expectErr("Value should exist")(Err(42)), 42);
  assertThrows(
    () => Ok(42).expectErr("Value should exist"),
    Error,
    "Value should exist",
  );
  assertThrows(
    () => Result.expectErr("Value should exist")(Ok(42)),
    Error,
    "Value should exist",
  );
});

test("Ok returns unit if no value is applied", () => {
  assertEquals(Ok().unwrap(), undefined);
});

test("Err returns unit if no value is applied", () => {
  assertEquals(Err().unwrapErr(), undefined);
});

test("Result.unwrap on Ok returns Ok value", () => {
  assertEquals(Result.unwrap(Ok(0)), 0);
});

test("Result.unwrap on Err throws", () => {
  assertThrows(() => Result.unwrap(Err(0)), Error, "Called unwrap on Err");
});

test("Result.unwrapErr on Err returns Err value", () => {
  assertEquals(Result.unwrapErr(Err(0)), 0);
});

test("Result.unwrapErr on Ok throws", () => {
  assertThrows(() => Result.unwrapErr(Ok(0)), Error, "Called unwrapErr on Ok");
});

test("Result.unwrapOr on Ok returns Ok value", () => {
  assertEquals(Result.unwrapOr(1)(Ok(0)), 0);
});

test("Result.unwrapOr on Err returns or value", () => {
  assertEquals(Result.unwrapOr(1)(Err(0)), 1);
});

test("Result.inspect", () => {
  const mapSpy = spy((value: number) => value + 1);
  const actual = Result.inspect(mapSpy)(Ok(0));
  assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Ok(0));
});

test("Result.inspect on Err does not execute", () => {
  const mapSpy = spy((value: number) => value + 1);
  const actual = Result.inspect(mapSpy)(Err(0));
  assertSpyCalls(mapSpy, 0);
  assertEquals(actual, Err(0));
});

test("Result.inspectErr", () => {
  const mapSpy = spy((value: number) => value + 1);
  const actual = Result.inspectErr(mapSpy)(Err(0));
  assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Err(0));
});

test("Result.inspectErr on Ok does not execute", () => {
  const mapSpy = spy((value: number) => value + 1);
  const actual = Result.inspectErr(mapSpy)(Ok(0));
  assertSpyCalls(mapSpy, 0);
  assertEquals(actual, Ok(0));
});

test("Result.map", () => {
  const mapSpy = spy((value: number) => value + 1);
  const actual = Result.map(mapSpy)(Ok(0));
  assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Ok(1));
});

test("Result.map on Err does not execute", () => {
  const mapSpy = spy((value: number) => value + 1);
  const actual = Result.map(mapSpy)(Err(0));

  assertSpyCalls(mapSpy, 0);
  assertEquals(actual, Err(0));
});

test("Result.toString", () => {
  const tests: [Result<unknown, unknown>, string][] = [
    [Err(10), "Err(10)"],
    [Ok(10), "Ok(10)"],
    [Ok({ value: "ok" }), 'Ok({"value":"ok"})'],
    [Err(Ok(10)), "Err(Ok(10))"],
    [Ok(Err(10)), "Ok(Err(10))"],
  ];

  for (const [input, expected] of tests) {
    const actual = Result.toString(input);
    assertEquals(actual, expected);
  }
});

test("Result.partition", () => {
  const tests: [Result<unknown, unknown>[], [unknown[], unknown[]]][] = [
    [[], [[], []]],
    [[Err(10)], [[], [10]]],
    [[Ok(10)], [[10], []]],
    [[Ok(10), Err("error")], [[10], ["error"]]],
  ];

  for (const [input, expected] of tests) {
    const actual = Result.partition(input);
    assertEquals(actual, expected);
  }
});

test("Result.from", () => {
  const predicate = (x: number) => x >= 5;
  const tests: [Result<number, unknown>, boolean][] = [
    [Err(10), false],
    [Ok(2), false],
    [Ok(42), true],
  ];

  for (const [input, expected] of tests) {
    const actual = Result.filter(predicate)(input);
    assertEquals(actual, expected);
  }
});

test("Result.mapErr", () => {
  const mapSpy = spy((value: number) => value + 1);
  const actual = Result.mapErr(mapSpy)(Err(0));
  assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Err(1));
});

test("Result.mapErr on Ok does not execute", () => {
  const mapSpy = spy((value: number) => value + 1);
  const actual = Result.mapErr(mapSpy)(Ok(0));

  assertSpyCalls(mapSpy, 0);
  assertEquals(actual, Ok(0));
});

test("Result.flatMap", () => {
  const mapSpy = spy((value: number) => Ok(value + 1));
  const actual = Result.flatMap(mapSpy)(Ok(0));
  assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Ok(1));
});

test("Result.flatMap example", () => {
  type TryParse = (input: string) => Result<number, string>;

  const tryParse: TryParse = (input: string) => {
    const value = parseInt(input);
    return isNaN(value) ? Err("could not parse") : Ok(value);
  };

  const tests: [Result<string, string>, Result<number, string>][] = [
    [Ok("42"), Ok(42)],
    [Err("error"), Err("error")],
    [Ok("Forty-two"), Err("could not parse")],
  ];

  tests.forEach(([input, expected]) => {
    assertEquals(input.flatMap(tryParse), expected);
  });
});

test("Result.flatMap on Err does not execute", () => {
  const flatMapSpy = spy((value: number) => Ok(value + 1));
  const actual = Result.flatMap(flatMapSpy)(Err(0));
  assertSpyCalls(flatMapSpy, 0);
  assertEquals(actual, Err(0));
});

test("Result.match Ok", () => {
  const actual = Result.match((ok) => `${ok}-ok`, (err) => `${err}-error`)(
    Ok("value"),
  );
  assertEquals(actual, "value-ok");
});

test("Result.match Err", () => {
  const actual = Result.match((ok) => `${ok}-ok`, (err) => `${err}-error`)(
    Err("failed"),
  );
  assertEquals(actual, "failed-error");
});

test("Result.flatMap union Ok<undefined> | Ok<ConcreteType> | Err<string>", async () => {
  // deno-lint-ignore require-await
  const asyncGetUnionResult = async (flag: 0 | 1 | 2) => {
    if (flag === 1) return Ok();
    return flag === 2 ? Ok(42) : Err("Got zero value");
  };

  const tests: [flag: 0 | 1 | 2, expected: Result<void, string>][] = [
    [0, Err("Got zero value")],
    [1, Err("Got unit value")],
    [2, Ok()],
  ];

  await Promise.all(tests.map(async ([input, expected]) => {
    const actual = await asyncGetUnionResult(input).then(
      Result.flatMap((value) => {
        if (value) return Ok();
        else return Err("Got unit value");
      }),
    );
    assertEquals(actual, expected);
  }));
});

test("Result.from", async () => {
  const tests: [unknown, Result<unknown, unknown>][] = [
    [Promise.resolve(0), Ok(0)],
    [Promise.resolve(), Ok()],
    [Promise.reject("rejected"), Err("error")],
    [Promise.reject(), Err("error")],
    [() => Promise.resolve(0), Ok(0)],
    [() => Promise.resolve(), Ok()],
    [() => Promise.reject("error"), Err("error")],
    [() => Promise.reject(), Err("error")],
    // Custom PromiseLike successful
    [
      {
        then: (onfulfilled?: (value?: unknown) => unknown) => onfulfilled?.(42),
      },
      Ok(42),
    ],
    // Custom PromiseLike failure
    [
      {
        then: (
          _onfulfilled?: (value?: unknown) => unknown,
          onrejected?: (value?: unknown) => unknown,
        ) => onrejected?.(),
      },
      Err("error"),
    ],
    [0, Ok(0)],
    [null, Ok(null)],
    ["", Ok("")],
    [undefined, Ok()],
    [() => 0, Ok(0)],
    [() => null, Ok(null)],
    [() => {}, Ok()],
    [() => () => 0, Ok(0)],
    [() => {
      throw Error("error");
    }, Err("error")],
  ];

  for (const [input, expected] of tests) {
    const actual = await Result.from(input, "error");
    assertEquals(actual, expected);
  }

  // Result.from expected as function
  assertEquals(
    Result.from(() => {
      throw new Error("error");
    }, (err: Error) => `original ${err.message}`).unwrapErr(),
    "original error",
  );

  // Result.from without expected defined
  assertEquals(
    Result.from(() => {
      throw new Error("error");
    }).unwrapErr(),
    new Error("error"),
  );

  // Result.from expected as function
  assertEquals(
    (await Result.from(
      Promise.reject("error"),
      (err: string) => `original ${err}`,
    )).unwrapErr(),
    "original error",
  );

  // Result.from without expected defined
  assertEquals(
    (await Result.from(Promise.reject("error"))).unwrapErr(),
    "error",
  );
});
