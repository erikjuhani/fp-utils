import * as Option from "option";

const tryGetHead = <T extends NonNullable<unknown>>(arr: T[]) =>
  arr.length ? Option.some(arr[0]) : Option.none();

const toUpperCase = (value: string) => value.toUpperCase();

const headToUpperCase = (arr: string[]) =>
  tryGetHead(arr)
    .map(toUpperCase)
    .match(
      () => "Nothing to uppercase",
      (value) => value,
    );

headToUpperCase([]); // Nothing to uppercase
headToUpperCase(["fp-utils"]); // FP-UTILS
