import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	id_prefix: 'myPrefix',
	test({ assert, target, variant }) {
		if (variant === 'dom') {
			assert.htmlEqual(
				target.innerHTML,
				`
					<button>toggle</button>
					<h1>c1</h1>
					<p>c2</p>
					<p>c3</p>
					<p>c4</p>
				`
			);
		} else {
			assert.htmlEqual(
				target.innerHTML,
				`
					<button>toggle</button>
					<h1>myPrefix-s1</h1>
					<p>myPrefix-s2</p>
					<p>myPrefix-s3</p>
					<p>myPrefix-s4</p>
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
					<h1>c1</h1>
					<p>c2</p>
					<p>c3</p>
					<p>c4</p>
					<p>c5</p>
				`
			);
		} else {
			assert.htmlEqual(
				target.innerHTML,
				`
					<button>toggle</button>
					<h1>myPrefix-s1</h1>
					<p>myPrefix-s2</p>
					<p>myPrefix-s3</p>
					<p>myPrefix-s4</p>
					<p>c1</p>
				`
			);
		}
	}
});
