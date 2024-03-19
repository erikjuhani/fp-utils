/**
 * @module
 *
 * Result encapsulates two possible values: a successful result `Ok` or an
 * error `Err`. Result allows to chain together a series of operations that can
 * potentially fail and propagate the error through the computations. This
 * enables to write code that is more focused on the 'happy path' and separate
 * the error handling logic in a clean and concise way.
 *
 * When a computation succeeds, Result carries the successful value and allows
 * you to continue chaining operations on it. If at any point an error occurs,
 * the error value is propagated, and subsequent operations are bypassed
 * until an error handler is encountered, which enables explicit handling of
 * both the success and error cases making the code easier to reason about.
 *
 * Result is similar to Option, the main difference is that it holds either a
 * value or an error, and not value or none.
 *
 * ```ts
 * import { Result } from "@fp-utils/result";
 *
 * type BookIndex = number;
 * type BookName = string;
 *
 * const books = ["The Hobbit", "The Fellowship of the Ring"];
 *
 * const tryGetBook = (index: BookIndex): Result<BookName, string> =>
 *  books[index]
 *    ? Result.ok(books[index])
 *    : Result.err(`Cannot find a book with index ${index}`);
 *
 * // Evaluates to Ok "The Fellowship of the Ring"
 * const bookFound = tryGetBook(1);
 *
 * // Evaluates to Err "Cannot find a book with index 2"
 * const bookNotFound = tryGetBook(2);
 * ```
 */

/**
 * Result represents the success of a computation `Ok` or the failure of a
 * computation `Err`. It is commonly used with computations known to either
 * succeed or fail.
 */
// deno-lint-ignore no-namespace
export namespace Result {
  /**
   * Recursive type helper for the Result.from function return type. The type
   * is recursively traversed to find the correct type depending on the given
   * value. The recursion happens if the type is a function.
   */
  type From<T, TError> = T extends () => unknown
    ? ReturnType<T> extends never ? Err<TError> : From<ReturnType<T>, TError>
    : T extends undefined ? Result<undefined, TError>
    : T extends Promise<never> ? Promise<Err<TError>>
    : T extends Promise<unknown> ? Promise<Result<Awaited<T>, TError>>
    : Result<T, TError>;

  /**
   * Type helper to determine if the value is a Promise.
   */
  function isPromise<T>(value: unknown): value is Promise<T> {
    return isNonNullable(value) && typeof value === "object" && "then" in value;
  }

  /**
   * Type helper to determine if the value is NonNullable.
   */
  function isNonNullable<T>(value: T): value is NonNullable<T> {
    return value !== null && value !== undefined;
  }
  /** {@link Result} */
  export interface Type<T, TError> {
    /**
     * Result.flatMap applies a function `fn` to the content of a result `T` and
     * transforms it into a result containing value `U`.
     *
     * @example
     * ```ts
     * type TryParse = (input: string) => Result<number, string>;
     *
     * const tryParse: TryParse = (input: string) => {
     *   const value = parseInt(input);
     *   return isNaN(value) ? Result.err("could not parse") : Result.ok(value);
     * };
     *
     * Result.ok("42")
     *   .flatMap(tryParse); // Evaluates to Ok 42
     *
     * Result.ok("Forty-two")
     *   .flatMap(tryParse); // Evaluates to Err "could not parse"
     *
     * Result.err("error")
     *   .flatMap(tryParse); // Evaluates to Err "error"
     * ```
     */
    flatMap<U, UError>(fn: (value: T) => Result<U, UError>): Result<U, UError>;

    /**
     * Result.inspect calls the provided function `fn` with a reference to the
     * contained result value `T` if the result is ok.
     *
     * @example
     * ```ts
     * Result.ok(42)
     *   .inspect((x) => console.log(x * 2)); // Evaluates to 84
     *
     * Result.err(42)
     *   .inspect((x) => console.log(x * 2)); // Prints nothing
     * ```
     */
    inspect(fn: (value: T) => void): this;

    /**
     * Result.inspectErr calls the provided function `fn` with a reference to the
     * contained result error value `TError` if the result is err.
     *
     * @example
     * ```ts
     * Result.ok(42)
     *   .inspectErr((x) => console.log(x * 2)); // Prints nothing
     *
     * Result.err(42)
     *   .inspectErr((x) => console.log(x * 2)); // Evaluates to 84
     *
     * ```
     */
    inspectErr(fn: (value: TError) => void): this;

