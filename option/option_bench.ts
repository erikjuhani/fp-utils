import { Native, WithOption as Option } from "../examples/option_fetch.ts";
import { bench } from "../utils/bench.ts";

bench({
  fetch_success: {
    Option: async () => {
      await Option.infoSuccess();
    },
    Native: async () => {
      await Native.infoSuccess();
    },
  },
  fetch_failure: {
    Option: async () => {
      await Option.infoFailure();
    },
    Native: async () => {
      await Native.infoFailure();
    },
  },
});
