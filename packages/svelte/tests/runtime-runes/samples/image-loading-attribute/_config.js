import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, `<img alt="Svelte" loading="eager" src="foo.png">`);
	}
});
