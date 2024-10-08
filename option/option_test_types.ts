import { None, Option, Some } from "./mod.ts";
import { assertType, type IsExact } from "@std/testing/types";

// Option.map - number to string
(() => {
  const some = Some(42);

  const t0 = some.map((value) => {
    assertType<IsExact<typeof value, number>>(true);
    return value.toString();
  });

  // When this fails it means that we are falsely returning something else than a string
  // Usually this would mean that we instead return a never type due to failing inference
  assertType<IsExact<typeof t0, Option<string>>>(true);
});

// Test for nullable values
(() => {
  const some = Some(undefined);

  assertType<IsExact<typeof some, Some<never>>>(true);

  const option = Some(42);

  // @ts-expect-error doesn't actually allow to pass a null or undefined to Some in compile time
  const t1 = option.map((value) => {
    assertType<IsExact<typeof value, number>>(true);
    return undefined;
  });

  // deno-lint-ignore ban-types
  assertType<IsExact<typeof t1, Option<{}>>>(true);

  const t2 = option.flatMap((value) => {
    assertType<IsExact<typeof value, number>>(true);
    return Some(null);
  });

  assertType<IsExact<typeof t2, Some<never>>>(true);
});

// Option.match - identity and throw
(() => {
  const option: Option<string> = Some("42");

  const t = option.match(
    (value) => value,
    () => {
      throw new Error();
    },
  );

  assertType<IsExact<typeof t, string>>(true);
});

// Option.all
// (() => {
//   const options0: Option<string>[] = [Some("42")];
//
//   const t0 = Option.all(options0);
//
//   assertType<IsExact<typeof t0, Some<string[]>>>(true);
//
//   const options1 = [Some("42"), Some(42)];
//
//   const t1 = Option.all(options1);
//
//   assertType<IsExact<typeof t1, Some<string[]>>>(true);
// });

// Option.isNone and Option.isSome
(() => {
  const option: Option<string> = Some("42");

  if (option.isNone()) {
    assertType<IsExact<typeof option, None>>(true);
  }

  if (Option.isNone(option)) {
    assertType<IsExact<typeof option, None>>(true);
  }

  if (option.isSome()) {
    assertType<IsExact<typeof option, Some<string>>>(true);
  }

  if (Option.isSome(option)) {
    assertType<IsExact<typeof option, Some<string>>>(true);
  }

  const option1 = Some(42) as Some<number> | Some<string> | None;

  if (option1.isNone()) {
    assertType<IsExact<typeof option1, None>>(true);
  }

  if (Option.isNone(option1)) {
    assertType<IsExact<typeof option1, None>>(true);
  }

  if (option1.isSome()) {
    assertType<IsExact<typeof option1, Some<number> | Some<string>>>(true);
  }

  if (Option.isSome(option1)) {
    assertType<IsExact<typeof option1, Some<string> | Some<number>>>(true);
  }

  const option2 = Some(42);

  if (option2.isNone()) {
    assertType<IsExact<typeof option2, never>>(true);
  }

  if (Option.isNone(option2)) {
    assertType<IsExact<typeof option2, Some<number> & None>>(true);
  }

  if (option2.isSome()) {
    assertType<IsExact<typeof option2, Some<number>>>(true);
  }

  if (Option.isSome(option2)) {
    assertType<IsExact<typeof option2, Some<number>>>(true);
  }

  const option3 = None;

  if (option3.isNone()) {
    assertType<IsExact<typeof option3, None>>(true);
  }

  if (Option.isNone(option3)) {
    assertType<IsExact<typeof option3, None>>(true);
  }

  if (option3.isSome()) {
    assertType<IsExact<typeof option3, never>>(true);
  }

  if (Option.isSome(option3)) {
    assertType<IsExact<typeof option3, None & Some<never>>>(true);
  }
});

// Option.match - match promise then callback
(async () => {
  const option: Option<string> = Some("42");

  const t = await Promise.resolve(option).then(Option.match(
    (value) => value,
    () => {
      throw new Error();
    },
  ));

  assertType<IsExact<typeof t, string>>(true);
});

