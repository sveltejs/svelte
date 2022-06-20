import { append_empty_stylesheet, get_root_for_style } from './dom';
import { raf } from './environment';

interface StyleInformation {
	stylesheet: CSSStyleSheet;
	rules: Record<string, true>;
}

export class StyleSheetTestObj {
	title: string;
	type: string;
	cssRules: any[];

	constructor(title: string, type: string = 'text/css', cssRules: any[] = []) {
		this.title = title;
		this.type = type;
		this.cssRules = cssRules;
	}
}

export function get_svelte_style_sheet_index(style_sheet_list: StyleSheetList | StyleSheetTestObj[]) {
	let svelte_style_sheet_index: number;
	const svelte_style_sheet_title = 'svelte-stylesheet';
	
		for (let i = 0; i < style_sheet_list.length; i++) {
			if ( style_sheet_list[i].type !== 'text/css') continue;
			const css = <CSSStyleSheet>style_sheet_list[i];
			
		const css_rules = css?.cssRules;

		if (!css_rules) continue;

		if (css.title === svelte_style_sheet_title && css_rules.length === 0) {
			svelte_style_sheet_index = i;
			break;
		}
	}
	return svelte_style_sheet_index;
}
// we need to store the information for multiple documents because a Svelte application could also contain iframes
// https://github.com/sveltejs/svelte/issues/3624
const managed_styles = new Map<Document | ShadowRoot, StyleInformation>();
let active = 0;

// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str: string) {
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return hash >>> 0;
}

function create_style_information(doc: Document | ShadowRoot, node: Element & ElementCSSInlineStyle) {
	
	let svelte_style_sheet_index: number;

	if (!managed_styles.get(doc)) {
		svelte_style_sheet_index = get_svelte_style_sheet_index(document.styleSheets);
	}
	const info = { stylesheet: (document.styleSheets[svelte_style_sheet_index] as CSSStyleSheet) ?? append_empty_stylesheet(node), rules: {} };
	managed_styles.set(doc, info);
	return info;
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
	const doc = get_root_for_style(node);

	const { stylesheet, rules } = managed_styles.get(doc) ||  create_style_information(doc, node);

	if (!rules[name]) {
		rules[name] = true;
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
		managed_styles.forEach(info => {
			const { stylesheet } = info;
			let i = stylesheet.cssRules.length;
			while (i--) stylesheet.deleteRule(i);
			info.rules = {};
		});
		managed_styles.clear();
	});
}
