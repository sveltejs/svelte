import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		const button = target.querySelector('button');

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>toggle</button>
				<div>
					<p>First if block:</p>
					<span class="first">First: true</span>
					<p>Second if block:</p>
					<span class="second">Second: true</span>
				</div>
			`
		);

		flushSync(() => button?.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>toggle</button>
				<div>
					<p>First if block:</p>
					<p>Second if block:</p>
				</div>
			`
		);
	}
});
