import { element } from './dom';
import { raf } from './environment';

type DocStyles = [CSSStyleSheet, Record<string, true>];

let activeDocs = new Set<Document>();
let docStyles = new WeakMap<Document, DocStyles>();
let active = 0;

// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str: string) {
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return hash >>> 0;
}

export function create_rule(node: Element & ElementCSSInlineStyle, a: number, b: number, duration: number, delay: number, ease: (t: number) => number, fn: (t: number, u: number) => string, uid: number = 0) {
	const step = 16.666 / duration;
	let keyframes = '{\n';

	for (let p = 0; p <= 1; p += step) {
		const t = a + (b - a) * ease(p);
		keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
	}

	const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
	const name = `__svelte_${hash(rule)}_${uid}`;
	const doc = node.ownerDocument;
	activeDocs.add(doc);
	let [ stylesheet, current_rules ] = (docStyles.get(doc) || []) as DocStyles;
	if (!stylesheet) {
		current_rules = {};
		const style = element('style');
		doc.head.appendChild(style);
		stylesheet = style.sheet as CSSStyleSheet;
		docStyles.set(doc, [ stylesheet, current_rules ]);
	}

	if (!current_rules[name]) {
		current_rules[name] = true;
		stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
	}

	const animation = node.style.animation || '';
	node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;

	active += 1;
	return name;
}

export function delete_rule(node: Element & ElementCSSInlineStyle, name?: string) {
	node.style.animation = (node.style.animation || '')
		.split(', ')
		.filter(name
			? anim => anim.indexOf(name) < 0 // remove specific animation
			: anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
		)
		.join(', ');

	active = Math.max(0, active - 1);
	if (name && !active) clear_rules();
}

export function clear_rules() {
	raf(() => {
		if (active) return;
		activeDocs.forEach(doc => {
			const [ stylesheet ] = docStyles.get(doc);
			let i = stylesheet.cssRules.length;
			while (i--) stylesheet.deleteRule(i);
			docStyles.set(doc, [ stylesheet, {} ]);
		});
		activeDocs.clear();
	});
}
