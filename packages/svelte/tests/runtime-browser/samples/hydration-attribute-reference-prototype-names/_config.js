import { test } from '../../assert';

export default test({
	mode: ['hydrate'],

	test({ assert, target }) {
		// `createElementNS` would reject these names, but the parser and hydration accept them
		assert.htmlEqual(
			target.innerHTML,
			'<xmlns data-n="1">x</xmlns><xmlns:ab data-n="1">x</xmlns:ab><svg><xmlns data-n="1"></xmlns></svg>'
		);
	}
});
