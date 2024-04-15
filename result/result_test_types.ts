import { Err, Ok, Result } from "./mod.ts";
import { assertType, type IsExact } from "../dev_deps.ts";

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
    assertType<IsExact<typeof result, Result<string, string>>>(true);
  }

  if (result.isOk()) {
    assertType<IsExact<typeof result, Ok<string>>>(true);
  }

  if (Result.isOk(result)) {
    assertType<IsExact<typeof result, Result<string, string>>>(true);
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
    assertType<IsExact<typeof result2, Ok<number>>>(true);
  }

  if (Result.isErr(result2)) {
    assertType<IsExact<typeof result2, never>>(true);
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
    assertType<IsExact<typeof result3, Err<number>>>(true);
  }

  if (Result.isOk(result3)) {
    assertType<IsExact<typeof result3, never>>(true);
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
    | Ok<number>
    | Err<number>
    | Result<string, string>;

  const t0 = unionResult.flatMap((value) => {
    assertType<IsExact<typeof value, string | number | undefined>>(true);
    if (value === 42) return Ok();
    if (value) return Ok("Ok" as const);
    else return Err("Got undefined value");
  });

  assertType<
    IsExact<
      typeof t0,
      Err<string> | Err<number> | Result<"Ok" | undefined, string>
    >
  >(true);

  const t1 = unionResult.inspectErr((value) => {
    assertType<IsExact<typeof value, string | number>>(true);
  });

  assertType<
    IsExact<
      typeof t1,
      | Result<string, string>
      | Ok<number>
      | Ok<undefined>
      | Err<string>
      | Err<number>
    >
  >(
    true,
  );

  // FlatMap on Err should always return Err type
  const t2 = Err(10).flatMap(() => Ok(10));
  assertType<IsExact<typeof t2, Err<number>>>(true);

  const t3 = Ok(10).flatMap(() => Err(10));
  assertType<IsExact<typeof t3, Result<never, number>>>(true);

  const t4 = (Ok(10) as Result<number, string>).flatMap((value) =>
    value > 10 ? Ok("10") : Err(10)
  );
  assertType<IsExact<typeof t4, Result<string, number>>>(true);
});

// Result.flatMap - union input type and union return type (callback)
(async () => {
  const unionResult = Ok() as
    | Ok<undefined>
    | Err<string>
    | Ok<number>
    | Err<number>
    | Result<string, string>;

  // Using the Result API this way requires you to pass the Result function (in
  // this case flatMap) to a function expecting a callback, since the method
  // is a higher order function. Also the inference only works correctly from
  // left to right.
  const t0 = await Promise.resolve(unionResult).then(
    Result.flatMap((value) => {
      assertType<IsExact<typeof value, string | number | undefined>>(true);
      if (value === 42) return Ok();
      if (value) return Ok("Ok" as const);
      else return Err("Got undefined value");
    }),
  );

  assertType<IsExact<typeof t0, Result<"Ok" | undefined, string | number>>>(
    true,
  );

  // When the Result.flatMap function is not used in a callback and the result
  // is given directly, it is expected that the callback type needs to be
  // explicitly specified, due to TypeScript inference not working from right
  // to left.
  const t1 = Result.flatMap((value: number | undefined) => {
    if (value === 42) return Ok();
    if (value) return Ok("Ok" as const);
    if (value === 102) return Err(102);
    else return Err("Got undefined value");
  })(unionResult);

  // We cannot infer the original Result type so we return type unknown for err
  // type, which is better than a wrong type.
  assertType<IsExact<typeof t1, Result<"Ok" | undefined, unknown>>>(
    true,
  );

  const t2 = await Promise.resolve(unionResult).then(
    Result.inspectErr((value) => {
      assertType<IsExact<typeof value, string | number>>(true);
    }),
  );

  assertType<IsExact<typeof t2, typeof unionResult>>(true);

  const t3 = await Promise.resolve(unionResult).then(
    Result.inspect((value) => {
      assertType<IsExact<typeof value, string | number | undefined>>(true);
    }),
  );

  assertType<IsExact<typeof t3, typeof unionResult>>(true);

  const t4 = await Promise.resolve(unionResult).then(
    Result.map((value) => {
      assertType<IsExact<typeof value, string | number | undefined>>(true);
      return String(value);
    }),
  );

  assertType<IsExact<typeof t4, Result<string, string | number>>>(true);

  const t5 = await Promise.resolve(unionResult).then(
    Result.mapErr((value) => {
      assertType<IsExact<typeof value, number | string>>(true);
      return String(value);
    }),
  );

  assertType<IsExact<typeof t5, Result<string | number | undefined, string>>>(
    true,
  );

  const t6 = await Promise.resolve(unionResult).then(
    Result.expect("Error"),
  );

  assertType<IsExact<typeof t6, string | number | undefined>>(true);

  const t7 = await Promise.resolve(unionResult).then(
    Result.expectErr("Error"),
  );

  assertType<IsExact<typeof t7, number | string>>(true);

  const t8 = await Promise.resolve(unionResult).then(
    Result.filter((value) => {
      assertType<IsExact<typeof value, string | number | undefined>>(true);
      return Boolean(value);
    }),
  );

  assertType<IsExact<typeof t8, boolean>>(true);

  const t9 = await Promise.resolve(unionResult).then(
    Result.unwrapOr("abc"),
  );

  assertType<IsExact<typeof t9, string | number | undefined>>(true);

  const t10 = [Ok(42), Err("Error"), Ok("string") as Result<string, number>]
    .filter(Result.isOk);

  assertType<IsExact<typeof t10, (Ok<number> | Result<string, number>)[]>>(
    true,
  );

  const t11 = [Ok(42), Err("Error"), Ok("string") as Result<string, number>]
    .filter(Result.isErr);

  assertType<IsExact<typeof t11, (Err<string> | Result<string, number>)[]>>(
    true,
  );

  const t12 = await Promise.resolve(unionResult).then(
    Result.unwrap,
  );

  assertType<IsExact<typeof t12, string | number | undefined>>(true);

  const t13 = await Promise.resolve(unionResult).then(
    Result.unwrapErr,
  );

  assertType<IsExact<typeof t13, string | number>>(true);
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
