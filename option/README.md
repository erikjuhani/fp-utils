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

### `Option.flatMap`

Signature: `<U>(fn: (value: T) => Option<U>): Option<U>`

Option.flatMap applies a function `fn` to the content of option `T` and
transforms it into an option `U`.

<details>
  <summary>Example</summary>

```ts
type TryParse = (input: string) => Option<number>;

const tryParse: TryParse = (input: string) => {
  const value = parseInt(input);
  return isNaN(value) ? Option.none() : Option.some(value);
};

Option.none()
  .flatMap(tryParse); // Evaluates to None

Option.some("42")
  .flatMap(tryParse); // Evaluates to Some 42

Option.some("Forty-two")
  .flatMap(tryParse); // Evaluates to None
```

</details>

### `Option.inspect`

Signature: `(fn: (value: T) => void): Option<T>`

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

Signature: `<U1, U2>(onSome: (value: T) => U1, onNone: () => U2): U1 | U2`

Option.match transforms the option value `T` into `U1` using `onSome` and then
returns `U1`. If the option is None, `onNone` is called and `U2` returned.

<details>
  <summary>Example</summary>

```ts
Option.none()
  .match((x) => x * 2, () => 99); // Evaluates to 99

Option.some(42)
  .match((x) => x * 2, () => 99); // Evaluates to 84
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

Signature: `(defaultValue: T): T`

Option.unwrapOr returns the value `T` from the associated option or returns the
default value if the option is `None`.

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
