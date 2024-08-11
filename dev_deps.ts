/**
 * @module
 * This file acts similarly to "dev_dependencies" in package.json.
 * Dependencies can be quickly updated by running `deno task up`.
 *
 * The versions are defined in the `deno.jsonc` file.
 */
import "@deno/dnt";
import "@std/assert";
import "@std/cli";
import "@std/testing/mock";
import "terser";
import "fast-check";
