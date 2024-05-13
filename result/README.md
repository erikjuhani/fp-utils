# Result

Result encapsulates two possible values: a successful result `Ok` or an error
`Err`. Result allows to chain together a series of operations that can
potentially fail and propagate the error through the computations. This enables
to write code that is more focused on the 'happy path' and separate the error
handling logic in a clean and concise way.

When a computation succeeds, Result carries the successful value and allows you
to continue chaining operations on it. If at any point an error occurs, the
error value is propagated, and subsequent operations are bypassed until an error
handler is encountered, which enables explicit handling of both the success and
error cases making the code easier to reason about.

Result is similar to Option, the main difference is that it holds either a value
or an error, and not value or none.

```ts
import { Err, Ok, Result } from "@fp-utils/result";

type BookIndex = number;
type BookName = string;

const books = ["The Hobbit", "The Fellowship of the Ring"];

const tryGetBook = (index: BookIndex): Result<BookName, string> =>
  books[index]
    ? Ok(books[index])
    : Err(`Cannot find a book with index ${index}`);

// Evaluates to Ok "The Fellowship of the Ring"
const bookFound = tryGetBook(1);

// Evaluates to Err "Cannot find a book with index 2"
const bookNotFound = tryGetBook(2);
```

## Usage

### Constructors

Similar as how `String` or `Number` constructors are used in JavaScript:

Use `Ok(42)` constructor to wrap a value for success and for errors use
`Err(42)` constructor to wrap a value for an error.

<details>
  <summary>Example</summary>

```ts
const ok = Ok(42);
const err = Err(42);
```

</details>

### Result methods

Result methods are chainable functions that enable a sequence of operations with
the contained value `T` in the Result.

#### `Result.expect`

Signature: `(value: string): T`

Result.expect will return the wrapped value if the result is Ok. If the result
is Err the function will throw an error with the given input value as the error
message.

<details>
  <summary>Example</summary>

```ts
Ok(42)
  .expect("Value should exist"); // evaluates 42

Err(42)
  .expect("Value should exist"); // Throws an exception with message Value should exist!
```

</details>

#### `Result.expectErr`

Signature: `(value: string): TError`

Result.expectErr will return the wrapped value if the result is Err. If the
result is Ok the function will throw an error with the given input value as the
error message.

<details>
  <summary>Example</summary>

```ts
Ok(42)
  .expectErr("Value should exist"); // Throws an exception with message Value should exist!

Err(42)
  .expectErr("Value should exist"); // evaluates 42
```

</details>

#### `Result.filter`

Signature: `(predicate: (value: T) => boolean): boolean`

Result.filter returns a boolean that is evaluated with the given `predicate`
function which is applied on the result value `T`. Err evaluates to `false`.

<details>
  <summary>Example</summary>

```ts
Ok(2)
  .filter((x) => x >= 5); // evaluates to false

Ok(42)
  .filter((x) => x >= 5); // evaluates to true

Err(10)
  .filter((x) => x >= 5); // evaluates to false
```

</details>

#### `Result.flatMap`

Signature: `<U>(fn: (value: T) => Result<U, TError>): Result<U, TError>`

Result.flatMap applies a function `fn` to the content of a result `T` and
transforms it into a result containing value `U`.

<details>
<summary>Example</summary>

```ts
type TryParse = (input: string) => Result<number, string>;

const tryParse: TryParse = (input: string) => {
  const value = parseInt(input);
  return isNaN(value) ? Err("could not parse") : Ok(value);
};

Ok("42")
  .flatMap(tryParse); // Evaluates to Ok 42

Ok("Forty-two")
  .flatMap(tryParse); // Evaluates to Err "could not parse"

Err("message")
  .flatMap(tryParse); // Evaluates to Err "message"
```

</details>

#### `Result.inspect`

Signature: `(fn: (value: T) => void): Result<T, TError>`

Result.inspect calls the provided function `fn` with a reference to the
contained result value `T` if the result is ok.

<details>
  <summary>Example</summary>

```ts
Ok(42)
  .inspect((x) => console.log(x * 2)); // Prints 84

Err(42)
  .inspect((x) => console.log(x * 2)); // Prints nothing
```

</details>

#### `Result.inspectErr`

Signature: `(fn: (value: TError) => void): Result<T, TError>`

Result.inspectErr calls the provided function `fn` with a reference to the
contained result error value `TError` if the result is err.

<details>
  <summary>Example</summary>

```ts
Ok(42)
  .inspectErr((x) => console.log(x * 2)); // Prints nothing

Err(42)
  .inspectErr((x) => console.log(x * 2)); // Prints 84
```

</details>

#### `Result.isErr`

Signature: `<T>(): this is Err<TError>`

Result.isErr returns `true` if the result is `Err`.

<details>
  <summary>Example</summary>

