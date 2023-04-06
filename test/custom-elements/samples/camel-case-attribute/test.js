import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	target.innerHTML = '<custom-element camel-case="world" an-array="[1,2]"></custom-element>';
	const el = target.querySelector('custom-element');

	assert.equal(el.shadowRoot.innerHTML, '<h1>Hello world!</h1> <p>1</p><p>2</p>');

	el.setAttribute('camel-case', 'universe');
	el.setAttribute('an-array', '[3,4]');
	assert.equal(el.shadowRoot.innerHTML, '<h1>Hello universe!</h1> <p>3</p><p>4</p>');
	assert.equal(target.innerHTML, '<custom-element camel-case="universe" an-array="[3,4]"></custom-element>')

	el.camelCase = 'galaxy';
	el.anArray = [5, 6];
	assert.equal(el.shadowRoot.innerHTML, '<h1>Hello galaxy!</h1> <p>5</p><p>6</p>');
	assert.equal(target.innerHTML, '<custom-element camel-case="universe" an-array="[5,6]"></custom-element>')

	el.camelcase = 'solar system';
	el.anarray = [7, 8];
	assert.equal(el.shadowRoot.innerHTML, '<h1>Hello solar system!</h1> <p>7</p><p>8</p>');
	assert.equal(target.innerHTML, '<custom-element camel-case="universe" an-array="[7,8]"></custom-element>')
}
