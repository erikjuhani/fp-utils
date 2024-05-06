import { assertSpyCalls, spy } from "@std/testing/mock";
import { assertEquals, assertThrows } from "@std/assert";
import { None, Option, Some } from "@fp-utils/option";

const { test } = Deno;

test("Option.some passing null or undefined throws", () => {
  [null, undefined].forEach((value) => {
    assertThrows(
      // @ts-expect-error doesn't actually allow to pass a null or undefined to Option.some in compile time
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

test("Option.unwrap on Some returns Option value", () => {
  assertEquals(Option.unwrap(Some(0)), 0);
});

test("Option.unwrap on None throws", () => {
  assertThrows(() => Option.unwrap(None), "Called unwrap on None");
});

test("Option.unwrapOr on Some returns Option value", () => {
  assertEquals(Option.unwrapOr(1)(Some(0)), 0);
});

test("Option.unwrapOr on None returns or value", () => {
  assertEquals(Option.unwrapOr(1)(None), 1);
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

test("Option.toString", () => {
  const tests: [Option<unknown>, string][] = [
    [None, "None"],
    [Some(10), "Some(10)"],
    [Some(Some(10)), "Some(Some(10))"],
    [Some(None), "Some(None)"],
    [Some({ value: "some" }), 'Some({"value":"some"})'],
  ];

  for (const [input, expected] of tests) {
    const actual = Option.toString(input);
    assertEquals(actual, expected);
  }
});

test("Option.map", () => {
  const mapSpy = spy((value: number) => value + 1);
  const actual = Option.map(mapSpy)(Some(0));
  assertSpyCalls(mapSpy, 1);
  assertEquals(actual, Some(1));
});

test("Option.zip", () => {
  const tests: [
    a: Option<unknown>,
    b: Option<unknown>,
    expected: Option<unknown[]>,
  ][] = [
    [Some(42), Some(84), Some([42, 84])],
    [Some(42), Some("84"), Some([42, "84"])],
    [None, Some(84), None],
    [Some(42), None, None],
  ];

  for (const [a, b, expected] of tests) {
    const actual = a.zip(b);
    assertEquals(actual, expected);

    const actualHof = Option.zip(b)(a);
    assertEquals(actualHof, expected);
  }
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

test("Option.flatMap", () => {
  const flatMapSpy = spy((value: number) => Some(value + 1));
  const actual = Option.flatMap(flatMapSpy)(Some(0));
  assertSpyCalls(flatMapSpy, 1);
  assertEquals(actual, Some(1));
});

test("Option.flatMap on None does not execute", () => {
  const flatMapSpy = spy((value: number) => Some(value + 1));
  const actual = Option.flatMap(flatMapSpy)(None);
  assertSpyCalls(flatMapSpy, 0);
  assertEquals(actual, None);
});

test("Option.flatMap example", () => {
  type TryParse = (input: string) => Option<number>;

  const tryParse: TryParse = (input: string) => {
    const value = parseInt(input);
    return isNaN(value) ? None : Some(value);
  };

  const tests: [Option<string>, Option<number>][] = [
    [Some("42"), Some(42)],
    [None, None],
    [Some("Forty-two"), None],
  ];

  tests.forEach(([input, expected]) => {
    assertEquals(input.flatMap(tryParse), expected);
  });
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
