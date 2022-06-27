import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	target.innerHTML = '<custom-element name="world" answer="42" test="svelte" hyphenated-attr="galaxy" rest-attr="universe"></custom-element>';
	const el = target.querySelector('custom-element');

	assert.htmlEqual(el.shadowRoot.innerHTML, `
		<p>name: world</p>
		<p>hyphenated attribute: galaxy</p>
		<p>$$props: {"name":"world","answer":"42","test":"svelte","hyphenatedAttr":"galaxy","restAttr":"universe"}</p>
		<p>$$restProps: {"answer":"42","test":"svelte","restAttr":"universe"}</p>
	`);
}
