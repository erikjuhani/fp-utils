import { Err, Ok, Result } from "./mod.ts";
import { assertType, IsExact } from "../dev_deps.ts";

// Result.map - unit to string
(() => {
  const unitResult = Ok();

  const t = unitResult.map((value) => {
    assertType<IsExact<typeof value, undefined>>(true);
    return "42";
  });

  // When this fails it means that we are falsely returning something else than a string
  // Usually this would mean that we instead return a never type due to failing inference
  assertType<IsExact<typeof t, Ok<string>>>(true);
});

(() => {
  const ok = Ok(42);

  const t = ok.map((value) => {
    assertType<IsExact<typeof value, number>>(true);
  });

  assertType<IsExact<typeof t, Ok<void>>>(true);
});

// Result.match - identity and throw
(() => {
  const result: Result<string, unknown> = Ok("42");

  const t = result.match(
    (value) => value,
    () => {
      throw new Error();
    },
  );

  assertType<IsExact<typeof t, string>>(true);
});

// Result.isErr and Result.isOk
(() => {
  const result: Result<string, string> = Ok("42");

  if (result.isErr()) {
    assertType<IsExact<typeof result, Err<string>>>(true);
  }

  if (Result.isErr(result)) {
    assertType<IsExact<typeof result, Err<string>>>(true);
  }

  if (result.isOk()) {
    assertType<IsExact<typeof result, Ok<string>>>(true);
  }

  if (Result.isOk(result)) {
    assertType<IsExact<typeof result, Ok<string>>>(true);
  }

  const result1 = Ok(42) as Ok<number> | Err<string> | Ok<undefined>;

  if (result1.isErr()) {
    assertType<IsExact<typeof result1, Err<string>>>(true);
  }

  if (Result.isErr(result1)) {
    assertType<IsExact<typeof result1, Err<string>>>(true);
  }

  if (result1.isOk()) {
    assertType<IsExact<typeof result1, Ok<number> | Ok<undefined>>>(true);
  }

  if (Result.isOk(result1)) {
    assertType<IsExact<typeof result1, Ok<number> | Ok<undefined>>>(true);
  }

  const result2 = Ok(42);

  if (result2.isErr()) {
    assertType<IsExact<typeof result2, Ok<number> & Err<never>>>(true);
  }

  if (Result.isErr(result2)) {
    assertType<IsExact<typeof result2, Ok<number> & Err<never>>>(true);
  }

  if (result2.isOk()) {
    assertType<IsExact<typeof result2, Ok<number>>>(true);
  }

  if (Result.isOk(result2)) {
    assertType<IsExact<typeof result2, Ok<number>>>(true);
  }

  const result3 = Err(42);

  if (result3.isErr()) {
    assertType<IsExact<typeof result3, Err<number>>>(true);
  }

  if (Result.isErr(result3)) {
    assertType<IsExact<typeof result3, Err<number>>>(true);
  }

  if (result3.isOk()) {
    assertType<IsExact<typeof result3, Err<number> & Ok<never>>>(true);
  }

  if (Result.isOk(result3)) {
    assertType<IsExact<typeof result3, Err<number> & Ok<never>>>(true);
  }
});

// Result.match - match promise then callback
(async () => {
  const result: Result<string, unknown> = Ok("42");

  const t = await Promise.resolve(result).then(Result.match(
    (value) => value,
    () => {
      throw new Error();
    },
  ));

  assertType<IsExact<typeof t, string>>(true);
});

// Result.flatMap - union input type and union return type (method)
(() => {
  const unionResult = Ok() as
    | Ok<undefined>
    | Err<string>
    | Ok<number>;

  const t = unionResult.flatMap((value) => {
    assertType<IsExact<typeof value, number | undefined>>(true);
    if (value === 42) return Ok();
    if (value) return Ok("Ok" as const);
    else return Err("Got undefined value");
  });

  assertType<IsExact<typeof t, Result<"Ok" | undefined, string>>>(true);
});

