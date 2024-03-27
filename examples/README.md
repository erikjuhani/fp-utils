## Library Comparison

The intent of the comparison example is to compare functionality from other
similar utility libraries as `@fp-utils`. The code examples can be found
[here](/examples/fp_utils_comparison.ts). This is not supposed to be a vast
comparison between all the functionality, but rather an overview of some of the
differences.

The modules compared to are in no particular order the following:

- `oxide.ts`
- `@oxi/result`
- `@mobily/ts-belt`
- `ts-result-es`
- `@badrap/result`

Requirements for the modules in this comparison were the following:

- At least over 1000 weekly downloads in npm
- Typescript support
- Has to contain Result or Option modules (Either or Maybe)

Each module is contained within a corresponding namespace in this comparison
file. Each of the modules have the same expectations and functions defined.
Although with some of the libraries we need to make compromises with the
expectations.

### Benchmarks

Each of the libraries are contained within their own namespace (fpUtils =
@fp-utils, oxideTs = oxide.ts, and so forth). For code details check the actual
file [here](/examples/fp_utils_comparison.ts). `@fp-utils/result` is used as the
baseline

```
date: Wed Mar 27 08:22:16 EET 2024
cpu: Apple M1
runtime: deno 1.41.3 (aarch64-apple-darwin)

benchmark                        time (avg)        iter/s             (min … max)       p75       p99      p995
--------------------------------------------------------------------------------- -----------------------------

group ok
fpUtils.ok                       27.66 ns/iter  36,158,355.8    (25.1 ns … 74.03 ns) 30.48 ns 37.2 ns 45.03 ns
oxi.ok                           27.56 ns/iter  36,281,038.9   (25.07 ns … 39.97 ns) 30.63 ns 36.52 ns 36.97 ns
oxideTs.ok                       28.52 ns/iter  35,057,118.2    (25.3 ns … 71.14 ns) 31.29 ns 39.88 ns 41.87 ns
tsBelt.ok                        36.16 ns/iter  27,655,533.1    (33.6 ns … 46.38 ns) 39.67 ns 43.98 ns 44.6 ns
tsResultEs.ok                    45.41 ns/iter  22,023,062.5  (42.04 ns … 104.22 ns) 48.43 ns 55.75 ns 60.73 ns
badrap.ok                        27.93 ns/iter  35,808,006.7   (25.59 ns … 37.56 ns) 31.17 ns 33.33 ns 36.52 ns

summary
  fpUtils.ok
   1x slower than oxi.ok
   1.01x faster than badrap.ok
   1.03x faster than oxideTs.ok
   1.31x faster than tsBelt.ok
   1.64x faster than tsResultEs.ok

group map
fpUtils.map                       41.7 ns/iter  23,983,006.2   (37.98 ns … 82.31 ns) 44.46 ns 51.25 ns 55.43 ns
oxi.map                          58.87 ns/iter  16,986,591.8    (53.2 ns … 80.77 ns) 60.06 ns 67.63 ns 67.97 ns
oxideTs.map                      62.11 ns/iter  16,101,609.8   (57.1 ns … 126.62 ns) 64.71 ns 72.92 ns 73.67 ns
tsBelt.map                       93.75 ns/iter  10,667,223.6     (90 ns … 180.95 ns) 93.52 ns 108.34 ns 117.61 ns
tsResultEs.map                   58.64 ns/iter  17,054,495.3    (54.3 ns … 70.97 ns) 61.75 ns 66.69 ns 67.31 ns
badrap.map                       79.75 ns/iter  12,539,139.5  (75.28 ns … 159.92 ns) 79.89 ns 99.73 ns 107.49 ns

summary
  fpUtils.map
   1.41x faster than tsResultEs.map
   1.41x faster than oxi.map
   1.49x faster than oxideTs.map
   1.91x faster than badrap.map
   2.25x faster than tsBelt.map

group interoperability
fpUtils.interoperability        751.55 ns/iter   1,330,588.4   (233.38 ns … 2.65 µs) 1.02 µs 2.65 µs 2.65 µs
oxi.interoperability            760.21 ns/iter   1,315,424.1   (230.42 ns … 2.29 µs) 979.53 ns 2.29 µs 2.29 µs
oxideTs.interoperability        685.51 ns/iter   1,458,774.0    (228.3 ns … 2.59 µs) 906.75 ns 2.59 µs 2.59 µs
tsBelt.interoperability         985.86 ns/iter   1,014,342.9   (328.65 ns … 2.81 µs) 1.11 µs 2.81 µs 2.81 µs
tsResultEs.interoperability     668.76 ns/iter   1,495,299.6   (215.94 ns … 2.15 µs) 932.88 ns 2.15 µs 2.15 µs
badrap.interoperability         726.21 ns/iter   1,377,012.6   (229.78 ns … 2.29 µs) 937.91 ns 2.29 µs 2.29 µs

summary
  fpUtils.interoperability
   1.12x slower than tsResultEs.interoperability
   1.1x slower than oxideTs.interoperability
   1.03x slower than badrap.interoperability
   1.01x faster than oxi.interoperability
   1.31x faster than tsBelt.interoperability

group union
fpUtils.union                   556.19 ns/iter   1,797,936.8   (108.79 ns … 2.19 µs) 501.11 ns 1.57 µs 2.19 µs
oxi.union                       571.59 ns/iter   1,749,520.9      (120.33 ns … 2 µs) 548.9 ns 2 µs 2 µs
oxideTs.union                   603.92 ns/iter   1,655,852.6   (129.03 ns … 2.21 µs) 851.88 ns 2.21 µs 2.21 µs
tsBelt.union                    707.12 ns/iter   1,414,195.3   (188.53 ns … 2.16 µs) 865.82 ns 2.16 µs 2.16 µs
tsResultEs.union                631.94 ns/iter   1,582,432.3   (137.36 ns … 1.61 µs) 989.83 ns 1.61 µs 1.61 µs
badrap.union                    555.64 ns/iter   1,799,731.1   (109.62 ns … 1.73 µs) 527.59 ns 1.73 µs 1.73 µs

summary
  fpUtils.union
   1x slower than badrap.union
   1.03x faster than oxi.union
   1.09x faster than oxideTs.union
   1.14x faster than tsResultEs.union
   1.27x faster than tsBelt.union
```
