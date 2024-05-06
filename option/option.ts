/**
 * Option represents the presence of a value `Some` or the absence of a value
 * `None`. It's commonly utilized to manage computations that might or might not
 * yield a result, or those that could potentially fail.
 */
export abstract class Option<T> {
  /**
   * Option.filter returns a boolean that is evaluated with the given
   * `predicate` function which is applied on the option value `T`. None
   * evaluates to `false`.
   *
   * @example
   * ```ts
   * Option
   *   .filter((x: number) => x >= 5)(Some(2)); // evaluates to false
   *
   * Option
   *   .filter((x: number) => x >= 5)(Some(42)); // evaluates to true
   *
   * Option
   *   .filter((x: number) => x >= 5)(None); // evaluates to false
   * ```
   */
  // deno-lint-ignore no-explicit-any
  static filter<TOption extends Option<any>>(
    predicate: (
      value: TOption extends Some<infer U> ? U
        : TOption extends Option<infer U> ? U
        : never,
    ) => boolean,
  ): (option: TOption) => boolean {
    return (option) => option.filter(predicate);
  }

  /**
   * Option.flatMap applies a function `fn` to the content of option `T` and
   * transforms it into an option `U`.
   *
   * @example
   * ```ts
   * type TryParse = (input: string) => Option<number>;
   *
   * const tryParse: TryParse = (input: string) => {
   *   const value = parseInt(input);
   *   return isNaN(value) ? None : Some(value);
   * };
   *
   * Option
   *   .flatMap(tryParse)(Some("42")); // Evaluates to Some 42
   *
   * Option
   *   .flatMap(tryParse)(Some("Forty-two")); // Evaluates to None
   *
   * Option
   *   .flatMap(tryParse)(None); // Evaluates to None
   * ```
   */
  // deno-lint-ignore no-explicit-any
  static flatMap<TOption extends Option<any>, UOption extends Option<any>>(
    fn: (
      value: TOption extends Some<infer U> ? U
        : TOption extends Option<infer U> ? U
        : never,
    ) => UOption,
  ): (option: TOption) => Option<
    UOption extends Some<infer U> ? U
      : UOption extends Option<infer U> ? U
      : never
  > {
    return (option) => option.flatMap(fn);
  }

  /**
   * Option.from converts a nullable value, non-nullable value, a function or a
   * promise to an option.
   *
   * @example
   * ```ts
   * Option
   *   .from(undefined); // Evaluates to None
   *
   * Option
   *   .from(null); // Evaluates to None
   *
   * Option
   *   .from(42); // Evaluates to Some 42
   *
   * Option
   *   .from(() => 42); // Evaluates to Some 42
   *
   * Option
   *   .from(() => Promise.resolve(42)); // Evaluates to Promise<Some 42>
   *
   * Option
   *   .from(() => Promise.reject()); // Evaluates to Promise<None>
   *
   * Option
   *   .from(Promise.resolve(42)); // Evaluates to Promise<Some 42>
   *
   * Option
   *   .from(Promise.resolve(undefined)); // Evaluates to Promise<None>
   *
   * Option
   *   .from(Promise.reject()); // Evaluates to Promise<None>
   * ```
   */
  static from<T>(
    value: T | (() => T),
  ): From<typeof value> {
    type Value = typeof value;

    if (value === null || value === undefined) {
      return new None() as From<Value>;
    }
    if (value instanceof Function) {
      return Option.from<T>(value()) as From<Value>;
    }
    if (isPromiseLike<T>(value)) {
      return Promise.resolve(value).then((value) =>
        value === null || value === undefined ? new None() : new Some(value)
      ).catch(
        Option.none,
      ) as From<Value>;
    }
    return new Some(value) as From<Value>;
  }

  /**
   * Option.inspect calls the provided function `fn` with a reference to the
   * contained option value `T` if the option is some.
   *
   * @example
   * ```ts
   * Option
   *   .inspect((x: number) => console.log(x * 2))(Some(42)); // Prints 84
   *
   * Option
   *   .inspect((x: number) => console.log(x * 2))(None); // Prints nothing
   * ```
   */
  // deno-lint-ignore no-explicit-any
  static inspect<TOption extends Option<any>>(
    fn: (
      value: TOption extends Some<infer U> ? U
        : TOption extends Option<infer U> ? U
        : never,
    ) => void,
  ): (option: TOption) => TOption {
    return (option) => option.inspect(fn);
  }

  /**
   * Option.isNone returns `true` if the option is `None`
   *
   * @example
   * ```ts
   * Option
   *   .isNone(Some(42)); // Evaluates to false
   *
   * Option
   *   .isNone(None); // Evaluates to true
   * ```
   */
  static isNone(option: Option<unknown>): option is None {
    return option.isNone();
  }

