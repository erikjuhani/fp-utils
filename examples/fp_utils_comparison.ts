/**
 * @module
 * The intent of this example is to compare functionality from other similar
 * utility libraries as `@fp-utils`. This is not supposed to be a vast
 * comparison between all the functionality, but rather an overview of some of
 * the differences.
 *
 * The modules compared to are in no particular order the following:
 * - `oxide.ts`
 * - `@oxi/result`
 * - `@mobily/ts-belt`
 * - `ts-result-es`
 * - `@badrap/result`
 *
 * Requirements for the modules in this comparison were the following:
 *
 * - At least over 1000 weekly downloads in npm
 * - Typescript support
 * - Has to contain Result or Option modules (Either or Maybe)
 *
 * Each module is contained within a corresponding namespace in this comparison
 * file. Each of the modules have the same expectations and functions defined.
 * Although with some of the libraries we need to make compromises with the
 * expectations.
 */
import { assertType, IsExact, std } from "../dev_deps.ts";
import * as fp_utils from "@fp-utils/result";
import * as oxi_result from "@oxi/result";
import * as oxide_ts from "npm:oxide.ts";
import * as ts_belt from "npm:@mobily/ts-belt@4.0.0-rc.5";
import * as ts_result_es from "npm:ts-results-es";
import * as badrap_result from "npm:@badrap/result";

const { assertEquals } = std.assert;

// deno-lint-ignore no-namespace
export namespace fpUtils {
  /**
   * Returning ok
   * @expected-type Ok<number>
   */
  export function ok() {
    type ExpectedType = fp_utils.Result.Ok<number>;

    const ok = fp_utils.Result.ok(42);
    assertType<IsExact<typeof ok, ExpectedType>>(true);
    assertEquals(ok.unwrap(), 42);
    return ok;
  }

  /**
   * Mapping over result
   * @expected-type Ok<string>
   */
  export function map() {
    type ExpectedType = fp_utils.Result.Ok<string>;

    const result = fp_utils.Result.ok(42)
      .map((value) => value + 10)
      .map(String);

    assertType<IsExact<typeof result, ExpectedType>>(true);
    assertEquals(result.unwrap(), "52");
    return result;
  }

  /**
   * Interoperability with promises.
   * Has support for higher-order functions in then callbacks.
   * @expected-type Result<string | undefined, string>
   */
  export async function interoperability() {
    type ExpectedType = fp_utils.Result<string | undefined, string>;

    const promise = Promise.resolve(42);

    const result = await promise
      .then(fp_utils.Result.from)
      // Commented out example of using higher order function
      // .then(
      //   fp_utils.Result.flatMap((value) => {
      //     if (value === 42) return fp_utils.Result.ok("42");
      //     if (value === 0) return fp_utils.Result.err("Got zero");
      //     return fp_utils.Result.ok();
      //   }),
      // here we use the class method to keep the benchmark comparison fair
      .then(
        (result) =>
          result.flatMap((value) => {
            if (value === 42) return fp_utils.Result.ok("42");
            if (value === 0) return fp_utils.Result.err("Got zero");
            return fp_utils.Result.ok();
          }),
      );

    assertType<IsExact<typeof result, ExpectedType>>(true);
    assertEquals(result.unwrap(), "42");
    return result;
  }

  /**
   * Can infer the union result type returned by async function.
   * Has support for higher-order functions in then callbacks.
   * @expected-type string | number
   */
  export async function unionTypePromise() {
    type ExpectedType = string | number;

    // deno-lint-ignore require-await
    async function unionTypePromise(n: number = 1) {
      if (n === 2) return fp_utils.Result.ok(42);
      return n === 1
        ? fp_utils.Result.ok("+1")
        : fp_utils.Result.err("Got zero");
    }

    const result = await unionTypePromise()
      // Commented out example of using higher order function
      // .then(fp_utils.Result.match(
      //   (value) => value,
      //   (err) => {
      //     throw Error(err);
      //   },
      // ))
      // here we use the class method to keep the benchmark comparison fair
      .then((result) =>
        result.match(
          (value) => value,
          (err) => {
            throw Error(err);
          },
        )
      );

    assertType<IsExact<typeof result, ExpectedType>>(true);
    assertEquals(result, "+1");
    return result;
  }
}

