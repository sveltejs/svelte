import { flushSync } from 'svelte';
import { raf } from '../../../animation-helpers';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [fly_in, fly_out] = target.querySelectorAll('button');

		fly_in.click();
		flushSync();
		raf.tick(25);
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>fly in</button>
				<button>fly out</button>
				<div style="">hello</div>
			`
		);

		fly_out.click();
		flushSync();
		raf.tick(50);
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>fly in</button>
				<button>fly out</button>
			`
		);
	}
});
