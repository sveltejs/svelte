import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],

	props: {
		browser: true
	},

	server_props: {
		browser: false
	},

	async test({ assert, target }) {
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>resolve a</button>
				<button>resolve b</button>
				<p>hello from server</p>
				<p>hello from server</p>
				<p>hello from server</p>
				<p>hello from server</p>
			`
		);

		const [button1, button2] = target.querySelectorAll('button');

		button1.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>resolve a</button>
				<button>resolve b</button>
				<p>hello from browser</p>
				<p>hello from browser</p>
				<p>hello from server</p>
				<p>hello from server</p>
			`
		);

		button2.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>resolve a</button>
				<button>resolve b</button>
				<p>hello from browser</p>
				<p>hello from browser</p>
				<p>hello from browser</p>
				<p>hello from browser</p>
			`
		);
	}
});