    /**
     * Result.map applies a function `fn` to result value `T` and transforms it
     * into value `U`.
     *
     * @example
     * ```ts
     * Result.ok(42)
     *   .map((x) => x * 2); // Evaluates to Ok 84
     *
     * Result.err(42)
     *   .map((x) => x * 2); // Evaluates to Err 42
     *
     * ```
     */
    map<U>(fn: (value: T) => U): Result<U, TError>;

    /**
     * Result.mapErr applies a function `fn` to result error value `TError` and
     * transforms it into value `U`.
     *
     * @example
     * ```ts
     * Result.err(42)
     *   .mapErr((x) => x * 2); // Evaluates to Err 84
     *
     * Result.ok(42)
     *   .mapErr((x) => x * 2); // Evaluates to Ok 42
     * ```
     */
    mapErr<U>(fn: (value: TError) => U): Result<T, U>;

    /**
     * Result.match transforms the result value `T` into `U1` using `onOk` and
     * then returns `U1`. If the result is Err, the error value `TError` is
     * transformed to `U2` with `onErr` and then returns `U2`.
     *
     * @example
     * ```ts
     * Result.ok(42)
     *   .match((x) => x * 2, (err) => err + 10); // Evaluates to 84
     *
     * Result.err(42)
     *   .match((x) => x * 2, (err) => err + 10); // Evaluates to 52
     *
     * ```
     */
    match<U1, U2>(
      onOk: (value: T) => U1,
      onErr: (value: TError) => U2,
    ): U1 | U2;

    /**
     * Result.unwrap returns the value `T` from the associated result if it is
     * `Ok`; otherwise it will throw.
     *
     * @example
     * ```ts
     * Result.ok(42).unwrap(); // Evaluates to 42
     *
     * Result.err(42).unwrap(); // Throws an exception!
     * ```
     */
    unwrap<U extends T>(): T | U;

    /**
     * Result.unwrapErr returns the value `TError` from the associated result if
     * it is `Err`; otherwise it will throw.
     *
     * @example
     * ```ts
     * Result.err(42).unwrapErr(); // Evaluates to 42
     *
     * Result.ok(42).unwrapErr(); // Throws an exception!
     * ```
     */
    unwrapErr(): TError;

    /**
     * Result.unwrapOr returns the value `T` from the associated result or
     * returns the default value if the result is `Err`.
     *
     * @example
     * ```ts
     * Result.ok(42).unwrapOr(99); // Evaluates to 42
     *
     * Result.err(42).unwrapOr(99); // Evaluates to 99
     * ```
     */
    unwrapOr<U>(defaultValue: U): U;
    unwrapOr<U>(defaultValue: T | U): T | U;

    /**
     * Result.isOk returns `true` if the result is `Ok`.
     *
     * @example
     * ```ts
     * Result.ok(42).isOk(); // Evaluates to true
     *
     * Result.err(42).isOk(); // Evaluates to false
     * ```
     */
    isOk<U extends T>(): this is Ok<U>;

    /**
     * Result.isErr returns `true` if the result is `Err`.
     *
     * @example
     * ```ts
     * Result.ok(42).isOk(); // Evaluates to false
     *
     * Result.err(42).isErr(); // Evaluates to true
     * ```
     */
    isErr(): this is Err<TError>;
  }

  /**
   * Ok represents a succesful computation with value `T` contained in the
   * result.
   */
  export class Ok<T> implements Result<T, never> {
    private value: T;

    constructor(value: T) {
      this.value = value;
    }

    /**
     * Ok.flatMap applies a function `fn` to the content of a result `T` and
     * transforms it into a result containing value `U`.
     *
     * @example
     * ```ts
     * type TryParse = (input: string) => Result<number, string>;
     *
     * const tryParse: TryParse = (input: string) => {
     *   const value = parseInt(input);
     *   return isNaN(value) ? Result.err("could not parse") : Result.ok(value);
     * };
     *
     * Result.ok("42")
     *   .flatMap(tryParse); // Evaluates to Ok 42
     *
     * Result.ok("Forty-two")
     *   .flatMap(tryParse); // Evaluates to Err "could not parse"
     * ```
     */
    flatMap<U, UError>(fn: (value: T) => Result<U, UError>): Result<U, UError> {
      return fn(this.value);
    }

