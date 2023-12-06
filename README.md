<p align="center">
  <img src="/assets/dark.png#gh-dark-mode-only">
  <img src="/assets/light.png#gh-light-mode-only">
</p>

<p align="center">Logo Copyright - Original design by Ryan Dahl - Vector design by <a href="https://github.com/Kirlovon/deno-logo">Kirills Reunovs</a></p>

<p align="center">Functional utility library for Deno / Node</p>

## Background

I've been exploring ways to represent Option or Result types in TypeScript that
would be intuitive to use and have idiomatic functionality, similar to how
promises work. This is the incarnation of these explorations. Think of lodash,
but as utilities for functional programming.

Fair warning, even though these concepts can be used without much knowledge
about functional programming. I wholeheartedly recommend to understand the
basics of functional programming before using these utilities.

## Option

Option represents the presence of a value `Some` or the absence of a value
`None`. It's commonly utilized to manage computations that might or might not
yield a result, or those that could potentially fail.

Option is particularly useful, when dealing with operations that may return
`null` or `undefined` values, providing a structured and safe approach to manage
such scenarios.

By using option, the need for imperative and explicit `null` or `undefined`
checks diminishes, reducing code noise and allowing for clearer focus on
essential domain logic. Essentially, the Option enables to focus primarily on
the 'happy path'.

```ts
// deno
import * as Option from "https://deno.land/x/fp_utils@0.1.0/option/mod.ts";
// node
import * as Option from "@fp-utils/option";

const tryGetHead = <T extends NonNullable<unknown>>(arr: T[]) =>
  arr.length ? Option.some(arr[0]) : Option.none();

const toUpperCase = (value: string) => value.toUpperCase();

const headToUpperCase = (arr: string[]) =>
  tryGetHead(arr)
    .map(toUpperCase)
    .match(
      () => "Nothing to uppercase",
      (value) => value,
    );

headToUpperCase([]); // Nothing to uppercase
headToUpperCase(["fp-utils"]); // FP-UTILS
```

### Usage

### `Option.bind`

Signature: `<U>(fn: (value: T) => Option<U>): Option<U>`

Option.bind applies a function `fn` to the content of option `T` and transforms
it into an option `U`.

<details>
  <summary>Example</summary>

```ts
type TryParse = (input: string) => Option.None | Option.Some<number>;

const tryParse: TryParse = (input: string) => {
  const value = parseInt(input);
  return isNaN(value) ? Option.none() : Option.some(value);
};

Option.none()
  .bind(tryParse); // Impossible state

Option.some("42")
  .bind(tryParse); // Evaluates to Some 42

Option.some("Forty-two")
  .bind(tryParse); // Evaluates to None
```

</details>

### `Option.inspect`

Signature: (fn: (value: T) => void): Option<T>;

Option.inspect calls the provided function `fn` with a reference to the
contained option value `T` if the option is some.

<details>
  <summary>Example</summary>

```ts
Option.none()
  .inspect((x) => console.log(x * 2)); // Prints nothing

Option.some(42)
  .inspect((x) => console.log(x * 2)); // Prints 84
```

</details>

### `Option.map`

Signature: `<U>(fn: (value: T) => U): Option<U>`

Option.map applies a function `fn` to option value `T` and transforms it into
value `U`.

<details>
  <summary>Example</summary>

```ts
Option.none()
  .map((x) => x * 2); // Evaluates to None

Option.some(42)
  .map((x) => x * 2); // Evaluates to Some 84
```

</details>

### `Option.match`

Signature: `<U>(onNone: () => U, onSome: (value: T) => U): U`

Option.match transforms the option value `T` into `U` using `onSome` and then
returns `U`. If the option is None, it uses `onNone` and returns `U`.

<details>
  <summary>Example</summary>

```ts
Option.none()
  .match(() => 99, (x) => x * 2); // Evaluates to 99

Option.some(42)
  .match(() => 99, (x) => x * 2); // Evaluates to 84
```

</details>

### `Option.unwrap`

Signature: `(): T`

Option.unwrap returns the value `T` from the associated option if it is `Some`;
otherwise it will throw.

<details>
  <summary>Example</summary>

```ts
Option.some(42).unwrap(); // Evaluates to 42

Option.none().unwrap(); // ! Throws an exception
```

</details>

### `Option.unwrapOr`

Signature: `<U>(defaultValue: U): T | U`

Option.unwrapOr returns the value `T` from the associated option or returns the
default value `U` if the option is `None`.

<details>
  <summary>Example</summary>

```ts
Option.some(42).unwrapOr(99); // Evaluates to 42

Option.none().unwrapOr(99); // Evaluates to 99
```

</details>

### `Option.isSome`

Signature: `<T>(): this is Some<T>`

Option.isSome returns `true` if the option is `Some`

<details>
  <summary>Example</summary>

```ts
Option.none().isSome(); // Evaluates to false

Option.some(42).isSome(); // Evaluates to true
```

</details>

### `Option.isNone`

Signature: `(): this is None`

Option.isNone returns `true` if the option is `None`

<details>
  <summary>Example</summary>

```ts
Option.none().isNone(); // Evaluates to true

Option.some(42).isNone(); // Evaluates to false
```

</details>
