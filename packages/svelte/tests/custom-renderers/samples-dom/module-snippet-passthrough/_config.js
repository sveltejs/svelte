import { test } from '../../test-dom.test';

export default test({
	// The key assertion is that this test does not throw.
	// A DOM module snippet imported by a custom renderer component and
	// passed to a DOM child component should work without errors.
	// We don't check html because the DOM child renders into the real DOM,
	// not the custom renderer tree.
});
