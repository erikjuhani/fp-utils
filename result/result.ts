/**
 * Result represents the success of a computation `Ok` or the failure of a
 * computation `Err`. It is commonly used with computations known to either
 * succeed or fail.
 */
export abstract class Result<T, TError> {
  /**
   * Result.err creates a result Err with error value `T`. Type `undefined` can
   * be interpreted to have the same significance as the `unit` type. Unit type
   * signifies the absence of a specific value and acts as a placeholder when no
   * other value exits or is needed.
   *
   * @example ```ts
   * Result
   *   .err("error"); // Evaluates to Err "error"
   *
   * Result
   *   .err(42); // Evaluates to Err 42
   *
   * Result
   *   .err(); // Evaluates to Err undefined
   *
   * Result
   *   .err(null); // Evaluates to Err null
   * ```
   */
  static err(): Err<undefined>;
  static err<T>(value: T): Err<T>;
  static err<T>(value?: T): Err<T> | Err<undefined> {
    if (value === undefined) return new Err<undefined>(undefined);
    return new Err(value);
  }

  /**
   * Result.filter returns a boolean that is evaluated with the given
   * `predicate` function which is applied on the result value `T`. Err
   * evaluates to `false`.
   *
   * @example
   * ```ts
   * Result
   *   .filter((x: number) => x >= 5)(Ok(2)); // evaluates to false
   *
   * Result
   *   .filter((x: number) => x >= 5)(Ok(10)); // evaluates to true
   *
   * Result
   *   .filter((x: number) => x >= 5)(Err(10)); // evaluates to false
   * ```
   */
  static filter<T, TError>(
    predicate: (value: T) => boolean,
  ): (result: Result<T, TError>) => boolean {
    return (result) => result.filter(predicate);
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
   *   return isNaN(value) ? Err("could not parse") : Ok(value);
   * };
   *
   * Result
   *   .flatMap(tryParse)(Ok("42")); // Evaluates to Ok 42
   *
   * Result
   *   .flatMap(tryParse)(Ok("Forty-two")); // Evaluates to Err "could not parse"
   *
   * Result
   *   .flatMap(tryParse)(Err("error")); // Evaluates to Err "error"
   * ```
   */
  static flatMap<T, TError, U, UError>(
    fn: (value: T) => Ok<U> | Err<UError>,
  ): (result: Result<T, TError>) => Result<U, UError> {
    return (result) => result.flatMap(fn);
  }

  /**
   * Result.from converts a value, a throwing function, or a promise to a
   * Result type. A function is recursively evaluated until another value than
   * function is returned. If the function throws `Err<TError>` will be
   * returned.
   *
   * The `Err<TError>` return value can be controlled by the expected optional
   * parameter and if given a map function the error value can be mapped. If the
   * parameter is not given the function returns type `Result<T, unknown>`.
   *
   * When the function receives undefined value Ok<undefined> will be returned.
   *
   * @example
   * ```ts
   * Result
   *   .from(42); // Evaluates to Ok 42
   *
   * Result
   *   .from(undefined); // Evaluates to Ok undefined
   *
   * Result
   *   .from(Promise.resolve(42), "Rejected"); // Evaluates to Ok 42
   *
   * Result
   *   .from(Promise.resolve(), "Rejected"); // Evaluates to Promise Ok undefined
   *
   * Result
   *   .from(fetch("https://example.com"), "Rejected"); // Evaluates to Promise Result<Response, "Rejected">
   *
   * Result
   *   .from(Promise.reject(), "Rejected"); // Evaluates to Promise Err "Rejected"
   *
   * Result
   *   .from<R, SyntaxError>(() => JSON.parse(rawJson)); // Evaluates to Result<R, SyntaxError>
   *
   * Result
   *   .from(() => JSON.parse(rawJson) as ReturnValue, (err: SyntaxError) => err.message); // Evaluates to Result<ReturnValue, string>
   * ```
   */
  static from<T, TError = unknown>(
    value: T | (() => T),
    // deno-lint-ignore no-explicit-any
    expected?: TError | ((value: any) => TError),
  ): From<typeof value, TError> {
    type Value = typeof value;

    if (value instanceof Function) {
      try {
        return Result.from(value(), expected);
      } catch (e) {
        if (expected instanceof Function) {
          return Result.err(expected(e)) as From<never, TError>;
        }
        return Result.err(expected ? expected : e) as From<never, TError>;
      }
    }
    if (isPromiseLike<T>(value)) {
      return Promise.resolve(value).then(Result.ok<T>).catch((e) => {
        if (expected instanceof Function) return Result.err(expected(e));
        else return expected ? Result.err(expected) : Result.err(e);
      }) as From<
        Value,
        TError
      >;
    }
    return Result.ok(value) as From<Value, TError>;
  }

  /**
   * Result.inspect calls the provided function `fn` with a reference to the
   * contained result value `T` if the result is ok.
   *
   * @example
   * ```ts
   * Result
   *   .inspect((x: number) => console.log(x * 2))(Ok(42)); // Prints 84
   *
   * Result
   *   .inspect((x) => console.log(x * 2))(Err(42)); // Prints nothing
   * ```
   */
  static inspect<T, TError>(
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
   * Result
   *   .inspectErr((x: number) => console.log(x * 2))(Ok(42)); // Prints nothing
   *
   * Result
   *   .inspectErr((x: number) => console.log(x * 2))(Err(42)); // Prints 84
   * ```
   */
  static inspectErr<T, TError>(
    fn: (value: TError) => void,
  ): (result: Result<T, TError>) => Result<T, TError> {
    return (result) => result.inspectErr(fn);
  }