```ts
Ok(42)
  .isErr(); // Evaluates to false

Err(42)
  .isErr(); // Evaluates to true
```

</details>

#### `Result.isOk`

Signature: `<T>(): this is Ok<T>`

Result.isOk returns `true` if the result is `Ok`.

<details>
  <summary>Example</summary>

```ts
Ok(42)
  .isOk(); // Evaluates to true

Err(42)
  .isOk(); // Evaluates to false
```

</details>

#### `Result.map`

Signature: `<U>(fn: (value: T) => U): Result<U, TError>`

Result.map applies a function `fn` to result value `T` and transforms it into
value `U`.

<details>
  <summary>Example</summary>

```ts
Ok(42)
  .map((x) => x * 2); // Evaluates to Ok 84

Err(42)
  .map((x) => x * 2); // Evaluates to Err 42
```

</details>

#### `Result.mapErr`

Signature: `<U>(fn: (value: TError) => U): Result<U, TError>`

Result.mapErr applies a function `fn` to result error value `TError` and
transforms it into value `U`.

<details>
  <summary>Example</summary>

```ts
Ok(42)
  .mapErr((x) => x * 2); // Evaluates to Ok 42

Err(42)
  .mapErr((x) => x * 2); // Evaluates to Err 84
```

</details>

#### `Result.match`

Signature: `<U>(onErr: (value: TError) => U, onOk: (value: T) => U): U`

Result.match transforms the result value `T` into `U1` using `onOk` and then
returns `U1`. If the result is Err, the error value `TError` is transformed to
`U2` with `onErr` and then returns `U2`.

<details>
  <summary>Example</summary>

```ts
Ok(42)
  .match((x) => x * 2, (err) => err + 10); // Evaluates to 84

Err(42)
  .match((x) => x * 2, (err) => err + 10); // Evaluates to 52
```

</details>

#### `Result.toString`

Signature: `(): "Ok(value)" | "Err(value)"`

Result.toString returns the string representation of the result and the
stringified value as `Ok(value)` if the result is `Ok` or `Err(value)` if the
result is `Err`.

<details>
  <summary>Example</summary>

```ts
Ok(42)
  .toString(); // Evaluates to "Ok(42)"

Err(42)
  .toString(); // Evaluates to "Err(42)"
```

</details>

#### `Result.unwrap`

Signature: `(): T`

Result.unwrap returns the value `T` from the associated result if it is `Ok`;
otherwise it will throw.

<details>
  <summary>Example</summary>

```ts
Ok(42)
  .unwrap(); // Evaluates to 42

Err(42)
  .unwrap(); // Throws an exception!
```

</details>

#### `Result.unwrapErr`

Signature: `(): TError`

Result.unwrapErr returns the value `TError` from the associated result if it is
`Err`; otherwise it will throw.

<details>
  <summary>Example</summary>

```ts
Ok(42)
  .unwrapErr(); // Throws an exception!

Err(42)
  .unwrapErr(); // Evaluates to 42
```

</details>

#### `Result.unwrapOr`

Signature: `(defaultValue: T): T`

Result.unwrapOr returns the value `T` from the associated result or returns the
default value if the result is `Err`.

<details>
  <summary>Example</summary>

```ts
Ok(42)
  .unwrapOr(99); // Evaluates to 42

Err(42)
  .unwrapOr(99); // Evaluates to 99
```

</details>

### Result higher-order functions

Result higher-order functions enable chainability of Result Ok `T` or Err
`TError`> values within callbacks.

```ts
Promise.resolve(42)
  .then(Result.from) // Evaluates to Ok 42
  .then(Result.inspect) // Prints 42
  .then(Result.map((value) => value + 10)) // Evaluates to 52
  .then(Result.unwrap); // Returns 52
```

#### `Result.expect`

Signature: `expect(value: string): (result: Result<T, TError>) => T`

Result.expect will return the wrapped value if the result is Ok. If the result
is Err the function will throw an error with the given input value as the error
message.

<details>
  <summary>Example</summary>

```ts
Result
  .expect("Value should exist")(Ok(42)); // Evaluates 42

Result
  .expect("Value should exist")(Err(42)); // Throws an exception with message Value should exist!
```

</details>

#### `Result.expectErr`

Signature: `expectErr(value: string): (result: Result<T, TError>) => TError`

Result.expectErr will return the wrapped value if the result is Err. If the
result is Ok the function will throw an error with the given input value as the
error message.

<details>
  <summary>Example</summary>

```ts
Result
  .expectErr("Value should exist")(Ok(42)); // Throws an exception with message Value should exist!

Result
  .expectErr("Value should exist")(Err(42)); // Evaluates 42
```

</details>

#### `Result.filter`

Signature:
`filter(predicate: (value: T) => boolean): (result: Result<T, TError>) => boolean`

