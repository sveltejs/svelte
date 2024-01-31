import { test } from '../../test';

export default test({
	// There's a slight difference in the output between modes, because the server doesn't know
	// whether or not the custom element has the readonly boolean, so it plays it save and
	// assumes it does.
	html: `
		<button>click me</button>
		<input>
		<input>

		<custom-element readonly="false"></custom-element>
		<custom-element readonly="false"></custom-element>

		<svg readonly="false"></svg>
		<svg readonly="false"></svg>
	`,
	ssrHtml: `
		<button>click me</button>
		<input>
		<input>

		<custom-element></custom-element>
		<custom-element readonly="false"></custom-element>

		<svg readonly="false"></svg>
		<svg readonly="false"></svg>
`
});
