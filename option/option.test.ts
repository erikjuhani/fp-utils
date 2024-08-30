import { assertSpyCalls, spy } from "@std/testing/mock";
import { assertEquals, assertThrows } from "@std/assert";
import { None, Option, Some } from "@fp-utils/option";
import {
  anything,
  type Arbitrary,
  array,
  assert,
  constant,
  integer,
  oneof,
  property,
  string,
  tuple,
} from "fast-check";

const { test } = Deno;

// Property testing arbitraries

const some = <T>(arb: Arbitrary<T>): Arbitrary<Some<T>> =>
  arb.map((value) => Some(value));

const none = constant(None);

const anyNonNullable = (): Arbitrary<unknown> =>
  anything().filter((value: unknown) => value !== undefined && value !== null);

const option = <T>(
  arb: Arbitrary<T>,
): Arbitrary<Option<T>> => oneof(some(arb), none);

test("Option.unwrap", () => {
  assert(property(
    anyNonNullable().chain((value) =>
      tuple(option(constant(value)), constant(value))
    ),
    ([option, value]) => {
      if (option.isSome()) assertEquals(Option.unwrap(option), value);
      else {
        assertThrows(
          () => Option.unwrap(option),
          Error,
          "Called unwrap on None",
        );
      }
    },
  ));
});

test("Option.unwrapOr", () => {
  assert(property(
    anyNonNullable().chain((value) =>
      tuple(option(constant(value)), anything(), constant(value))
    ),
    ([option, or, value]) => {
      if (option.isSome()) assertEquals(Option.unwrapOr(or)(option), value);
      else assertEquals(Option.unwrapOr(or)(option), or);
    },
  ));
});

test("Option.toString", () => {
  assert(property(
    oneof(
      anyNonNullable().chain((value) =>
        tuple(
          some(constant(value)),
          constant(value).map((value) =>
            `Some(${value !== undefined ? JSON.stringify(value) : ""})`
          ),
        )
      ),
      tuple(
        none,
        constant("None"),
      ),
    ),
    ([input, expected]) => {
      assertEquals(Option.toString(input), expected);
    },
  ));
});

test("Option.all", () => {
  assert(property(
    array(anyNonNullable().chain((value) => option(constant(value)))),
    (arr) =>
      assertEquals(
        Option.all(arr),
        arr.find(Option.isNone) ?? Some(arr.map(Option.unwrap)),
      ),
  ));
});

test("Option.all", () => {
  assert(property(
    array(anyNonNullable().chain((value) => option(constant(value)))),
    (arr) =>
      assertEquals(
        Option.all(arr),
        arr.find(Option.isNone) ?? Some(arr.map(Option.unwrap)),
      ),
  ));
});

test("Option.any", () => {
  assert(property(
    array(anyNonNullable().chain((value) => option(constant(value)))),
    (arr) =>
      assertEquals(
        Option.any(arr),
        arr.find(Option.isSome) ?? None,
      ),
  ));
});

test("Option.zip", () => {
  assert(property(
    tuple(option(anyNonNullable()), option(anyNonNullable())),
    ([a, b]) => {
      if (a.isSome() && b.isSome()) {
        assertEquals(
          Option.zip(b)(a).unwrap(),
          [a.unwrap(), b.unwrap()],
        );
      } else {
        assertEquals(Option.zip(b)(a), None);
      }
    },
  ));
});

test("Option.flatMap", () => {
  assert(property(
    option(oneof(string(), integer().map(String))),
    (input) => {
      const tryParseInt = (input: string) => {
        const value = parseInt(input);
        return !isNaN(value) ? Some(value) : None;
      };

      const actual = Option.flatMap(tryParseInt)(input);

      if (input.isNone()) return assertEquals(actual, input);
      if (input.map(parseInt).filter(isNaN)) {
        return assertEquals(
          actual,
          None,
        );
      }
      assertEquals(actual, input.map(parseInt));
    },
  ));
});

test("Option.toJSON", () => {
  assert(property(
    anyNonNullable().chain((value) =>
      oneof(
        tuple(
          some(constant(value)),
          constant(value),
        ),
        tuple(
          some(some(constant(value))),
          constant(value),
        ),
        tuple(
          some(none),
          constant(null),
        ),
        tuple(
          none,
          constant(null),
        ),
      )
    ),
    ([input, expected]) => {
      assertEquals(Option.toJSON(input), expected);
    },
  ));
});

