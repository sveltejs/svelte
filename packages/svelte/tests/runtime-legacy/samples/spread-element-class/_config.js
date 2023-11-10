import { test } from '../../test';

export default test({
	html: "<div class='foo svelte-u3t2mm bar'>hello</div>",
	test({ assert, component, target }) {
		component.blah = 'goodbye';
		assert.htmlEqual(target.innerHTML, "<div class='foo svelte-u3t2mm bar'>goodbye</div>");
	}
});
