import { has_prop } from './utils';

export function append(target: Node, node: Node) {
	target.appendChild(node);
}

export function insert(target: Node, node: Node, anchor?: Node) {
	target.insertBefore(node, anchor || null);
}

export function detach(node: Node) {
	node.parentNode.removeChild(node);
}

export function destroy_each(iterations, detaching) {
	for (let i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detaching);
	}
}

export function element<K extends keyof HTMLElementTagNameMap>(name: K) {
	return document.createElement<K>(name);
}

export function element_is<K extends keyof HTMLElementTagNameMap>(name: K, is: string) {
	return document.createElement<K>(name, { is });
}

export function object_without_properties<T, K extends keyof T>(obj: T, exclude: K[]) {
	const target = {} as Pick<T, Exclude<keyof T, K>>;
	for (const k in obj) {
		if (
			has_prop(obj, k)
			// @ts-ignore
			&& exclude.indexOf(k) === -1
		) {
			// @ts-ignore
			target[k] = obj[k];
		}
	}
	return target;
}

export function svg_element<K extends keyof SVGElementTagNameMap>(name: K): SVGElement {
	return document.createElementNS<K>('http://www.w3.org/2000/svg', name);
}

export function text(data: string) {
	return document.createTextNode(data);
}

export function space() {
	return text(' ');
}

export function empty() {
	return text('');
}

export function listen(node: EventTarget, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | EventListenerOptions) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}

export function prevent_default(fn) {
	return function(event) {
		event.preventDefault();
		// @ts-ignore
		return fn.call(this, event);
	};
}

export function stop_propagation(fn) {
	return function(event) {
		event.stopPropagation();
		// @ts-ignore
		return fn.call(this, event);
	};
}

export function self(fn) {
	return function(event) {
		// @ts-ignore
		if (event.target === this) fn.call(this, event);
	};
}

export function attr(node: Element, attribute: string, value?: string) {
	if (value == null) node.removeAttribute(attribute);
	else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}

export function set_attributes(node: Element & ElementCSSInlineStyle, attributes: { [x: string]: string }) {
	// @ts-ignore
	const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
	for (const key in attributes) {
		if (attributes[key] == null) {
			node.removeAttribute(key);
		} else if (key === 'style') {
			node.style.cssText = attributes[key];
		} else if (key === '__value') {
			(node as any).value = node[key] = attributes[key];
		} else if (descriptors[key] && descriptors[key].set) {
			node[key] = attributes[key];
		} else {
			attr(node, key, attributes[key]);
		}
	}
}

export function set_svg_attributes(node: Element & ElementCSSInlineStyle, attributes: { [x: string]: string }) {
	for (const key in attributes) {
		attr(node, key, attributes[key]);
	}
}

export function set_custom_element_data(node, prop, value) {
	if (prop in node) {
		node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
	} else {
		attr(node, prop, value);
	}
}

export function xlink_attr(node, attribute, value) {
	node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
}

export function get_binding_group_value(group, __value, checked) {
	const value = new Set();
	for (let i = 0; i < group.length; i += 1) {
		if (group[i].checked) value.add(group[i].__value);
	}
	if (!checked) {
		value.delete(__value);
	}
	return Array.from(value);
}

export function to_number(value) {
	return value === '' ? null : +value;
}

export function time_ranges_to_array(ranges) {
	const array = [];
	for (let i = 0; i < ranges.length; i += 1) {
		array.push({ start: ranges.start(i), end: ranges.end(i) });
	}
	return array;
}

export function children(element) {
	return Array.from(element.childNodes);
}

export function claim_element(nodes, name, attributes, svg) {
	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i];
		if (node.nodeName === name) {
			let j = 0;
			const remove = [];
			while (j < node.attributes.length) {
				const attribute = node.attributes[j++];
				if (!attributes[attribute.name]) {
					remove.push(attribute.name);
				}
			}
			for (let k = 0; k < remove.length; k++) {
				node.removeAttribute(remove[k]);
			}
			return nodes.splice(i, 1)[0];
		}
	}

	return svg ? svg_element(name) : element(name);
}

export function claim_text(nodes, data) {
	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i];
		if (node.nodeType === 3) {
			node.data = '' + data;
			return nodes.splice(i, 1)[0];
		}
	}

	return text(data);
}

