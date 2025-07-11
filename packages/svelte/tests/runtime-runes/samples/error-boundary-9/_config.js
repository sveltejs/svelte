import { test } from '../../test';

export default test({
	test({ assert, target, logs, warnings, variant }) {
		if (variant === 'hydrate') {
			assert.deepEqual(warnings, [
				'Hydration failed because the initial UI does not match what was rendered on the server'
			]);
		}

		assert.deepEqual(logs, ['error caught']);
		assert.htmlEqual(target.innerHTML, `<div>Error!</div><button>Retry</button>`);
	}
});
