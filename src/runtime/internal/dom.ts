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

type NodeEx = Node & {
	claim_order?: number,
	hydrate_init? : true,
	actual_end_child?: NodeEx,
	childNodes: NodeListOf<NodeEx>,
};

function upper_bound(low: number, high: number, key: (index: number) => number, value: number) {
	// Return first index of value larger than input value in the range [low, high)
	while (low < high) {
		const mid = low + ((high - low) >> 1);
		if (key(mid) <= value) {
			low = mid + 1;
		} else {
			high = mid;
		}
	}
	return low;
}

function init_hydrate(target: NodeEx) {
	if (target.hydrate_init) return;
	target.hydrate_init = true;

	type NodeEx2 = NodeEx & {claim_order: number};

	// We know that all children have claim_order values since the unclaimed have been detached if target is not <head>
	let children: ArrayLike<NodeEx2> = target.childNodes as NodeListOf<NodeEx2>;

	// If target is <head>, there may be children without claim_order
	if (target.nodeName === 'HEAD') {
		const myChildren = [];
		for (let i = 0; i < children.length; i++) {
			const node = children[i];
			if (node.claim_order !== undefined) {
				myChildren.push(node);
			}
		}
		children = myChildren;
	}

	/*
	* Reorder claimed children optimally.
	* We can reorder claimed children optimally by finding the longest subsequence of
	* nodes that are already claimed in order and only moving the rest. The longest
	* subsequence subsequence of nodes that are claimed in order can be found by
	* computing the longest increasing subsequence of .claim_order values.
	*
	* This algorithm is optimal in generating the least amount of reorder operations
	* possible.
	*
	* Proof:
	* We know that, given a set of reordering operations, the nodes that do not move
	* always form an increasing subsequence, since they do not move among each other
	* meaning that they must be already ordered among each other. Thus, the maximal
	* set of nodes that do not move form a longest increasing subsequence.
	*/

	// Compute longest increasing subsequence
	// m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
	const m = new Int32Array(children.length + 1);
	// Predecessor indices + 1
	const p = new Int32Array(children.length);

	m[0] = -1;
	let longest = 0;
	for (let i = 0; i < children.length; i++) {
		const current = children[i].claim_order;
		// Find the largest subsequence length such that it ends in a value less than our current value

		// upper_bound returns first greater value, so we subtract one
		// with fast path for when we are on the current longest subsequence
		const seqLen = ((longest > 0 && children[m[longest]].claim_order <= current) ? longest + 1 : upper_bound(1, longest, idx => children[m[idx]].claim_order, current)) - 1;

		p[i] = m[seqLen] + 1;

		const newLen = seqLen + 1;

		// We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
		m[newLen] = i;

		longest = Math.max(newLen, longest);
	}

	// The longest increasing subsequence of nodes (initially reversed)
	const lis: NodeEx2[] = [];
	// The rest of the nodes, nodes that will be moved
	const toMove: NodeEx2[] = [];
	let last = children.length - 1;
	for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
		lis.push(children[cur - 1]);
		for (; last >= cur; last--) {
			toMove.push(children[last]);
		}
		last--;
	}
	for (; last >= 0; last--) {
		toMove.push(children[last]);
	}
	lis.reverse();

	// We sort the nodes being moved to guarantee that their insertion order matches the claim order
	toMove.sort((a, b) => a.claim_order - b.claim_order);

	// Finally, we move the nodes
	for (let i = 0, j = 0; i < toMove.length; i++) {
		while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
			j++;
		}
		const anchor = j < lis.length ? lis[j] : null;
		target.insertBefore(toMove[i], anchor);
	}
}

export function append(target: Node, node: Node) {
	target.appendChild(node);
}

export function append_styles(
	target: Node,
	style_sheet_id: string,
	styles: string
) {
	const append_styles_to = get_root_for_style(target);

	if (!append_styles_to.getElementById(style_sheet_id)) {
		const style = element('style');
		style.id = style_sheet_id;
		style.textContent = styles;
		append_stylesheet(append_styles_to, style);
	}
}

export function get_root_for_style(node: Node): ShadowRoot | Document {
	if (!node) return document;

	const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
	if (root && (root as ShadowRoot).host) {
		return root as ShadowRoot;
	}
	return node.ownerDocument;
}

