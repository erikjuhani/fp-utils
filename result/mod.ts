/**
 * Result represents the success of a computation `Ok` or the failure of a
 * computation `Err`. It is commonly used with computations known to either
 * succeed or fail.
 */
export interface Type<T, E> {
  /**
   * Result.flatMap applies a function `fn` to the content of a result `T` and
   * transforms it into a result containing value `U`.
   *
   * @example
   * ```ts
   * type TryParse = (input: string) => Result.Type<number, string>;
   *
   * const tryParse: TryParse = (input: string) => {
   *   const value = parseInt(input);
   *   return isNaN(value) ? Result.err("could not parse") : Result.ok(value);
   * };
   *
   * Result.err("message")
   *   .flatMap(tryParse); // Evaluates to Err "message"
   *
   * Result.ok("42")
   *   .flatMap(tryParse); // Evaluates to Ok 42
   *
   * Result.ok("Forty-two")
   *   .flatMap(tryParse); // Evaluates to Err "could not parse"
   * ```
   */
  flatMap<U>(fn: (value: T) => Type<U, E>): Type<U, E>;

  /**
   * Result.inspect calls the provided function `fn` with a reference to the
   * contained result value `T` if the result is ok.
   *
   * @example
   * ```ts
   * Result.err(42)
   *   .inspect((x) => console.log(x * 2)); // Prints nothing
   *
   * Result.ok(42)
   *   .inspect((x) => console.log(x * 2)); // Evaluates to 84
   * ```
   */
  inspect(fn: (value: T) => void): Type<T, E>;

  /**
   * Result.inspectErr calls the provided function `fn` with a reference to the
   * contained result error value `E` if the result is err.
   *
   * @example
   * ```ts
   * Result.err(42)
   *   .inspectErr((x) => console.log(x * 2)); // Evaluates to 84
   *
   * Result.ok(42)
   *   .inspectErr((x) => console.log(x * 2)); // Prints nothing
   * ```
   */
  inspectErr(fn: (value: E) => void): Type<T, E>;

  /**
   * Result.map applies a function `fn` to result value `T` and transforms it
   * into value `U`.
   *
   * @example
   * ```ts
   * Result.err(42)
   *   .map((x) => x * 2); // Evaluates to Err 42
   *
   * Result.ok(42)
   *   .map((x) => x * 2); // Evaluates to Ok 84
   * ```
   */
  map<U>(fn: (value: T) => U): Type<U, E>;

  /**
   * Result.mapErr applies a function `fn` to result error value `E` and
   * transforms it into value `F`.
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
  mapErr<F>(fn: (value: E) => F): Type<T, F>;

  /**
   * Result.match transforms the result value `T` into `U` using `onOk` and
   * then returns `U`. If the result is Err, the error value `E` is transformed
   * to `U` with `onErr` and then returns `U`.
   *
   * @example
   * ```ts
   * Result.err(42)
   *   .match((err) => err + 10, (x) => x * 2); // Evaluates to 52
   *
   * Result.ok(42)
   *   .match((err) => err + 10, (x) => x * 2); // Evaluates to 84
   * ```
   */
  match<U>(onErr: (value: E) => U, onOk: (value: T) => U): U;

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
   * Result.unwrapErr returns the value `E` from the associated result if it is
   * `Err`; otherwise it will throw.
   *
   * @example
   * ```ts
   * Result.ok(42).unwrapErr(); // Throws an exception!
   *
   * Result.err(42).unwrapErr(); // Evaluates to 42
   * ```
   */
  unwrapErr(): E;

  /**
   * Result.unwrapOr returns the value `T` from the associated result or
   * returns the default value `U` if the result is `Err`.
   *
   * @example
   * ```ts
   * Result.ok(42).unwrapOr(99); // Evaluates to 42
   *
   * Result.err(42).unwrapOr(99); // Evaluates to 99
   * ```
   */
  unwrapOr<U>(defaultValue: U): T | U;

  /**
   * Result.isOk returns `true` if the result is `Ok`.
   *
   * @example
   * ```ts
   * Result.err(42).isOk(); // Evaluates to false
   *
   * Result.ok(42).isOk(); // Evaluates to true
   * ```
   */
  isOk<T>(): this is Ok<T>;

