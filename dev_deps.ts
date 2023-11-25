import { build, emptyDir } from "https://deno.land/x/dnt@0.39.0/mod.ts";
import { parse } from "https://deno.land/std@0.208.0/flags/mod.ts";

export const dnt = { build, emptyDir };

export const std = {
  flags: {
    parse,
  },
};
