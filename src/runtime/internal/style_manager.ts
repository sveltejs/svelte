import { element } from './dom';
import { raf } from './environment';
const enum SVELTE {
	RULE = `__svelte_`,
	STYLESHEET = `__svelte_stylesheet`,
	RULESET = `__svelte_rules`,
}

let FRAME_RATE;
function calc_framerate() {
	const f24 = 1000 / 24,
		f60 = 1000 / 60,
		f144 = 1000 / 144;
	raf((t1) => {
		raf((d) => {
			FRAME_RATE = (d = d - t1) > f144 ? f144 : d < f24 ? f24 : d;
		});
	});
	return (FRAME_RATE = f60);
}
interface ExtendedDoc extends Document {
	[SVELTE.STYLESHEET]: CSSStyleSheet;
	[SVELTE.RULESET]: Set<string>;
}

const active_documents = new Set<ExtendedDoc>();
let running_animations = 0;

function add_rule(node, name, rule): [CSSStyleSheet, Set<string>] {
	const { ownerDocument } = node;
	if (!active_documents.has(ownerDocument)) {
		active_documents.add(ownerDocument);
		if (!(SVELTE.STYLESHEET in ownerDocument))
			ownerDocument[SVELTE.STYLESHEET] = ownerDocument.head.appendChild(element('style')).sheet;
		if (!(SVELTE.RULESET in ownerDocument)) ownerDocument[SVELTE.RULESET] = new Set();
	}
	return [ownerDocument[SVELTE.STYLESHEET], ownerDocument[SVELTE.RULESET]];
}
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str: string) {
	let hash = 5381;
	let i = str.length;
	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return hash >>> 0;
}
const gen = (t, step, css) => {
	let rule = '{\n';
	for (; t < 1; t += step) rule += `${100 * t}%{${css(t)}}\n`;
	rule += `100% {${css(1)}}\n}`;
	const name = SVELTE.RULE + hash(rule);
	return [name, `@keyframes ${name} ${rule}`];
};
export function animate_css(css: (t: number) => string, node: HTMLElement, duration: number, t = 0) {
	const [name, rule] = gen(t, duration / (FRAME_RATE || calc_framerate()), css);
	const [stylesheet, rules] = add_rule(node, rule);
	if (!rules.has(name)) {
		rules.add(name);
		stylesheet.insertRule(rule, stylesheet.cssRules.length);
	}
	const previous = node.style.animation;
	node.style.animation = (previous ? previous + ', ' : '') + `${duration}ms linear 0ms 1 normal both running ${name}`;
	running_animations++;
	return () => {
		const prev = (node.style.animation || '').split(', ');
		const next = prev.filter((anim) => !anim.includes(name));
		if (prev.length !== next.length) node.style.animation = next.join(', ');
		if (--running_animations) return;
		active_documents.forEach(({ [SVELTE.STYLESHEET]: stylesheet, [SVELTE.RULESET]: ruleset }) => {
			let i = stylesheet.cssRules.length;
			while (i--) stylesheet.deleteRule(i);
			ruleset.clear();
		});
		active_documents.clear();
	};
}
export function delete_rule(node: HTMLElement, name?: string) {
	const previous = (node.style.animation || '').split(', ');
	const next = previous.filter(
		name
			? (anim) => anim.indexOf(name) < 0 // remove specific animation
			: (anim) => anim.indexOf(SVELTE.RULE) === -1 // remove all Svelte animations
	);
	const deleted = previous.length - next.length;
	if (deleted) {
		node.style.animation = next.join(', ');
		running_animations -= deleted;
		if (!active_documents) active_documents.clear();
	}
}
