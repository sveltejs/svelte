import { framerate } from './environment';

let documents_uid = 0;
let running_animations = 0;

const document_uid = new Map();
const document_stylesheets = new Map();

const current_rules = new Set();
export const animate_css = /*#__PURE__*/ Function.prototype.call.bind(function animate_css(
	this: HTMLElement,
	css: (t: number) => string,
	duration: number,
	delay = 0
) {
	if (!document_uid.has(this.ownerDocument)) {
		document_uid.set(this.ownerDocument, documents_uid++);
		document_stylesheets.set(
			this.ownerDocument,
			this.ownerDocument.head.appendChild(this.ownerDocument.createElement('style')).sheet
		);
	}
	let rule = '{\n';
	for (let t = 0, step = framerate / duration; t < 1; t += step) rule += `${100 * t}%{${css(t)}}\n`;
	rule += `100% {${css(1)}}\n}`;

	// darkskyapp/string-hash
	let i = rule.length,
		hash = 5381;
	while (i--) hash = ((hash << 5) - hash) ^ rule.charCodeAt(i);
	const name = `__svelte_${hash >>> 0}${document_uid.get(this.ownerDocument)}`;

	if (!current_rules.has(name)) {
		current_rules.add(name);
		const stylesheet = document_stylesheets.get(this.ownerDocument);
		stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
	}

	const previous = this.style.animation;
	this.style.animation = `${
		previous ? `${previous}, ` : ''
	}${duration}ms linear ${delay}ms 1 normal both running ${name}`;

	running_animations++;

	return () => {
		const prev = (this.style.animation || '').split(', ');
		const next = prev.filter((anim) => !anim.includes(name));
		if (prev.length !== next.length) this.style.animation = next.join(', ');
		if (--running_animations === 0) {
			document_stylesheets.forEach((stylesheet) => {
				let i = stylesheet.cssRules.length;
				while (i--) stylesheet.deleteRule(i);
			});
			current_rules.clear();
			if (1 !== documents_uid) {
				document_stylesheets.clear();
				document_uid.clear();
				documents_uid = 0;
			}
		}
	};
});
