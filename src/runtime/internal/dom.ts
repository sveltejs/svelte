import { has_prop } from './utils';

// Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
// at the end of hydration without touching the remaining nodes.
let is_hydrating = false;

export function start_hydrating() {
	is_hydrating = true;
}
export function end_hydrating() {
	is_hydrating = false;
}

export function append(target: Node & {actual_end_child?: Node | null}, node: Node) {
	if (is_hydrating) {
		// If we are just starting with this target, we will insert before the firstChild (which may be null)
		if (target.actual_end_child === undefined) {
			target.actual_end_child = target.firstChild;
		}
		if (node.parentNode !== target) {
			target.insertBefore(node, target.actual_end_child);
		} else {
			target.actual_end_child = node.nextSibling;
		}
	} else if (node.parentNode !== target) {
		target.appendChild(node);
	}
}

export function insert(target: Node, node: Node, anchor?: Node) {
	if (is_hydrating && !anchor) {
		append(target, node);
	} else if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
		target.insertBefore(node, anchor || null);
	}
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

export function children(element: HTMLElement) {
	return Array.from(element.childNodes);
}

type ChildNodeArray = ChildNode[] & {
	/**
     * All nodes at or after this index are available for preservation (not getting detached)
     */
	lastKeepIndex?: number;
};

function claim_node<R extends ChildNode>(nodes: ChildNodeArray, predicate: (node: ChildNode) => node is R, processNode: (node: ChildNode) => void, createNode: () => R) {
	if (nodes.lastKeepIndex === undefined) {
		nodes.lastKeepIndex = 0;
	}
	
	// We first try to find a node we can actually keep without detaching
	// This node should be after the previous node that we chose to keep without detaching
	for (let i = nodes.lastKeepIndex; i < nodes.length; i++) {
		const node = nodes[i];
		
		if (predicate(node)) {
			processNode(node);

			nodes.splice(i, 1);
			nodes.lastKeepIndex = i;
			return node;
		}
	}
	
	
	// Otherwise, we try to find a node that we should detach
	for (let i = 0; i < nodes.lastKeepIndex; i++) {
		const node = nodes[i];
		
		if (predicate(node)) {
			processNode(node);

			nodes.splice(i, 1);
			nodes.lastKeepIndex -= 1;
			detach(node);
			return node;
		}
	}
	
	// If we can't find any matching node, we create a new one
	return createNode();
}

export function claim_element(nodes: ChildNodeArray, name: string, attributes: {[key: string]: boolean}, svg) {
	return claim_node<Element | SVGElement>(
		nodes,
		(node: ChildNode): node is Element | SVGElement => node.nodeName === name,
		(node: Element) => {
			const remove = [];
			for (let j = 0; j < node.attributes.length; j++) {
				const attribute = node.attributes[j];
				if (!attributes[attribute.name]) {
					remove.push(attribute.name);
				}
			}
			remove.forEach(v => node.removeAttribute(v));
		},
		() => svg ? svg_element(name as keyof SVGElementTagNameMap) : element(name as keyof HTMLElementTagNameMap)
	);
}

export function claim_text(nodes: ChildNodeArray, data) {
	return claim_node<Text>(
		nodes,
		(node: ChildNode): node is Text => node.nodeType === 3,
		(node: Text) => node.data = '' + data,
		() => text(data)
	);
}

export function claim_space(nodes) {
	return claim_text(nodes, ' ');
}

function find_comment(nodes, text, start) {
	for (let i = start; i < nodes.length; i += 1) {
		const node = nodes[i];
		if (node.nodeType === 8 /* comment node */ && node.textContent.trim() === text) {
			return i;
		}
	}
	return nodes.length;
}

export function claim_html_tag(nodes) {
	// find html opening tag
	const start_index = find_comment(nodes, 'HTML_TAG_START', 0);
	const end_index = find_comment(nodes, 'HTML_TAG_END', start_index);
	if (start_index === end_index) {
		return new HtmlTag();
	}
	const html_tag_nodes = nodes.splice(start_index, end_index + 1);
	detach(html_tag_nodes[0]);
	detach(html_tag_nodes[html_tag_nodes.length - 1]);
	return new HtmlTag(html_tag_nodes.slice(1, html_tag_nodes.length - 1));
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
	// parent for creating node
	e: HTMLElement;
	// html tag nodes
	n: ChildNode[];
	// hydration claimed nodes
	l: ChildNode[] | void;
	// target
	t: HTMLElement;
	// anchor
	a: HTMLElement;

	constructor(claimed_nodes?: ChildNode[]) {
		this.e = this.n = null;
		this.l = claimed_nodes;
	}

	m(html: string, target: HTMLElement, anchor: HTMLElement = null) {
		if (!this.e) {
			this.e = element(target.nodeName as keyof HTMLElementTagNameMap);
			this.t = target;
			if (this.l) {
				this.n = this.l;
			} else {
				this.h(html);
			}
		}

		this.i(anchor);
	}

	h(html: string) {
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