  /**
   * Result.isErr returns `true` if the result is `Err`.
   *
   * @example
   * ```ts
   * Result.err(42).isErr(); // Evaluates to true
   *
   * Result.ok(42).isOk(); // Evaluates to false
   * ```
   */
  isErr<E>(): this is Err<E>;
}

/**
 * Result type alias is used to clarify the intent in Result function
 * signatures.
 */
type Result<T, E> = Type<T, E>;

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
   * type TryParse = (input: string) => Result.Type<number, string>;
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
  flatMap<U, E>(fn: (value: T) => Result<U, E>) {
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
  inspect(fn: (value: T) => void) {
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
  map<U>(fn: (value: T) => U) {
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
  mapErr<F>(_fn: (value: never) => F) {
    return this;
  }

  /**
   * Ok.match calls `onOk` to transform result value `T` into `U` and then
   * returns `U`.
   *
   * @example
   * ```ts
   * Result.ok(42)
   *   .match((err) => err + 10, (x) => x * 2); // Evaluates to 84
   * ```
   */
  match<U>(_onErr: (_value: never) => U, onOk: (value: T) => U): U {
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
  unwrapOr() {
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
   * type TryParse = (input: string) => Result.Type<number, string>;
   *
   * const tryParse: TryParse = (input: string) => {
   *   const value = parseInt(input);
   *   return isNaN(value) ? Result.err("could not parse") : Result.ok(value);
   * };
   *
   * Result.err("message")
   *   .flatMap(tryParse); // Evaluates to Err "message"
   * ```
   */
  flatMap<U>(_fn: (value: never) => Type<U, T>) {
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
  inspectErr(fn: (value: T) => void): Result<never, T> {
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
  mapErr<F>(fn: (value: T) => F) {
    return err(fn(this.value));
  }

  /**
   * Err.match calls `onErr` to transform result error value `T` into `U` and
   * then returns `U`.
   *
   * @example
   * ```ts
   * Result.err(42)
   *   .match((err) => err + 10); // Evaluates to 52
   * ```
   */
  match<U>(onErr: (value: T) => U): U {
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
 * Result.ok creates a result Ok with value `T`.
 *
 * @example
 * ```ts
 * Result.ok("message"); // Evaluates to Ok "message"
 *
 * Result.ok(42); // Evaluates to Ok 42
 * ```
 */
export function ok<T>(value: T): Ok<T> {
  return new Ok(value);
}

/**
 * Result.err creates a result Err with error value `T`.
 *
 * @example
 * ```ts
 * Result.err("message"); // Evaluates to Err "message"
 *
 * Result.err(42); // Evaluates to Err 42
 * ```
 */
export function err<T>(value: T): Err<T> {
  return new Err(value);
}

/**
 * Result.fromThrowable converts a throwing function `fn` into a Result using
 * try catch. If error occurs the error is interpreted as Err<E> otherwise
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
export function fromThrowable<T, E>(
  fn: () => T,
): Result<T, E> {
  try {
    return ok(fn());
  } catch (e) {
    return err(e);
  }
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
export function unwrap<T, E>(result: Result<T, E>): T {
  return result.unwrap();
}

/**
 * Result.unwrapErr returns the value `E` from the associated result if it is
 * `Err`; otherwise it will throw.
 *
 * @example
 * ```ts
 * Result.ok(42).unwrapErr(); // Throws an exception!
 *
 * Result.err(42).unwrapErr(); // Evaluates to 42
 * ```
 */
export function unwrapErr<T, E>(result: Result<T, E>): E {
  return result.unwrapErr();
}

/**
 * Result.unwrapOr returns the value `T` from the associated result or
 * returns the default value `U` if the result is `Err`.
 *
 * @example
 * ```ts
 * Result.ok(42).unwrapOr(99); // Evaluates to 42
 *
 * Result.err(42).unwrapOr(99); // Evaluates to 99
 * ```
 */
export function unwrapOr<T, E, U>(
  defaultValue: U,
): (result: Result<T, E>) => T | U {
  return (result) => result.unwrapOr(defaultValue);
}

/**
 * Result.map applies a function `fn` to result value `T` and transforms it
 * into value `U`.
 *
 * @example
 * ```ts
 * Result.err(42)
 *   .map((x) => x * 2); // Evaluates to Err 42
 *
 * Result.ok(42)
 *   .map((x) => x * 2); // Evaluates to Ok 84
 * ```
 */
export function map<T, E, U>(
  fn: (value: T) => U,
): (result: Result<T, E>) => Result<U, E> {
  return (result) => result.map(fn);
}

/**
 * Result.mapErr applies a function `fn` to result error value `E` and
 * transforms it into value `F`.
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
export function mapErr<T, E, F>(
  fn: (value: E) => F,
): (result: Result<T, E>) => Result<T, F> {
  return (result) => result.mapErr(fn);
}

/**
 * Result.inspect calls the provided function `fn` with a reference to the
 * contained result value `T` if the result is ok.
 *
 * @example
 * ```ts
 * Result.err(42)
 *   .inspect((x) => console.log(x * 2)); // Prints nothing
 *
 * Result.ok(42)
 *   .inspect((x) => console.log(x * 2)); // Evaluates to 84
 * ```
 */
export function inspect<T, E>(
  fn: (value: T) => void,
): (result: Result<T, E>) => Result<T, E> {
  return (result) => result.inspect(fn);
}

/**
 * Result.inspectErr calls the provided function `fn` with a reference to the
 * contained result error value `E` if the result is err.
 *
 * @example
 * ```ts
 * Result.err(42)
 *   .inspectErr((x) => console.log(x * 2)); // Evaluates to 84
 *
 * Result.ok(42)
 *   .inspectErr((x) => console.log(x * 2)); // Prints nothing
 * ```
 */
export function inspectErr<T, E>(
  fn: (value: E) => void,
): (result: Result<T, E>) => Result<T, E> {
  return (result) => result.inspectErr(fn);
}

/**
 * Result.isOk returns `true` if the result is `Ok`
 *
 * @example
 * ```ts
 * Result.err(42).isOk(); // Evaluates to false
 *
 * Result.ok(42).isOk(); // Evaluates to true
 * ```
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.isOk();
}

/**
 * Result.isErr returns `true` if the result is `Err`
 *
 * @example
 * ```ts
 * Result.err(42).isErr(); // Evaluates to true
 *
 * Result.ok(42).isOk(); // Evaluates to false
 * ```
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.isErr();
}

/**
 * Result.flatMap applies a function `fn` to the content of a result `T` and
 * transforms it into a result containing value `U`.
 *
 * @example
 * ```ts
 * type TryParse = (input: string) => Result.Type<number, string>;
 *
 * const tryParse: TryParse = (input: string) => {
 *   const value = parseInt(input);
 *   return isNaN(value) ? Result.err("could not parse") : Result.ok(value);
 * };
 *
 * Result.err("message")
 *   .flatMap(tryParse); // Evaluates to Err "message"
 *
 * Result.ok("42")
 *   .flatMap(tryParse); // Evaluates to Ok 42
 *
 * Result.ok("Forty-two")
 *   .flatMap(tryParse); // Evaluates to Err "could not parse"
 * ```
 */
export function flatMap<T, E, U>(
  fn: (value: T) => Result<U, E>,
): (result: Result<T, E>) => Result<U, E> {
  return (result) => result.flatMap(fn);
}

/**
 * Result.match transforms the result value `T` into `U` using `onOk` and
 * then returns `U`. If the result is Err, the error value `E` is transformed
 * to `U` with `onErr` and then returns `U`.
 *
 * @example
 * ```ts
 * Result.err(42)
 *   .match((err) => err + 10, (x) => x * 2); // Evaluates to 52
 *
 * Result.ok(42)
 *   .match((err) => err + 10, (x) => x * 2); // Evaluates to 84
 * ```
 */
export function match<T, E, U>(
  onErr: (value: E) => U,
  onOk: (value: T) => U,
): (result: Result<T, E>) => U {
  return (result: Result<T, E>) => result.match(onErr, onOk);
}
