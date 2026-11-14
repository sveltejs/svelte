import { flushSync } from 'svelte';
import { assert_ok, test } from '../../test';

export default test({
	server_props: {
		values: [
			'<i>server-only markup</i>',
			'<i>server-only markup</i>',
			'<i>server-only markup</i>',
			'',
			''
		]
	},
	// Cover nullish clients, an empty server/nonempty client, and matching empty values.
	props: { values: ['', null, undefined, '<em>client-only markup</em>', ''] },
	snapshot(target) {
		return { ...target.querySelectorAll('i, b') };
	},
	test(assert, target) {
		const button = target.querySelector('button');
		assert_ok(button);

		for (let n = 1; n <= 3; n++) {
			flushSync(() => button.click());
			const html = n === 2 ? '' : '<u>client markup</u>';

			for (const div of target.querySelectorAll('div')) {
				assert.htmlEqual(div.innerHTML, `${html}<b>${n}</b>`);
			}
			for (const section of target.querySelectorAll('section')) {
				assert.htmlEqual(section.innerHTML, html);
			}
		}
	},
	errors: Array(8).fill(
		'The value of an `{@html ...}` block changed between server and client renders. The client value will be ignored in favour of the server value'
	)
});
