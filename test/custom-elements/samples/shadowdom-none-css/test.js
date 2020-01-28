import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	target.innerHTML = '<custom-element></custom-element>';
	const el = target.querySelector('custom-element');
	const h1 = el.querySelector('h1');
  const colour = getComputedStyle(h1).color;
  assert.equal(colour,"rgb(255, 0, 0)");
}