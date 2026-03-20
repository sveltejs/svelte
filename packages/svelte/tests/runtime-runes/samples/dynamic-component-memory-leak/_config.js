import { flushSync } from 'svelte';

export default {
	html: '<p>Home</p>',

	async test({ assert, target, component }) {
		// Switch to About
		component.page = 'About';
		flushSync();
		assert.htmlEqual(target.innerHTML, '<p>About</p>');

		// Switch back to Home
		component.page = 'Home';
		flushSync();
		assert.htmlEqual(target.innerHTML, '<p>Home</p>');

		// Rapidly switch multiple times to stress test cleanup
		for (let i = 0; i < 10; i++) {
			component.page = i % 2 === 0 ? 'About' : 'Home';
			flushSync();
		}

		// Should end on Home (10 is even, 0-indexed last is About → Home)
		assert.htmlEqual(target.innerHTML, '<p>Home</p>');
	}
};
