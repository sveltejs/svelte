import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>prop-1: 1</p>
			<p>prop4: 4</p>
			<p>rest: {"prop2":2,"prop-3":3}</p>
			<p>prop-7: 7</p>
			<p>prop6: 6</p>
			<p>rest: {"prop-5":5,"prop8":8}</p>
			`
		);
	}
});
