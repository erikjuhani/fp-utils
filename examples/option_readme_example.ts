import { assertEquals } from "@std/assert";
import { None, Option, Some } from "@fp-utils/option";

type BookId = number;
type BookName = string;

const books = new Map<BookId, BookName>([
  [1, "The Hobbit"],
  [2, "The Fellowship of the Ring"],
]);

const tryGetBook = (id: BookId): Option<BookName> => Option.from(books.get(id));

const bookFound = tryGetBook(1);

assertEquals(
  bookFound,
  Some("The Hobbit"),
);

const bookNotFound = tryGetBook(0);

assertEquals(
  bookNotFound,
  None,
);
