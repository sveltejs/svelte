import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<div style="font-size:2em;color:red;--my-var:0">style1</div>
		<div style="font-size:2em;color:red;--MY-VAR:0">style2</div>
		<div style="font-size:2em;color:red;--MyVar:0">style3</div>
		<div style="font-size:2em;color:red;--my-var:0">style4</div>
		<div style="font-weight: bold;border-width: 3px; border-color: blue;COLOR: red">style5</div>
		<div style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">style6</div>
		<div style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">spread</div>
		<div style="--bg-color:red;opacity:0.5;font-size:1em"></div>

		<div style="font-size:2em;color:red;--my-var:0">child1:style1</div>
		<div style="font-size:2em;color:red;--MY-VAR:0">child1:style2</div>
		<div style="font-size:2em;color:red;--MyVar:0">child1:style3</div>
		<div style="font-size:2em;color:red;--my-var:0">child1:style4</div>
		<div style="font-weight: bold;border-width: 3px; border-color: blue;COLOR: red">child1:style5</div>
		<div style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">child1:style6</div>
		<div style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">child1:spread</div>
		<div style="--bg-color:red;opacity:0.5;font-size:1em">child1:</div>

		<div style="font-size:2em;color:red;--my-var:0">child2:style1</div>
		<div style="font-size:2em;color:red;--MY-VAR:0">child2:style2</div>
		<div style="font-size:2em;color:red;--MyVar:0">child2:style3</div>
		<div style="font-size:2em;color:red;--my-var:0">child2:style4</div>
		<div style="font-weight: bold;border-width: 3px; border-color: blue;COLOR: red">child2:style5</div>
		<div style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">child2:style6</div>
		<div style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">child2:spread</div>
		<div style="--bg-color:red;opacity:0.5;font-size:1em">child2:</div>

		<applied-to-custom-element style="font-size:2em;color:red;--my-var:0">style1</applied-to-custom-element>
		<applied-to-custom-element style="font-size:2em;color:red;--MY-VAR:0">style2</applied-to-custom-element>
		<applied-to-custom-element style="font-size:2em;color:red;--MyVar:0">style3</applied-to-custom-element>
		<applied-to-custom-element style="font-size:2em;color:red;--my-var:0">style4</applied-to-custom-element>
		<applied-to-custom-element style="font-weight: bold;border-width: 3px; border-color: blue;COLOR: red">style5</applied-to-custom-element>
		<applied-to-custom-element style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">style6</applied-to-custom-element>
		<applied-to-custom-element style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">spread</applied-to-custom-element>
		<applied-to-custom-element style="--bg-color:red;opacity:0.5;font-size:1em"></applied-to-custom-element>

		<button>update</button>
	`,
	test({ assert, target }) {
		const button = target.querySelector('button');

		button?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
		<div style="font-size:2em;color:red;--my-var:0">style1</div>
		<div style="font-size:2em;color:red;--MY-VAR:0">style2</div>
		<div style="font-size:2em;color:red;--MyVar:0">style3</div>
		<div style="font-size:2em;color:red;--my-var:0">style4</div>
		<div style="font-weight: bold;border-width: 3px; border-color: blue;COLOR: red">style5</div>
		<div style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">style6</div>
		<div style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">spread</div>
		<div style="--bg-color:blue;display:inline-block;opacity:0.75"></div>

		<div style="font-size:2em;color:red;--my-var:0">child1:style1</div>
		<div style="font-size:2em;color:red;--MY-VAR:0">child1:style2</div>
		<div style="font-size:2em;color:red;--MyVar:0">child1:style3</div>
		<div style="font-size:2em;color:red;--my-var:0">child1:style4</div>
		<div style="font-weight: bold;border-width: 3px; border-color: blue;COLOR: red">child1:style5</div>
		<div style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">child1:style6</div>
		<div style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">child1:spread</div>
		<div style="--bg-color:blue;display:inline-block;opacity:0.75">child1:</div>

		<div style="font-size:2em;color:red;--my-var:0">child2:style1</div>
		<div style="font-size:2em;color:red;--MY-VAR:0">child2:style2</div>
		<div style="font-size:2em;color:red;--MyVar:0">child2:style3</div>
		<div style="font-size:2em;color:red;--my-var:0">child2:style4</div>
		<div style="font-weight: bold;border-width: 3px; border-color: blue;COLOR: red">child2:style5</div>
		<div style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">child2:style6</div>
		<div style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">child2:spread</div>
		<div style="--bg-color:blue;display:inline-block;opacity:0.75">child2:</div>

		<applied-to-custom-element style="font-size:2em;color:red;--my-var:0">style1</applied-to-custom-element>
		<applied-to-custom-element style="font-size:2em;color:red;--MY-VAR:0">style2</applied-to-custom-element>
		<applied-to-custom-element style="font-size:2em;color:red;--MyVar:0">style3</applied-to-custom-element>
		<applied-to-custom-element style="font-size:2em;color:red;--my-var:0">style4</applied-to-custom-element>
		<applied-to-custom-element style="font-weight: bold;border-width: 3px; border-color: blue;COLOR: red">style5</applied-to-custom-element>
		<applied-to-custom-element style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">style6</applied-to-custom-element>
		<applied-to-custom-element style="font-size:2em;color:red;--my-var:0;font-weight: bold;border-width: 3px; border-color: blue;COLOR: red;opacity: 0">spread</applied-to-custom-element>
		<applied-to-custom-element style="--bg-color:blue;display:inline-block;opacity:0.75"></applied-to-custom-element>

		<button>update</button>
	`
		);
	}
});