  /**
   * Option.isSome returns `true` if the option is `Some`
   *
   * @example
   * ```ts
   * Option
   *   .isSome(Some(42)); // Evaluates to true
   *
   * Option
   *   .isSome(None); // Evaluates to false
   * ```
   */
  static isSome<T, TOption extends Option<T>>(
    option: TOption | Some<T>,
  ): option is Some<TOption extends Option<infer Z> ? Z : never> {
    return (option as TOption).isSome();
  }

  /**
   * Option.map applies a function `fn` to option value `T` and transforms it
   * into value `U`.
   *
   * @example
   * ```ts
   * Option
   *   .map((x: number) => x * 2)(Some(42)); // Evaluates to Some 84
   *
   * Option
   *   .map((x: number) => x * 2)(None); // Evaluates to None
   * ```
   */
  // deno-lint-ignore no-explicit-any
  static map<U, TOption extends Option<any>>(
    fn: (
      value: TOption extends Some<infer U> ? U
        : TOption extends Option<infer U> ? U
        : never,
    ) => NonNullable<U>,
  ): (option: TOption) => Option<NonNullable<U>> {
    return (option) => option.map(fn);
  }

  /**
   * Option.match transforms the option value `T` into `U1` using `onSome`
   * and then returns `U1`. If the option is None, `onNone` is called and `U2`
   * returned.
   *
   * @example
   * ```ts
   * Option
   *   .match((x: number) => x * 2, () => 99)(Some(42)); // Evaluates to 84
   *
   * Option
   *   .match((x: number) => x * 2, () => 99)(None); // Evaluates to 99
   * ```
   */
  static match<T, U1, U2, TOption extends Option<unknown>>(
    onSome: (
      value: TOption extends Some<infer U> ? U
        : TOption extends Option<infer U> ? U
        : never,
    ) => U1,
    onNone: () => U2,
  ): (option: TOption) => U1 | U2;
  static match<T, U1, U2>(
    onSome: (value: T) => U1,
    onNone: () => U2,
  ) {
    return (option: Some<T> | None) => option.match(onSome, onNone);
  }

  /**
   * Option.none returns a None option.
   *
   * @example
   * ```ts
   * Option
   *   .none(); // Evaluates to None
   * ```
   */
  static none(): None {
    return new None();
  }

  /**
   * Option.some creates an option Some with value `T`.
   *
   * @example
   * ```ts
   * Option
   *   .some(42); // Evaluates to Some 42
   *
   * Option
   *   .some(undefined); // Throws an exception or compiler error!
   *
   * Option
   *   .some(null); // Throws an exception or compiler error!
   * ```
   */
  static some<T>(value: NonNullable<T>): Some<NonNullable<T>> {
    return new Some(value);
  }

  /**
   * Option.toString returns the string representation of the result and the
   * stringified value as `Some(value)` if the result is `Some` or `None` if
   * the result is `None`.
   *
   * @example
   * ```ts
   * Option
   *   .toString(Some(42)); // Evaluates to "Some(42)"
   *
   * Option
   *   .toString(None); // Evaluates to "None"
   * ```
   */
  static toString<T>(option: Option<T>): `Some(${string})` | "None" {
    return option.toString();
  }

  /**
   * Option.unwrap returns the value `T` from the associated option if it is
   * `Some`; otherwise it will throw.
   *
   * @example
   * ```ts
   * Option
   *   .unwrap(Some(42)); // Evaluates to 42
   *
   * Option
   *   .unwrap(None); // Throws an exception!
   * ```
   */
  // deno-lint-ignore no-explicit-any
  static unwrap<TOption extends Option<any>>(
    option: TOption,
  ): TOption extends Some<infer U> ? U
    : TOption extends Option<infer U> ? U
    : never {
    return option.unwrap();
  }

  /**
   * Option.unwrapOr returns the value `T` from the associated Option or returns the
   * default value if the Option is None.
   *
   * @example
   * ```ts
   * Option
   *   .unwrapOr(99)(Some(42)); // Evaluates to 42
   *
   * Option
   *   .unwrapOr(99)(None); // Evaluates to 99
   * ```
   */
  // deno-lint-ignore no-explicit-any
  static unwrapOr<TOption extends Option<any>>(
    defaultValue: TOption extends Some<infer U> ? U
      : TOption extends Option<infer U> ? U
      : never,
  ): (option: TOption) => typeof defaultValue {
    return (option) => option.unwrapOr(defaultValue);
  }