// deno-lint-ignore no-namespace
export namespace oxi {
  /**
   * Returning ok
   * This is the exception return type as there is no Ok type
   * @expected-type Result<number, never>
   */
  export function ok() {
    /**
     * @oxi/result does not have a separate exported type for Ok value.
     */
    type ExpectedType = oxi_result.Result<number, never>;

    const ok = oxi_result.Ok(42);

    // We expected the error to be `never` as that does not exist in Ok type.
    // However returning unknown works just as well, but not what we expect in
    // this test.
    assertType<IsExact<typeof ok, ExpectedType>>(false);
    assertEquals(ok.unwrap(), 42);
    return ok;
  }

  /**
   * Mapping over result
   * @expected-type Result<string, never>
   */
  export function map() {
    type ExpectedType = oxi_result.Result<string, never>;

    const result = oxi_result.Ok(42)
      .map((value) => value + 10)
      .map(String);

    // We expected the error to be `never` as that does not exist in Ok type.
    // However returning unknown works just as well, but not what we expect in
    // this test.
    assertType<IsExact<typeof result, ExpectedType>>(false);
    assertEquals(result.unwrap(), "52");
    return result;
  }

  /**
   * Interoperability with promises.
   * No support for higher-order functions in then callbacks.
   * @expected-type Result<string | undefined, string>
   */
  export async function interoperability() {
    type ExpectedType = oxi_result.Result<string | undefined, string>;

    const promise = Promise.resolve(42);

    const result = await promise
      // oxi_result.from is intended for a different case
      .then(oxi_result.Result.Ok)
      .then(
        (result) =>
          // Loses type inference and infers the result as Result<unknown, unknown>
          result.andThen((value) => {
            if (value === 42) return oxi_result.Ok("42");
            if (value === 0) return oxi_result.Err("Got zero");
            // Requires a parameter to define "unit" type result
            return oxi_result.Ok(undefined);
          }),
      );

    assertType<IsExact<typeof result, ExpectedType>>(false);
    assertEquals(result.unwrap(), "42");
    return result;
  }

  /**
   * Can infer the union result type returned by async function.
   * No support for higher-order functions in then callbacks.
   * @expected-type string | number
   */
  export async function unionTypePromise() {
    type ExpectedType = string | number;

    // deno-lint-ignore require-await
    async function unionTypePromise(n: number = 1) {
      if (n === 2) return oxi_result.Ok(42);
      return n === 1 ? oxi_result.Ok("+1") : oxi_result.Err("Got zero");
    }

    const result = await unionTypePromise()
      .then((result) =>
        // Loses type inference
        result.match(
          (value) => value,
          (err) => {
            // Requires a cast
            throw Error(err as string);
          },
        )
      );

    assertType<IsExact<typeof result, ExpectedType>>(false);
    assertEquals(result, "+1");
    return result;
  }
}

// deno-lint-ignore no-namespace
export namespace oxideTs {
  /**
   * Returning ok
   * @expected-type Ok<number>
   */
  export function ok() {
    type ExpectedType = oxide_ts.Ok<number>;

    const ok = oxide_ts.Ok(42);
    assertType<IsExact<typeof ok, ExpectedType>>(true);
    assertEquals(ok.unwrap(), 42);
    return ok;
  }

  /**
   * Mapping over result
   * @expected-type Ok<string>
   */
  export function map() {
    type ExpectedType = oxide_ts.Ok<string>;

    // Turns into Result<string, never>, which is essentially the same as
    // Ok<string>
    const result = oxide_ts.Ok(42)
      .map((value) => value + 10)
      .map(String);

    assertType<IsExact<typeof result, ExpectedType>>(true);
    assertEquals(result.unwrap(), "52");
    return result;
  }

  /**
   * Interoperability with promises.
   * No support for higher-order functions in then callbacks.
   * @expected-type Result<string | undefined, string>
   */
  export async function interoperability() {
    type ExpectedType = oxide_ts.Result<string | undefined, string>;

    const promise = Promise.resolve(42);

    const result = await promise
      .then(oxide_ts.Result.from)
      .then(
        (result) =>
          result.andThen((value) => {
            if (value === 42) return oxide_ts.Ok("42");
            // Does not accept a string value as the error type here This is
            // definitely a bug in the library especially if the intention is
            // to "match" rust functionality
            if (value === 0) return oxide_ts.Err("Got zero" as unknown as null);
            // Requires a parameter to define "unit" type result
            return oxide_ts.Ok(undefined);
          }),
      );

    assertType<IsExact<typeof result, ExpectedType>>(false);
    assertEquals(result.unwrap(), "42");
    return result;
  }

