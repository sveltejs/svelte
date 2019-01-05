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

export function create_rule(a, b, duration, ease, fn) {
	const step = 16.666 / duration;
	let keyframes = '{\n';

	for (let p = 0; p <= 1; p += step) {
		const t = a + (b - a) * ease(p);
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
	console.log(`delete ${name} from ${node.textContent}`, { active });

	node.style.animation = node.style.animation
		.split(', ')
		.filter(anim => anim.indexOf(name) < 0)
		.join(', ');

	if (!--active) clear_rules();
}

export function clear_rules() {
	requestAnimationFrame(() => {
		if (active) return;
		let i = stylesheet.cssRules.length;
		console.log(`clear_rules ${i}`);
		while (i--) stylesheet.deleteRule(i);
		current_rules = {};
	});
}