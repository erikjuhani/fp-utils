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
cpu: Apple M1
runtime: deno 1.41.3 (aarch64-apple-darwin)

benchmark                        time (avg)        iter/s             (min   max)       p75       p99      p995
--------------------------------------------------------------------------------- -----------------------------

group ok
fpUtils.ok                       27.71 ns/iter  36,091,522.1   (25.07 ns   50.17 ns) 30.98 ns 36.6 ns 37.48 ns
oxi.ok                           28.08 ns/iter  35,616,959.0   (25.23 ns   83.52 ns) 31.12 ns 37.25 ns 38.46 ns
oxideTs.ok                       28.09 ns/iter  35,603,539.9   (25.35 ns   44.59 ns) 31.43 ns 37.38 ns 38.78 ns
tsBelt.ok                        35.89 ns/iter  27,860,019.2    (32.94 ns   73.7 ns) 39.12 ns 45.16 ns 48 ns
tsResultEs.ok                    44.88 ns/iter  22,282,720.9   (41.97 ns   53.96 ns) 48.17 ns 52.46 ns 53.41 ns
badrap.ok                        28.41 ns/iter  35,195,248.8   (25.55 ns   71.42 ns) 31.48 ns 37.76 ns 38.53 ns

summary
  fpUtils.ok
   1.01x faster than oxi.ok
   1.01x faster than oxideTs.ok
   1.03x faster than badrap.ok
   1.3x faster than tsBelt.ok
   1.62x faster than tsResultEs.ok

group map
fpUtils.map                      39.69 ns/iter  25,192,111.8   (36.82 ns   57.38 ns) 42.87 ns 47.72 ns 48.38 ns
oxi.map                          60.08 ns/iter  16,645,474.7  (53.07 ns   143.45 ns) 60.58 ns 71 ns 82.83 ns
oxideTs.map                      61.34 ns/iter  16,303,220.4   (57.07 ns   78.93 ns) 64.26 ns 68.25 ns 68.62 ns
tsBelt.map                       92.89 ns/iter  10,764,978.4  (89.73 ns   140.47 ns) 93.12 ns 108.98 ns 118.19 ns
tsResultEs.map                   59.92 ns/iter  16,688,105.4   (55.18 ns   75.35 ns) 63.16 ns 66.43 ns 66.66 ns
badrap.map                       80.71 ns/iter  12,389,526.6  (75.72 ns   132.51 ns) 82.56 ns 112.11 ns 125.22 ns

summary
  fpUtils.map
   1.51x faster than tsResultEs.map
   1.51x faster than oxi.map
   1.55x faster than oxideTs.map
   2.03x faster than badrap.map
   2.34x faster than tsBelt.map

group interoperability
fpUtils.interoperability         758.4 ns/iter   1,318,564.0   (234.87 ns   2.29 µs) 1.06 µs 2.29 µs 2.29 µs
oxi.interoperability            761.71 ns/iter   1,312,840.9   (229.43 ns   2.23 µs) 923.45 ns 2.23 µs 2.23 µs
oxideTs.interoperability        669.62 ns/iter   1,493,395.0    (233.57 ns   2.6 µs) 945.48 ns 2.6 µs 2.6 µs
tsBelt.interoperability         922.99 ns/iter   1,083,431.1    (324.13 ns   3.1 µs) 1.14 µs 3.1 µs 3.1 µs
tsResultEs.interoperability     652.56 ns/iter   1,532,425.6   (216.84 ns   2.09 µs) 905.93 ns 2.09 µs 2.09 µs
badrap.interoperability         636.95 ns/iter   1,569,987.1   (228.53 ns   2.52 µs) 904.88 ns 2.52 µs 2.52 µs

summary
  fpUtils.interoperability
   1.19x slower than badrap.interoperability
   1.16x slower than tsResultEs.interoperability
   1.13x slower than oxideTs.interoperability
   1x faster than oxi.interoperability
   1.22x faster than tsBelt.interoperability

group union
fpUtils.union                   554.48 ns/iter   1,803,487.8   (113.96 ns   2.05 µs) 523.48 ns 2.05 µs 2.05 µs
oxi.union                       604.66 ns/iter   1,653,815.6   (119.99 ns   2.22 µs) 767.15 ns 2.22 µs 2.22 µs
oxideTs.union                   536.97 ns/iter   1,862,318.4   (125.58 ns   1.72 µs) 522.44 ns 1.37 µs 1.72 µs
tsBelt.union                    718.68 ns/iter   1,391,436.0    (183.4 ns   2.17 µs) 837.82 ns 2.17 µs 2.17 µs
tsResultEs.union                589.98 ns/iter   1,694,984.0   (135.16 ns   2.07 µs) 818.8 ns 2.07 µs 2.07 µs
badrap.union                    586.54 ns/iter   1,704,926.5   (107.72 ns   1.49 µs) 669.36 ns 1.45 µs 1.49 µs

summary
  fpUtils.union
   1.03x slower than oxideTs.union
   1.06x faster than badrap.union
   1.06x faster than tsResultEs.union
   1.09x faster than oxi.union
   1.3x faster than tsBelt.union
```
