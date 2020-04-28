import { element } from './dom';
import { next_frame } from './loop';

const svelte_rule = `__svelte_`;

interface ExtendedDoc extends Document {
	__svelte_stylesheet: CSSStyleSheet;
	__svelte_rules: Set<string>;
}

const active_documents = new Set<ExtendedDoc>();
let running_animations = 0;

function rulesheet({ ownerDocument }): [CSSStyleSheet, Set<string>] {
	const doc = ownerDocument as ExtendedDoc;
	if (!active_documents.has(doc)) {
		active_documents.add(doc);
		if (!doc.__svelte_stylesheet) {
			doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet as CSSStyleSheet;
		}
		if (!doc.__svelte_rules) {
			doc.__svelte_rules = new Set();
		}
	}
	return [doc.__svelte_stylesheet, doc.__svelte_rules];
}
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str: string) {
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return hash >>> 0;
}
export function generate_rule(
	node: HTMLElement,
	a: number,
	b: number,
	duration: number,
	delay: number,
	ease: (t: number) => number,
	fn: (t: number, u: number) => string
) {
	const step = 16.6667 / duration;
	let rule = '{\n';
	for (let p = 0, t = 0; p <= 1; p += step) {
		t = a + (b - a) * ease(p);
		rule += p * 100 + `%{${fn(t, 1 - t)}}\n`;
	}
	rule += `100% {${fn(b, 1 - b)}}\n}`;
	const name = `${svelte_rule}${hash(rule)}`;
	const [stylesheet, rules] = rulesheet(node);
	if (!rules.has(name)) {
		rules.add(name);
		stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
	}
	const previous = node.style.animation || '';
	node.style.animation = `${previous ? `${previous}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
	running_animations++;
	return () => {
		const prev = (node.style.animation || '').split(', ');
		const next = prev.filter((anim) => !anim.includes(name));
		if (prev.length === next.length) return;
		node.style.animation = next.join(', ');
		if (--running_animations) return;
		active_documents.forEach(({ __svelte_stylesheet, __svelte_rules }) => {
			let i = __svelte_stylesheet.cssRules.length;
			while (i--) __svelte_stylesheet.deleteRule(i);
			__svelte_rules.clear();
		});
		active_documents.clear();
	};
}
export function delete_rule(node: HTMLElement, name?: string) {
	const previous = (node.style.animation || '').split(', ');
	const next = previous.filter(
		name
			? (anim) => anim.indexOf(name) < 0 // remove specific animation
			: (anim) => anim.indexOf('__svelte') === -1 // remove all Svelte animations
	);
	const deleted = previous.length - next.length;
	if (deleted) {
		node.style.animation = next.join(', ');
		running_animations -= deleted;
		if (!active_documents) active_documents.clear();
	}
}
