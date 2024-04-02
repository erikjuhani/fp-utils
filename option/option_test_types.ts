import { None, Option, Some } from "./mod.ts";
import { assertType, IsExact } from "../dev_deps.ts";

// Option.map - number to string
(() => {
  const some = Some(42);

  const t = some.map((value) => {
    assertType<IsExact<typeof value, 42>>(true);
    return value.toString();
  });

  // When this fails it means that we are falsely returning something else than a string
  // Usually this would mean that we instead return a never type due to failing inference
  assertType<IsExact<typeof t, Option<string>>>(true);
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
    assertType<IsExact<typeof option2, Some<42> & None>>(true);
  }

  if (Option.isNone(option2)) {
    assertType<IsExact<typeof option2, Some<42> & None>>(true);
  }

  if (option2.isSome()) {
    assertType<IsExact<typeof option2, Some<42>>>(true);
  }

  if (Option.isSome(option2)) {
    assertType<IsExact<typeof option2, Some<42>>>(true);
  }

  const option3 = None;

  if (option3.isNone()) {
    assertType<IsExact<typeof option3, None>>(true);
  }

  if (Option.isNone(option3)) {
    assertType<IsExact<typeof option3, None>>(true);
  }

  if (option3.isSome()) {
    assertType<IsExact<typeof option3, None & Some<never>>>(true);
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
(() => {
  const unionOption: Option<number | string> = Some(42) as
    | Some<number>
    | Some<string>
    | None;

  const t = unionOption.flatMap((value) => {
    assertType<IsExact<typeof value, string | number>>(true);
    if (value === 42) return Some(42);
    if (value) return Some("Ok" as const);
    return None;
  });

  assertType<
    IsExact<typeof t, Some<42> | Some<"Ok"> | None>
  >(true);
});

// Option.flatMap - union input type and union return type (callback)
(async () => {
  const unionOption = Some(42) as
    | Some<number>
    | Some<string>
    | None;

  // Using the Option API this way requires you to pass the Option function (in
  // this case flatMap) to a function expecting a callback, since the method
  // is a higher order function. Also the inference only works correctly from
  // left to right.
  const t0 = await Promise.resolve(unionOption).then(
    Option.flatMap((value) => {
      assertType<IsExact<typeof value, string | number>>(true);
      if (value === 42) return Some(42);
      if (value) return Some("Ok" as const);
      return None;
    }),
  );

  assertType<
    IsExact<typeof t0, Option<"Ok" | 42>>
  >(true);

  // When the Option.flatMap function is not used in a callback and the option
  // is given directly, it is expected that the callback type needs to be
  // explicitly specified, due to TypeScript inference not working from right
  // to left.
  const t1 = Option.flatMap((value: number | string) => {
    if (value === 42) return Some(42);
    if (value) return Some("Ok" as const);
    else return None;
  })(unionOption);

  assertType<
    IsExact<typeof t1, Option<"Ok" | 42>>
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
    assertType<IsExact<typeof value, "42" | number | { number: number }>>(
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
