import { std } from "../dev_deps.ts";
import { Option } from "./mod.ts";

const { assertThrows, assertEquals } = std.assert;
const { mock } = std.testing;
const { test } = Deno;

test("Option.some passing null or undefined throws", () => {
  [null, undefined].forEach((value) => {
    assertThrows(
      // @ts-expect-error doesn't actually allow to pass a null or undefined to Option.some in compile time
      () => Option.some(value),
      "Trying to pass nullable value to Some",
    );
  });
});

test("Option.isSome", () => {
  const tests: [Option<unknown>, boolean][] = [
    [Option.some(0), true],
    [Option.none(), false],
  ];

  tests.forEach(([input, expected]) => {
    assertEquals(Option.isSome(input), expected);
  });
});

test("Option.isNone", () => {
  const tests: [Option<unknown>, boolean][] = [
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

test("Option.filter", () => {
  const predicate = (x: number) => x >= 5;
  const tests: [input: Option<number>, expected: boolean][] = [
    [Option.none(), false],
    [Option.some(2), false],
    [Option.some(42), true],
  ];

  for (const [input, expected] of tests) {
    const actual = Option.filter(predicate)(input);
    assertEquals(actual, expected);
  }
});

test("Option.map on None does not execute", () => {
  const mapSpy = mock.spy((value: number) => value + 1);
  const actual = Option.map(mapSpy)(Option.none());

  mock.assertSpyCalls(mapSpy, 0);
  assertEquals(actual, Option.none());
});

test("Option.flatMap", () => {
  const flatMapSpy = mock.spy((value: number) => Option.some(value + 1));
  const actual = Option.flatMap(flatMapSpy)(Option.some(0));
  mock.assertSpyCalls(flatMapSpy, 1);
  assertEquals(actual, Option.some(1));
});

test("Option.flatMap on None does not execute", () => {
  const flatMapSpy = mock.spy((value: number) => Option.some(value + 1));
  const actual = Option.flatMap(flatMapSpy)(Option.none());
  mock.assertSpyCalls(flatMapSpy, 0);
  assertEquals(actual, Option.none());
});

test("Option.flatMap example", () => {
  type TryParse = (input: string) => Option<number>;

  const tryParse: TryParse = (input: string) => {
    const value = parseInt(input);
    return isNaN(value) ? Option.none() : Option.some(value);
  };

  const tests: [Option<string>, Option<number>][] = [
    [Option.some("42"), Option.some(42)],
    [Option.none(), Option.none()],
    [Option.some("Forty-two"), Option.none()],
  ];

  tests.forEach(([input, expected]) => {
    assertEquals(input.flatMap(tryParse), expected);
  });
});

test("Option.flatMap union Some<string> | Some<number> | None", async () => {
  // deno-lint-ignore require-await
  const asyncGetUnionOption = async (flag: 0 | 1 | 2) => {
    if (flag === 1) return Option.some("1");
    return flag === 2 ? Option.some(42) : Option.none();
  };

  const tests: [flag: 0 | 1 | 2, expected: Option<string | number>][] = [
    [0, Option.none()],
    [1, Option.some("1")],
    [2, Option.some(42)],
  ];

  await Promise.all(tests.map(async ([input, expected]) => {
    const actual = await asyncGetUnionOption(input).then(
      Option.flatMap((value) => {
        if (value) return Option.some(value);
        else return Option.none();
      }),
    );
    assertEquals(actual, expected);
  }));
});

test("Option.match Some", () => {
  const actual = Option.match((some) => `${some}`, () => "No value")(
    Option.some(0),
  );
  assertEquals(actual, "0");
});

test("Option.match None", () => {
  const actual = Option.match((some) => `${some}`, () => "No value")(
    Option.none(),
  );
  assertEquals(actual, "No value");
});

test("Option.from", async () => {
  const tests: [input: unknown, expected: Option<unknown>][] = [
    [Promise.resolve(0), Option.some(0)],
    [Promise.resolve(), Option.none()],
    [Promise.reject("error"), Option.none()],
    [Promise.reject(), Option.none()],
    [() => Promise.resolve(0), Option.some(0)],
    [() => Promise.resolve(), Option.none()],
    [() => Promise.reject("error"), Option.none()],
    [() => Promise.reject(), Option.none()],
    [null, Option.none()],
    [undefined, Option.none()],
    [0, Option.some(0)],
    ["", Option.some("")],
    [() => 0, Option.some(0)],
    [() => null, Option.none()],
    [() => {}, Option.none()],
    [() => () => 0, Option.some(0)],
  ];

  for (const [input, expected] of tests) {
    const actual = await Option.from(input);
    assertEquals(actual, expected);
  }
});
