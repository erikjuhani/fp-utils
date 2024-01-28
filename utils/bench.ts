export type BenchFn = (
  context: Deno.BenchContext,
) => void | Promise<void>;

export type Bench = {
  [name: string]: BenchFn;
};

export type BenchSchema = {
  [group: string]: Bench;
};

export function bench(benchSchema: BenchSchema) {
  Object.entries(benchSchema).forEach(([group, bench]) => {
    Object.entries(bench).forEach(([name, fn], index) => {
      Deno.bench(
        `${name}.${group}`,
        { group, baseline: index === 0 },
        fn,
      );
    });
  });
}