  /**
   * Result.isErr returns `true` if the result is `Err`
   *
   * @example
   * ```ts
   * Result
   *   .isErr(Ok(42)); // Evaluates to false
   *
   * Result
   *   .isErr(Err(42)); // Evaluates to true
   * ```
   */
  static isErr<T, TError>(
    result: Result<T, TError>,
  ): result is Err<TError> {
    return result.isErr();
  }

  /**
   * Result.isOk returns `true` if the result is `Ok`
   *
   * @example
   * ```ts
   * Result
   *   .isOk(Ok(42)); // Evaluates to true
   *
   * Result
   *   .isOk(Err(42)); // Evaluates to false
   * ```
   */
  static isOk<T, TError>(result: Result<T, TError>): result is Ok<T> {
    return result.isOk();
  }

  /**
   * Result.map applies a function `fn` to result value `T` and transforms it
   * into value `U`.
   *
   * @example
   * ```ts
   * Result
   *   .map((x: number) => x * 2)(Ok(42)); // Evaluates to Ok 84
   *
   * Result
   *   .map((x: number) => x * 2)(Err(42)); // Evaluates to Err 42
   * ```
   */
  static map<T, TError, U>(
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
   * Result
   *   .mapErr((x: number) => x * 2)(Ok(42)); // Evaluates to Ok 42
   *
   * Result
   *   .mapErr((x) => x * 2)(Err(42)); // Evaluates to Err 84
   * ```
   */
  static mapErr<T, TError, UError>(
    fn: (value: TError) => UError,
  ): (result: Result<T, TError>) => Result<T, UError> {
    return (result) => result.mapErr(fn);
  }

  /**
   * Result.match transforms the result value `T` into `U1` using `onOk` and
   * then returns `U1`. If the result is Err, the error value `TError` is
   * transformed to `U2` with `onErr` and then returns `U2`.
   *
   * @example
   * ```ts
   * Result
   *   .match((x: number) => x * 2, (err: number) => err + 10)(Ok(42)); // Evaluates to 84
   *
   * Result
   *   .match((x: number) => x * 2, (err: number) => err + 10)(Err(42)); // Evaluates to 52
   * ```
   */
  static match<
    T,
    TError,
    U1,
    U2,
    TResult extends Result<unknown, unknown>,
  >(
    onOk: (value: TResult extends Result<infer U, infer _> ? U : never) => U1,
    onErr: (value: TResult extends Result<infer _, infer U> ? U : never) => U2,
  ): (result: TResult) => U1 | U2;
  static match<T, TError, U1, U2>(
    onOk: (value: T) => U1,
    onErr: (value: TError) => U2,
  ) {
    return (result: Ok<T> | Err<TError>) => result.match(onOk, onErr);
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
   * Result
   *   .ok("value"); // Evaluates to Ok "value"
   *
   * Result
   *   .ok(42); // Evaluates to Ok 42
   *
   * Result
   *   .ok(); // Evaluates to Ok undefined
   *
   * Result
   *   .ok(null); // Evaluates to Ok null
   * ```
   */
  static ok(): Ok<undefined>;
  static ok<T>(value: T): Ok<T>;
  static ok<T>(value?: T): Ok<T> | Ok<undefined> {
    return value !== undefined ? new Ok(value) : new Ok<undefined>(undefined);
  }

  /**
   * Result.unwrap returns the value `T` from the associated result if it is
   * `Ok`; otherwise it will throw.
   *
   * @example
   * ```ts
   * Result
   *   .unwrap(Ok(42)); // Evaluates to 42
   *
   * Result
   *   .unwrap(Err(42)); // Throws an exception!
   * ```
   */
  static unwrap<T, TError>(result: Result<T, TError>): T {
    return result.unwrap();
  }

  /**
   * Result.unwrapErr returns the value `TError` from the associated result if it
   * is `Err`; otherwise it will throw.
   *
   * @example
   * ```ts
   * Result
   *   .unwrapErr(Ok(42)); // Throws an exception!
   *
   * Result
   *   .unwrapErr(Err(42)); // Evaluates to 42
   * ```
   */
  static unwrapErr<T, TError>(result: Result<T, TError>): TError {
    return result.unwrapErr();
  }

  /**
   * Result.unwrapOr returns the value `T` from the associated result or
   * returns the default value if the result is `Err`.
   *
   * @example
   * ```ts
   * Result
   *   .unwrapOr(99)(Ok(42)); // Evaluates to 42
   *
   * Result
   *   .unwrapOr(99)(Err(42)); // Evaluates to 99
   * ```
   */
  static unwrapOr<T, TError>(
    defaultValue: T,
  ): (result: Result<T, TError>) => T {
    return (result) => result.unwrapOr(defaultValue);
  }

  /**
   * Result.filter returns a boolean that is evaluated with the given
   * `predicate` function which is applied on the result value `T`. Err
   * evaluates to `false`.
   *
   * @example
   * ```ts
   * Ok(2)
   *   .filter((x) => x >= 5); // evaluates to false
   *
   * Ok(42)
   *   .filter((x) => x >= 5); // evaluates to true
   *
   * Err(10)
   *   .filter((x) => x >= 5); // evaluates to false
   * ```
   */
  abstract filter(predicate: (value: T) => boolean): boolean;

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
   *   return isNaN(value) ? Err("could not parse") : Ok(value);
   * };
   *
   * Ok("42")
   *   .flatMap(tryParse); // Evaluates to Ok 42
   *
   * Ok("Forty-two")
   *   .flatMap(tryParse); // Evaluates to Err "could not parse"
   *
   * Err("error")
   *   .flatMap(tryParse); // Evaluates to Err "error"
   * ```
   */
  abstract flatMap<U, UError>(
    fn: (value: T) => Result<U, UError>,
  ): Result<U, UError>;

  /**
   * Result.inspect calls the provided function `fn` with a reference to the
   * contained result value `T` if the result is ok.
   *
   * @example
   * ```ts
   * Ok(42)
   *   .inspect((x) => console.log(x * 2)); // Prints 84
   *
   * Err(42)
   *   .inspect((x) => console.log(x * 2)); // Prints nothing
   * ```
   */
  abstract inspect(fn: (value: T) => void): this;

  /**
   * Result.inspectErr calls the provided function `fn` with a reference to the
   * contained result error value `TError` if the result is err.
   *
   * @example
   * ```ts
   * Ok(42)
   *   .inspectErr((x) => console.log(x * 2)); // Prints nothing
   *
   * Err(42)
   *   .inspectErr((x) => console.log(x * 2)); // Prints 84
   *
   * ```
   */
  abstract inspectErr(fn: (value: TError) => void): this;

  /**
   * Result.isErr returns `true` if the result is `Err`.
   *
   * @example
   * ```ts
   * Ok(42)
   *   .isOk(); // Evaluates to false
   *
   * Err(42)
   *   .isErr(); // Evaluates to true
   * ```
   */
  abstract isErr(): this is Err<TError>;

  /**
   * Result.isOk returns `true` if the result is `Ok`.
   *
   * @example
   * ```ts
   * Ok(42)
   *   .isOk(); // Evaluates to true
   *
   * Err(42)
   *   .isOk(); // Evaluates to false
   * ```
   */
  abstract isOk<U extends T>(): this is Ok<U>;

  /**
   * Result.map applies a function `fn` to result value `T` and transforms it
   * into value `U`.
   *
   * @example
   * ```ts
   * Ok(42)
   *   .map((x) => x * 2); // Evaluates to Ok 84
   *
   * Err(42)
   *   .map((x) => x * 2); // Evaluates to Err 42
   *
   * ```
   */
  abstract map<U>(fn: (value: T) => U): Result<U, TError>;

  /**
   * Result.mapErr applies a function `fn` to result error value `TError` and
   * transforms it into value `UError`.
   *
   * @example
   * ```ts
   * Ok(42)
   *   .mapErr((x) => x * 2); // Evaluates to Ok 42
   *
   * Err(42)
   *   .mapErr((x) => x * 2); // Evaluates to Err 84
   * ```
   */
  abstract mapErr<UError>(fn: (value: TError) => UError): Result<T, UError>;

  /**
   * Result.match transforms the result value `T` into `U1` using `onOk` and
   * then returns `U1`. If the result is Err, the error value `TError` is
   * transformed to `U2` with `onErr` and then returns `U2`.
   *
   * @example
   * ```ts
   * Ok(42)
   *   .match((x) => x * 2, (err) => err + 10); // Evaluates to 84
   *
   * Err(42)
   *   .match((x) => x * 2, (err) => err + 10); // Evaluates to 52
   * ```
   */
  abstract match<U1, U2>(
    onOk: (value: T) => U1,
    onErr: (value: TError) => U2,
  ): U1 | U2;

  /**
   * Result.unwrap returns the value `T` from the associated result if it is
   * `Ok`; otherwise it will throw.
   *
   * @example
   * ```ts
   * Ok(42)
   *   .unwrap(); // Evaluates to 42
   *
   * Err(42)
   *   .unwrap(); // Throws an exception!
   * ```
   */
  abstract unwrap<U extends T>(): T | U;

  /**
   * Result.unwrapErr returns the value `TError` from the associated result if
   * it is `Err`; otherwise it will throw.
   *
   * @example
   * ```ts
   * Err(42)
   *   .unwrapErr(); // Evaluates to 42
   *
   * Ok(42)
   *   .unwrapErr(); // Throws an exception!
   * ```
   */
  abstract unwrapErr(): TError;

  /**
   * Result.unwrapOr returns the value `T` from the associated result or
   * returns the default value if the result is `Err`.
   *
   * @example
   * ```ts
   * Ok(42)
   *   .unwrapOr(99); // Evaluates to 42
   *
   * Err(42)
   *   .unwrapOr(99); // Evaluates to 99
   * ```
   */
  abstract unwrapOr<U>(defaultValue: U): U;
  abstract unwrapOr<U>(defaultValue: T | U): T | U;
}

/**
 * Ok represents a succesful computation with value `T` contained in the
 * result.
 */
export class Ok<T> extends Result<T, never> {
  #value: T;
  constructor(value: T) {
    super();
    this.#value = value;
  }

  filter(predicate: (value: T) => boolean): boolean {
    return predicate(this.#value);
  }

  flatMap<U, UError>(fn: (value: T) => Result<U, UError>): Result<U, UError> {
    return fn(this.#value);
  }

  inspect(fn: (value: T) => void): this {
    fn(this.#value);
    return this;
  }

  inspectErr(_fn: (value: never) => void): this {
    return this;
  }

  isErr(): this is Err<never> {
    return false;
  }

  isOk<T>(): this is Ok<T> {
    return true;
  }

  map<U>(fn: (value: T) => U): Ok<U> {
    return Result.ok(fn(this.#value));
  }

  mapErr<U>(_fn: (value: never) => U): this {
    return this;
  }

  match<U1, U2>(
    onOk: (value: T) => U1,
    _onErr: (value: never) => U2,
  ): this extends Ok<T> ? U1 : U2;
  match<U1, U2>(onOk: (value: T) => U1, _onErr: (value: never) => U2) {
    return onOk(this.#value);
  }

  unwrap(): T {
    return this.#value;
  }

  unwrapErr(): never {
    throw Error("Called unwrapErr on Ok");
  }

  unwrapOr(_defaultValue: T): T {
    return this.#value;
  }
}

/**
 * Err represents a failing computation with value `T` contained in the
 * result.
 */
export class Err<TError> extends Result<never, TError> {
  #value: TError;
  constructor(value: TError) {
    super();
    this.#value = value;
  }
  filter(_predicate: (value: never) => boolean): false {
    return false;
  }

  flatMap<U, UError>(
    _fn: (value: never) => Result<U, UError>,
  ): Result<U, UError> {
    // Hacky fix to make type inference behave as expected
    return this as unknown as Result<U, UError>;
  }

  inspect(_fn: (value: never) => void): this {
    return this;
  }

  inspectErr(fn: (value: TError) => void): this {
    fn(this.#value);
    return this;
  }

  isErr(): this is Err<TError> {
    return true;
  }

  isOk<T>(): this is Ok<T> {
    return false;
  }

  map<U>(_fn: (value: never) => U): this {
    return this;
  }

  mapErr<U>(fn: (value: TError) => U): Err<U> {
    return Result.err(fn(this.#value));
  }

  match<U1, U2>(_onOk: (value: never) => U1, onErr: (value: TError) => U2): U2 {
    return onErr(this.#value);
  }

  unwrap(): never {
    throw Error("Called unwrap on Err");
  }

  unwrapErr(): TError {
    return this.#value;
  }

  unwrapOr<U>(defaultValue: U): U {
    return defaultValue;
  }
}

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
 * Type helper to determine if the value is a PromiseLike.
 */
function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  return isNonNullable(value) && typeof value === "object" && "then" in value;
}

/**
 * Type helper to determine if the value is NonNullable.
 */
function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}
