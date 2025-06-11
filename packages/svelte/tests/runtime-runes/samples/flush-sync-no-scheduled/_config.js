import { ok, test } from '../../test';

export default test({
	async test({ assert, target }) {
		const btn = target.querySelector('button');
		const main = target.querySelector('main');
		ok(main);
		assert.htmlEqual(main.innerHTML, `<div>true</div>`);
		// we don't want to use flush sync (or tick that use it inside) since we are testing that calling `flushSync` once
		// when there are no scheduled effects does not cause reactivity to break
		btn?.click();
		await Promise.resolve();
		assert.htmlEqual(main.innerHTML, `<div>false</div> <div>false</div>`);
	}
});
