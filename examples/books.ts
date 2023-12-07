// This example demonstrates the use of Option type in a more complex setting,
// a library with borrowing and return system. When books are borrowed they are
// transferred to the patron Map and deleted from the Books Map. Returning
// books does the opposite.
import * as Option from "../option/mod.ts";
import { std } from "dev_deps";

const { assert } = std;

type ID = number;

type Book = {
  id: ID;
  title: string;
  available: boolean;
};

type Patron = {
  id: ID;
  name: string;
  borrowedBooks: Book[];
};

const books = new Map<ID, Book>([
  [1, { id: 1, title: "The Fellowship of the Ring", available: false }],
  [2, { id: 2, title: "The Two Towers", available: false }],
  [3, { id: 3, title: "The Return of the King", available: true }],
  [4, { id: 4, title: "The Hobbit", available: true }],
]);

const patrons = new Map<ID, Patron>([
  [101, { id: 101, name: "Frodo", borrowedBooks: [] }],
  [102, {
    id: 102,
    name: "Samwais",
    borrowedBooks: [
      books.get(1),
      books.get(2),
    ]
      .map(Option.fromNullable)
      .filter(Option.isSome)
      .map(Option.unwrap),
  }],
]);

const tryGetPatronById = (patronId: number) =>
  Option.fromNullable(patrons.get(patronId));

const tryFindBook = (title: string) =>
  Option.fromNullable(
    Array.from(books.values())
      .find((book) => book.title.toLowerCase() === title.toLowerCase()),
  );

const addBorrowedBookForPatron = (patron: Patron) => (book: Book) => {
  const updatedPatron = {
    ...patron,
    borrowedBooks: [...patron.borrowedBooks, book],
  };

  patrons.set(patron.id, updatedPatron);

  return updatedPatron;
};

const removeBorrowedBookFromPatron = (
  [patron, book]: readonly [Patron, Book],
) => {
  const updatedPatron = {
    ...patron,
    borrowedBooks: patron.borrowedBooks.filter((borrowedBook) =>
      book.id !== borrowedBook.id
    ),
  };

  patrons.set(patron.id, updatedPatron);

  return [updatedPatron, book] as const;
};

const updateBookAvailability = (available: boolean) => (book: Book) => {
  books.set(book.id, { ...book, available });
  return book;
};

const updateBorrowedBook = (bookName: string) => (patron: Patron) =>
  tryFindBook(bookName)
    // Log if the book is available
    .inspect((book) =>
      book.available || console.log(`'${bookName}' is not available`)
    )
    // Check that the book is available, if not we do not want to proceed with mutations
    .flatMap((book) => book.available ? Option.some(book) : Option.none())
    // Set the book as not available
    .map(updateBookAvailability(false))
    // Add the book to borrowed books list for patron
    .map(addBorrowedBookForPatron(patron))
    // Log who borrowed what book
    .inspect(() =>
      console.log(
        `'${bookName}' was borrowed by ${patron.name}`,
      )
    );

const borrowBook = (patronId: number, bookName: string) => {
  tryGetPatronById(patronId)
    .inspect((patron) => {
      console.log(`${patron.name} wants to borrow '${bookName}'`);

      patron.borrowedBooks.length >= 2 &&
        console.log(`${patron.name} has already two books borrowed`);
    })
    // Only patrons that have less than 3 books borrowed should be considered
    .flatMap((patron) =>
      patron.borrowedBooks.length < 3 ? Option.some(patron) : Option.none()
    )
    .match(
      () => console.log(`'${bookName}' could not be borrowed`),
      updateBorrowedBook(bookName),
    );
};

const returnBook = (patronId: number, bookId: number) => {
  tryGetPatronById(patronId)
    .inspect((patron) =>
      !patron.borrowedBooks.find((b) => b.id === bookId) &&
      console.log(`${patron.name} has not borrowed a book with id ${bookId}`)
    )
    // Only patrons that have the book should be considered
    .flatMap((patron) =>
      patron.borrowedBooks.find((b) => b.id === bookId)
        ? Option.some(patron)
        : Option.none()
    )
    .flatMap((patron) =>
      Option.fromNullable(
        patron.borrowedBooks.find((book) => bookId === book.id),
      ).map((book) => [patron, book] as const)
    )
    .map(removeBorrowedBookFromPatron)
    .inspect(([patron, book]) =>
      console.log(`'${book.title}' was returned by ${patron.name}`)
    )
    .map(([_, book]) => book)
    .map(updateBookAvailability(true));
};

// Trying to borrow an unavailable book
borrowBook(101, "The fellowship of the ring");
// Frodo wants to borrow 'The fellowship of the ring'
// 'The fellowship of the ring' is not available

assert.assertEquals(
  tryGetPatronById(101).map(({ borrowedBooks }) => borrowedBooks),
  Option.some([]),
);

console.log("---");

// Borrowing a book successfully
borrowBook(101, "The Hobbit");
// Frodo wants to borrow 'The Hobbit'
// 'The Hobbit' was borrowed by Frodo

assert.assertEquals(
  tryGetPatronById(101).map(({ borrowedBooks }) => borrowedBooks),
  Option.some([{ id: 4, title: "The Hobbit", available: true }]),
);

console.log("---");

// Trying to borrow when patron has already borrowed 2 books
borrowBook(102, "The Hobbit");
// Samwais wants to borrow 'The Hobbit'
// Samwais has already two books borrowed
// 'The Hobbit' is not available

assert.assertEquals(
  tryGetPatronById(102).map(({ borrowedBooks }) => borrowedBooks.length),
  Option.some(2),
);

console.log("---");

// Returning a borrowed book succesfully
returnBook(101, 4);
// 'The Hobbit' was returned by Frodo

assert.assertEquals(
  tryGetPatronById(101).map(({ borrowedBooks }) => borrowedBooks),
  Option.some([]),
);

console.log("---");

// Trying to return but has not borrowed by patron
returnBook(101, 1);
// Frodo has not borrowed a book with id 1

assert.assertEquals(
  tryGetPatronById(101).map(({ borrowedBooks }) => borrowedBooks),
  Option.some([]),
);

console.log("---");

// Returning a borrowed book succesfully
returnBook(102, 2);
// 'The Two Towers' was returned by Samwais

assert.assertEquals(
  tryGetPatronById(102).map(({ borrowedBooks }) => borrowedBooks.length),
  Option.some(1),
);
