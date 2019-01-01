import { createElement } from './dom.js';

let stylesheet;
let active = 0;
let current_rules = {};

// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return hash >>> 0;
}

export function create_rule({ a, b, delta, duration }, ease, fn) {
	const step = 16.666 / duration;
	let keyframes = '{\n';

	for (let p = 0; p <= 1; p += step) {
		const t = a + delta * ease(p);
		keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
	}

	const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
	const name = `__svelte_${hash(rule)}`;

	if (!current_rules[name]) {
		if (!stylesheet) {
			const style = createElement('style');
			document.head.appendChild(style);
			stylesheet = style.sheet;
		}

		current_rules[name] = true;
		stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
	}

	active += 1;
	return name;
}

export function delete_rule(node, name) {
	node.style.animation = node.style.animation
		.split(', ')
		.filter(anim => anim && anim.indexOf(name) === -1)
		.join(', ');

	if (--active <= 0) clear_rules();
}

export function clear_rules() {
	let i = stylesheet.cssRules.length;
	while (i--) stylesheet.deleteRule(i);
	current_rules = {};
}