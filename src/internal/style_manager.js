import { createElement } from './dom.js';

let stylesheet;
let active = 0;
let current_rules = {};

export function add_rule(rule, name) {
	if (!stylesheet) {
		const style = createElement('style');
		document.head.appendChild(style);
		stylesheet = style.sheet;
	}

	active += 1;
	console.log(`adding rule`, active);

	if (!current_rules[name]) {
		current_rules[name] = true;
		stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
	}
}

export function delete_rule(node, name) {
	node.style.animation = node.style.animation
		.split(', ')
		.filter(anim => anim && anim.indexOf(name) === -1)
		.join(', ');

	console.trace(`removing rule`, active - 1);
	if (--active <= 0) clear_rules();
}

export function generate_rule({ a, b, delta, duration }, ease, fn) {
	const step = 16.666 / duration;
	let keyframes = '{\n';

	for (let p = 0; p <= 1; p += step) {
		const t = a + delta * ease(p);
		keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
	}

	return keyframes + `100% {${fn(b, 1 - b)}}\n}`;
}

export function clear_rules() {
	let i = stylesheet.cssRules.length;
	console.log(`clearing ${i} rules`);
	while (i--) stylesheet.deleteRule(i);
	current_rules = {};
}