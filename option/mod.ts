import { None as _None, Option, Some as _Some } from "./option.ts";

export { Option };

export const Some = new Proxy<typeof Option.some>(Option.some, {
  apply(target, _, args) {
    return target(args[0]);
  },
});

export const None = new Proxy<None>(Option.none(), {
  apply(target) {
    return target;
  },
});

// deno-lint-ignore no-empty-interface
export interface Some<T> extends _Some<T> {}
// deno-lint-ignore no-empty-interface
export interface None extends _None {}
