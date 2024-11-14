import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>reset</button>
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
			`
			<button>reset</button>
			<div><button>update</button> 1 2 3 4</div>
			<div><button>update</button> 1 2 3 4</div>
			`
		);

		btn1.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
			<div><button>update</button> foo bar baz buz</div>
			<div><button>update</button> foo bar baz buz</div>
				`
		);
	}
});
