/**
 * @module
 *
 * Result encapsulates two possible values: a successful result `Ok` or an
 * error `Err`. Result allows to chain together a series of operations that can
 * potentially fail and propagate the error through the computations. This
 * enables to write code that is more focused on the 'happy path' and separate
 * the error handling logic in a clean and concise way.
 *
 * When a computation succeeds, Result carries the successful value and allows
 * you to continue chaining operations on it. If at any point an error occurs,
 * the error value is propagated, and subsequent operations are bypassed
 * until an error handler is encountered, which enables explicit handling of
 * both the success and error cases making the code easier to reason about.
 *
 * Result is similar to Option, the main difference is that it holds either a
 * value or an error, and not value or none.
 *
 * ```ts
 * import { Result } from "@fp-utils/result";
 *
 * type BookIndex = number;
 * type BookName = string;
 *
 * const books = ["The Hobbit", "The Fellowship of the Ring"];
 *
 * const tryGetBook = (index: BookIndex): Result<BookName, string> =>
 *  books[index]
 *    ? Ok(books[index])
 *    : Err(`Cannot find a book with index ${index}`);
 *
 * // Evaluates to Ok "The Fellowship of the Ring"
 * const bookFound = tryGetBook(1);
 *
 * // Evaluates to Err "Cannot find a book with index 2"
 * const bookNotFound = tryGetBook(2);
 * ```
 */

import { Err as _Err, Ok as _Ok, Result } from "./result.ts";

export { Result };

/** Ok represents a succesful computation with value `T` contained in the result. */
export const Ok = Result.ok;

/** Err represents a failing computation with value `T` contained in the result. */
export const Err = Result.err;

// deno-lint-ignore no-empty-interface
export interface Ok<T> extends _Ok<T> {}
// deno-lint-ignore no-empty-interface
export interface Err<TError> extends _Err<TError> {}
