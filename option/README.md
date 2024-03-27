# Option

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
import { Option } from "@fp-utils/option";

type BookId = number;
type BookName = string;

const books = new Map<BookId, BookName>([
  [1, "The Hobbit"],
  [2, "The Fellowship of the Ring"],
]);

const tryGetBook = (id: BookId): Option<BookName> => Option.from(books.get(id));

// Evaluates to None
const bookNotFound = tryGetBook(0);

// Evaluates to Some "The Hobbit"
const bookFound = tryGetBook(1);
```

## Usage

### Constructors

Similar as how `String` or `Number` constructors are used in JavaScript:

Use `Some(42)` constructor to wrap a value for existing value and for
non-existent value use the static `None` class.

<details>
  <summary>Example</summary>

```ts
const some = Some(42);
const none = None;
```

</details>

### Option methods

Option methods are chainable functions that allow for a sequence of operation
with the contained value `T` in the Option.

#### `Option.filter`

Signature: `(predicate: (value: T) => boolean): boolean`

Option.filter returns a boolean that is evaluated with the given `predicate`
function which is applied on the option value `T`. None evaluates to `false`.

<details>
  <summary>Example</summary>

```ts
Some(2)
  .filter((x) => x >= 5); // evaluates to false

Some(42)
  .filter((x) => x >= 5); // evaluates to true

None
  .filter((x) => x >= 5); // evaluates to false
```

</details>

#### `Option.flatMap`

Signature: `<U>(fn: (value: T) => Option<U>): Option<U>`

Option.flatMap applies a function `fn` to the content of option `T` and
transforms it into an option `U`.

<details>
  <summary>Example</summary>

```ts
type TryParse = (input: string) => Option<number>;

const tryParse: TryParse = (input: string) => {
  const value = parseInt(input);
  return isNaN(value) ? None : Some(value);
};

Some("42")
  .flatMap(tryParse); // Evaluates to Some 42

Some("Forty-two")
  .flatMap(tryParse); // Evaluates to None

None
  .flatMap(tryParse); // Evaluates to None
```

</details>

#### `Option.inspect`

Signature: `(fn: (value: T) => void): Option<T>`

Option.inspect calls the provided function `fn` with a reference to the
contained option value `T` if the option is some.

<details>
  <summary>Example</summary>

```ts
Some(42)
  .inspect((x) => console.log(x * 2)); // Prints 84

None
  .inspect((x) => console.log(x * 2)); // Prints nothing
```

</details>

#### `Option.isNone`

Signature: `(): this is None`

Option.isNone returns `true` if the option is `None`

<details>
  <summary>Example</summary>

```ts
Some(42).isNone(); // Evaluates to false

None.isNone(); // Evaluates to true
```

</details>

#### `Option.isSome`

Signature: `<T>(): this is Some<T>`

Option.isSome returns `true` if the option is `Some`

<details>
  <summary>Example</summary>

```ts
Some(42).isSome(); // Evaluates to true

None.isSome(); // Evaluates to false
```

</details>

#### `Option.map`

Signature: `<U>(fn: (value: T) => U): Option<U>`

Option.map applies a function `fn` to option value `T` and transforms it into
value `U`.

<details>
  <summary>Example</summary>

```ts
Some(42)
  .map((x) => x * 2); // Evaluates to Some 84

None
  .map((x) => x * 2); // Evaluates to None
```

</details>

#### `Option.match`

Signature: `<U1, U2>(onSome: (value: T) => U1, onNone: () => U2): U1 | U2`

Option.match transforms the option value `T` into `U1` using `onSome` and then
returns `U1`. If the option is None, `onNone` is called and `U2` returned.

<details>
  <summary>Example</summary>

```ts
Some(42)
  .match((x) => x * 2, () => 99); // Evaluates to 84

None
  .match((x) => x * 2, () => 99); // Evaluates to 99
```

</details>

#### `Option.unwrap`

Signature: `(): T`

Option.unwrap returns the value `T` from the associated option if it is `Some`;
otherwise it will throw.

<details>
  <summary>Example</summary>

```ts
Some(42).unwrap(); // Evaluates to 42

None().unwrap(); // Throws an exception!
```

</details>

#### `Option.unwrapOr`

Signature: `(defaultValue: T): T`

Option.unwrapOr returns the value `T` from the associated option or returns the
default value if the option is `None`.

<details>
  <summary>Example</summary>

```ts
Some(42).unwrapOr(99); // Evaluates to 42

None.unwrapOr(99); // Evaluates to 99
```

</details>

### Option higher-order functions

Option higher-order functions allow for Option value `T` chainability within
callbacks like Promise.then.

```ts
Promise.resolve(42)
  .then(Option.from)
  .then(Option.inspect)
  .then(Option.map((value) => value + 10))
  .then(Option.unwrap); // Evaluates to 52
```

#### `Option.filter`

Signature: `(predicate: (value: T) => boolean): (option: Option<T>) => boolean`

Option.filter returns a boolean that is evaluated with the given `predicate`
function which is applied on the option value `T`. None evaluates to `false`.

<details>
  <summary>Example</summary>

```ts
Option
  .filter((x: number) => x >= 5)(Some(2)); // evaluates to false

