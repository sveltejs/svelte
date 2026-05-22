import { test } from '../../test';

// `let:` directives on a slotted element must be declared before sibling `{@const}`
// declarations that capture them. In dev mode the `{@const}` derived is read eagerly,
// so a wrong declaration order throws "Cannot access '...' before initialization".
export default test({
	compileOptions: {
		dev: true
	},

	html: `
		<div slot="foo"><span>1</span></div>
		<div slot="foo"><span>2</span></div>
	`
});
