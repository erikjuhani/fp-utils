/**
 * Option represents the presence of a value `Some` or the absence of a value
 * `None`. It's commonly utilized to manage computations that might or might not
 * yield a result, or those that could potentially fail.
 */
export interface Type<T> {
  /**
   * Option.flatMap applies a function `fn` to the content of option `T` and
   * transforms it into an option `U`.
   *
   * @example
   * ```ts
   * type TryParse = (input: string) => Option.Type<number>;
   *
   * const tryParse: TryParse = (input: string) => {
   *   const value = parseInt(input);
   *   return isNaN(value) ? Option.none() : Option.some(value);
   * };
   *
   * Option.none()
   *   .flatMap(tryParse); // Evaluates to None
   *
   * Option.some("42")
   *   .flatMap(tryParse); // Evaluates to Some 42
   *
   * Option.some("Forty-two")
   *   .flatMap(tryParse); // Evaluates to None
   * ```
   */
  flatMap<U>(fn: (value: T) => Type<U>): Type<U>;

  /**
   * Option.inspect calls the provided function `fn` with a reference to the
   * contained option value `T` if the option is some.
   *
   * @example
   * ```ts
   * Option.none()
   *   .inspect((x) => console.log(x * 2)); // Evaluates to None
   *
   * Option.some(42)
   *   .inspect((x) => console.log(x * 2)); // Evaluates to 84
   * ```
   */
  inspect(fn: (value: T) => void): Type<T>;

  /**
   * Option.map applies a function `fn` to option value `T` and transforms it
   * into value `U`.
   *
   * @example
   * ```ts
   * Option.none()
   *   .map((x) => x * 2); // Evaluates to None
   *
   * Option.some(42)
   *   .map((x) => x * 2); // Evaluates to Some 84
   * ```
   */
  map<U>(fn: (value: T) => U): Type<U>;

  /**
   * Option.match transforms the option value `T` into `U` using `onSome` and
   * then returns `U`. If the option is None, it uses `onNone` and returns `U`.
   *
   * @example
   * ```ts
   * Option.none()
   *   .match(() => 99, (x) => x * 2); // Evaluates to 99
   *
   * Option.some(42)
   *   .match(() => 99, (x) => x * 2); // Evaluates to 84
   * ```
   */
  match<U>(onNone: () => U, onSome: (value: T) => U): U;

  /**
   * Option.unwrap returns the value `T` from the associated option if it is
   * `Some`; otherwise it will throw.
   *
   * @example
   * ```ts
   * Option.some(42).unwrap(); // Evaluates to 42
   *
   * Option.none().unwrap(); // Throws an exception!
   * ```
   */
  unwrap(): T;

  /**
   * Option.unwrapOr returns the value `T` from the associated option or
   * returns the default value if the option is `None`.
   *
   * @example
   * ```ts
   * Option.some(42).unwrapOr(99); // Evaluates to 42
   *
   * Option.none().unwrapOr(99); // Evaluates to 99
   * ```
   */
  unwrapOr<U>(defaultValue: U): U;
  unwrapOr<U>(defaultValue: T | U): T | U;

  /**
   * Option.isSome returns `true` if the option is `Some`
   *
   * @example
   * ```ts
   * Option.none().isSome(); // Evaluates to false
   *
   * Option.some(42).isSome(); // Evaluates to true
   * ```
   */
  isSome<T>(): this is Some<T>;

  /**
   * Option.isNone returns `true` if the option is `None`
   *
   * @example
   * ```ts
   * Option.none().isNone(); // Evaluates to true
   *
   * Option.some(42).isNone(); // Evaluates to false
   * ```
   */
  isNone(): this is None;
}

/**
 * Option type alias is used to clarify the intent in Option function
 * signatures.
 */
type Option<T> = Type<T>;

/**
 * Some represents the presence of a value `T` contained in the option.
 */
export class Some<T> implements Option<T> {
  private value: T;

  constructor(value: T) {
    if (value === null || value === undefined) {
      throw Error("Trying to pass nullable value to Some");
    }
    this.value = value;
  }
  /**
   * Some.flatMap applies a function `fn` to the content of Option<T> and
   * transforms it into an Option<U>.
   *
   * @example
   * ```ts
   * type TryParse = (input: string) => Option.None | Option.Some<number>;
   *
   * const tryParse: TryParse = (input: string) => {
   *   const value = parseInt(input);
   *   return isNaN(value) ? Option.none() : Option.some(value);
   * };
   *
   * Option.some("42")
   *   .flatMap(tryParse); // Evaluates to Some 42
   *
   * Option.some("Forty-two")
   *   .flatMap(tryParse); // Evaluates to None
   * ```
   */
  flatMap<U>(fn: (value: T) => Option<U>) {
    return fn(this.value);
  }

  /**
   * Some.inspect calls the provided function `fn` with a reference to the
   * contained option value `T`.
   *
   * @example
   * ```ts
   * Option.some(42)
   *   .inspect((x) => console.log(x * 2)); // Evaluates to 84
   * ```
   */
  inspect(fn: (value: T) => void) {
    fn(this.value);
    return this;
  }

