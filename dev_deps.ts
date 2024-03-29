import { build, emptyDir } from "https://deno.land/x/dnt@0.39.0/mod.ts";
import { parse } from "https://deno.land/std@0.208.0/flags/mod.ts";
import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.208.0/testing/mock.ts";
export {
  assertType,
  type IsExact,
} from "https://deno.land/std@0.208.0/testing/types.ts";

export const dnt = { build, emptyDir };

export const std = {
  flags: {
    parse,
  },
  assert: { assertEquals, assertThrows },
  testing: {
    mock: { assertSpyCalls, spy },
  },
};
