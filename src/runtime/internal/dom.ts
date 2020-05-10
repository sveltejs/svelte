import { dev$element, dev$block } from './dev.tools';
import { is_client, is_cors } from './environment';

export function append(target: Node, node: Node) {
	dev$element(node, `onMount`, { target });
	target.appendChild(node);
}

export function insert(target: Node, node: Node, anchor?: Node) {
	dev$element(node, `onMount`, { target, anchor });
	target.insertBefore(node, anchor || null);
}

export function detach(node: Node) {
	dev$element(node, `onDestroy`);
	node.parentNode.removeChild(node);
}

export function destroy_each(iterations, detaching) {
	for (let i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detaching);
	}
}
const dev$create = <K>(elem: K) => (dev$block(`create`, elem), elem);
export function element<K extends keyof HTMLElementTagNameMap>(name: K) {
	if (__DEV__) return dev$create(document.createElement<K>(name));
	return document.createElement<K>(name);
}

export function element_is<K extends keyof HTMLElementTagNameMap>(name: K, is: string) {
	if (__DEV__) return dev$create(document.createElement<K>(name));
	return document.createElement<K>(name, { is });
}
export function object_without_properties<T, K extends string[]>(obj: T, excluded: K) {
	const target = {} as Pick<T, Exclude<keyof T, keyof K>>;
	let key;
	for (key in obj) if (!~excluded.indexOf(key)) target[key] = obj[key];
	return target;
}

export function svg_element<K extends keyof SVGElementTagNameMap>(name: K): SVGElement {
	if (__DEV__) return dev$create(document.createElementNS<K>('http://www.w3.org/2000/svg', name));
	return document.createElementNS<K>('http://www.w3.org/2000/svg', name);
}

export function text(data: string) {
	if (__DEV__) return dev$create(document.createTextNode(data));
	return document.createTextNode(data);
}

export function space() {
	return text(' ');
}

export function empty() {
	return text('');
}
export function listen(
	node: EventTarget,
	event: string,
	handler: EventListenerOrEventListenerObject,
	options?: boolean | AddEventListenerOptions | EventListenerOptions
) {
	if (__DEV__) {
		const reference = { event, handler };
		dev$element(node, `addEventListener`, reference);
		node.addEventListener(event, handler, options);
		return () => {
			dev$element(node, `removeEventListener`, reference);
			node.removeEventListener(event, handler, options);
		};
	}
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}
// todo inline at compile time
export function prevent_default(fn) {
	return function (event) {
		event.preventDefault();
		// @ts-ignore
		return fn.call(this, event);
	};
}
// todo inline at compile time
export function stop_propagation(fn): EventListenerOrEventListenerObject {
	return function (event) {
		event.stopPropagation();
		//@ts-ignore
		return fn.call(this, event);
	};
}
// todo inline at compile time
export function self(fn) {
	return function (event) {
		// @ts-ignore
		if (event.target === this) fn.call(this, event);
	};
}

export function attr(node: Element, name: string, value?: any) {
	if (value == null) {
		dev$element(node, `removeAttribute`, { name });
		node.removeAttribute(name);
	} else if (node.getAttribute(name) !== value) {
		dev$element(node, `setAttribute`, { name, value });
		node.setAttribute(name, value);
	}
}

export function set_attributes(node: HTMLElement, attributes: { [x: string]: any }) {
	// @ts-ignore
	const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
	let name;
	for (name in attributes) {
		if (attributes[name] == null) {
			dev$element(node, `removeAttribute`, { name });
			node.removeAttribute(name);
		} else if (name === 'style') {
			dev$element(node, `setAttribute`, { name, value: attributes[name] });
			node.style.cssText = attributes[name];
		} else if (name === '__value' || (descriptors[name] && descriptors[name].set)) {
			dev$element(node, `setAttribute`, { name, value: attributes[name] });
			node[name] = attributes[name];
		} else {
			attr(node, name, attributes[name]);
		}
	}
}

export function set_svg_attributes(node: SVGElement, attributes: { [x: string]: any }) {
	let name;
	for (name in attributes) {
		attr(node, name, attributes[name]);
	}
}

export function set_custom_element_data(node, name, value) {
	if (name in node) {
		dev$element(node, `setAttribute`, { name, value });
		node[name] = value;
	} else {
		attr(node, name, value);
	}
}

export function xlink_attr(node: Element, name, value) {
	dev$element(node, `setAttribute`, { name, value });
	node.setAttributeNS('http://www.w3.org/1999/xlink', name, value);
}

export function get_binding_group_value(group) {
	const value = [];
	for (let i = 0, value = []; i < group.length; i += 1) {
		if (group[i].checked) value.push(group[i].__value);
	}
	return value;
}

export function to_number(value) {
	return value === '' ? undefined : +value;
}

export function time_ranges_to_array(ranges) {
	const array = [];
	for (let i = 0; i < ranges.length; i += 1) {
		array.push({ start: ranges.start(i), end: ranges.end(i) });
	}
	return array;
}

export const children = (element: HTMLElement) => Array.from(element.childNodes);

