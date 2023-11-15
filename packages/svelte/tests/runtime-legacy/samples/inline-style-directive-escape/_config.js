import { test } from '../../test';

export default test({
	html: `
		<div style="--css-variable: &quot; onload=&quot;alert('uhoh')&quot; data-nothing=&quot;not important;"></div>
	`,

	test({ assert, component, target }) {
		component.attack = '" onload="alert(\'uhoh2\')" data-nothing="not important';
		assert.htmlEqual(
			target.innerHTML,
			`
			<div style="--css-variable: &quot; onload=&quot;alert('uhoh2')&quot; data-nothing=&quot;not important;"></div>
		`
		);
	}
});
