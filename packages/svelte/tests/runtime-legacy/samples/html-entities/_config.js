import { test } from '../../test';

export default test({
	html: `
		<span>*</span>
		<span>*</span>
		<span>*</span>
		<span>*</span>
		<span>*</span>
		<span>*</span>

		<span></span>
		<span>A</span>
		<span>€</span>
		<span>€</span>
		<span>\u{30EDD}</span>
		<span>\u{F0001}</span>
		<span title="\u{30EDD}\u{10FFFD}">x</span>

		<span>&amp;stringnotanentity;</span>

		<span>different &amp;rect and ▭</span>

		<span>©otherstring</span>

		<span>©=otherstring</span>

		<span>©=otherstring</span>

		<span>©123</span>

		<span>Ÿotherstring</span>
	`
});
