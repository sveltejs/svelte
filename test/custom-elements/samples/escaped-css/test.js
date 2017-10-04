import * as assert from 'assert';
import CustomElement from './main.html';

export default function (target) {
	new CustomElement({
		target
	});

	const icon = target.querySelector('custom-element').shadowRoot.querySelector('.icon');
	const before = getComputedStyle(icon, '::before');

	assert.equal(before.content, JSON.stringify(String.fromCharCode(0xff)));
}