import * as assert from 'assert.js';
import { tick } from 'svelte';
import './main.svelte';

export default async function (target) {
	target.innerHTML =
		'<custom-element camelcase2="Hello" camel-case="world" an-array="[1,2]"></custom-element>';
	await tick();
	const el = target.querySelector('custom-element');

	assert.equal(el.shadowRoot.innerHTML, '<h1>Hello world!</h1> <p>1</p><p>2</p>');

	el.setAttribute('camel-case', 'universe');
	el.setAttribute('an-array', '[3,4]');
	el.setAttribute('camelcase2', 'Hi');
	await tick();
	assert.equal(el.shadowRoot.innerHTML, '<h1>Hi universe!</h1> <p>3</p><p>4</p>');
	assert.equal(
		target.innerHTML,
		'<custom-element camelcase2="Hi" camel-case="universe" an-array="[3,4]"></custom-element>'
	);

	el.camelCase = 'galaxy';
	el.camelCase2 = 'Hey';
	el.anArray = [5, 6];
	await tick();
	assert.equal(el.shadowRoot.innerHTML, '<h1>Hey galaxy!</h1> <p>5</p><p>6</p>');
	assert.equal(
		target.innerHTML,
		'<custom-element camelcase2="Hey" camel-case="universe" an-array="[5,6]"></custom-element>'
	);
}
