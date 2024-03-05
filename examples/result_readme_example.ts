import { Result } from "@fp-utils/result";
import { std } from "dev_deps";

const { assert } = std;

type BookIndex = number;
type BookName = string;

const books = ["The Hobbit", "The Fellowship of the Ring"];

const tryGetBook = (index: BookIndex): Result<BookName, string> =>
  books[index]
    ? Result.ok(books[index])
    : Result.err(`Cannot find a book with index ${index}`);

const bookFound = tryGetBook(1);

assert.assertEquals(
  bookFound,
  Result.ok("The Fellowship of the Ring"),
);

const bookNotFound = tryGetBook(2);

assert.assertEquals(
  bookNotFound,
  Result.err("Cannot find a book with index 2"),
);
