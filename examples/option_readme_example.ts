import { Option } from "@fp-utils/option";
import { std } from "dev_deps";

const { assert } = std;

type BookId = number;
type BookName = string;

const books = new Map<BookId, BookName>([
  [1, "The Hobbit"],
  [2, "The Fellowship of the Ring"],
]);

const tryGetBook = (id: BookId): Option<BookName> =>
  Option.fromNullable(books.get(id));

const bookFound = tryGetBook(1);

assert.assertEquals(
  bookFound,
  Option.some("The Hobbit"),
);

const bookNotFound = tryGetBook(0);

assert.assertEquals(
  bookNotFound,
  Option.none(),
);
