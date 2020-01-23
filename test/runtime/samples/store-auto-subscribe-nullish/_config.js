import { writable } from '../../../../store';

export default {
	html: `
		<p>undefined</p>
	`,
	async test({ assert, component, target }) {
		component.store = writable('foo');
		assert.htmlEqual(target.innerHTML, `
			<p>foo</p>
		`);
	}
};
