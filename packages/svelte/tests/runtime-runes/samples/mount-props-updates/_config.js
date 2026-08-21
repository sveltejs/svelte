import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			// The buz fallback does not propagate back up
			`
			<button>reset</button> foo baz
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
			// baz is not set in the parent because while it's a bindable property,
			// it wasn't set initially so it's treated as a readonly property
			`
			<button>reset</button> foo 3
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
