import { tick } from 'svelte';
import { test } from '../../test';

// destructure to store
export default test({
	html: '<h1>2 2 xxx 5 6 9 10 2</h1>',
	async test({ assert, target, component }) {
		component.update();
		await tick();
		assert.htmlEqual(target.innerHTML, '<h1>11 11 yyy 12 13 14 15 11</h1>');
	}
});
