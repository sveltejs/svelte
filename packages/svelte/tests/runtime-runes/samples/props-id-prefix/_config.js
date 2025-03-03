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
					<h1>myPrefix-c1</h1>
					<p>myPrefix-c2</p>
					<p>myPrefix-c3</p>
					<p>myPrefix-c4</p>
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
					<h1>myPrefix-c1</h1>
					<p>myPrefix-c2</p>
					<p>myPrefix-c3</p>
					<p>myPrefix-c4</p>
					<p>myPrefix-c5</p>
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
					<p>myPrefix-c1</p>
				`
			);
		}
	}
});
