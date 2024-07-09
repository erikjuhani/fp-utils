## 0.16.0

BREAKING CHANGES:

- [Change type guards to return never instead of false](https://github.com/erikjuhani/fp-utils/commit/88e7f0447a3205d7bf7feae0101d9d4eae4fdd93)
- [Change type guards to return never instead of false in option](https://github.com/erikjuhani/fp-utils/commit/3a11cc7f5514ab475596014d68daf8d132a7acdf)

CHANGES:

- [Add terser to minify code published to npm](https://github.com/erikjuhani/fp-utils/commit/b79677dc608659c40e826ebe8cae0bb95f905e45)

FIXES:

- [Fix details tags in Option and Result README](https://github.com/erikjuhani/fp-utils/commit/2ab1a3f0e0c0ea2ff38291597b275e577a25d3d1)

## 0.15.0

BREAKING CHANGES:

- [Add Result.toJSON method and static variant](https://github.com/erikjuhani/fp-utils/commit/7019c03743dace4d39e9119f94f86b1f7b8f6193)
- [Add Option.toJSON method and static variant](https://github.com/erikjuhani/fp-utils/commit/f08f1bf17bc29a482d13c0281a2134106a5589a4)

## 0.14.0

BREAKING CHANGES:

- [Change build_npm target to ES2022 to support cause property](https://github.com/erikjuhani/fp-utils/commit/48568a5f13620e51b0ae4f11e97843c5144e3d3d)

CHANGES:

- [Add cause property when throwing with expect on Err type](https://github.com/erikjuhani/fp-utils/commit/7a6c57b395133a3c7ee18a8a16e579f9a8fd9a5e)

FEATURES:

- [Add Option.all and Option.any static methods](https://github.com/erikjuhani/fp-utils/commit/71bf4ab2392e09573afc5b9f0b60fbdc901455a4)
- [Add Result.all and Result.any static methods](https://github.com/erikjuhani/fp-utils/commit/5e26b90a61e9aeb31952f31b791c0323c8ca7eff)

## 0.13.1

FEATURES:

- [Add Result.partition static method](https://github.com/erikjuhani/fp-utils/commit/b46e9f53ada4d83caa757003fffeca06dc5adce4)
- [Add Result.toString method and higher-order function variant](https://github.com/erikjuhani/fp-utils/commit/0a0943f75935784f3d6d52f08beedde0b7e64030)
- [Add Option.toString method and higher-order function variant](https://github.com/erikjuhani/fp-utils/commit/290a7ec80130def8e0e5cf8ffff6f3d0ce0a1a69)

## 0.13.0

FEATURES:

- [Add Option.zip method and higher-order function variant](https://github.com/erikjuhani/fp-utils/commit/5e0f2100a5c10c998bee35580184373ef3074ed3)

FIXES:

- [Fix expectErr code examples in Result module README](https://github.com/erikjuhani/fp-utils/commit/bb21167f06264392e899a297125678e64da5ab5f)
- [Fix type inference for unwrap, unwrapErr, isOk and isErr HOFs](https://github.com/erikjuhani/fp-utils/commit/eb3424aa17f10a0fed1c5ab54e57346350da7054)

CHANGES:

- [Improve type inference for result higher order functions](https://github.com/erikjuhani/fp-utils/commit/eef05022981e2663866b1417e7a9bdcb518fb800)
- [Improve type inference for Option flatMap](https://github.com/erikjuhani/fp-utils/commit/1ef1bb29f1f53aa42afb0a33172ea6ab32acd7e6)
- [Improve type inference for Option higher order functions](https://github.com/erikjuhani/fp-utils/commit/2f1e3c91d2f721db10c1acd5083ab6e70aa97cce)

## 0.12.0

FEATURES:

- [Add expect and expectErr for Result](https://github.com/erikjuhani/fp-utils/commit/5b359d1d6c79ee95b965f1a780872cc1aef38b08)

FIXES:

- [Fix imports in Result module documentation code example](https://github.com/erikjuhani/fp-utils/commit/e54475ec0308c790776c881c2a2eec98c4681574)

CHANGES:

- [Improve constructor documentation](https://github.com/erikjuhani/fp-utils/commit/088e4212ce44e379f8b9c6369f3e6fc6910fec9d)
- [Improve Result isOk and isErr type guard type inference](https://github.com/erikjuhani/fp-utils/commit/b829ce916b78836e86c46a93a57a05a0445e572b)
- [Improve Option isSome and isNone type guard type inference](https://github.com/erikjuhani/fp-utils/commit/78e5eb9a771e9d69788370ebce0da653a23783c5)

## 0.11.1

FIXES:

- [Strip comments from option.js and result.js files](https://github.com/erikjuhani/fp-utils/commit/55123c5e7c32eb40acbd2290eaa891cab98757f8)

## 0.11.0

BREAKING CHANGES:

- [Option module overhaul](https://github.com/erikjuhani/fp-utils/commit/feeffa63db6d53d3fa980022e9f627d26bf4578a)
- [Result module overhaul](https://github.com/erikjuhani/fp-utils/commit/544d6b330d0e8862a85dec263ca66eb2c3df71cb)

## 0.10.0

FEATURES:

- [Add Option.filter function to filter options](https://github.com/erikjuhani/fp-utils/commit/c662d76f84897dd3182676b23e02867f8287167f)
- [Add Result.filter function to filter results](https://github.com/erikjuhani/fp-utils/commit/041fb7fc0fca529b4238e159b1503d8ef916c078)
- [Support promise likes with Option.from and Result.from functions](https://github.com/erikjuhani/fp-utils/commit/09b45f7512e1ef56add0e0a3715978780c048e7c)

CHANGES:

- [Better type inference for union types with Option.match](https://github.com/erikjuhani/fp-utils/commit/6ef287f52672f8d6cdcd761982c77487c2dbf2a9)
- [Better type inference for union types with Result.match](https://github.com/erikjuhani/fp-utils/commit/78bad1cb74a3bbe75c8de96023b09b55580dc5d8)
- [Change Result.from to error map function as the second argument](https://github.com/erikjuhani/fp-utils/commit/201510d25cd919b03cb773923fe17b249b1bba52)

FIXES:

- [Fix Option.match and Result.match generic could be any type](https://github.com/erikjuhani/fp-utils/commit/1b607aca793c53e8d02d5a57d03b911a5e1f65a4)

## 0.9.0

BREAKING CHANGES:

- [Use undefined instead of void as the unit type for Result](https://github.com/erikjuhani/fp-utils/commit/622ce74ef7d81d4fa7d7cbc2326683707d0500f8)

CHANGES:

- [Improve return type correctness for Option.from function](https://github.com/erikjuhani/fp-utils/commit/bf1aa6bddb5ad8ef7e557314e4d6c309484449d4)
- [Make the value in Some explicitly of type NonNullable](https://github.com/erikjuhani/fp-utils/commit/d7e81fc315208d3d2f24b4cccbf591eaa93b30a9)
- [Improve type inference for Option type](https://github.com/erikjuhani/fp-utils/commit/d7299901c2be5d8938bb7ac0c0b97eb44db29690)
- [Improve type inference for Result type](https://github.com/erikjuhani/fp-utils/commit/b1db0bd740f02c355d6c0d5adc5df0112eba608b)

## 0.8.0

BREAKING CHANGES:

Functions `Option.fromNullable`, `Option.fromPromise`, `Result.fromThrowable`
and `Result.fromPromise` were removed in favor of using `Option.from` or
`Result.from` instead.

- [Add Result.from function](https://github.com/erikjuhani/fp-utils/commit/0cee6743007ba340f9ddc951811a89cc7e30a423)
- [Add Option.from function](https://github.com/erikjuhani/fp-utils/commit/0dcb11658fbdac2457c73219b3cdb05b81a35c30)

CHANGES:

- [Add @module documentation for Result](https://github.com/erikjuhani/fp-utils/commit/54cf8c6d5deeac325157e146a2403c2a26d6b3cd)
- [Add @module documentation for Option](https://github.com/erikjuhani/fp-utils/commit/a22aa43f6b1d7cab77ba13f2ecc80d2bfbfe8112)

## 0.7.0

FIXES:

- [Fix "slow types" in Option](https://github.com/erikjuhani/fp-utils/commit/17023841fe6e8379095a35b7cfb03ef08d7ce49d)
- [Fix "slow types" in Result](https://github.com/erikjuhani/fp-utils/commit/7b69d5b42093b02677d1061b760ff1201c1ed34f)

## 0.6.0

BREAKING CHANGES:

- [Change the order of arguments in Option match function](https://github.com/erikjuhani/fp-utils/commit/c2a49e63b9d2595cfcf33468f604fdaa8260e025)

CHANGES:

- [Remove comments from transpiled js files](https://github.com/erikjuhani/fp-utils/commit/e5747f15ff04c11ff85c3595bc3f0e234d5ae59b)
- [Add return type for Result.flatMap instead of relying on inference](https://github.com/erikjuhani/fp-utils/commit/87d303392fc379d62f7f96609b20582b819bed06)
- [Allow null values with Result.ok and Result.err](https://github.com/erikjuhani/fp-utils/commit/c26229b61ace28e26d228935fa0b7bc289c770bb)

FIXES:

- [Fix type inference for match and flatMap in Option](https://github.com/erikjuhani/fp-utils/commit/5c44c344bcad59d4bb74a4461178c1a77bde5a9a)
- [Fix type inference for match and flatMap in Result](https://github.com/erikjuhani/fp-utils/commit/a019ce313a7c3b80a3faa35837785a6e04caacb5)
- [Fix documentation in Result](https://github.com/erikjuhani/fp-utils/commit/6c1c1eebe6f53eb2ebcd57df2ed757193810b8b6)

## 0.5.0

BREAKING CHANGES:

- [Export `Result` as a namespace](https://github.com/erikjuhani/fp-utils/commit/1f5efa949fe30dbece13f178a24022bd52eff20b)
- [Export `Option` as a namespace](https://github.com/erikjuhani/fp-utils/commit/1b6d1d47cfcaa1497fe31021417333b1a5dad1ba)
- [Change the order of arguments in match function](https://github.com/erikjuhani/fp-utils/commit/e2e12d57e0733195ec747f52afc59ea34d1c19cf)
- [Add void type for Result.ok and Result.err](https://github.com/erikjuhani/fp-utils/commit/9ebde8d494af0ec6db79246a86f6f16ee1275d80)

CHANGES:

- [Reflect the Result type signature name change in README](https://github.com/erikjuhani/fp-utils/commit/3313436dde27a6723b17a122ca3e83baf63e6522)
- [Make result error type name more verbose](https://github.com/erikjuhani/fp-utils/commit/e4ce48488e5ba84ed018db9c19fcd74297d77b6a)

## 0.4.0

FEATURES:

- [Add `fromPromise` function for Option and Result modules](https://github.com/erikjuhani/fp-utils/commit/875043737fbb266da246fe355a61c0c71efb123f)

CHANGES:

- [Make unwrapOr default value use contained type T](https://github.com/erikjuhani/fp-utils/commit/31f0cc25dcf4f2fc95d00ececbc012ab0a3b818b)

## 0.3.0

FEATURES:

- [Add `Result` utility type](https://github.com/erikjuhani/fp-utils/commit/a62299f4b24e829264d7bb006057ada3552fd409)
- [Add more complex example for the Option type](https://github.com/erikjuhani/fp-utils/commit/de8488c25b22644c487d6caac1cbbadd227c975b)

CHANGES:

- [Create separate README for Option](https://github.com/erikjuhani/fp-utils/commit/6ccc036bfe21bfad422115b7bbecb5fa38751ccd)
- [Use flatMap instead of bind](https://github.com/erikjuhani/fp-utils/commit/32d7938dae4c4bc8f81023e30c08ade28e7727c8)

FIXES:

- [Fix signature style in README for Option.inspect](https://github.com/erikjuhani/fp-utils/commit/e1a38bbe400e6ed3ffc2a4c200479865bb072af3)

## 0.2.0

FEATURES:

- [Add Option.inspect](https://github.com/erikjuhani/fp-utils/commit/242ad2d425111da0cf88ab927af840ea1dabe5fc)

CHANGES:

- [Remove duplication from the root README option example](https://github.com/erikjuhani/fp-utils/commit/c01c6d0c53908eaa48f5f86e8058328a68bdb689)

FIXES:

- [Fix option type simple example](https://github.com/erikjuhani/fp-utils/commit/64d80cf228da6743c0e382e0026d62f871f9fcd5)

## 0.1.0

FEATURES:

- [Add Option utility type](https://github.com/erikjuhani/fp-utils/commit/ef748659930ee8d8b9b71c91fdf3c1c67d33b124)
- [Add build_npm script to generate node compatible code](https://github.com/erikjuhani/fp-utils/commit/dc63b18edae5647998276ac5dc7acd0173f63c08)
