import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			// Even thought we're in runes mode, the buz fallback propagates back up in this case
			`
			<button>reset</button> foo baz buz
			<div><button>update</button> foo bar baz buz</div>
			<div><button>update</button> foo bar baz buz</div>
			`
		);

		const [btn1, btn2, btn3] = target.querySelectorAll('button');

		btn2.click();
		btn3.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			// bar is not set in the parent because it's a readonly property
			`
			<button>reset</button> foo 3 4
			<div><button>update</button> 1 2 3 4</div>
			<div><button>update</button> 1 2 3 4</div>
			`
		);

		btn1.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			// Because foo is a readonly property, component.svelte diverges locally from it,
			// and the passed in property keeps the initial value of foo. This is why it stays
			// at 1, because foo is not updated to a different value.
			`
				<button>reset</button> foo bar baz buz
			<div><button>update</button> 1 bar baz buz</div>
			<div><button>update</button> 1 bar baz buz</div>
				`
		);
	}
});
