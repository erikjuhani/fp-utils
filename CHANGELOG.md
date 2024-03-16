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
