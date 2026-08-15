import { test } from '../../test';

// Under `preserveWhitespace: true` the whitespace surrounding a `{#snippet}` inside a
// component tag used to be serialized as implicit default-slot content. That emitted a
// second `children` property into the component's props object, which — being the later
// key in the same object literal — silently clobbered the explicit `{#snippet children}`,
// so the first component below rendered whitespace instead of its paragraph.
//
// The second component checks the milder form of the same bug: with only a *named*
// snippet, the surrounding whitespace produced a spurious `children` prop, making
// `{#if children}`-style branches take the wrong path.
export default test({
	compileOptions: {
		preserveWhitespace: true
	},
	html: `<p>explicit children snippet</p> <h1>titled</h1>`
});