    /**
     * Ok.inspect calls the provided function `fn` with a reference to the
     * contained result value `T`.
     *
     * @example
     * ```ts
     * Result.ok(42)
     *   .inspect((x) => console.log(x * 2)); // Evaluates to 84
     * ```
     */
    inspect(fn: (value: T) => void): this {
      fn(this.value);
      return this;
    }

    /**
     * Ok.inspectErr performs no calculations and returns Ok<T>.
     *
     * @example
     * ```ts
     * Result.ok(42)
     *   .inspectErr((x) => console.log(x * 2)); // Prints nothing
     * ```
     */
    inspectErr(_fn: (value: never) => void): this {
      return this;
    }

    /**
     * Ok.map applies a function `fn` to result value `T` and transforms it into
     * value `U`.
     *
     * @example
     * ```ts
     * Result.ok(42)
     *   .map((x) => x * 2); // Evaluates to Ok 84
     * ```
     */
    map<U>(fn: (value: T) => U): Ok<U> {
      return ok(fn(this.value));
    }

    /**
     * Ok.mapErr performs no calculations and returns Ok<T>.
     *
     * @example
     * ```ts
     * Result.ok(42)
     *   .mapErr((x) => x * 2); // Evaluates to Ok 42
     * ```
     */
    mapErr<U>(_fn: (value: never) => U): this {
      return this;
    }

    /**
     * Ok.match calls `onOk` to transform result value `T` into `U1` and then
     * returns `U1`.
     *
     * @example
     * ```ts
     * Result.ok(42)
     *   .match((x) => x * 2, (err) => err + 10); // Evaluates to 84
     * ```
     */
    match<U1, U2>(
      onOk: (value: T) => U1,
      _onErr: (value: never) => U2,
    ): this extends Ok<T> ? U1 : U2;
    match<U1, U2>(onOk: (value: T) => U1, _onErr: (value: never) => U2) {
      return onOk(this.value);
    }

    /**
     * Ok.unwrap returns the value `T` from the associated result.
     *
     * @example
     * ```ts
     * Result.ok(42).unwrap(); // Evaluates to 42
     * ```
     */
    unwrap(): T {
      return this.value;
    }

    /**
     * Ok.unwrapErr will throw.
     *
     * @example
     * ```ts
     * Result.ok(42).unwrapErr(); // Throws an exception!
     * ```
     */
    unwrapErr(): never {
      throw Error("Called unwrapErr on Ok");
    }

    /**
     * Ok.unwrapOr returns the value `T`.
     *
     * @example
     * ```ts
     * Result.ok(42).unwrapOr(99); // Evaluates to 42
     * ```
     */
    unwrapOr(_defaultValue: T): T {
      return this.value;
    }

    /**
     * Ok.isOk returns `true`.
     *
     * @example
     * ```ts
     * Result.ok(42).isOk(); // Evaluates to true
     * ```
     */
    isOk<T>(): this is Ok<T> {
      return true;
    }

    /**
     * Ok.isErr returns `false`.
     *
     * @example
     * ```ts
     * Result.ok(42).isErr(); // Evaluates to false
     * ```
     */
    isErr(): this is Err<never> {
      return false;
    }
  }

  /**
   * Err represents a failing computation with value `T` contained in the
   * result.
   */
  export class Err<T> implements Result<never, T> {
    private value: T;

    constructor(value: T) {
      this.value = value;
    }

    /**
     * Err.flatMap performs no calculation and returns Err<T>.
     *
     * @example
     * ```ts
     * type TryParse = (input: string) => Result<number, string>;
     *
     * const tryParse: TryParse = (input: string) => {
     *   const value = parseInt(input);
     *   return isNaN(value) ? Result.err("could not parse") : Result.ok(value);
     * };
     *
     * Result.err("error")
     *   .flatMap(tryParse); // Evaluates to Err "error"
     * ```
     */
    flatMap<U, UError>(
      _fn: (value: never) => Result<U, UError>,
    ): Result<U, UError> {
      // Hacky fix to make type inference behave as expected
      return this as unknown as Result<U, UError>;
    }