  /**
   * Some.map applies a function `fn` to option value `T` and transforms it
   * into value `U`.
   *
   * @example
   * ```ts
   * Option.some(42)
   *   .map((x) => x * 2); // Evaluates to Some 84
   * ```
   */
  map<U>(fn: (value: T) => NonNullable<U>) {
    return some(fn(this.value));
  }

  /**
   * Option.match transforms the option value `T` into `U` using `onSome` and
   * then returns `U`.
   *
   * @example
   * ```ts
   * Option.some(42)
   *   .match(() => 99, (x) => x * 2); // Evaluates to 84
   * ```
   */
  match<U>(_onNone: () => U, onSome: (value: T) => U): U {
    return onSome(this.value);
  }

  /**
   * Some.unwrap returns the value `T`.
   *
   * @example
   * ```ts
   * Option.some(42).unwrap(); // Evaluates to 42
   * ```
   */
  unwrap() {
    return this.value;
  }

  /**
   * Some.unwrapOr returns the value `T`.
   *
   * @example
   * ```ts
   * Option.some(42).unwrapOr(99); // Evaluates to 42
   * ```
   */
  unwrapOr(_defaultValue: T) {
    return this.value;
  }

  /**
   * Some.isSome returns `true`
   *
   * @example
   * ```ts
   * Option.some(42).isSome(); // Evaluates to true
   * ```
   */
  isSome<T>(): this is Some<T> {
    return true;
  }

  /**
   * Some.isNone returns `false`
   *
   * @example
   * ```ts
   * Option.some(42).isNone(); // Evaluates to false
   * ```
   */
  isNone(): this is None {
    return false;
  }
}

/**
 * None represents the absence of a value.
 */
export class None implements Option<never> {
  /**
   * None.flatMap performs no calculation and returns None. It cannot be given a
   * `fn` function parameter like in Some.flatMap.
   *
   * @example
   * ```ts
   * type TryParse = (input: string) => Option.None | Option.Some<number>;
   *
   * const tryParse: TryParse = (input: string) => {
   *   const value = parseInt(input);
   *   return isNaN(value) ? Option.none() : Option.some(value);
   * };
   *
   * Option.none()
   *   .flatMap(tryParse); // Evaluates to None
   * ```
   */
  flatMap<U>(_fn: (value: never) => Option<U>) {
    return this;
  }

  /**
   * None.inspect performs no calculations and returns None.
   *
   * @example
   * ```ts
   * Option.none()
   *   .inspect((x) => console.log(x * 2)); // Evaluates to None
   * ```
   */
  inspect(_fn: (value: never) => void) {
    return this;
  }

  /**
   * None.map performs no calculation and returns None.
   *
   * @example
   * ```ts
   * Option.none()
   *   .map((x) => x * 2); // Evaluates to None
   * ```
   */
  map<U>(_fn: (value: never) => NonNullable<U>) {
    return this;
  }

  /**
   * None.match performs `onNone` and returns `U`.
   *
   * @example
   * ```ts
   * Option.none()
   *   .match(() => 99, (x) => x * 2); // Evaluates to 99
   * ```
   */
  match<U>(onNone: () => U, _onSome: (value: never) => U): U {
    return onNone();
  }

  /**
   * None.unwrap will throw.
   *
   * @example
   * ```ts
   * Option.none().unwrap(); // Throws an exception!
   * ```
   */
  unwrap(): never {
    throw Error("Called unwrap on None");
  }

  /**
   * None.unwrapOr returns the default value `U`.
   *
   * @example
   * ```ts
   * Option.none().unwrapOr(99); // Evaluates to 99
   * ```
   */
  unwrapOr<U>(defaultValue: U): U {
    return defaultValue;
  }

  /**
   * None.isSome returns `false`
   *
   * @example
   * ```ts
   * Option.none().isSome(); // Evaluates to false
   * ```
   */
  isSome(): this is Some<never> {
    return false;
  }

  /**
   * None.isNone returns `true`
   *
   * @example
   * ```ts
   * Option.none().isNone(); // Evaluates to true
   * ```
   */
  isNone(): this is None {
    return true;
  }
}

const static_none = new None();

/**
 * Option.some creates an option Some with value `T`.
 *
 * @example
 * ```ts
 * Option.some(undefined); // Throws an exception or compiler error!
 *
 * Option.some(null); // Throws an exception or compiler error!
 *
 * Option.some(42); // Evaluates to Some 42
 * ```
 */
export function some<T>(value: NonNullable<T>): Some<T> {
  return new Some(value);
}

/**
 * Option.none returns a None option.
 *
 * @example
 * ```ts
 * Option.none(); // Evaluates to None
 * ```
 */
export function none(): None {
  return static_none;
}

/**
 * Option.fromNullable converts a nullable value to an option.
 *
 * @example
 * ```ts
 * Option.fromNullable(undefined); // Evaluates to None
 *
 * Option.fromNullable(null); // Evaluates to None
 *
 * Option.fromNullable(42); // Evaluates to Some 42
 * ```
 */
