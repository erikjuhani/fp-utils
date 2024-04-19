// Demonstrates how the Option type can be used with existing Map get
// functionality.

import { Option } from "@fp-utils/option";

const map = new Map([["1", { name: "deno" }]]);

const tryGet = (id: string) => Option.from(map.get(id));

const notFound = tryGet("0"); // Evaluates to None

console.log(notFound);

const found = tryGet("1"); // Evaluates to Some { name: "deno" }

console.log(found);
