import { Native, WithResult as Result } from "../examples/result_fetch.ts";
import {
  Native as NativeJSON,
  WithResult as ResultJSON,
} from "../examples/result_parse_json.ts";
import { bench } from "../utils/bench.ts";

bench({
  valid_json: {
    Result: () => {
      ResultJSON.validJSONContent();
    },
    Native: () => {
      NativeJSON.validJSONContent();
    },
  },
  invalid_json: {
    Result: () => {
      ResultJSON.invalidJSON();
    },
    Native: () => {
      NativeJSON.invalidJSON();
    },
  },
  invalid_json_content: {
    Result: () => {
      ResultJSON.invalidJSONContent();
    },
    Native: () => {
      NativeJSON.invalidJSONContent();
    },
  },
  fetch_success: {
    Result: async () => {
      await Result.infoSuccess();
    },
    Native: async () => {
      await Native.infoSuccess();
    },
  },
  fetch_failure: {
    Result: async () => {
      await Result.infoFailure();
    },
    Native: async () => {
      await Native.infoFailure();
    },
  },
});