  /**
   * Option.zip combines two option values into a tuple and returns the tuple
   * wrapped in Option.
   *
   * @example
   * ```ts
   * Option
   *   .zip(Some(84))(Some(42)); // Evaluates to Some<[42, 84]>
   *
   * Option
   *   .zip(None)(Some(42)); // Evaluates to None
   *
   * Option
   *   .zip(Some(84))(None); // Evaluates to None
   * ```
   */
  // deno-lint-ignore no-explicit-any
  static zip<TOption extends Option<any>, UOption extends Option<any>>(
    optionB: UOption,
  ): (optionA: TOption) => Option<[
    TOption extends Some<infer U> ? U
      : TOption extends Option<infer U> ? U
      : never,
    UOption extends Some<infer U> ? U
      : UOption extends Option<infer U> ? U
      : never,
  ]> {
    return (optionA) => optionA.zip(optionB);
  }

  /**
   * Option.filter returns a boolean that is evaluated with the given
   * `predicate` function which is applied on the option value `T`. None
   * evaluates to `false`.
   *
   * @example
   * ```ts
   * Some(2)
   *   .filter((x) => x >= 5); // evaluates to false
   *
   * Some(42)
   *   .filter((x) => x >= 5); // evaluates to true
   *
   * None
   *   .filter((x) => x >= 5); // evaluates to false
   * ```
   */
  abstract filter(predicate: (value: T) => boolean): boolean;

  /**
   * Option.flatMap applies a function `fn` to the content of option `T` and
   * transforms it into an option `U`.
   *
   * @example
   * ```ts
   * type TryParse = (input: string) => Option<number>;
   *
   * const tryParse: TryParse = (input: string) => {
   *   const value = parseInt(input);
   *   return isNaN(value) ? None : Some(value);
   * };
   *
   * Some("42")
   *   .flatMap(tryParse); // Evaluates to Some 42
   *
   * Some("Forty-two")
   *   .flatMap(tryParse); // Evaluates to None
   *
   * None
   *   .flatMap(tryParse); // Evaluates to None
   * ```
   */
  // deno-lint-ignore no-explicit-any
  abstract flatMap<U extends NonNullable<any>, UOption extends Option<U>>(
    fn: (value: T) => UOption,
  ): UOption;
  // deno-lint-ignore no-explicit-any
  abstract flatMap<U extends NonNullable<any>, UOption extends Option<U>>(
    fn: (value: T) => UOption,
  ): this;

  /**
   * Option.inspect calls the provided function `fn` with a reference to the
   * contained option value `T` if the option is some.
   *
   * @example
   * ```ts
   * Some(42)
   *   .inspect((x) => console.log(x * 2)); // Prints 84
   *
   * None
   *   .inspect((x) => console.log(x * 2)); // Prints nothing
   * ```
   */
  abstract inspect(fn: (value: T) => void): this;

  /**
   * Option.isNone returns `true` if the option is `None`
   *
   * @example
   * ```ts
   * Some(42).isNone(); // Evaluates to false
   *
   * None.isNone(); // Evaluates to true
   * ```
   */
  abstract isNone(): this is None;

  /**
   * Option.isSome returns `true` if the option is `Some`
   *
   * @example
   * ```ts
   * Some(42).isSome(); // Evaluates to true
   *
   * None.isSome(); // Evaluates to false
   * ```
   */
  abstract isSome<U extends T>(): this is Some<U>;

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
  abstract map<U>(fn: (value: T) => NonNullable<U>): Option<NonNullable<U>>;

  /**
   * Option.match transforms the option value `T` into `U1` using `onSome`
   * and then returns `U1`. If the option is None, `onNone` is called and `U2`
   * returned.
   *
   * @example
   * ```ts
   * Some(42)
   *   .match((x) => x * 2, () => 99); // Evaluates to 84
   *
   * None
   *   .match((x) => x * 2, () => 99); // Evaluates to 99
   * ```
   */
  abstract match<U1, U2>(
    onSome: (value: T) => U1,
    onNone: () => U2,
  ): U1 | U2;

  /**
   * Option.toString returns the string representation of the option and the
   * stringified value as `Some(value)` if the result is `Some` or `None` if
   * the result is `None`.
   *
   * @example
   * ```ts
   * Some(42)
   *   .toString(); // Evaluates to "Some(42)"
   *
   * None
   *   .toString(); // Evaluates to "None"
   * ```
   */
  abstract toString(): `Some(${string})` | "None";

  /**
   * Option.unwrap returns the value `T` from the associated option if it is
   * `Some`; otherwise it will throw.
   *
   * @example
   * ```ts
   * Some(42).unwrap(); // Evaluates to 42
   *
   * None.unwrap(); // Throws an exception!
   * ```
   */
  abstract unwrap<U extends T>(): T | U;

