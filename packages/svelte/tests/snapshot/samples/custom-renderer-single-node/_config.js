import { test } from '../../test';

export default test({
	compileOptions: {
		experimental: {
			// The actual renderer module is irrelevant for this snapshot — we only
			// care that the server output is a no-op while the client output still
			// imports/uses the custom renderer. Using a fixed path keeps the
			// snapshot stable across machines.
			customRenderer: 'my-custom-renderer'
		}
	}
});
