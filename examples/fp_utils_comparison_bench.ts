import {
  badrap,
  fpUtils,
  oxi,
  oxideTs,
  tsBelt,
  tsResultEs,
} from "./fp_utils_comparison.ts";
import { bench } from "../utils/bench.ts";

bench({
  ok: {
    fpUtils: () => {
      fpUtils.ok();
    },
    oxi: () => {
      oxi.ok();
    },
    oxideTs: () => {
      oxideTs.ok();
    },
    tsBelt: () => {
      tsBelt.ok();
    },
    tsResultEs: () => {
      tsResultEs.ok();
    },
    badrap: () => {
      badrap.ok();
    },
  },
  map: {
    fpUtils: () => {
      fpUtils.map();
    },
    oxi: () => {
      oxi.map();
    },
    oxideTs: () => {
      oxideTs.map();
    },
    tsBelt: () => {
      tsBelt.map();
    },
    tsResultEs: () => {
      tsResultEs.map();
    },
    badrap: () => {
      badrap.map();
    },
  },
  interoperability: {
    fpUtils: () => {
      fpUtils.interoperability();
    },
    oxi: () => {
      oxi.interoperability();
    },
    oxideTs: () => {
      oxideTs.interoperability();
    },
    tsBelt: () => {
      tsBelt.interoperability();
    },
    tsResultEs: () => {
      tsResultEs.interoperability();
    },
    badrap: () => {
      badrap.interoperability();
    },
  },
  union: {
    fpUtils: () => {
      fpUtils.unionTypePromise();
    },
    oxi: () => {
      oxi.unionTypePromise();
    },
    oxideTs: () => {
      oxideTs.unionTypePromise();
    },
    tsBelt: () => {
      tsBelt.unionTypePromise();
    },
    tsResultEs: () => {
      tsResultEs.unionTypePromise();
    },
    badrap: () => {
      badrap.unionTypePromise();
    },
  },
});