Option
  .filter((x: number) => x >= 5)(Some(42)); // evaluates to true

Option
  .filter((x: number) => x >= 5)(None); // evaluates to false
```

</details>

#### `Option.flatMap`

Signature:
`flatMap(fn: (value: T) => Option<U>): (option: Option<T>) => Option<U>`

Option.flatMap applies a function `fn` to the content of option `T` and
transforms it into an option `U`.

<details>
  <summary>Example</summary>

```ts
type TryParse = (input: string) => Option<number>;

const tryParse: TryParse = (input: string) => {
  const value = parseInt(input);
  return isNaN(value) ? None : Some(value);
};

Option
  .flatMap(tryParse)(Some("42")); // Evaluates to Some 42

Option
  .flatMap(tryParse)(Some("Forty-two")); // Evaluates to None

Option
  .flatMap(tryParse)(None); // Evaluates to None
```

</details>

#### `Option.inspect`

Signature: `inspect(fn: (value: T) => void): (option: Option<T>) => Option<T>`

Option.inspect calls the provided function `fn` with a reference to the
contained option value `T` if the option is some.

<details>
  <summary>Example</summary>

```ts
Option
  .inspect((x: number) => console.log(x * 2))(Some(42)); // Prints 84

Option
  .inspect((x: number) => console.log(x * 2))(None); // Prints nothing
```

</details>

#### `Option.map`

Signature: `map(fn: (value: T) => U): (option: Option<T>) => Option<U>`

Option.map applies a function `fn` to option value `T` and transforms it into
value `U`.

<details>
  <summary>Example</summary>

```ts
Option
  .map((x: number) => x * 2)(Some(42)); // Evaluates to Some 84

Option
  .map((x: number) => x * 2)(None); // Evaluates to None
```

</details>

#### `Option.match`

Signature:
`match(onSome: (value: T) => U1, onNone: () => U2): (option: Option<T>) => U1 | U2`

Option.match transforms the option value `T` into `U1` using `onSome` and then
returns `U1`. If the option is None, `onNone` is called and `U2` returned.

<details>
  <summary>Example</summary>

```ts
Option
  .match((x: number) => x * 2, () => 99)(Some(42)); // Evaluates to 84

Option
  .match((x: number) => x * 2, () => 99)(None); // Evaluates to 99
```

</details>

#### `Option.unwrapOr`

Signature: `unwrapOr(defaultValue: T): (option: Option<T>) => T`

Option.unwrapOr returns the value `T` from the associated option or returns the
default value if the option is `None`.

<details>
  <summary>Example</summary>

```ts
Option
  .unwrapOr(99)(Some(42)); // Evaluates to 42

Option
  .unwrapOr(99)(None); // Evaluates to 99
```

</details>

### Option static methods

Static methods for working with options.

#### `Option.from`

Signature: `from(value: T | (() => T)): From<T>`

Option.from converts a nullable value, non-nullable value, a function or a
promise to an option.

<details>
  <summary>Example</summary>

```ts
Option
  .from(undefined); // Evaluates to None

Option
  .from(null); // Evaluates to None

Option
  .from(42); // Evaluates to Some 42

Option
  .from(() => 42); // Evaluates to Some 42

Option
  .from(() => Promise.resolve(42)); // Evaluates to Promise<Some 42>

Option
  .from(() => Promise.reject()); // Evaluates to Promise<None>

Option
  .from(Promise.resolve(42)); // Evaluates to Promise<Some 42>

Option
  .from(Promise.resolve(undefined)); // Evaluates to Promise<None>

Option
  .from(Promise.reject()); // Evaluates to Promise<None>
```

</details>

#### `Option.isNone`

Signature: `isNone(option: Option<T>): option is None`

Option.isNone returns `true` if the option is `None`

<details>
  <summary>Example</summary>

```ts
Option
  .isNone(Some(42)); // Evaluates to false

Option
  .isNone(None); // Evaluates to true
```

</details>

#### `Option.isSome`

Signature: `isSome(option: Option<T>): option is Some<T>`

Option.isSome returns `true` if the option is `Some`

<details>
  <summary>Example</summary>

```ts
Option
  .isSome(Some(42)); // Evaluates to true

Option
  .isSome(None); // Evaluates to false
```

</details>

#### `Option.none`

Signature: `none(): None`

Option.none returns a None option.

<details>
  <summary>Example</summary>

```ts
Option
  .none(); // Evaluates to None
```

</details>

#### `Option.some`

Signature: `some(value: NonNullable<T>): Some<NonNullable<T>>`

Option.some creates an option Some with value `T`.

<details>
  <summary>Example</summary>

```ts
Option
  .some(42); // Evaluates to Some 42

Option
  .some(undefined); // Throws an exception or compiler error!

Option
  .some(null); // Throws an exception or compiler error!
```

</details>

#### `Option.unwrap`

Signature: `unwrap(option: Option<T>): T`

Option.unwrap returns the value `T` from the associated option if it is `Some`;
otherwise it will throw.

<details>
  <summary>Example</summary>

```ts
Option
  .unwrap(Some(42)); // Evaluates to 42

Option
  .unwrap(None); // Throws an exception!
```

</details>
