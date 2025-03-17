import { test } from '../../test';

export default test({
	mode: ['hydrate', 'client'],
	recover: true,
	needs_import_logs: true,
	test({ warnings, assert, variant }) {
		const expected_warnings = [
			'This html structure `<p></p><tr></tr>` would be corrected like this `<p></p>` by the browser making this component impossible to hydrate properly'
		];
		if (variant === 'hydrate') {
			expected_warnings.push(
				'Hydration failed because the initial UI does not match what was rendered on the server'
			);
		}
		assert.deepEqual(warnings, expected_warnings);
	}
});
