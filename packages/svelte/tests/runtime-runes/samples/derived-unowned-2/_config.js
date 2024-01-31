import { test } from '../../test';

export default test({
	html: '<div>d2: 3</div><div>d3: 3</div><div>d4: 3</div>',
	skip_if_hydrate: 'permanent',

	async test({ assert, target }) {
		await Promise.resolve();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			'<div>d2: 3,4,5</div><div>d3: 3,4,5</div><div>d4: 3,4,5</div>'
		);
	}
});