// Result.flatMap - union input type and union return type (callback)
(async () => {
  const unionResult = Ok() as
    | Ok<undefined>
    | Err<string>
    | Ok<number>;

  // Using the Result API this way requires you to pass the Result function (in
  // this case flatMap) to a function expecting a callback, since the method
  // is a higher order function. Also the inference only works correctly from
  // left to right.
  const t0 = await Promise.resolve(unionResult).then((a) => a).then(
    Result.flatMap((value) => {
      assertType<IsExact<typeof value, number | undefined>>(true);
      if (value === 42) return Ok();
      if (value) return Ok("Ok" as const);
      else return Err("Got undefined value");
    }),
  );

  assertType<IsExact<typeof t0, Result<"Ok" | undefined, string>>>(true);

  // When the Result.flatMap function is not used in a callback and the result
  // is given directly, it is expected that the callback type needs to be
  // explicitly specified, due to TypeScript inference not working from right
  // to left.
  const t1 = Result.flatMap((value: number | undefined) => {
    if (value === 42) return Ok();
    if (value) return Ok("Ok" as const);
    else return Err("Got undefined value");
  })(unionResult);

  assertType<IsExact<typeof t1, Result<"Ok" | undefined, string>>>(true);
});

// Result.from - function union input type with undefined and union return type
(() => {
  const fromUnionToResult = Result.from(
    (): number | string | undefined => 42,
    "Thrown error",
  );

  fromUnionToResult.inspect((value) =>
    assertType<IsExact<typeof value, number | string | undefined>>(true)
  );
});

// Result.match higher order takes union type
(async () => {
  // deno-lint-ignore require-await
  async function unionTypePromise(n: number = 1) {
    if (n === 3) return Err(100);
    if (n === 2) return Ok();
    if (n === 1) return Ok("42");
    return Result.from(42, "Unexpected error");
  }

  await unionTypePromise().then(Result.match((value) => {
    assertType<IsExact<typeof value, string | number | undefined>>(true);
    return value;
  }, (err) => {
    assertType<IsExact<typeof err, string | number>>(true);
    throw Error(String(err));
  }));
});

// Result.from - throwing function
(() => {
  const thrownResult = Result.from(() => {
    throw Error("Thrown error");
  }, "Thrown error");

  thrownResult.inspect((value) =>
    assertType<IsExact<typeof value, never>>(true)
  );

  thrownResult.inspectErr((value) =>
    assertType<IsExact<typeof value, string>>(true)
  );
});

// Result.from - resolved union type promise with undefined
(() => {
  const resolvedResult = Result.from(
    (): Promise<number | string | undefined> => Promise.resolve(42),
    "Thrown error",
  );

  resolvedResult
    .then((result) =>
      result.inspect((value) =>
        assertType<IsExact<typeof value, number | string | undefined>>(true)
      )
    )
    .then(
      Result.inspect((value) =>
        assertType<IsExact<typeof value, number | string | undefined>>(true)
      ),
    )
    .then((result) =>
      result.inspectErr((value) =>
        assertType<IsExact<typeof value, string>>(true)
      )
    )
    .then(
      Result.inspectErr((value) =>
        assertType<IsExact<typeof value, string>>(true)
      ),
    );
});

// Result.from - rejected promise
(() => {
  const rejectedResult = Result.from(Promise.reject(), "Thrown error");

  rejectedResult
    .then((result) =>
      result.inspect((value) => assertType<IsExact<typeof value, never>>(true))
    )
    .then((result) =>
      result.inspectErr((value) =>
        assertType<IsExact<typeof value, string>>(true)
      )
    )
    .then(
      Result.inspect((value) => assertType<IsExact<typeof value, never>>(true)),
    )
    .then(
      Result.inspectErr((value) =>
        assertType<IsExact<typeof value, string>>(true)
      ),
    );
});
