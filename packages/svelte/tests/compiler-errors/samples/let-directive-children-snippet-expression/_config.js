import { test } from '../../test';

export default test({
	error: {
		code: 'let_directive_snippet_conflict',
		message:
			'Cannot use `let:` directives on a component that has a `children` snippet. Use snippet parameters instead (e.g. `{#snippet children({ item: x })}`)',
		position: [62, 74]
	}
});