  /**
   * Option.unwrapOr returns the value `T` from the associated option or
   * returns the default value if the option is `None`.
   *
   * @example
   * ```ts
   * Some(42).unwrapOr(99); // Evaluates to 42
   *
   * None.unwrapOr(99); // Evaluates to 99
   * ```
   */
  abstract unwrapOr<U>(defaultValue: U): U;
  abstract unwrapOr<U>(defaultValue: T | U): T | U;

  /**
   * Option.zip combines two option values into a tuple and returns the tuple
   * wrapped in Option.
   *
   * @example
   * ```ts
   * Some(42).zip(Some(84)); // Evaluates to Some<[42, 84]>
   *
   * Some(42).zip(None); // Evaluates to None
   *
   * None.zip(Some(84)); // Evaluates to None
   * ```
   */
  abstract zip<U>(option: Option<U>): Option<[T, U]>;
}

/**
 * Some represents the presence of a value `T` contained in the option.
 */
export class Some<T> extends Option<T> {
  #value: NonNullable<T>;

  constructor(value: T) {
    super();
    if (!isNonNullable(value)) {
      throw Error("Trying to pass nullable value to Some");
    }
    this.#value = value;
  }

  /** {@link Option.filter} */
  filter(predicate: (value: T) => boolean): boolean {
    return predicate(this.#value);
  }

  /** {@link Option.flatMap} */
  // deno-lint-ignore no-explicit-any
  flatMap<U extends NonNullable<any>, UOption extends Option<U>>(
    fn: (value: T) => UOption,
  ): UOption {
    return fn(this.#value);
  }

  /** {@link Option.inspect} */
  inspect(fn: (value: T) => void): this {
    fn(this.#value);
    return this;
  }

  /** {@link Option.map} */
  map<U>(fn: (value: T) => NonNullable<U>): Option<NonNullable<U>> {
    return Option.some(fn(this.#value));
  }

  /** {@link Option.match} */
  match<U1, U2>(onSome: (value: T) => U1, _onNone: () => U2): U1 {
    return onSome(this.#value);
  }

  /** {@link Option.isSome} */
  isSome<T>(): this is Some<T> {
    return true;
  }

  /** {@link Option.isNone} */
  isNone(): false {
    return false;
  }

  /** {@link Option.toString} */
  toString(): `Some(${string})` {
    return `Some(${
      this.#value instanceof Option
        ? this.#value.toString()
        : JSON.stringify(this.#value)
    })`;
  }

  /** {@link Option.unwrap} */
  unwrap(): T {
    return this.#value;
  }

  /** {@link Option.unwrapOr} */
  unwrapOr(_defaultValue: T): T {
    return this.#value;
  }

  /** {@link Option.zip} */
  zip<U>(option: Option<U>): Option<[T, U]> {
    return option.map((value) => [this.#value, value]);
  }

  [Symbol.for("Deno.customInspect")](): `Some(${string})` {
    return this.toString();
  }
}

/**
 * None represents the absence of a value.
 */
export class None extends Option<never> {
  /** {@link Option.filter} */
  filter(_predicate: (value: never) => boolean): false {
    return false;
  }

  /** {@link Option.flatMap} */
  // deno-lint-ignore no-explicit-any
  flatMap<U extends NonNullable<any>, UOption extends Option<U>>(
    _fn: (value: never) => UOption,
  ): this {
    return this;
  }

  /** {@link Option.inspect} */
  inspect(_fn: (value: never) => void): this {
    return this;
  }

  /** {@link Option.map} */
  map<U>(_fn: (value: never) => NonNullable<U>): this {
    return this;
  }

  /** {@link Option.match} */
  match<U1, U2>(_onSome: (value: never) => U1, onNone: () => U2): U2 {
    return onNone();
  }

  /** {@link Option.isSome} */
  isSome(): false {
    return false;
  }

  /** {@link Option.isNone} */
  isNone(): this is None {
    return true;
  }

  /** {@link Option.toString} */
  toString(): "None" {
    return "None";
  }

  /** {@link Option.unwrap} */
  unwrap(): never {
    throw Error("Called unwrap on None");
  }

  /** {@link Option.unwrapOr} */
  unwrapOr<U>(defaultValue: U): U {
    return defaultValue;
  }

  /** {@link Option.zip} */
  zip<U>(_option: Option<U>): this {
    return this;
  }

  [Symbol.for("Deno.customInspect")](): "None" {
    return this.toString();
  }
}

/**
 * Recursive type helper for the Option.from function return type. The type
 * is recursively traversed to find the correct type depending on the given
 * value. The recursion happens if the type is a function.
 */
type From<T> = T extends () => unknown
  ? ReturnType<T> extends never ? None : From<ReturnType<T>>
  : T extends undefined ? never
  : T extends Promise<never> ? Promise<None>
  : T extends Promise<unknown> ? Promise<From<Awaited<T>>>
  : Option<T>;

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
