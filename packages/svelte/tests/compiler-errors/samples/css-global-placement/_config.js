import { test } from '../../test';

export default test({
	error: {
		code: 'css_global_block_invalid_placement',
		message:
			':global cannot be at the end of a selector with children starting with a `&` (aka nesting) selector. ' +
			'Either remove those nested child selectors, or append the :global selector to the end of the previous selector (e.g. `div:global` instead of `div :global`)',
		position: [184, 192]
	}
});