export function claim_element(nodes, name, attributes, is_svg) {
	for (let i = 0, j = 0, n, a; i < nodes.length; i += 1, j = 0)
		if ((n = nodes[i]).nodeName !== name) continue;
		else {
			while (j < n.attributes.length) {
				if (attributes[(a = n.attributes[j]).name]) j++;
				else n.removeAttribute(a.name);
			}
			dev$block(`claim`, n);
			return nodes.splice(i, 1)[0];
		}
	dev$block(`claim.failed`, name);
	return is_svg ? svg_element(name) : element(name);
}

export function claim_text(nodes, data) {
	for (let i = 0, n; i < nodes.length; i += 1)
		if ((n = nodes[i]).nodeType === 3) {
			dev$block(`claim`, n);
			return (n.data = '' + data), nodes.splice(i, 1)[0];
		}
	dev$block(`claim.failed`, 'text');
	return text(data);
}

export function claim_space(nodes) {
	return claim_text(nodes, ' ');
}

export function set_data(text, data) {
	if (text.data !== (data = '' + data)) {
		text.data = data;
		dev$element(text, `setAttribute`, { name: 'data', value: data });
	}
}

export function set_input_value(input, value) {
	if (value != null || input.value) {
		input.value = value;
		dev$element(input, `setAttribute`, { name: 'value', value });
	}
}

export function set_input_type(input, type) {
	try {
		input.type = type;
		dev$element(input, `setAttribute`, { name: 'type', value: type });
	} catch (e) {}
}

export function set_style(node, property, value, is_important?) {
	dev$element(node, `setAttribute`, { name: 'style', property, value });
	node.style.setProperty(property, value, is_important ? 'important' : '');
}

export function select_option(select, value) {
	for (let i = 0, o; i < select.options.length; i += 1) {
		if ((o = select.options[i]).__value === value) {
			dev$element(o, `setAttribute`, { name: 'selected', value: true });
			o.selected = true;
			return;
		}
	}
}

export function select_options(select, value) {
	for (let i = 0, o; i < select.options.length; i += 1) {
		if (__DEV__) {
			dev$element((o = select.options[i]), `setAttribute`, {
				name: 'selected',
				value: (o = select.options[i]).selected = ~value.indexOf(o.__value),
			});
			continue;
		}
		(o = select.options[i]).selected = ~value.indexOf(o.__value);
	}
}

export function select_value(select) {
	return (select = select.querySelector(':checked') || select.options[0]) && select.__value;
}

export function select_multiple_value(select) {
	return [].map.call(select.querySelectorAll(':checked'), (option) => option.__value);
}

export function add_resize_listener(node: HTMLElement, fn: () => void) {
	const computed_style = getComputedStyle(node);
	const z_index = (parseInt(computed_style.zIndex) || 0) - 1;

	if (computed_style.position === 'static') {
		set_style(node, 'position', 'relative');
	}

	const iframe = element('iframe');
	attr(
		iframe,
		'style',
		`display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ` +
			`overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`
	);
	attr(iframe, 'aria-hidden', 'true');
	attr(iframe, 'tabIndex', -1);

	let unsubscribe: () => void;

	if (is_cors) {
		iframe.src = `data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>`;
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
		detach(iframe);
		if (unsubscribe) unsubscribe();
	};
}

export function toggle_class(element, name, toggle) {
	dev$element(element, toggle ? 'addClass' : 'removeClass', { name });
	element.classList[toggle ? 'add' : 'remove'](name);
}

export function custom_event<T = any>(type: string, detail?: T) {
	const event: CustomEvent<T> = document.createEvent('CustomEvent');
	event.initCustomEvent(type, false, false, detail);
	return event;
}
export class HtmlTag {
	e: HTMLElement;
	n: ChildNode[];
	t: HTMLElement;
	a: HTMLElement;

	constructor(html: string, anchor: HTMLElement = null) {
		this.e = element('div');
		this.a = anchor;
		this.u(html);
	}

	m(target: HTMLElement, anchor: HTMLElement = null) {
		for (let i = 0; i < this.n.length; i += 1) {
			insert(target, this.n[i], anchor);
		}

		this.t = target;
	}

	u(html: string) {
		this.e.innerHTML = html;
		this.n = Array.from(this.e.childNodes);
	}

	p(html: string) {
		this.d();
		this.u(html);
		this.m(this.t, this.a);
	}

	d() {
		this.n.forEach(detach);
	}
}

export const hasOwnProperty = Object.prototype.hasOwnProperty;
const nodeProto = Node.prototype;
export const insertBefore = nodeProto.insertBefore;
export const removeChild = nodeProto.removeChild;
export const replaceChild = nodeProto.replaceChild;
export const cloneNode = nodeProto.cloneNode;
const elementProto = Element.prototype;
export const setAttribute = elementProto.setAttribute;
export const setAttributeNS = elementProto.setAttributeNS;
export const removeAttribute = elementProto.removeAttribute;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
export const setClassName = getOwnPropertyDescriptor(elementProto, 'className').set;
export const getStyle = getOwnPropertyDescriptor(HTMLElement.prototype, 'style').get;
export const svg_getStyle = getOwnPropertyDescriptor(SVGElement.prototype, 'style').get;
