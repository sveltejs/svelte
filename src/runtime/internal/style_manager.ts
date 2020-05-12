import { element } from './dom';
import { framerate } from 'svelte/environment';
enum SVELTE {
	RULE = `__svelte_`,
	STYLESHEET = `__svelte_stylesheet`,
	RULESET = `__svelte_rules`,
}
interface ExtendedDoc extends Document {
	[SVELTE.STYLESHEET]: CSSStyleSheet;
	[SVELTE.RULESET]: Set<string>;
}

const active_documents = new Set<ExtendedDoc>();
let running_animations = 0;

function add_rule(node): [CSSStyleSheet, Set<string>] {
	const { ownerDocument } = node;
	if (!active_documents.has(ownerDocument)) {
		active_documents.add(ownerDocument);
		if (!(SVELTE.STYLESHEET in ownerDocument))
			ownerDocument[SVELTE.STYLESHEET] = ownerDocument.head.appendChild(element('style')).sheet;
		if (!(SVELTE.RULESET in ownerDocument)) ownerDocument[SVELTE.RULESET] = new Set();
	}
	return [ownerDocument[SVELTE.STYLESHEET], ownerDocument[SVELTE.RULESET]];
}

function hash(str: string) {
	// darkskyapp/string-hash
	let hash = 5381;
	let i = str.length;
	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return hash >>> 0;
}
const gen = (step, css) => {
	let rule = '{\n';
	for (let t = 0; t < 1; t += step) rule += `${100 * t}%{${css(t)}}\n`;
	rule += `100% {${css(1)}}\n}`;
	const name = SVELTE.RULE + hash(rule);
	return [name, `@keyframes ${name} ${rule}`];
};
function animate(this: HTMLElement, css: (t: number) => string, duration: number, delay = 0) {
	const [name, rule] = gen(Math.max(1 / 1000, framerate / duration), css);
	const [stylesheet, rules] = add_rule(this);
	if (!rules.has(name)) {
		rules.add(name);
		stylesheet.insertRule(rule, stylesheet.cssRules.length);
	}
	const previous = this.style.animation;
	this.style.animation = `${
		previous ? `${previous}, ` : ''
	} ${duration}ms linear ${delay}ms 1 normal both running ${name}`;

	running_animations++;
	return () => {
		const prev = (this.style.animation || '').split(', ');
		const next = prev.filter((anim) => !anim.includes(name));
		if (prev.length !== next.length) this.style.animation = next.join(', ');
		if (--running_animations) return;
		active_documents.forEach(({ [SVELTE.STYLESHEET]: stylesheet, [SVELTE.RULESET]: ruleset }) => {
			let i = stylesheet.cssRules.length;
			while (i--) stylesheet.deleteRule(i);
			ruleset.clear();
		});
		active_documents.clear();
	};
}
export const animate_css = Function.prototype.call.bind(animate);