  /**
   * Can infer the union result type returned by async function.
   * No support for higher-order functions in then callbacks.
   * @expected-type string | number
   */
  export async function unionTypePromise() {
    type ExpectedType = string | number;

    // deno-lint-ignore require-await
    async function unionTypePromise(n: number = 1) {
      if (n === 2) return oxide_ts.Ok(42);
      return n === 1 ? oxide_ts.Ok("+1") : oxide_ts.Err("Got zero");
    }

    const result = await unionTypePromise()
      .then((result) =>
        // Loses all inference on the callbacks, which requires manual typing
        oxide_ts.match(
          result,
          {
            Ok: (value: string | number) => value,
            Err: (err: string) => {
              throw Error(err);
            },
          },
        )
      );

    assertType<IsExact<typeof result, ExpectedType>>(true);
    assertEquals(result, "+1");
    return result;
  }
}

// deno-lint-ignore no-namespace
export namespace tsBelt {
  /**
   * Returning ok
   * @expected-type Ok<number>
   */
  export function ok() {
    type ExpectedType = ts_belt.R.Ok<number>;

    const ok = ts_belt.R.Ok(42);
    // Returns the literal value 42.
    assertType<IsExact<typeof ok, ExpectedType>>(true);
    assertEquals(ts_belt.R.getExn(ok), 42);
    return ok;
  }

  /**
   * Mapping over result
   * @expected-type Ok<string>
   */
  export function map() {
    type ExpectedType = ts_belt.R.Ok<string>;

    // ts-belt does not have chainable methods on the results, but offers pipe
    // and higher order functions
    //
    // Turns into Result<string, unknown>.
    const result = ts_belt.pipe(
      ts_belt.R.Ok(42),
      ts_belt.R.map((value) => value + 10),
      ts_belt.R.map(String),
    );

    // In ts-belt Ok and Result<string, never> are not considered the same
    assertType<IsExact<typeof result, ExpectedType>>(false);
    assertEquals(ts_belt.R.getExn(result), "52");
    return result;
  }

  /**
   * Interoperability with promises.
   * Has support for higher-order functions in then callbacks.
   * @expected-type Result<string | undefined, string>
   */
  export async function interoperability() {
    type ExpectedType = ts_belt.R.Result<string | undefined, string>;

    const promise = Promise.resolve(42);

    const result = await promise
      // Requires error to be defined for the from functions
      .then(ts_belt.R.fromNullable("Requires error"))
      .then(
        ts_belt.R.flatMap((value) => {
          if (value === 42) return ts_belt.R.Ok("42");
          if (value === 0) return ts_belt.R.Error("Got zero");
          // Requires a parameter to define "unit" type result
          return ts_belt.R.Ok(undefined);
        }),
      );

    assertType<IsExact<typeof result, ExpectedType>>(true);
    assertEquals(ts_belt.R.getExn(result), "42");
    return result;
  }

  /**
   * Can infer the union result type returned by async function.
   * Has support for higher-order functions in then callbacks.
   * @expected-type string | number
   */
  export async function unionTypePromise() {
    type ExpectedType = string | number;

    // deno-lint-ignore require-await
    async function unionTypePromise(n: number = 1) {
      if (n === 2) return ts_belt.R.Ok(42);
      return n === 1 ? ts_belt.R.Ok("+1") : ts_belt.R.Error("Got zero");
    }

    const result = await unionTypePromise()
      // Type inference breaks to never and requires manual typing
      .then(ts_belt.R.match(
        (value: string | number) => value,
        (err) => {
          throw Error(err);
        },
      ));

    assertType<IsExact<typeof result, ExpectedType>>(true);
    assertEquals(result, "+1");
    return result;
  }
}

// deno-lint-ignore no-namespace
export namespace tsResultEs {
  /**
   * Returning ok
   * @expected-type Ok<number>
   */
  export function ok() {
    type ExpectedType = ts_result_es.Ok<number>;

    const ok = ts_result_es.Ok(42);
    assertType<IsExact<typeof ok, ExpectedType>>(true);
    assertEquals(ok.unwrap(), 42);
    return ok;
  }

  /**
   * Mapping over result
   * @expected-type Ok<string>
   */
  export function map() {
    type ExpectedType = ts_result_es.Ok<string>;

    const result = ts_result_es.Ok(42)
      .map((value) => value + 10)
      .map(String);

    assertType<IsExact<typeof result, ExpectedType>>(true);
    assertEquals(result.unwrap(), "52");
    return result;
  }