    /**
     * Err.inspect performs no calculations and returns Err<T>.
     *
     * @example
     * ```ts
     * Result.err(42)
     *   .inspect((x) => console.log(x * 2)); // Prints nothing
     * ```
     */
    inspect(_fn: (value: never) => void): this {
      return this;
    }

    /**
     * Err.inspectErr calls the provided function `fn` with a reference to the
     * contained result error value `E`.
     *
     * @example
     * ```ts
     * Result.err(42)
     *   .inspectErr((x) => console.log(x * 2)); // Evaluates to 84
     * ```
     */
    inspectErr(fn: (value: T) => void): this {
      fn(this.value);
      return this;
    }

    /**
     * Err.map performs no calculations and returns Err<T>.
     *
     * @example
     * ```ts
     * Result.err(42)
     *   .map((x) => x * 2); // Evaluates to Err 42
     * ```
     */
    map<U>(_fn: (value: never) => U): this {
      return this;
    }

    /**
     * Err.mapErr applies a function `fn` to result error value `E` and
     * transforms it into value `F`.
     *
     * @example
     * ```ts
     * Result.err(42)
     *   .mapErr((x) => x * 2); // Evaluates to Err 84
     * ```
     */
    mapErr<U>(fn: (value: T) => U): Err<U> {
      return err(fn(this.value));
    }

    /**
     * Err.match calls `onErr` to transform result error value `T` into `U2` and
     * then returns `U2`.
     *
     * @example
     * ```ts
     * Result.err(42)
     *   .match((x) => x * 2, (err) => err + 10); // Evaluates to 52
     * ```
     */
    match<U1, U2>(_onOk: (value: never) => U1, onErr: (value: T) => U2): U2 {
      return onErr(this.value);
    }

    /**
     * Err.unwrap will throw.
     *
     * @example
     * ```ts
     * Result.err(42).unwrap(); // Throws an exception!
     * ```
     */
    unwrap(): never {
      throw Error("Called unwrap on Err");
    }

    /**
     * Err.unwrapErr returns the error value `T` from the associated result.
     *
     * @example
     * ```ts
     * Result.err(42).unwrapErr(); // Evaluates to 42
     * ```
     */
    unwrapErr(): T {
      return this.value;
    }

    /**
     * Err.unwrapOr returns the default value `U`.
     *
     * @example
     * ```ts
     * Result.err(42).unwrapOr(99); // Evaluates to 99
     * ```
     */
    unwrapOr<U>(defaultValue: U): U {
      return defaultValue;
    }

    /**
     * Err.isOk returns `false`.
     *
     * @example
     * ```ts
     * Result.err(42).isOk(); // Evaluates to false
     * ```
     */
    isOk<T>(): this is Ok<T> {
      return false;
    }

    /**
     * Err.isErr returns `true`.
     *
     * @example
     * ```ts
     * Result.err(42).isErr(); // Evaluates to true
     * ```
     */
    isErr(): this is Err<T> {
      return true;
    }
  }

  /**
   * Result.ok creates a result Ok with value `T`. If called without arguments
   * Ok<undefined> is returned. Type `undefined` can be interpreted to have the
   * same significance as the `unit` type. Unit type signifies the absence of a
   * specific value and acts as a placeholder when no other value exits or is
   * needed.
   *
   * @example
   *
   * ```ts
   * Result.ok("value"); // Evaluates to Ok "value"
   *
   * Result.ok(42); // Evaluates to Ok 42
   *
   * Result.ok(); // Evaluates to Ok undefined
   *
   * Result.ok(null); // Evaluates to Ok null
   * ```
   */
  export function ok(): Ok<undefined>;
  export function ok<T>(value: T): Ok<T>;
  export function ok<T>(value?: T): Ok<T> | Ok<undefined> {
    return value !== undefined ? new Ok(value) : new Ok<undefined>(undefined);
  }

  /**
   * Result.err creates a result Err with error value `T`. Type `undefined` can
   * be interpreted to have the same significance as the `unit` type. Unit type
   * signifies the absence of a specific value and acts as a placeholder when no
   * other value exits or is needed.
   *
   * @example ```ts
   * Result.err("error"); // Evaluates to Err "error"
   *
   * Result.err(42); // Evaluates to Err 42
   *
   * Result.err(); // Evaluates to Err undefined
   *
   * Result.err(null); // Evaluates to Err null
   * ```
   */
  export function err(): Err<undefined>;
  export function err<T>(value: T): Err<T>;
  export function err<T>(value?: T): Err<T> | Err<undefined> {
    if (value === undefined) return new Err<undefined>(undefined);
    return new Err(value);
  }

