/**
 * @module
 *
 * Option represents the presence of a value `Some` or the absence of a value
 * `None`. It's commonly utilized to manage computations that might or might not
 * yield a result, or those that could potentially fail.
 *
 * Option is particularly useful, when dealing with operations that may return
 * `null` or `undefined` values, providing a structured and safe approach to
 * manage such scenarios.
 *
 * By using option, the need for imperative and explicit `null` or `undefined`
 * checks diminishes, reducing code noise and allowing for clearer focus on
 * essential domain logic. Essentially, the Option enables to focus primarily
 * on the 'happy path'.
 *
 * ```ts
 * import { Option } from "@fp-utils/option";
 *
 * type BookId = number;
 * type BookName = string;
 *
 * const books = new Map<BookId, BookName>([
 *   [1, "The Hobbit"],
 *   [2, "The Fellowship of the Ring"],
 * ]);
 *
 * const tryGetBook = (id: BookId): Option<BookName> =>
 *   Option.from(books.get(id));
 *
 * // Evaluates to None
 * const bookNotFound = tryGetBook(0);
 *
 * // Evaluates to Some "The Hobbit"
 * const bookFound = tryGetBook(1);
 * ```
 */

import { Option } from "./option.ts";
import type { None as _None, Some as _Some } from "./option.ts";

export { Option };

/**
 * Some creates an option Some with value `T`.
 *
 * @example
 * ```ts
 * Some(42); // Evaluates to Some 42
 *
 * Some(undefined); // Throws an exception or compiler error!
 *
 * Some(null); // Throws an exception or compiler error!
 * ```
 */
export const Some = Option.some;

/**
 * None returns a None option.
 *
 * @example
 * ```ts
 * const none = None; // Evaluates to None
 * ```
 */
export const None: None = Option.none();

/** Some represents the presence of a value `T` contained in the option. */
export interface Some<T> extends _Some<T> {}

/** None represents the absence of a value. */
export interface None extends _None {}