Result.filter returns a boolean that is evaluated with the given `predicate`
function which is applied on the result value `T`. Err evaluates to `false`.

<details>
  <summary>Example</summary>

```ts
Result
  .filter((x: number) => x >= 5)(Ok(2)); // evaluates to false

Result
  .filter((x: number) => x >= 5)(Ok(42)); // evaluates to true

Result
  .filter((x: number) => x >= 5)(Err(10)); // evaluates to false
```

</details>

#### `Result.flatMap`

Signature:
`flatMap(fn: (value: T) => Result<U, UError>): (result: Result<T, TError>) => Result<U, UError>`

Result.flatMap applies a function `fn` to the content of a result `T` and
transforms it into a result containing value `U`.

<details>
<summary>Example</summary>

```ts
type TryParse = (input: string) => Result<number, string>;

const tryParse: TryParse = (input: string) => {
  const value = parseInt(input);
  return isNaN(value) ? Err("could not parse") : Ok(value);
};

Result
  .flatMap(tryParse)(Ok("42")); // Evaluates to Ok 42

Result
  .flatMap(tryParse)(Ok("Forty-two")); // Evaluates to Err "could not parse"

Result
  .flatMap(tryParse)(Err("message")); // Evaluates to Err "message"
```

</details>

#### `Result.inspect`

Signature:
`inspect(fn: (value: T) => void): (result: Result<T, TError>) => Result<T, TError>`

Result.inspect calls the provided function `fn` with a reference to the
contained result value `T` if the result is ok.

<details>
  <summary>Example</summary>

```ts
Result
  .inspect((x: number) => console.log(x * 2))(Ok(42)); // Prints 84

Result
  .inspect((x: number) => console.log(x * 2))(Err(42)); // Prints nothing
```

</details>

#### `Result.inspectErr`

Signature:
`inspectErr(fn: (value: TError) => void): (result: Result<T, TError>) => Result<T, TError>`

Result.inspectErr calls the provided function `fn` with a reference to the
contained result error value `TError` if the result is err.

<details>
  <summary>Example</summary>

```ts
Result
  .inspectErr((x: number) => console.log(x * 2))(Ok(42)); // Prints nothing

Result
  .inspectErr((x: number) => console.log(x * 2))(Err(42)); // Prints 84
```

</details>

#### `Result.map`

Signature:
`map(fn: (value: T) => U): (result: Result<T, TError>) => Result<U, TError>`

Result.map applies a function `fn` to result value `T` and transforms it into
value `U`.

<details>
  <summary>Example</summary>

```ts
Result
  .map((x: number) => x * 2)(Ok(42)); // Evaluates to Ok 84

Result
  .map((x: number) => x * 2)(Err(42)); // Evaluates to Err 42
```

</details>

#### `Result.mapErr`

Signature:
`mapErr(fn: (value: TError) => UError): (result: Result<T, TError>) => Result<T, UError>`

Result.mapErr applies a function `fn` to result error value `TError` and
transforms it into value `U`.

<details>
  <summary>Example</summary>

```ts
Result
  .mapErr((x: number) => x * 2)(Ok(42)); // Evaluates to Ok 42

Result
  .mapErr((x: number) => x * 2)(Err(42)); // Evaluates to Err 84
```

</details>

#### `Result.match`

Signature:
`match(onOk: (value: T) => U1, onErr: (value: TError) => U2): (result: Result<T, TError>) => U1 | U2`

Result.match transforms the result value `T` into `U1` using `onOk` and then
returns `U1`. If the result is Err, the error value `TError` is transformed to
`U2` with `onErr` and then returns `U2`.

<details>
  <summary>Example</summary>

```ts
Result
  .match((x: number) => x * 2, (err: number) => err + 10)(Ok(42)); // Evaluates to 84

Result
  .match((x: number) => x * 2, (err: number) => err + 10)(Err(42)); // Evaluates to 52
```

#### `Result.unwrapOr`

Signature: `unwrapOr(defaultValue: T): (result: Result<T, TError>) => T`

Result.unwrapOr returns the value `T` from the associated result or returns the
default value if the result is `Err`.

<details>
  <summary>Example</summary>

```ts
Result
  .unwrapOr(99)(Ok(42)); // Evaluates to 42

Result
  .unwrapOr(99)(Err(42)); // Evaluates to 99
```

</details>

</details>

### Result static methods

Static methods for working with results.

#### `Result.err`

Signature: `err(value?: T): Err<T>`

Result.err creates a result Err with error value `T`. Type `undefined` can be
interpreted to have the same significance as the `unit` type. Unit type
signifies the absence of a specific value and acts as a placeholder when no
other value exits or is needed.

<details>
  <summary>Example</summary>

```ts
Result
  .err("error"); // Evaluates to Err "error"

Result
  .err(42); // Evaluates to Err 42

Result
  .err(); // Evaluates to Err undefined

Result
  .err(null); // Evaluates to Err null
```

