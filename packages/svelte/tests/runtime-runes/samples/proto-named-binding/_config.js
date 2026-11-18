import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>1</button><p>3</p><p>10</p><i>none</i><i>7</i><span>5</span><span>6</span>`,
	async test({ assert, target }) {
		const [button] = target.querySelectorAll('button');

		button.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>2</button><p>3</p><p>20</p><i>none</i><i>7</i><span>5</span><span>6</span>`
		);
	}
});
