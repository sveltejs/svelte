import { append_empty_stylesheet, get_root_for_node } from './dom';
import { raf } from './environment';

interface ExtendedDoc extends Document {
	__svelte_stylesheet: CSSStyleSheet;
	__svelte_rules: Record<string, true>;
}

const active_docs = new Set<ExtendedDoc>();
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
	const doc = get_root_for_node(node) as unknown as ExtendedDoc;
	active_docs.add(doc);
	const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet as CSSStyleSheet);
	const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});

	if (!current_rules[name]) {
		current_rules[name] = true;
		stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
	}

	const animation = node.style.animation || '';
	node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;

	active += 1;
	return name;
}

export function delete_rule(node: Element & ElementCSSInlineStyle, name?: string) {
	const previous = (node.style.animation || '').split(', ');
	const next = previous.filter(name
		? anim => anim.indexOf(name) < 0 // remove specific animation
		: anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
	);
	const deleted = previous.length - next.length;
	if (deleted) {
		node.style.animation = next.join(', ');
		active -= deleted;
		if (!active) clear_rules();
	}
}

export function clear_rules() {
	raf(() => {
		if (active) return;
		active_docs.forEach(doc => {
			const stylesheet = doc.__svelte_stylesheet;
			let i = stylesheet.cssRules.length;
			while (i--) stylesheet.deleteRule(i);
			doc.__svelte_rules = {};
		});
		active_docs.clear();
	});
}