  /**
   * Interoperability with promises.
   * No support for higher-order functions in then callbacks.
   * @expected-type Result<string | undefined, string>
   */
  export async function interoperability() {
    type ExpectedType = ts_result_es.Result<string | undefined, string>;

    const promise = Promise.resolve(42);

    const result = await promise
      // No Result."from" function
      .then(ts_result_es.Ok)
      .then(
        (result) =>
          result.andThen((value) => {
            if (value === 42) return ts_result_es.Ok("42");
            if (value === 0) return ts_result_es.Err("Got zero");
            // Requires a parameter to define "unit" type result
            return ts_result_es.Ok(undefined);
          }),
      );

    assertType<IsExact<typeof result, ExpectedType>>(true);
    assertEquals(result.unwrap(), "42");
    return result;
  }

  /**
   * Can infer the union result type returned by async function.
   * No support for higher-order functions in then callbacks.
   * @expected-type string | number
   */
  export async function unionTypePromise() {
    type ExpectedType = string | number;

    // deno-lint-ignore require-await
    async function unionTypePromise(n: number = 1) {
      if (n === 2) return ts_result_es.Ok(42);
      return n === 1 ? ts_result_es.Ok("+1") : ts_result_es.Err("Got zero");
    }

    const result = await unionTypePromise()
      // No match function
      // Implementation to mimick the end result of the other example functions
      .then((result) => {
        if (result.isOk()) return result.unwrap();
        else throw Error(result.unwrapErr());
      });

    assertType<IsExact<typeof result, ExpectedType>>(true);
    assertEquals(result, "+1");
    return result;
  }
}

/**
 * @badrap/result uses Error as the type for Result error, which is quite
 * limiting in terms of flexibility.
 */
// deno-lint-ignore no-namespace
export namespace badrap {
  /**
   * Returning ok
   * @expected-type Ok<number>
   */
  export function ok() {
    type ExpectedType = badrap_result.Result.Ok<number, never>;

    const ok = badrap_result.Result.ok(42);
    // Library provides type for Ok, but ok function returns Result<number, Error>,
    // which is not what we expect
    assertType<IsExact<typeof ok, ExpectedType>>(false);
    assertEquals(ok.unwrap(), 42);
    return ok;
  }

  /**
   * Mapping over result
   * @expected-type Ok<string>
   */
  export function map() {
    type ExpectedType = badrap_result.Result.Ok<string, never>;

    const result = badrap_result.Result.ok(42)
      .map((value) => value + 10)
      .map(String);

    // Library provides type for Ok, but ok function returns Result<number, Error>,
    // which is not what we expect. Should return Result<string, never>.
    assertType<IsExact<typeof result, ExpectedType>>(false);
    assertEquals(result.unwrap(), "52");
    return result;
  }

  /**
   * Interoperability with promises.
   * No support for higher-order functions in then callbacks.
   * @expected-type Result<string | undefined, Error>
   */
  export async function interoperability() {
    // Forces the result error type as Error
    type ExpectedType = badrap_result.Result<string | undefined, Error>;

    const promise = Promise.resolve(42);

    const result = await promise
      // No Result."from" function
      .then(badrap_result.Result.ok)
      .then(
        (result) =>
          result.chain((value) => {
            if (value === 42) return badrap_result.Result.ok("42");
            if (value === 0) return badrap_result.Result.err(Error("Got zero"));
            // Requires a parameter to define "unit" type result
            return badrap_result.Result.ok(undefined);
          }),
      );

    assertType<IsExact<typeof result, ExpectedType>>(true);
    assertEquals(result.unwrap(), "42");
    return result;
  }

  /**
   * Can infer the union result type returned by async function.
   * No support for higher-order functions in then callbacks.
   * @expected-type string | number
   */
  export async function unionTypePromise() {
    type ExpectedType = string | number;

    // deno-lint-ignore require-await
    async function unionTypePromise(n: number = 1) {
      if (n === 2) return badrap_result.Result.ok(42);
      return n === 1
        ? badrap_result.Result.ok("+1")
        // Forces the result error type as Error
        : badrap_result.Result.err(Error("Got zero"));
    }

    const result = await unionTypePromise()
      // No match function
      // Implementation to mimick the end result of the other example functions
      .then((result) => {
        if (result.isOk) return result.unwrap();
        else throw result.error;
      });

    assertType<IsExact<typeof result, ExpectedType>>(true);
    assertEquals(result, "+1");
    return result;
  }
}