  /**
   * Result.from converts a value, a throwing function, or a promise to a
   * Result type. A function is recursively evaluated until another value than
   * function is returned. If the function throws `Err<TError>` will be
   * returned.
   *
   * The `Err<TError>` return value can be controlled by the expected optional
   * parameter. If the parameter is not given the function returns type
   * `Result<T, unknown>`.
   *
   * When the function receives undefined value Ok<undefined> will be returned.
   *
   * @example
   * ```ts
   * Result.from(42); // Evaluates to Ok 42
   *
   * Result.from(undefined); // Evaluates to Ok undefined
   *
   * Result.from(Promise.resolve(42), "Rejected"); // Evaluates to Ok 42
   *
   * Result.from(Promise.resolve(), "Rejected"); // Evaluates to Promise Ok undefined
   *
   * Result.from(fetch("https://example.com"), "Rejected"); // Evaluates to Promise Result<Response, "Rejected">
   *
   * Result.from(Promise.reject(), "Rejected"); // Evaluates to Promise Err "Rejected"
   *
   * // Function that throws
   * Result.from<R, SyntaxError>(() => JSON.parse(rawJson)); // Evaluates to Result<R, SyntaxError>
   * ```
   */
  export function from<T, TError = unknown>(
    value: T | (() => T),
    expected?: TError,
  ): From<typeof value, TError> {
    type Value = typeof value;

    if (value instanceof Function) {
      try {
        return Result.from<T, TError>(value(), expected);
      } catch (e) {
        return Result.err(expected ? expected : e) as From<never, TError>;
      }
    }
    if (isPromise<T>(value)) {
      return value.then(Result.ok<T>).catch((e) =>
        expected ? Result.err(expected) : Result.err(e)
      ) as From<
        Value,
        TError
      >;
    }
    return Result.ok(value) as From<Value, TError>;
  }

  /**
   * Result.unwrap returns the value `T` from the associated result if it is
   * `Ok`; otherwise it will throw.
   *
   * @example
   * ```ts
   * Result.ok(42).unwrap(); // Evaluates to 42
   *
   * Result.err(42).unwrap(); // Throws an exception!
   * ```
   */
  export function unwrap<T, TError>(result: Result<T, TError>): T {
    return result.unwrap();
  }

  /**
   * Result.unwrapErr returns the value `TError` from the associated result if it
   * is `Err`; otherwise it will throw.
   *
   * @example
   * ```ts
   * Result.ok(42).unwrapErr(); // Throws an exception!
   *
   * Result.err(42).unwrapErr(); // Evaluates to 42
   * ```
   */
  export function unwrapErr<T, TError>(result: Result<T, TError>): TError {
    return result.unwrapErr();
  }

  /**
   * Result.unwrapOr returns the value `T` from the associated result or
   * returns the default value if the result is `Err`.
   *
   * @example
   * ```ts
   * Result.ok(42).unwrapOr(99); // Evaluates to 42
   *
   * Result.err(42).unwrapOr(99); // Evaluates to 99
   * ```
   */
  export function unwrapOr<T, TError>(
    defaultValue: T,
  ): (result: Result<T, TError>) => T {
    return (result) => result.unwrapOr(defaultValue);
  }

  /**
   * Result.map applies a function `fn` to result value `T` and transforms it
   * into value `U`.
   *
   * @example
   * ```ts
   * Result.ok(42)
   *   .map((x) => x * 2); // Evaluates to Ok 84
   *
   * Result.err(42)
   *   .map((x) => x * 2); // Evaluates to Err 42
   * ```
   */
  export function map<T, TError, U>(
    fn: (value: T) => U,
  ): (result: Result<T, TError>) => Result<U, TError> {
    return (result) => result.map(fn);
  }

  /**
   * Result.mapErr applies a function `fn` to result error value `TError` and
   * transforms it into value `U`.
   *
   * @example
   * ```ts
   * Result.ok(42)
   *   .mapErr((x) => x * 2); // Evaluates to Ok 42
   *
   * Result.err(42)
   *   .mapErr((x) => x * 2); // Evaluates to Err 84
   * ```
   */
  export function mapErr<T, TError, U>(
    fn: (value: TError) => U,
  ): (result: Result<T, TError>) => Result<T, U> {
    return (result) => result.mapErr(fn);
  }