export function append_empty_stylesheet(node: Node) {
	const style_element = element('style') as HTMLStyleElement;
	append_stylesheet(get_root_for_style(node), style_element);
	return style_element.sheet as CSSStyleSheet;
}

function append_stylesheet(node: ShadowRoot | Document, style: HTMLStyleElement) {
	append((node as Document).head || node, style);
}

export function append_hydration(target: NodeEx, node: NodeEx) {
	if (is_hydrating) {
		init_hydrate(target);

		if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
			target.actual_end_child = target.firstChild;
		}

		// Skip nodes of undefined ordering
		while ((target.actual_end_child !== null) && (target.actual_end_child.claim_order === undefined)) {
			target.actual_end_child = target.actual_end_child.nextSibling;
		}

		if (node !== target.actual_end_child) {
			// We only insert if the ordering of this node should be modified or the parent node is not target
			if (node.claim_order !== undefined || node.parentNode !== target) {
				target.insertBefore(node, target.actual_end_child);
			}
		} else {
			target.actual_end_child = node.nextSibling;
		}
	} else if (node.parentNode !== target || node.nextSibling !== null) {
		target.appendChild(node);
	}
}

export function insert(target: Node, node: Node, anchor?: Node) {
	target.insertBefore(node, anchor || null);
}

export function insert_hydration(target: NodeEx, node: NodeEx, anchor?: NodeEx) {
	if (is_hydrating && !anchor) {
		append_hydration(target, node);
	} else if (node.parentNode !== target || node.nextSibling != anchor) {
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

export function trusted(fn) {
	return function(event) {
		// @ts-ignore
		if (event.isTrusted) fn.call(this, event);
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

type ChildNodeEx = ChildNode & NodeEx;

type ChildNodeArray = ChildNodeEx[] & {
	claim_info?: {
		/**
		 * The index of the last claimed element
		 */
		last_index: number;
		/**
		 * The total number of elements claimed
		 */
		total_claimed: number;
	}
};

export function children(element: Element) {
	return Array.from(element.childNodes);
}

function init_claim_info(nodes: ChildNodeArray) {
	if (nodes.claim_info === undefined) {
		nodes.claim_info = {last_index: 0, total_claimed: 0};
	}
}

function claim_node<R extends ChildNodeEx>(nodes: ChildNodeArray, predicate: (node: ChildNodeEx) => node is R, processNode: (node: ChildNodeEx) => ChildNodeEx | undefined, createNode: () => R, dontUpdateLastIndex: boolean = false) {
	// Try to find nodes in an order such that we lengthen the longest increasing subsequence
	init_claim_info(nodes);

	const resultNode = (() => {
		// We first try to find an element after the previous one
		for (let i = nodes.claim_info.last_index; i < nodes.length; i++) {
			const node = nodes[i];

			if (predicate(node)) {
				const replacement = processNode(node);

				if (replacement === undefined) {
					nodes.splice(i, 1);
				} else {
					nodes[i] = replacement;
				}
				if (!dontUpdateLastIndex) {
					nodes.claim_info.last_index = i;
				}
				return node;
			}
		}


		// Otherwise, we try to find one before
		// We iterate in reverse so that we don't go too far back
		for (let i = nodes.claim_info.last_index - 1; i >= 0; i--) {
			const node = nodes[i];

			if (predicate(node)) {
				const replacement = processNode(node);

				if (replacement === undefined) {
					nodes.splice(i, 1);
				} else {
					nodes[i] = replacement;
				}
				if (!dontUpdateLastIndex) {
					nodes.claim_info.last_index = i;
				} else if (replacement === undefined) {
					// Since we spliced before the last_index, we decrease it
					nodes.claim_info.last_index--;
				}
				return node;
			}
		}

		// If we can't find any matching node, we create a new one
		return createNode();
	})();

	resultNode.claim_order = nodes.claim_info.total_claimed;
	nodes.claim_info.total_claimed += 1;
	return resultNode;
}

function claim_element_base(nodes: ChildNodeArray, name: string, attributes: { [key: string]: boolean }, create_element: (name: string) => Element | SVGElement) {
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
			return undefined;
		},
		() => create_element(name)
	);
}

export function claim_element(nodes: ChildNodeArray, name: string, attributes: { [key: string]: boolean }) {
	return claim_element_base(nodes, name, attributes, element);
}

export function claim_svg_element(nodes: ChildNodeArray, name: string, attributes: { [key: string]: boolean }) {
	return claim_element_base(nodes, name, attributes, svg_element);
}

export function claim_text(nodes: ChildNodeArray, data) {
	return claim_node<Text>(
		nodes,
		(node: ChildNode): node is Text => node.nodeType === 3,
		(node: Text) => {
			const dataStr = '' + data;
			if (node.data.startsWith(dataStr)) {
				if (node.data.length !== dataStr.length) {
					return node.splitText(dataStr.length);
				}
			} else {
				node.data = dataStr;
			}
		},
		() => text(data),
		true	// Text nodes should not update last index since it is likely not worth it to eliminate an increasing subsequence of actual elements
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


export function claim_html_tag(nodes, is_svg: boolean) {
	// find html opening tag
	const start_index = find_comment(nodes, 'HTML_TAG_START', 0);
	const end_index = find_comment(nodes, 'HTML_TAG_END', start_index);
	if (start_index === end_index) {
		return new HtmlTagHydration(undefined, is_svg);
	}

	init_claim_info(nodes);
	const html_tag_nodes = nodes.splice(start_index, end_index - start_index + 1);
	detach(html_tag_nodes[0]);
	detach(html_tag_nodes[html_tag_nodes.length - 1]);
	const claimed_nodes = html_tag_nodes.slice(1, html_tag_nodes.length - 1);
	for (const n of claimed_nodes) {
		n.claim_order = nodes.claim_info.total_claimed;
		nodes.claim_info.total_claimed += 1;
	}
	return new HtmlTagHydration(claimed_nodes, is_svg);
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
	if (value === null) {
		node.style.removeProperty(key);
	} else {
		node.style.setProperty(key, value, important ? 'important' : '');
	}
}

export function select_option(select, value) {
	for (let i = 0; i < select.options.length; i += 1) {
		const option = select.options[i];

		if (option.__value === value) {
			option.selected = true;
			return;
		}
	}

	select.selectedIndex = -1; // no option should be selected
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

export function custom_event<T=any>(type: string, detail?: T, { bubbles = false, cancelable = false } = {}): CustomEvent<T> {
	const e: CustomEvent<T> = document.createEvent('CustomEvent');
	e.initCustomEvent(type, bubbles, cancelable, detail);
	return e;
}

export function query_selector_all(selector: string, parent: HTMLElement = document.body) {
	return Array.from(parent.querySelectorAll(selector)) as ChildNodeArray;
}

export class HtmlTag {
	private is_svg = false;
	// parent for creating node
	e: HTMLElement | SVGElement;
	// html tag nodes
	n: ChildNode[];
	// target
	t: HTMLElement | SVGElement;
	// anchor
	a: HTMLElement | SVGElement;

	constructor(is_svg: boolean = false) {
		this.is_svg = is_svg;
		this.e = this.n = null;
	}

	c(html: string) {
		this.h(html);
	}

	m(
		html: string,
		target: HTMLElement | SVGElement,
		anchor: HTMLElement | SVGElement = null
	) {
		if (!this.e) {
			if (this.is_svg) this.e = svg_element(target.nodeName as keyof SVGElementTagNameMap);
			else this.e = element(target.nodeName as keyof HTMLElementTagNameMap);
			this.t = target;
			this.c(html);
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

export class HtmlTagHydration extends HtmlTag {
	// hydration claimed nodes
	l: ChildNode[] | void;

	constructor(claimed_nodes?: ChildNode[], is_svg: boolean = false) {
		super(is_svg);
		this.e = this.n = null;
		this.l = claimed_nodes;
	}
	c(html: string) {
		if (this.l) {
			this.n = this.l;
		} else {
			super.c(html);
		}
	}
	i(anchor) {
		for (let i = 0; i < this.n.length; i += 1) {
			insert_hydration(this.t, this.n[i], anchor);
		}
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