test("Option.some passing null or undefined throws", () => {
  [null, undefined].forEach((value) => {
    assertThrows(
      () => Some(value),
      "Trying to pass nullable value to Some",
    );
  });
});

test("Option.isSome", () => {
  const tests: [Option<unknown>, boolean][] = [
    [Some(0), true],
    [None, false],
  ];

  tests.forEach(([input, expected]) => {
    assertEquals(Option.isSome(input), expected);
  });
});

test("Option.isNone", () => {
  const tests: [Option<unknown>, boolean][] = [
    [Some(0), false],
    [None, true],
  ];

  tests.forEach(([input, expected]) => {
    assertEquals(Option.isNone(input), expected);
  });
});

test("Option.inspect", () => {
  const mapSpy = spy((value: number) => value + 1);
  const actual = Option.inspect(mapSpy)(Some(0));
  assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Some(0));
});

test("Option.inspect on None does not execute", () => {
  const mapSpy = spy((value: number) => value + 1);
  const actual = Option.inspect(mapSpy)(None);
  assertSpyCalls(mapSpy, 0);
  assertEquals(actual, None);
});

test("Option.map", () => {
  const mapSpy = spy((value: number) => value + 1);
  const actual = Option.map(mapSpy)(Some(0));
  assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Some(1));
});

test("Option.filter", () => {
  const predicate = (x: number) => x >= 5;
  const tests: [input: Option<number>, expected: boolean][] = [
    [None, false],
    [Some(2), false],
    [Some(42), true],
  ];

  for (const [input, expected] of tests) {
    const actual = Option.filter(predicate)(input);
    assertEquals(actual, expected);
  }
});

test("Option.map on None does not execute", () => {
  const mapSpy = spy((value: number) => value + 1);
  const actual = Option.map(mapSpy)(None);

  assertSpyCalls(mapSpy, 0);
  assertEquals(actual, None);
});

test("Option.flatMap union Some<string> | Some<number> | None", async () => {
  // deno-lint-ignore require-await
  const asyncGetUnionOption = async (flag: 0 | 1 | 2) => {
    if (flag === 1) return Some("1");
    return flag === 2 ? Some(42) : None;
  };

  const tests: [flag: 0 | 1 | 2, expected: Option<string | number>][] = [
    [0, None],
    [1, Some("1")],
    [2, Some(42)],
  ];

  await Promise.all(tests.map(async ([input, expected]) => {
    const actual = await asyncGetUnionOption(input).then(
      Option.flatMap((value) => {
        if (value) return Some(value);
        else return None;
      }),
    );
    assertEquals(actual, expected);
  }));
});

test("Option.match Some", () => {
  const actual = Option.match((some) => `${some}`, () => "No value")(
    Some(0),
  );
  assertEquals(actual, "0");
});

test("Option.match None", () => {
  const actual = Option.match((some) => `${some}`, () => "No value")(
    None,
  );
  assertEquals(actual, "No value");
});

test("Option.from", async () => {
  const tests: [input: unknown, expected: Option<unknown>][] = [
    [Promise.resolve(0), Some(0)],
    [Promise.resolve(), None],
    [Promise.reject("error"), None],
    [Promise.reject(), None],
    [() => Promise.resolve(0), Some(0)],
    [() => Promise.resolve(), None],
    [() => Promise.reject("error"), None],
    [() => Promise.reject(), None],
    // Custom PromiseLike successful
    [
      {
        then: (onfulfilled?: (value?: unknown) => unknown) => onfulfilled?.(42),
      },
      Some(42),
    ],
    // Custom PromiseLike failure
    [
      {
        then: (
          _onfulfilled?: (value?: unknown) => unknown,
          onrejected?: (value?: unknown) => unknown,
        ) => onrejected?.(),
      },
      None,
    ],
    [null, None],
    [undefined, None],
    [0, Some(0)],
    ["", Some("")],
    [() => 0, Some(0)],
    [() => null, None],
    [() => {}, None],
    [() => () => 0, Some(0)],
  ];

  for (const [input, expected] of tests) {
    const actual = await Option.from(input);
    assertEquals(actual, expected);
  }
});
