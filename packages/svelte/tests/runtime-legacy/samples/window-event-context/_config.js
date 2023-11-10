import { test } from '../../test';

export default test({
	get props() {
		return { foo: true };
	},

	html: 'true',

	skip: /^v4/.test(process.version), // node 4 apparently does some dumb stuff

	async test({ assert, component, target, window }) {
		const event = new window.Event('click');

		await window.dispatchEvent(event);
		assert.equal(component.foo, false);
		assert.htmlEqual(target.innerHTML, 'false');

		await window.dispatchEvent(event);
		assert.equal(component.foo, true);
		assert.htmlEqual(target.innerHTML, 'true');
	}
});
