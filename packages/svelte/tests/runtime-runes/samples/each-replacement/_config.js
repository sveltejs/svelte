import { test } from '../../test';

export default test({
	html: `
		<button>update</button>
		<p>1</p>
		<p>2</p>
		<p>3</p>
	`,

	async test({ assert, target }) {
		const button = target.querySelector('button');

		// ensure each click runs in its own rerender task
		await button?.click();
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>update</button>
				<p>4</p>
				<p>5</p>
				<p>6</p>
			`
		);
	}
});
