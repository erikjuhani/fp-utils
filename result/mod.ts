/**
 * Result represents the success of a computation `Ok` or the failure of a
 * computation `Err`. It is commonly used with computations known to either
 * succeed or fail.
 */
// deno-lint-ignore no-namespace
export namespace Result {
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
    flatMap<TResult extends Result<unknown, TError>>(
      fn: (value: T) => TResult,
    ): TResult;
    flatMap<TPromiseResult extends Promise<Result<unknown, TError>>>(
      fn: (value: T) => TPromiseResult,
    ): TPromiseResult;
    flatMap(fn: (value: T) => Err<TError>): Err<TError>;

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
    inspect(fn: (value: Awaited<T>) => void): this;

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
    map<U>(
      fn: (value: Awaited<T>) => U,
    ): this extends Result<Promise<Awaited<T>>, TError>
      ? Result<Promise<U>, TError>
      : Result<U, TError>;
    map<U>(
      fn: (value: Awaited<T>) => U,
    ): Result<Promise<U>, TError> | Result<U, TError>;

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
     * Result.match transforms the result value `T` into `U` using `onOk` and
     * then returns `U`. If the result is Err, the error value `TError` is
     * transformed to `U` with `onErr` and then returns `U`.
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
    match<U, TError>(
      onOk: (value: Awaited<T>) => U,
      onErr: (value: TError) => U,
    ): this extends Result<Promise<Awaited<T>>, TError> ? Promise<U> : U;
    match<U, TError>(
      onOk: (value: Awaited<T>) => U,
      onErr: (value: TError) => U,
    ): Promise<U> | U;

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
    unwrap(): T;

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
    unwrapOr<U>(defaultValue: U): this extends Ok<T> ? T : U;
    unwrapOr<U>(defaultValue: U): T | U;

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
    isOk<T>(): this is Ok<T>;

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
    isErr<TError>(): this is Err<TError>;
  }

  function isPromise<T>(value: unknown): value is Promise<T> {
    return isNonNullable(value) && typeof value === "object" && "then" in value;
  }

  function isNonNullable<T>(value: T): value is NonNullable<T> {
    return value !== null || value !== undefined;
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
    flatMap<TResult extends Result<unknown, unknown>>(
      fn: (value: T) => TResult,
    ): TResult;
    flatMap<TPromiseResult extends Promise<Result<unknown, unknown>>>(
      fn: (value: T) => TPromiseResult,
    ): TPromiseResult;
    flatMap<TResult extends Result<unknown, unknown>>(
      fn: (value: T) => TResult,
    ) {
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
    inspect(fn: (value: Awaited<T>) => void) {
      if (isPromise<Awaited<T>>(this.value)) this.value.then(fn);
      else fn(this.value as Awaited<T>);
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
    inspectErr(_fn: (value: never) => void) {
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
    map<U>(
      fn: (value: Awaited<T>) => U,
    ): this extends Ok<Promise<Awaited<T>>> ? Ok<Promise<Awaited<U>>> : Ok<U>;
    map<U>(fn: (value: Awaited<T>) => U) {
      if (isPromise<Awaited<T>>(this.value)) return ok(this.value.then(fn));
      else return ok(fn(this.value as Awaited<T>));
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
    mapErr<U>(_fn: (value: never) => U) {
      return this;
    }

    /**
     * Ok.match calls `onOk` to transform result value `T` into `U` and then
     * returns `U`.
     *
     * @example
     * ```ts
     * Result.ok(42)
     *   .match((x) => x * 2, (err) => err + 10); // Evaluates to 84
     * ```
     */
    match<U, TError>(
      onOk: (value: Awaited<T>) => U,
      onErr: (value: TError) => U,
    ): this extends Ok<Promise<Awaited<T>>> ? Promise<U> : U;
    match<U, TError>(
      onOk: (value: Awaited<T>) => U,
      onErr: (value: TError) => U,
    ) {
      if (isPromise<Awaited<T>>(this.value)) {
        return this.value.then(onOk).catch(onErr);
      } else return onOk(this.value as Awaited<T>);
    }

    /**
     * Ok.unwrap returns the value `T` from the associated result.
     *
     * @example
     * ```ts
     * Result.ok(42).unwrap(); // Evaluates to 42
     * ```
     */
    unwrap() {
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
    unwrapOr(_defaultValue: T) {
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
    flatMap(_fn: (value: never) => Err<T>) {
      return this;
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
    inspect(_fn: (value: never) => void) {
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
    inspectErr(fn: (value: T) => void) {
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
    map<U>(_fn: (value: never) => U) {
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
    mapErr<U>(fn: (value: T) => U) {
      return err(fn(this.value));
    }

    /**
     * Err.match calls `onErr` to transform result error value `T` into `U` and
     * then returns `U`.
     *
     * @example
     * ```ts
     * Result.err(42)
     *   .match((x) => x * 2, (err) => err + 10); // Evaluates to 52
     * ```
     */
    match<U>(_onOk: (value: never) => U, onErr: (value: T) => U): U {
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
    unwrapErr() {
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
    unwrapOr<U>(defaultValue: U) {
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
    isOk(): this is Ok<never> {
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
    isErr<T>(): this is Err<T> {
      return true;
    }
  }

  /**
   * Result.ok creates a result Ok with value `T`. If called without arguments
   * Ok<void> is returned. Type `void` can be interpreted to have the same
   * significance as the `unit` type. Unit type signifies the absence of a
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
   * Result.ok(); // Evaluates to Ok void
   *
   * Result.ok(null); // Evaluates to Ok null
   * ```
   */
  export function ok(): Ok<void>;
  export function ok<T>(value: T): Ok<T>;
  export function ok<T>(value?: T): Ok<T> | Ok<void> {
    if (value === undefined) return new Ok<void>(undefined);
    else return new Ok(value);
  }

  /**
   * Result.err creates a result Err with error value `T`. Type `void` can be
   * interpreted to have the same significance as the `unit` type. Unit type
   * signifies the absence of a specific value and acts as a placeholder when no
   * other value exits or is needed.
   *
   * @example ```ts
   * Result.err("error"); // Evaluates to Err "error"
   *
   * Result.err(42); // Evaluates to Err 42
   *
   * Result.err(); // Evaluates to Err void
   *
   * Result.err(null); // Evaluates to Err null
   * ```
   */
  export function err(): Err<void>;
  export function err<T>(value: T): Err<T>;
  export function err<T>(value?: T): Err<T> | Err<void> {
    if (value === undefined) return new Err<void>(undefined);
    return new Err(value);
  }

  /**
   * Result.fromThrowable converts a throwing function `fn` into a Result using
   * try catch. If error occurs the error is interpreted as Err<TError> otherwise
   * returns Ok<T>.
   *
   * @example
   * ```ts
   * Result.fromThrowable(() => JSON.parse("")); // Evaluates to Err<any, unknown>
   *
   * type JSONWithProperty = { property: number };
   *
   * Result.fromThrowable<JSONWithProperty, SyntaxError>(() => JSON.parse("")); // Evaluates to Err<SyntaxError>
   *
   * Result.fromThrowable<JSONWithProperty, SyntaxError>(() => JSON.parse('{ "property": 42 }')); // Evaluates to Ok<JSONWithProperty>
   *
   * Result.fromThrowable(() => {
   *   const json = JSON.parse('{ "prop": 42 }');
   *
   *   const isJSONWithProperty = (value: any): value is JSONWithProperty =>
   *     "property" in value;
   *
   *   if (isJSONWithProperty(json)) return json;
   *
   *   throw new Error(
   *     `Wrong type of json, expected "property" field, got "${Object.keys(json)}"`,
   *   );
   * }); // Evaluates to type Result<JSONWithProperty, unknown>
   * ```
   */
  export function fromThrowable<T, TError>(
    fn: () => T,
  ): Result<T, TError> {
    try {
      return ok(fn());
    } catch (e) {
      return err(e);
    }
  }

  /**
   * Result.fromPromise converts a promise into a Result. If the promise is
   * rejected, it returns Err<TError>. Otherwise, it returns Ok<T>. Type `void` is
   * returned if a resolved promise has a nullable value. Type `void` can be
   * interpreted to have the same significance as the `unit` type. Unit type
   * signifies the absence of a specific value and acts as a placeholder when no
   * other value exits or is needed.
   *
   * @example
   * ```ts
   * Result.fromPromise(Promise.resolve(42), "Rejected"); // Evaluates to Ok 42
   *
   * Result.fromPromise(fetch("https://example.com"), "Rejected"); // Evaluates to Ok Response
   *
   * Result.fromPromise(Promise.resolve(), "Rejected"); // Evaluates to Ok void
   *
   * Result.fromPromise(Promise.reject(), "Rejected"); // Evaluates to Err "Rejected"
   *
   * Result.fromPromise(fetch("https://localhost:9999"), "Rejected"); // Evaluates to Err "Rejected"
   * ```
   */
  export function fromPromise<T, TError>(
    promise: Promise<T>,
    onReject: TError,
  ): Promise<Result<T, TError>>;
  export function fromPromise<T, TError>(
    asyncFn: () => Promise<T>,
    onReject: TError,
  ): Promise<Result<T, TError>>;
  export function fromPromise<T, TError>(
    promiseOrFn: Promise<T> | (() => Promise<T>),
    onReject: TError,
  ) {
    const promise = typeof promiseOrFn === "function"
      ? promiseOrFn()
      : promiseOrFn;

    const onRejected = () => err(onReject);

    return promise.then(ok).catch(onRejected);
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
  export function unwrap<TError, TResult extends Result<unknown, TError>>(
    result: TResult,
  ): TResult extends Result<infer Z, TError> ? Z : never {
    return result.unwrap() as TResult extends Result<infer Z, TError> ? Z
      : never;
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
  ) {
    return <TResult extends Result<T, TError>>(result: TResult) =>
      result.unwrapOr(defaultValue);
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
  export function map<T, TError, U = T>(
    fn: (value: Awaited<T>) => U,
  ) {
    return <TResult extends Result<T | Promise<T>, TError>>(
      result: TResult,
    ) =>
      result.map(fn) as TResult extends Ok<Promise<Awaited<T>>>
        ? Result<Promise<U>, TError>
        : Result<U, TError>;
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
  ) {
    return <TResult extends Result<T, TError>>(result: TResult) =>
      result.mapErr(fn);
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
    fn: (value: Awaited<T>) => void,
  ) {
    return <TResult extends Result<T, TError>>(result: TResult) =>
      result.inspect(fn);
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
  ) {
    return <TResult extends Result<T, TError>>(result: TResult) =>
      result.inspectErr(fn);
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
  export function flatMap<T, TError, UResult extends Result<unknown, TError>>(
    fn: (value: T) => UResult,
  ): <TResult extends Result<T, TError>>(result: TResult) => UResult;
  export function flatMap<
    T,
    TError,
    UPromiseResult extends Promise<Result<unknown, TError>>,
  >(
    fn: (value: T) => UPromiseResult,
  ): <TResult extends Result<T, TError>>(result: TResult) => UPromiseResult;
  export function flatMap<T, TError, UResult extends Result<unknown, TError>>(
    fn: (value: T) => UResult,
  ) {
    return <TResult extends Result<T, TError>>(result: TResult) =>
      result.flatMap(fn);
  }

  /**
   * Result.match transforms the result value `T` into `U` using `onOk` and
   * then returns `U`. If the result is Err, the error value `TError` is transformed
   * to `U` with `onErr` and then returns `U`.
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
  export function match<T, TError, U>(
    onOk: (value: Awaited<T>) => U,
    onErr: (value: TError) => U,
  ) {
    return <TResult extends Result<T | Promise<T>, TError>>(result: TResult) =>
      result.match(onOk, onErr) as TResult extends Ok<Promise<Awaited<T>>>
        ? Promise<U>
        : U;
  }
}

export type Result<T, TError> = Result.Type<T, TError>;
