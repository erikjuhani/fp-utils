import { assertSpyCalls, spy } from "@std/testing/mock";
import { assertEquals, assertThrows } from "@std/assert";
import { Err, Ok, Result } from "@fp-utils/result";
import {
  anything,
  type Arbitrary,
  array,
  assert,
  asyncProperty,
  constant,
  func,
  integer,
  oneof,
  property,
  string,
  tuple,
} from "fast-check";

// Property testing arbitraries

const ok = <T>(arb: Arbitrary<T>): Arbitrary<Ok<T>> => {
  return arb.map((value) => Ok(value));
};

const err = <E>(arb: Arbitrary<E>): Arbitrary<Err<E>> => {
  return arb.map((value) => Err(value));
};

const result = <T, E>(
  arbT: Arbitrary<T>,
  arbE: Arbitrary<E>,
): Arbitrary<Result<T, E>> => {
  return oneof(ok(arbT), err(arbE));
};

const resolved = <T>(arb: Arbitrary<T>): Arbitrary<Promise<T>> => {
  return arb.map((value) => Promise.resolve(value));
};

const rejected = <T>(arb: Arbitrary<T>): Arbitrary<Promise<T>> => {
  return arb.map((value) => Promise.reject(value));
};

const { test } = Deno;

// Unit tests

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
    () => Result.expect("Value should exist")(Err(42)),
    Error,
    "Value should exist",
  );
});

test("Result.expectErr", () => {
  assertEquals(Err(42).expectErr("Value should exist"), 42);
  assertEquals(Result.expectErr("Value should exist")(Err(42)), 42);
  assertThrows(
    () => Result.expectErr("Value should exist")(Ok(42)),
    Error,
    "Value should exist",
  );
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

test("Result.flatMap", () => {
  assert(property(
    result(oneof(string(), integer().map(String)), string()),
    (input) => {
      const tryParseInt = (input: string) => {
        const value = parseInt(input);
        return !isNaN(value)
          ? Ok(value)
          : Err("Could not parse input. Input was not an integer");
      };

      const actual = input.flatMap(tryParseInt);

      if (input.isErr()) return assertEquals(actual, input);
      if (input.map(parseInt).filter(isNaN)) {
        return assertEquals(
          actual,
          Err("Could not parse input. Input was not an integer"),
        );
      }
      assertEquals(actual, input.map(parseInt));
    },
  ));
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

// Property tests

test("Result.unwrap", () => {
  assert(property(
    anything().chain((value) =>
      tuple(result(constant(value), constant(value)), constant(value))
    ),
    ([result, value]) => {
      if (result.isOk()) assertEquals(result.unwrap(), value);
      else assertThrows(() => result.unwrap(), Error, "Called unwrap on Err");
    },
  ));
});

test("Result.unwrapErr", () => {
  assert(property(
    anything().chain((value) =>
      tuple(result(constant(value), constant(value)), constant(value))
    ),
    ([result, value]) => {
      if (result.isErr()) assertEquals(result.unwrapErr(), value);
      else {assertThrows(
          () => result.unwrapErr(),
          Error,
          "Called unwrapErr on Ok",
        );}
    },
  ));
});

test("Result.unwrapOr", () => {
  assert(property(
    anything().chain((value) =>
      tuple(
        result(constant(value), constant(value)),
        constant(value),
        anything(),
      )
    ),
    ([result, value, orValue]) => {
      if (result.isOk()) assertEquals(result.unwrapOr(orValue), value);
      else assertEquals(result.unwrapOr(orValue), orValue);
    },
  ));
});

test("Result.toString", () => {
  assert(property(
    oneof(
      anything().chain((value) =>
        tuple(
          ok(constant(value)),
          constant(value).map((value) =>
            `Ok(${value !== undefined ? JSON.stringify(value) : ""})`
          ),
        )
      ),
      anything().chain((value) =>
        tuple(
          err(constant(value)),
          constant(value).map((value) =>
            `Err(${value !== undefined ? JSON.stringify(value) : ""})`
          ),
        )
      ),
    ),
    ([input, expected]) => {
      assertEquals(Result.toString(input), expected);
    },
  ));
});

test("Result.partition", () => {
  assert(property(
    array(result(anything(), anything())),
    (arr) =>
      assertEquals(
        Result.partition(arr),
        [
          arr.filter(Result.isOk).map(Result.unwrap),
          arr.filter(Result.isErr).map(Result.unwrapErr),
        ],
      ),
  ));
});

test("Result.all", () => {
  assert(property(
    array(result(anything(), anything())),
    (arr) =>
      assertEquals(
        Result.all(arr),
        arr.find(Result.isErr) ?? Ok(arr.map(Result.unwrap)),
      ),
  ));
});

test("Result.any", () => {
  assert(property(
    array(result(anything(), anything())),
    (arr) =>
      assertEquals(
        Result.any(arr),
        arr.find(Result.isOk) ?? Err(arr.map(Result.unwrapErr)),
      ),
  ));
});

test("Result.from", () => {
  assert(property(
    oneof(anything(), func(anything()), func(func(anything()))),
    (input) => {
      assertEquals(
        Result.from(input),
        Ok(input),
      );
    },
  ));
});

test("Result.from - Promise.resolved", () => {
  assert(asyncProperty(
    resolved(anything()),
    async (input) => {
      assertEquals(
        await Result.from(input),
        Ok(await input),
      );
    },
  ));
});

test("Result.from - Promise.rejected", () => {
  assert(asyncProperty(
    rejected(anything()),
    async (input) => {
      assertEquals(
        await Result.from(input),
        await input.catch(Err),
      );
    },
  ));
});

test("Result.toJSON", () => {
  assert(property(
    anything().chain((value) =>
      oneof(
        tuple(
          ok(constant(value)),
          constant(value).map((value) => ({ "ok": value })),
        ),
        tuple(
          ok(ok(constant(value))),
          constant(value).map((value) => ({ "ok": { "ok": value } })),
        ),
        tuple(
          ok(err(constant(value))),
          constant(value).map((value) => ({ "ok": { "err": value } })),
        ),
        tuple(
          err(constant(value)),
          constant(value).map((value) => ({ "err": value })),
        ),
        tuple(
          err(err(constant(value))),
          constant(value).map((value) => ({ "err": { "err": value } })),
        ),
        tuple(
          err(ok(constant(value))),
          constant(value).map((value) => ({ "err": { "ok": value } })),
        ),
      )
    ),
    ([input, expected]) => {
      assertEquals(Result.toJSON(input), expected);
    },
  ));
});