  /**
   * Result.inspect calls the provided function `fn` with a reference to the
   * contained result value `T` if the result is ok.
   *
   * @example
   * ```ts
   * Result.ok(42)
   *   .inspect((x) => console.log(x * 2)); // Evaluates to 84
   *
   * Result.err(42)
   *   .inspect((x) => console.log(x * 2)); // Prints nothing
   * ```
   */
  export function inspect<T, TError>(
    fn: (value: T) => void,
  ): (result: Result<T, TError>) => Result<T, TError> {
    return (result) => result.inspect(fn);
  }

  /**
   * Result.inspectErr calls the provided function `fn` with a reference to the
   * contained result error value `TError` if the result is err.
   *
   * @example
   * ```ts
   * Result.ok(42)
   *   .inspectErr((x) => console.log(x * 2)); // Prints nothing
   *
   * Result.err(42)
   *   .inspectErr((x) => console.log(x * 2)); // Evaluates to 84
   * ```
   */
  export function inspectErr<T, TError>(
    fn: (value: TError) => void,
  ): (result: Result<T, TError>) => Result<T, TError> {
    return (result) => result.inspectErr(fn);
  }

  /**
   * Result.isOk returns `true` if the result is `Ok`
   *
   * @example
   * ```ts
   * Result.ok(42).isOk(); // Evaluates to true
   *
   * Result.err(42).isOk(); // Evaluates to false
   * ```
   */
  export function isOk<T, TError>(result: Result<T, TError>): result is Ok<T> {
    return result.isOk();
  }

  /**
   * Result.isErr returns `true` if the result is `Err`
   *
   * @example
   * ```ts
   * Result.ok(42).isOk(); // Evaluates to false
   *
   * Result.err(42).isErr(); // Evaluates to true
   * ```
   */
  export function isErr<T, TError>(
    result: Result<T, TError>,
  ): result is Err<TError> {
    return result.isErr();
  }

  /**
   * Result.flatMap applies a function `fn` to the content of a result `T` and
   * transforms it into a result containing value `U`.
   *
   * @example
   * ```ts
   * type TryParse = (input: string) => Result<number, string>;
   *
   * const tryParse: TryParse = (input: string) => {
   *   const value = parseInt(input);
   *   return isNaN(value) ? Result.err("could not parse") : Result.ok(value);
   * };
   *
   * Result.ok("42")
   *   .flatMap(tryParse); // Evaluates to Ok 42
   *
   * Result.ok("Forty-two")
   *   .flatMap(tryParse); // Evaluates to Err "could not parse"
   *
   * Result.err("error")
   *   .flatMap(tryParse); // Evaluates to Err "error"
   * ```
   */
  export function flatMap<T, TError, U, UError>(
    fn: (value: T) => Ok<U> | Err<UError>,
  ): (result: Result<T, TError>) => Result<U, UError> {
    return (result) => result.flatMap(fn);
  }

  /**
   * Result.match transforms the result value `T` into `U1` using `onOk` and
   * then returns `U1`. If the result is Err, the error value `TError` is
   * transformed to `U2` with `onErr` and then returns `U2`.
   *
   * @example
   * ```ts
   * Result.ok(42)
   *   .match((ok) => ok * 2, (err) => err + 10); // Evaluates to 84
   *
   * Result.err(42)
   *   .match((ok) => ok * 2, (err) => err + 10); // Evaluates to 52
   * ```
   */
  export function match<T, TError, U1, U2, TResult>(
    onOk: (
      value: TResult extends Result<infer U, infer _> ? U : never,
    ) => U1,
    onErr: (
      value: TResult extends Result<infer _, infer U> ? U : never,
    ) => U2,
  ): (result: TResult) => U1 | U2;
  export function match<T, TError, U1, U2>(
    onOk: (value: T) => U1,
    onErr: (value: TError) => U2,
  ) {
    return (result: Ok<T> | Err<TError>) => result.match(onOk, onErr);
  }
}
/** {@link Result} */
export type Result<T, TError> = Result.Type<T, TError>;
