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
// deno
import { Result } from "https://deno.land/x/fp_utils@0.1.0/result/mod.ts";

// node
import { Result } from "@fp-utils/result";

const parseJSON = <R extends Record<string, unknown>>(rawJson: string) =>
  Result.fromThrowable<R, SyntaxError>(() => JSON.parse(rawJson))
    .mapErr((err) => err.message);

type JSONWithProperty = { property: number };

const invalidJSON = parseJSON<JSONWithProperty>(""); // SyntaxError

const validateJSON = (json: Record<string, unknown>) => {
  const isJSONWithProperty = (value: any): value is JSONWithProperty =>
    "property" in value;

  if (isJSONWithProperty(json)) return json;

  throw new Error(
    `Wrong type of json, expected "property" field, got "${Object.keys(json)}"`,
  );
};

const invalidJSONContent = parseJSON('{ "prop": 42 }').flatMap((json) =>
  Result.fromThrowable(() => validateJSON(json))
); // Err Wrong type of json, expected "property" got "prop"

const validJSONContent = parseJSON('{ "property": 42 }').flatMap((json) =>
  Result.fromThrowable(() => validateJSON(json))
); // Ok { property: 42 }
```

## Usage

### `Result.flatMap`

Signature: `<U>(fn: (value: T) => Result<U, TError>): Result<U, TError>`

Result.flatMap applies a function `fn` to the content of a result `T` and
transforms it into a result containing value `U`.

<details>
<summary>Example</summary>

```ts
type TryParse = (input: string) => Result<number, string>;

const tryParse: TryParse = (input: string) => {
  const value = parseInt(input);
  return isNaN(value) ? Result.err("could not parse") : Result.ok(value);
};

Result.err("message")
  .flatMap(tryParse); // Evaluates to Err "message"

Result.ok("42")
  .flatMap(tryParse); // Evaluates to Ok 42

Result.ok("Forty-two")
  .flatMap(tryParse); // Evaluates to Err "could not parse"
```

</details>

### `Result.inspect`

Signature: `(fn: (value: T) => void): Result<T, TError>`

Result.inspect calls the provided function `fn` with a reference to the
contained result value `T` if the result is ok.

<details>
  <summary>Example</summary>

```ts
Result.err(42)
  .inspect((x) => console.log(x * 2)); // Prints nothing

Result.ok(42)
  .inspect((x) => console.log(x * 2)); // Evaluates to 84
```

</details>

### `Result.inspectErr`

Signature: `(fn: (value: TError) => void): Result<T, TError>`

Result.inspectErr calls the provided function `fn` with a reference to the
contained result error value `TError` if the result is err.

<details>
  <summary>Example</summary>

```ts
Result.err(42)
  .inspectErr((x) => console.log(x * 2)); // Evaluates to 84

Result.ok(42)
  .inspectErr((x) => console.log(x * 2)); // Prints nothing
```

</details>

### `Result.map`

Signature: `<U>(fn: (value: T) => U): Result<U, TError>`

Result.map applies a function `fn` to result value `T` and transforms it into
value `U`.

<details>
  <summary>Example</summary>

```ts
Result.err(42)
  .map((x) => x * 2); // Evaluates to Err 42

Result.ok(42)
  .map((x) => x * 2); // Evaluates to Ok 84
```

</details>

### `Result.mapErr`

Signature: `<U>(fn: (value: TError) => U): Result<U, TError>`

Result.mapErr applies a function `fn` to result error value `TError` and
transforms it into value `U`.

<details>
  <summary>Example</summary>

```ts
Result.err(42)
  .mapErr((x) => x * 2); // Evaluates to Err 84

Result.ok(42)
  .mapErr((x) => x * 2); // Evaluates to Ok 42
```

</details>

### `Result.match`

Signature: `<U>(onErr: (value: TError) => U, onOk: (value: T) => U): U`

Result.match transforms the result value `T` into `U1` using `onOk` and then
returns `U1`. If the result is Err, the error value `TError` is transformed to
`U2` with `onErr` and then returns `U2`.

<details>
  <summary>Example</summary>

```ts
Result.err(42)
  .match((err) => err + 10, (x) => x * 2); // Evaluates to 52

Result.ok(42)
  .match((err) => err + 10, (x) => x * 2); // Evaluates to 84
```

</details>

### `Result.unwrap`

Signature: `(): T`

Result.unwrap returns the value `T` from the associated result if it is `Ok`;
otherwise it will throw.

<details>
  <summary>Example</summary>

```ts
Result.ok(42).unwrap(); // Evaluates to 42

Result.err(42).unwrap(); // Throws an exception!
```

</details>

### `Result.unwrapErr`

Signature: `(): TError`

Result.unwrapErr returns the value `TError` from the associated result if it is
`Err`; otherwise it will throw.

<details>
  <summary>Example</summary>

```ts
Result.ok(42).unwrapErr(); // Throws an exception!

Result.err(42).unwrapErr(); // Evaluates to 42
```

</details>

### `Result.unwrapOr`

Signature: `(defaultValue: T): T`

Result.unwrapOr returns the value `T` from the associated result or returns the
default value if the result is `Err`.

<details>
  <summary>Example</summary>

```ts
Result.ok(42).unwrapOr(99); // Evaluates to 42

Result.err(42).unwrapOr(99); // Evaluates to 99
```

</details>

### `Result.isOk`

Signature: `<T>(): this is Ok<T>`

Result.isOk returns `true` if the result is `Ok`.

<details>
  <summary>Example</summary>

```ts
Result.err(42).isOk(); // Evaluates to false

Result.ok(42).isOk(); // Evaluates to true
```

</details>

### `Result.isErr`

Signature: `<T>(): this is Err<TError>`

Result.isErr returns `true` if the result is `Err`.

<details>
  <summary>Example</summary>

```ts
Result.err(42).isErr(); // Evaluates to true

Result.ok(42).isErr(); // Evaluates to false
```

</details>
