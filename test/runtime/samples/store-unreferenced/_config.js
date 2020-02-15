import { count } from './store.js';

export default {
	html: `<p>count: 0</p>`,

	async test({ assert, component, target }) {
		await component.increment();

		assert.htmlEqual(target.innerHTML, `<p>count: 1</p>`);

		count.set(0);
	}
};
