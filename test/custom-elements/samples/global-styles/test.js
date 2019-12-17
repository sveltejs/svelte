import * as assert from 'assert';
import CustomElement from './main.svelte';

export default function (target) {
	new CustomElement({
		target
	});

	const style = target.querySelector('custom-element').shadowRoot.querySelector('style');

	assert.equal(style.textContent, 'p.active{color:rgb(128, 128, 128)}');
}
