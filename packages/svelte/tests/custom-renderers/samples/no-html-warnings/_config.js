import { test } from '../../test';

// This test verifies that HTML-specific warnings and errors are NOT produced
// when compiling with a custom renderer. All patterns in main.svelte would
// normally trigger compile errors or warnings in standard HTML mode.
// With a custom renderer, they should all be silently accepted.
export default test({
	compile_warnings: false
});
