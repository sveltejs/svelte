import { flushSync } from 'svelte';
import { serialize } from '../../platform';
import { test } from '../../suite';

export default test({
	html: '<view><banner></banner><item>a</item><item>b</item><item>c</item><footer></footer></view>',
	test({ assert, instance, root, platform_root }) {
		instance.shuffle();
		flushSync();
		assert.equal(
			serialize(platform_root),
			'<view><banner></banner><item>c</item><item>a</item><item>d</item><footer></footer></view>'
		);

		instance.toggle();
		flushSync();
		assert.equal(
			serialize(platform_root),
			'<view><item>c</item><item>a</item><item>d</item><footer></footer></view>'
		);

		// back in its place, before the items
		instance.toggle();
		flushSync();
		assert.equal(
			serialize(platform_root),
			'<view><banner></banner><item>c</item><item>a</item><item>d</item><footer></footer></view>'
		);
	}
});
