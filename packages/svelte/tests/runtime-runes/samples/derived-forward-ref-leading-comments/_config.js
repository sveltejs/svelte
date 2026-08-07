import { test } from '../../test';

// Repro for #18607: leading comments on a later $derived must not break
// server compilation of an earlier getter that returns that derived
// (comments between `return` and the value → ASI → return undefined).
export default test({
	html: '<p>LATER</p>'
});