export function fromNullable<T>(value: T | null | undefined): Option<T> {
  if (value === null || value === undefined) return none();
  else return new Some(value);
}

/**
 * Option.fromPromise converts a promise into an option. If promise is rejected
 * None is returned, otherwise Some<T>.
 *
 * @example
 * ```ts
 * Option.fromPromise(Promise.reject()); // Evaluates to None
 *
 * Option.fromPromise(Promise.resolve(null)); // Evaluates to None
 *
 * Option.fromPromise(Promise.resolve(42)); // Evaluates to Some 42
 *
 * Option.fromPromise(() => Promise.reject()); // Evaluates to None
 *
 * Option.fromPromise(() => Promise.resolve(42)); // Evaluates to Some 42
 * ```
 */
export function fromPromise<T>(promise: Promise<T>): Promise<Option<T>>;
export function fromPromise<T>(fn: () => Promise<T>): Promise<Option<T>>;
export function fromPromise<T>(
  promiseOrFn: Promise<T> | (() => Promise<T>),
): Promise<Option<T>> {
  const promise = typeof promiseOrFn === "function"
    ? promiseOrFn()
    : promiseOrFn;

  return promise.then(fromNullable).catch(none);
}

/**
 * Option.unwrap returns the value `T` from the associated option if it is
 * `Some`; otherwise it will throw.
 *
 * @example
 * ```ts
 * Option.some(42).unwrap(); // Evaluates to 42
 *
 * Option.none().unwrap(); // Throws an exception!
 * ```
 */
export function unwrap<T>(option: Option<T>): T {
  return option.unwrap();
}

/**
 * Option.unwrapOr returns the value `T` from the associated Option or returns the
 * default value if the Option is None.
 *
 * @example
 * ```ts
 * Option.some(42).unwrapOr(99); // Evaluates to 42
 *
 * Option.none().unwrapOr(99); // Evaluates to 99
 * ```
 */
export function unwrapOr<T>(defaultValue: T): (option: Option<T>) => T {
  return (option) => option.unwrapOr(defaultValue);
}

/**
 * Option.map applies a function `fn` to option value `T` and transforms it
 * into value `U`.
 *
 * @example
 * ```ts
 * Option.none()
 *   .map((x) => x * 2); // Evaluates to None
 *
 * Option.some(42)
 *   .map((x) => x * 2); // Evaluates to Some 84
 * ```
 */
export function map<T, U = unknown>(
  fn: (value: T) => U,
): (option: Option<T>) => Option<U> {
  return (option) => option.map(fn);
}

/**
 * Option.inspect calls the provided function `fn` with a reference to the
 * contained option value `T` if the option is some.
 *
 * @example
 * ```ts
 * Option.none()
 *   .inspect((x) => console.log(x * 2)); // Evaluates to None
 *
 * Option.some(42)
 *   .inspect((x) => console.log(x * 2)); // Evaluates to 84
 * ```
 */
export function inspect<T>(
  fn: (value: T) => void,
): (option: Option<T>) => Option<T> {
  return (option) => option.inspect(fn);
}

/**
 * Option.isSome returns `true` if the option is `Some`
 *
 * @example
 * ```ts
 * Option.none().isSome(); // Evaluates to false
 *
 * Option.some(42).isSome(); // Evaluates to true
 * ```
 */
export function isSome<T>(option: Option<T>): option is Some<T> {
  return option.isSome();
}

/**
 * Option.isNone returns `true` if the option is `None`
 *
 * @example
 * ```ts
 * Option.none().isNone(); // Evaluates to true
 *
 * Option.some(42).isNone(); // Evaluates to false
 * ```
 */
export function isNone<T>(option: Option<T>): option is None {
  return option.isNone();
}

/**
 * Option.flatMap applies a function `fn` to the content of option `T` and
 * transforms it into an option `U`.
 *
 * @example
 * ```ts
 * type TryParse = (input: string) => Option.Type<number>;
 *
 * const tryParse: TryParse = (input: string) => {
 *   const value = parseInt(input);
 *   return isNaN(value) ? Option.none() : Option.some(value);
 * };
 *
 * Option.none()
 *   .flatMap(tryParse); // Evaluates to None
 *
 * Option.some("42")
 *   .flatMap(tryParse); // Evaluates to Some 42
 *
 * Option.some("Forty-two")
 *   .flatMap(tryParse); // Evaluates to None
 * ```
 */
export function flatMap<T, U>(
  fn: (value: T) => Option<U>,
): (option: Option<T>) => Option<U> {
  return (option) => option.flatMap(fn);
}

/**
 * Option.match transforms the option value `T` into `U` using `onSome` and
 * then returns `U`. If the option is None, it uses `onNone` and returns `U`.
 *
 * @example
 * ```ts
 * Option.none()
 *   .match(() => 99, (x) => x * 2); // Evaluates to 99
 *
 * Option.some(42)
 *   .match(() => 99, (x) => x * 2); // Evaluates to 84
 * ```
 */
export function match<T, U>(
  onNone: () => U,
  onSome: (value: T) => U,
): (option: Option<T>) => U {
  return (option: Option<T>) => option.match(onNone, onSome);
}