export function claim_space(nodes) {
	return claim_text(nodes, ' ');
}

export function set_data(text, data) {
	data = '' + data;
	if (text.wholeText !== data) text.data = data;
}

export function set_input_value(input, value) {
	input.value = value == null ? '' : value;
}

export function set_input_type(input, type) {
	try {
		input.type = type;
	} catch (e) {
		// do nothing
	}
}

export function set_style(node, key, value, important) {
	node.style.setProperty(key, value, important ? 'important' : '');
}

export function select_option(select, value) {
	for (let i = 0; i < select.options.length; i += 1) {
		const option = select.options[i];

		if (option.__value === value) {
			option.selected = true;
			return;
		}
	}
}

export function select_options(select, value) {
	for (let i = 0; i < select.options.length; i += 1) {
		const option = select.options[i];
		option.selected = ~value.indexOf(option.__value);
	}
}

export function select_value(select) {
	const selected_option = select.querySelector(':checked') || select.options[0];
	return selected_option && selected_option.__value;
}

export function select_multiple_value(select) {
	return [].map.call(select.querySelectorAll(':checked'), option => option.__value);
}

// unfortunately this can't be a constant as that wouldn't be tree-shakeable
// so we cache the result instead
let crossorigin: boolean;

export function is_crossorigin() {
	if (crossorigin === undefined) {
		crossorigin = false;

		try {
			if (typeof window !== 'undefined' && window.parent) {
				void window.parent.document;
			}
		} catch (error) {
			crossorigin = true;
		}
	}

	return crossorigin;
}

export function add_resize_listener(node: HTMLElement, fn: () => void) {
	const computed_style = getComputedStyle(node);

	if (computed_style.position === 'static') {
		node.style.position = 'relative';
	}

	const iframe = element('iframe');
	iframe.setAttribute('style',
		'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
		'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;'
	);
	iframe.setAttribute('aria-hidden', 'true');
	iframe.tabIndex = -1;

	const crossorigin = is_crossorigin();

	let unsubscribe: () => void;

	if (crossorigin) {
		iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
		unsubscribe = listen(window, 'message', (event: MessageEvent) => {
			if (event.source === iframe.contentWindow) fn();
		});
	} else {
		iframe.src = 'about:blank';
		iframe.onload = () => {
			unsubscribe = listen(iframe.contentWindow, 'resize', fn);
		};
	}

	append(node, iframe);

	return () => {
		if (crossorigin) {
			unsubscribe();
		} else if (unsubscribe && iframe.contentWindow) {
			unsubscribe();
		}

		detach(iframe);
	};
}

export function toggle_class(element, name, toggle) {
	element.classList[toggle ? 'add' : 'remove'](name);
}

export function custom_event<T=any>(type: string, detail?: T) {
	const e: CustomEvent<T> = document.createEvent('CustomEvent');
	e.initCustomEvent(type, false, false, detail);
	return e;
}

export function query_selector_all(selector: string, parent: HTMLElement = document.body) {
	return Array.from(parent.querySelectorAll(selector));
}

export class HtmlTag {
	e: HTMLElement;
	n: ChildNode[];
	t: HTMLElement;
	a: HTMLElement;

	constructor(anchor: HTMLElement = null) {
		this.a = anchor;
		this.e = this.n = null;
	}

	m(html: string, target: HTMLElement, anchor: HTMLElement = null) {
		if (!this.e) {
			this.e = element(target.nodeName as keyof HTMLElementTagNameMap);
			this.t = target;
			this.h(html);
		}

		this.i(anchor);
	}

	h(html) {
		this.e.innerHTML = html;
		this.n = Array.from(this.e.childNodes);
	}

	i(anchor) {
		for (let i = 0; i < this.n.length; i += 1) {
			insert(this.t, this.n[i], anchor);
		}
	}

	p(html: string) {
		this.d();
		this.h(html);
		this.i(this.a);
	}

	d() {
		this.n.forEach(detach);
	}
}

export function attribute_to_object(attributes: NamedNodeMap) {
	const result = {};
	for (const attribute of attributes) {
		result[attribute.name] = attribute.value;
	}
	return result;
}

export function get_custom_elements_slots(element: HTMLElement) {
	const result = {};
	element.childNodes.forEach((node: Element) => {
		result[node.slot || 'default'] = true;
	});
	return result;
}
