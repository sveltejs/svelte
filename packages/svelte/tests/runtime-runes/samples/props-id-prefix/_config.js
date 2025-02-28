import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	uid_prefix: 'myPrefix',
	test({ assert, target, variant }) {
		if (variant === 'dom') {
			assert.htmlEqual(
				target.innerHTML,
				`
					<button>toggle</button>
					<h1>c-myPrefix-1</h1>
					<p>c-myPrefix-2</p>
					<p>c-myPrefix-3</p>
					<p>c-myPrefix-4</p>
				`
			);
		} else {
			assert.htmlEqual(
				target.innerHTML,
				`
					<button>toggle</button>
					<h1>s-myPrefix-1</h1>
					<p>s-myPrefix-2</p>
					<p>s-myPrefix-3</p>
					<p>s-myPrefix-4</p>
				`
			);
		}

		let button = target.querySelector('button');
		flushSync(() => button?.click());

		if (variant === 'dom') {
			assert.htmlEqual(
				target.innerHTML,
				`
					<button>toggle</button>
					<h1>c-myPrefix-1</h1>
					<p>c-myPrefix-2</p>
					<p>c-myPrefix-3</p>
					<p>c-myPrefix-4</p>
					<p>c-myPrefix-5</p>
				`
			);
		} else {
			assert.htmlEqual(
				target.innerHTML,
				`
					<button>toggle</button>
					<h1>s-myPrefix-1</h1>
					<p>s-myPrefix-2</p>
					<p>s-myPrefix-3</p>
					<p>s-myPrefix-4</p>
					<p>c-myPrefix-1</p>
				`
			);
		}
	}
});
