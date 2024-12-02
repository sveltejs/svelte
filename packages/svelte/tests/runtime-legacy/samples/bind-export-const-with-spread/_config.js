import { test } from '../../test';

export default test({
	html: `<p>42</p>`,
	async test({ target, assert }) {
		const p = target.querySelector('p');
		assert.equal(p?.innerHTML, '42');
	}
});
