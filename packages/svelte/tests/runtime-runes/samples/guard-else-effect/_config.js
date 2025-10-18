import { expect, vi } from 'vitest';
import { test } from '../../test';
import { flushSync } from 'svelte';

const trackBranch = vi.fn();

export default test({
	mode: ['client'],
	props: { trackBranch: trackBranch },
	async test({ target }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		flushSync(() => button?.click());
		flushSync(() => button?.click());
		flushSync(() => button?.click());

		expect(trackBranch).toHaveBeenCalledWith('one');
		expect(trackBranch).toHaveBeenCalledWith('two');
		expect(trackBranch).not.toHaveBeenCalledWith('else');
	}
});
