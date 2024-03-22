import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const p = target.querySelector('p');

		assert.htmlEqual(
			p?.innerHTML || '',
			`{"text":"text","checkbox":true,"radio_group":"a","checkbox_group":["a"],"select":"b","textarea":"textarea"}`
		);

		await target.querySelector('button')?.click();
		await Promise.resolve();
		assert.htmlEqual(
			p?.innerHTML || '',
			`{"text":"","checkbox":false,"radio_group":null,"checkbox_group":[],"select":"a","textarea":""}`
		);
	}
});