// Option.flatMap - union input type and union return type (method)
(async () => {
  const unionOption = Some(42) as
    | Some<number>
    | Some<string>
    | Option<boolean>
    | None;

  const t0 = unionOption.flatMap((value) => {
    assertType<IsExact<typeof value, string | number | boolean>>(true);
    if (value === 42) return Some(42);
    if (value) return Some("Ok" as const);
    return None;
  });

  assertType<
    IsExact<typeof t0, Some<number> | Some<"Ok"> | None>
  >(true);

  const t1 = await Promise.resolve(unionOption).then(
    Option.inspect((value) => {
      assertType<IsExact<typeof value, string | number | boolean>>(true);
    }),
  );

  assertType<IsExact<typeof t1, typeof unionOption>>(true);

  const t2 = await Promise.resolve(unionOption).then(
    Option.map((value) => {
      assertType<IsExact<typeof value, string | number | boolean>>(true);
      return String(value);
    }),
  );

  assertType<IsExact<typeof t2, Option<string>>>(true);

  const t3 = await Promise.resolve(unionOption).then(
    Option.filter((value) => {
      assertType<IsExact<typeof value, string | number | boolean>>(true);
      return Boolean(value);
    }),
  );

  assertType<IsExact<typeof t3, boolean>>(true);

  const t4 = await Promise.resolve(unionOption).then(
    Option.unwrapOr("abc"),
  );

  assertType<IsExact<typeof t4, string | number | boolean>>(true);

  const t5 = await Promise.resolve(unionOption).then(
    Option.zip(Some("abc")),
  );

  assertType<IsExact<typeof t5, Option<[string | number | boolean, string]>>>(
    true,
  );

  const t6 = await Promise.resolve(unionOption).then(
    Option.zip(None),
  );

  assertType<IsExact<typeof t6, Option<[string | number | boolean, never]>>>(
    true,
  );
});

// Option.flatMap - union input type and union return type (callback)
(async () => {
  const unionOption = Some(42) as
    | Some<number>
    | Some<string>
    | Option<boolean>
    | None;

  // Using the Option API this way requires you to pass the Option function (in
  // this case flatMap) to a function expecting a callback, since the method
  // is a higher order function. Also the inference only works correctly from
  // left to right.
  const t0 = await Promise.resolve(unionOption).then(
    Option.flatMap((value) => {
      assertType<IsExact<typeof value, string | number | boolean>>(true);
      if (value === 42) return Some(42);
      if (value === 102) return Some(true) as Option<boolean>;
      if (value) return Some("Ok" as const);
      return None;
    }),
  );

  assertType<
    IsExact<typeof t0, Option<"Ok" | number | boolean>>
  >(true);

  // When the Option.flatMap function is not used in a callback and the option
  // is given directly, it is expected that the callback type needs to be
  // explicitly specified, due to TypeScript inference not working from right
  // to left.
  const t1 = Option.flatMap((value: number | string | boolean) => {
    if (value === 42) return Some(42);
    if (value) return Some("Ok" as const);
    else return None;
  })(unionOption);

  assertType<
    IsExact<typeof t1, Option<"Ok" | number>>
  >(true);
});

// Option.match higher order takes union type
(async () => {
  // deno-lint-ignore require-await
  async function unionTypePromise(n: number = 1) {
    if (n === 3) return None;
    if (n === 2) return Some({ number: 2 });
    if (n === 1) return Some("42");
    return Option.from(42);
  }

  await unionTypePromise().then(Option.match((value) => {
    assertType<IsExact<typeof value, string | number | { number: number }>>(
      true,
    );
    return value;
  }, () => {
    throw Error();
  }));
});

// Option.from - union input type with undefined and union return type
(() => {
  const fromUnionToOption = Option.from(
    (): number | string | undefined => 42,
  );

  fromUnionToOption.inspect((value) =>
    assertType<IsExact<typeof value, number | string>>(true)
  );
});

// Option.from - resolved union type promise with undefined
(() => {
  const resolvedOption = Option.from(
    (): Promise<number | string | undefined> => Promise.resolve(42),
  );

  resolvedOption
    .then((option) =>
      option.inspect((value) =>
        assertType<IsExact<typeof value, number | string>>(true)
      )
    )
    .then(
      Option.inspect((value) =>
        assertType<IsExact<typeof value, number | string>>(true)
      ),
    );
});

// Option.from - rejected promise
(() => {
  const rejectedOption = Option.from(Promise.reject());

  rejectedOption
    .then((option) =>
      option.inspect((value) => assertType<IsExact<typeof value, never>>(true))
    )
    .then(
      Option.inspect((value) => assertType<IsExact<typeof value, never>>(true)),
    );
});
