import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	html: '<p>42</p><p>42</p><button>update</button><button>reset</button>',

	test({ assert, target }) {
		const [update, reset] = target.querySelectorAll('button');
		flushSync(() => update.click());

		assert.htmlEqual(
			target.innerHTML,
			'<p>42</p><p>42</p><button>update</button><button>reset</button>'
		);

		flushSync(() => reset.click());
	},

	warnings: [
		'A `$:` statement (main.svelte:4:1) read reactive state that was not visible to the compiler. Updates to this state will not cause the statement to re-run. The behaviour of this code will change if you migrate it to runes mode'
	]
});