</details>

#### `Result.from`

Signature:
`from(value: T | (() => T), expected?: TError | ((value: any) => TError)): From<T, TError>`

Result.from converts a value, a throwing function, or a promise to a Result
type. A function is recursively evaluated until another value than function is
returned. If the function throws `Err<TError>` will be returned.

The `Err<TError>` return value can be controlled by the expected optional
parameter and if given a map function the error value can be mapped. If the
parameter is not given the function returns type `Result<T, unknown>`.

When the function receives undefined value Ok<undefined> will be returned.

<details>
  <summary>Example</summary>

```ts
Result
  .from(42); // Evaluates to Ok 42

Result
  .from(undefined); // Evaluates to Ok undefined

Result
  .from(Promise.resolve(42), "Rejected"); // Evaluates to Ok 42

Result
  .from(Promise.resolve(), "Rejected"); // Evaluates to Promise Ok undefined

Result
  .from(fetch("https://example.com"), "Rejected"); // Evaluates to Promise Result<Response, "Rejected">

Result
  .from(Promise.reject(), "Rejected"); // Evaluates to Promise Err "Rejected"

Result
  .from<R, SyntaxError>(() => JSON.parse(rawJson)); // Evaluates to Result<R, SyntaxError>

Result
  .from(
    () => JSON.parse(rawJson) as ReturnValue,
    (err: SyntaxError) => err.message,
  ); // Evaluates to Result<ReturnValue, string>
```

</details>

#### `Result.isErr`

Signature: `isErr(result: Result<T, TError>): result is Err<TError>`

Result.isErr returns `true` if the result is `Err`.

<details>
  <summary>Example</summary>

```ts
Result
  .isErr(Ok(42)); // Evaluates to false

Result
  .isErr(Err(42)); // Evaluates to true
```

</details>

#### `Result.isOk`

Signature: `isErr(result: Result<T, TError>): result is Ok<T>`

Result.isOk returns `true` if the result is `Ok`.

<details>
  <summary>Example</summary>

```ts
Result
  .isOk(Ok(42)); // Evaluates to true

Result
  .isOk(Err(42)); // Evaluates to false
```

</details>

#### `Result.ok`

Signature: `ok(value?: T): Ok<T>`

Result.ok creates a result Ok with value `T`. If called without arguments
Ok<undefined> is returned. Type `undefined` can be interpreted to have the same
significance as the `unit` type. Unit type signifies the absence of a specific
value and acts as a placeholder when no other value exits or is needed.

<details>
  <summary>Example</summary>

```ts
Result
  .ok("value"); // Evaluates to Ok "value"

Result
  .ok(42); // Evaluates to Ok 42

Result
  .ok(); // Evaluates to Ok undefined

Result
  .ok(null); // Evaluates to Ok null
```

</details>

#### `Result.partition`

Signature: `partition(results: Result<T, TError>[]): [[T], [TError]]`

Result.partition unwraps an array of results into a tuple of unwrapped Ok and
Err values. This is especially useful if for example all errors and success
cases need to be evaluated individually.

<details>
  <summary>Example</summary>

```ts
Result
  .partition([]); // Evaluates to [[], []]

Result
  .partition([Ok(42)]); // Evaluates to [[42], []]

Result
  .partition([Err(42)]); // Evaluates to [[], [42]]

Result
  .partition([Ok(42), Err(84), Ok("Ok"), Err("Error")]); // Evaluates to [[10, "Ok"], ["Error", 84]]
```

</details>

#### `Result.toString`

Signature: `toString(result: Result<T, TError>): "Ok(value)" | "Err(value)"`

Result.toString returns the string representation of the result and the
stringified value as `Ok(value)` if the result is `Ok` or `Err(value)` if the
result is `Err`.

<details>
  <summary>Example</summary>

```ts
Result
  .toString(Ok(42)); // Evaluates to "Ok(42)"

Result
  .toString(Err(42)); // Evaluates to "Err(42)"
```

</details>

#### `Result.unwrap`

Signature: `unwrap(result: Result<T, TError>): T`

Result.unwrap returns the value `T` from the associated result if it is `Ok`;
otherwise it will throw.

<details>
  <summary>Example</summary>

```ts
Result
  .unwrap(Ok(42)); // Evaluates to 42

Result
  .unwrap(Err(42)); // Throws an exception!
```

</details>

#### `Result.unwrapErr`

Signature: `unwrapErr(result: Result<T, TError>): TError`

Result.unwrapErr returns the value `TError` from the associated result if it is
`Err`; otherwise it will throw.

<details>
  <summary>Example</summary>

```ts
Result
  .unwrapErr(Ok(42)); // Throws an exception!

Result
  .unwrapErr(Err(42)); // Evaluates to 42
```

</details>
