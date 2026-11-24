import { test } from '../../test';
import {
	async_mode_flag,
	disable_async_mode_flag,
	enable_async_mode_flag
} from '../../../../src/internal/flags/index.js';

let was_enabled = false;

// The server renders the pending snippet (and the `[!` marker) whenever one is provided,
// even without `experimental.async`. A client without async mode must still replace it
// with the actual content after hydration. Other samples may have turned the (global)
// flag on, so turn it off for the duration of this one
export default test({
	before_test() {
		was_enabled = async_mode_flag;
		disable_async_mode_flag();
	},
	after_test() {
		if (was_enabled) enable_async_mode_flag();
	}
});
