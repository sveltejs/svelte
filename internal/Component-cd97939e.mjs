/** @returns {void} */
function noop() {}

const identity = (x) => x;

/**
 * @template T
 * @template S
 * @param {T} tar
 * @param {S} src
 * @returns {T & S}
 */
function assign(tar, src) {
	// @ts-ignore
	for (const k in src) tar[k] = src[k];
	return /** @type {T & S} */ (tar);
}

// Adapted from https://github.com/then/is-promise/blob/master/index.js
// Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
/**
 * @template T
 * @param {T} value
 * @returns {value is PromiseLike<T>}
 */
function is_promise(value) {
	return (
		!!value &&
		(typeof value === 'object' || typeof value === 'function') &&
		typeof (/** @type {any} */ (value).then) === 'function'
	);
}

/** @returns {void} */
function add_location(element, file, line, column, char) {
	element.__svelte_meta = {
		loc: { file, line, column, char }
	};
}

function run(fn) {
	return fn();
}

function blank_object() {
	return Object.create(null);
}

/**
 * @param {Function[]} fns
 * @returns {void}
 */
function run_all(fns) {
	fns.forEach(run);
}

/**
 * @param {any} thing
 * @returns {thing is Function}
 */
function is_function(thing) {
	return typeof thing === 'function';
}

/** @returns {boolean} */
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

let src_url_equal_anchor;

/** @returns {boolean} */
function src_url_equal(element_src, url) {
	if (!src_url_equal_anchor) {
		src_url_equal_anchor = document.createElement('a');
	}
	src_url_equal_anchor.href = url;
	return element_src === src_url_equal_anchor.href;
}

/** @returns {boolean} */
function not_equal(a, b) {
	return a != a ? b == b : a !== b;
}

/** @returns {boolean} */
function is_empty(obj) {
	return Object.keys(obj).length === 0;
}

/** @returns {void} */
function validate_store(store, name) {
	if (store != null && typeof store.subscribe !== 'function') {
		throw new Error(`'${name}' is not a store with a 'subscribe' method`);
	}
}

function subscribe(store, ...callbacks) {
	if (store == null) {
		for (const callback of callbacks) {
			callback(undefined);
		}
		return noop;
	}
	const unsub = store.subscribe(...callbacks);
	return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}

/**
 * @template T
 * @param {import('../store/public.js').Readable<T>} store
 * @returns {T}
 */
function get_store_value(store) {
	let value;
	subscribe(store, (_) => (value = _))();
	return value;
}

/** @returns {void} */
function component_subscribe(component, store, callback) {
	component.$$.on_destroy.push(subscribe(store, callback));
}

function create_slot(definition, ctx, $$scope, fn) {
	if (definition) {
		const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
		return definition[0](slot_ctx);
	}
}

function get_slot_context(definition, ctx, $$scope, fn) {
	return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
}

function get_slot_changes(definition, $$scope, dirty, fn) {
	if (definition[2] && fn) {
		const lets = definition[2](fn(dirty));
		if ($$scope.dirty === undefined) {
			return lets;
		}
		if (typeof lets === 'object') {
			const merged = [];
			const len = Math.max($$scope.dirty.length, lets.length);
			for (let i = 0; i < len; i += 1) {
				merged[i] = $$scope.dirty[i] | lets[i];
			}
			return merged;
		}
		return $$scope.dirty | lets;
	}
	return $$scope.dirty;
}

/** @returns {void} */
function update_slot_base(
	slot,
	slot_definition,
	ctx,
	$$scope,
	slot_changes,
	get_slot_context_fn
) {
	if (slot_changes) {
		const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
		slot.p(slot_context, slot_changes);
	}
}

/** @returns {void} */
function update_slot(
	slot,
	slot_definition,
	ctx,
	$$scope,
	dirty,
	get_slot_changes_fn,
	get_slot_context_fn
) {
	const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
	update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn);
}

/** @returns {any[] | -1} */
function get_all_dirty_from_scope($$scope) {
	if ($$scope.ctx.length > 32) {
		const dirty = [];
		const length = $$scope.ctx.length / 32;
		for (let i = 0; i < length; i++) {
			dirty[i] = -1;
		}
		return dirty;
	}
	return -1;
}

/** @returns {{}} */
function exclude_internal_props(props) {
	const result = {};
	for (const k in props) if (k[0] !== '$') result[k] = props[k];
	return result;
}

/** @returns {{}} */
function compute_rest_props(props, keys) {
	const rest = {};
	keys = new Set(keys);
	for (const k in props) if (!keys.has(k) && k[0] !== '$') rest[k] = props[k];
	return rest;
}

/** @returns {{}} */
function compute_slots(slots) {
	const result = {};
	for (const key in slots) {
		result[key] = true;
	}
	return result;
}

/** @returns {(this: any, ...args: any[]) => void} */
function once(fn) {
	let ran = false;
	return function (...args) {
		if (ran) return;
		ran = true;
		fn.call(this, ...args);
	};
}

function null_to_empty(value) {
	return value == null ? '' : value;
}

function set_store_value(store, ret, value) {
	store.set(value);
	return ret;
}

const has_prop = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

function action_destroyer(action_result) {
	return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}

/** @param {number | string} value
 * @returns {[number, string]}
 */
function split_css_unit(value) {
	const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
	return split ? [parseFloat(split[1]), split[2] || 'px'] : [/** @type {number} */ (value), 'px'];
}

const contenteditable_truthy_values = ['', true, 1, 'true', 'contenteditable'];

const is_client = typeof window !== 'undefined';

/** @type {() => number} */
let now = is_client ? () => window.performance.now() : () => Date.now();

let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;

// used internally for testing
/** @returns {void} */
function set_now(fn) {
	now = fn;
}

/** @returns {void} */
function set_raf(fn) {
	raf = fn;
}

const tasks = new Set();

/**
 * @param {number} now
 * @returns {void}
 */
function run_tasks(now) {
	tasks.forEach((task) => {
		if (!task.c(now)) {
			tasks.delete(task);
			task.f();
		}
	});
	if (tasks.size !== 0) raf(run_tasks);
}

/**
 * For testing purposes only!
 * @returns {void}
 */
function clear_loops() {
	tasks.clear();
}

/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 * @param {import('./private.js').TaskCallback} callback
 * @returns {import('./private.js').Task}
 */
function loop(callback) {
	/** @type {import('./private.js').TaskEntry} */
	let task;
	if (tasks.size === 0) raf(run_tasks);
	return {
		promise: new Promise((fulfill) => {
			tasks.add((task = { c: callback, f: fulfill }));
		}),
		abort() {
			tasks.delete(task);
		}
	};
}

/** @type {typeof globalThis} */
const globals =
	typeof window !== 'undefined'
		? window
		: typeof globalThis !== 'undefined'
		? globalThis
		: // @ts-ignore Node typings have this
		  global;

function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
/**
 * Resize observer singleton.
 * One listener per element only!
 * https://groups.google.com/a/chromium.org/g/blink-dev/c/z6ienONUb5A/m/F5-VcUZtBAAJ
 */
class ResizeObserverSingleton {
	/**
	 * @private
	 * @readonly
	 * @type {WeakMap<Element, import('./private.js').Listener>}
	 */
	__init() {this._listeners = 'WeakMap' in globals ? new WeakMap() : undefined;}

	/**
	 * @private
	 * @type {ResizeObserver}
	 */
	__init2() {this._observer = undefined;}

	/** @type {ResizeObserverOptions} */
	

	/** @param {ResizeObserverOptions} options */
	constructor(options) {ResizeObserverSingleton.prototype.__init.call(this);ResizeObserverSingleton.prototype.__init2.call(this);
		this.options = options;
	}

	/**
	 * @param {Element} element
	 * @param {import('./private.js').Listener} listener
	 * @returns {() => void}
	 */
	observe(element, listener) {
		this._listeners.set(element, listener);
		this._getObserver().observe(element, this.options);
		return () => {
			this._listeners.delete(element);
			this._observer.unobserve(element); // this line can probably be removed
		};
	}

	/**
	 * @private
	 */
	_getObserver() {
		return (
			_nullishCoalesce(this._observer, () => (
			(this._observer = new ResizeObserver((entries) => {
				for (const entry of entries) {
					ResizeObserverSingleton.entries.set(entry.target, entry);
					_optionalChain$1([this, 'access', _ => _._listeners, 'access', _2 => _2.get, 'call', _3 => _3(entry.target), 'optionalCall', _4 => _4(entry)]);
				}
			}))))
		);
	}
}

// Needs to be written like this to pass the tree-shake-test
ResizeObserverSingleton.entries = 'WeakMap' in globals ? new WeakMap() : undefined;

// Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
// at the end of hydration without touching the remaining nodes.
let is_hydrating = false;

/**
 * @returns {void}
 */
function start_hydrating() {
	is_hydrating = true;
}

/**
 * @returns {void}
 */
function end_hydrating() {
	is_hydrating = false;
}

/**
 * @param {number} low
 * @param {number} high
 * @param {(index: number) => number} key
 * @param {number} value
 * @returns {number}
 */
function upper_bound(low, high, key, value) {
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

/**
 * @param {NodeEx} target
 * @returns {void}
 */
function init_hydrate(target) {
	if (target.hydrate_init) return;
	target.hydrate_init = true;
	// We know that all children have claim_order values since the unclaimed have been detached if target is not <head>

	let children = /** @type {ArrayLike<NodeEx2>} */ (target.childNodes);
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
	 * subsequence of nodes that are claimed in order can be found by
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
		const seqLen =
			(longest > 0 && children[m[longest]].claim_order <= current
				? longest + 1
				: upper_bound(1, longest, (idx) => children[m[idx]].claim_order, current)) - 1;
		p[i] = m[seqLen] + 1;
		const newLen = seqLen + 1;
		// We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
		m[newLen] = i;
		longest = Math.max(newLen, longest);
	}
	// The longest increasing subsequence of nodes (initially reversed)

	/**
	 * @type {NodeEx2[]}
	 */
	const lis = [];
	// The rest of the nodes, nodes that will be moved

	/**
	 * @type {NodeEx2[]}
	 */
	const toMove = [];
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

/**
 * @param {Node} target
 * @param {Node} node
 * @returns {void}
 */
function append(target, node) {
	target.appendChild(node);
}

/**
 * @param {Node} target
 * @param {string} style_sheet_id
 * @param {string} styles
 * @returns {void}
 */
function append_styles(target, style_sheet_id, styles) {
	const append_styles_to = get_root_for_style(target);
	if (!append_styles_to.getElementById(style_sheet_id)) {
		const style = element('style');
		style.id = style_sheet_id;
		style.textContent = styles;
		append_stylesheet(append_styles_to, style);
	}
}

/**
 * @param {Node} node
 * @returns {ShadowRoot | Document}
 */
function get_root_for_style(node) {
	if (!node) return document;
	const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
	if (root && /** @type {ShadowRoot} */ (root).host) {
		return /** @type {ShadowRoot} */ (root);
	}
	return node.ownerDocument;
}

/**
 * @param {Node} node
 * @returns {CSSStyleSheet}
 */
function append_empty_stylesheet(node) {
	const style_element = element('style');
	// For transitions to work without 'style-src: unsafe-inline' Content Security Policy,
	// these empty tags need to be allowed with a hash as a workaround until we move to the Web Animations API.
	// Using the hash for the empty string (for an empty tag) works in all browsers except Safari.
	// So as a workaround for the workaround, when we append empty style tags we set their content to /* empty */.
	// The hash 'sha256-9OlNO0DNEeaVzHL4RZwCLsBHA8WBQ8toBp/4F5XV2nc=' will then work even in Safari.
	style_element.textContent = '/* empty */';
	append_stylesheet(get_root_for_style(node), style_element);
	return style_element.sheet;
}

/**
 * @param {ShadowRoot | Document} node
 * @param {HTMLStyleElement} style
 * @returns {CSSStyleSheet}
 */
function append_stylesheet(node, style) {
	append(/** @type {Document} */ (node).head || node, style);
	return style.sheet;
}

/**
 * @param {NodeEx} target
 * @param {NodeEx} node
 * @returns {void}
 */
function append_hydration(target, node) {
	if (is_hydrating) {
		init_hydrate(target);
		if (
			target.actual_end_child === undefined ||
			(target.actual_end_child !== null && target.actual_end_child.parentNode !== target)
		) {
			target.actual_end_child = target.firstChild;
		}
		// Skip nodes of undefined ordering
		while (target.actual_end_child !== null && target.actual_end_child.claim_order === undefined) {
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

/**
 * @param {Node} target
 * @param {Node} node
 * @param {Node} [anchor]
 * @returns {void}
 */
function insert(target, node, anchor) {
	target.insertBefore(node, anchor || null);
}

/**
 * @param {NodeEx} target
 * @param {NodeEx} node
 * @param {NodeEx} [anchor]
 * @returns {void}
 */
function insert_hydration(target, node, anchor) {
	if (is_hydrating && !anchor) {
		append_hydration(target, node);
	} else if (node.parentNode !== target || node.nextSibling != anchor) {
		target.insertBefore(node, anchor || null);
	}
}

/**
 * @param {Node} node
 * @returns {void}
 */
function detach(node) {
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}
}

/**
 * @returns {void} */
function destroy_each(iterations, detaching) {
	for (let i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detaching);
	}
}

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} name
 * @returns {HTMLElementTagNameMap[K]}
 */
function element(name) {
	return document.createElement(name);
}

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} name
 * @param {string} is
 * @returns {HTMLElementTagNameMap[K]}
 */
function element_is(name, is) {
	return document.createElement(name, { is });
}

/**
 * @template T
 * @template {keyof T} K
 * @param {T} obj
 * @param {K[]} exclude
 * @returns {Pick<T, Exclude<keyof T, K>>}
 */
function object_without_properties(obj, exclude) {
	const target = /** @type {Pick<T, Exclude<keyof T, K>>} */ ({});
	for (const k in obj) {
		if (
			has_prop(obj, k) &&
			// @ts-ignore
			exclude.indexOf(k) === -1
		) {
			// @ts-ignore
			target[k] = obj[k];
		}
	}
	return target;
}

/**
 * @template {keyof SVGElementTagNameMap} K
 * @param {K} name
 * @returns {SVGElement}
 */
function svg_element(name) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}

/**
 * @param {string} data
 * @returns {Text}
 */
function text(data) {
	return document.createTextNode(data);
}

/**
 * @returns {Text} */
function space() {
	return text(' ');
}

/**
 * @returns {Text} */
function empty() {
	return text('');
}

/**
 * @param {string} content
 * @returns {Comment}
 */
function comment(content) {
	return document.createComment(content);
}

/**
 * @param {EventTarget} node
 * @param {string} event
 * @param {EventListenerOrEventListenerObject} handler
 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
 * @returns {() => void}
 */
function listen(node, event, handler, options) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}

/**
 * @returns {(event: any) => any} */
function prevent_default(fn) {
	return function (event) {
		event.preventDefault();
		// @ts-ignore
		return fn.call(this, event);
	};
}

/**
 * @returns {(event: any) => any} */
function stop_propagation(fn) {
	return function (event) {
		event.stopPropagation();
		// @ts-ignore
		return fn.call(this, event);
	};
}

/**
 * @returns {(event: any) => any} */
function stop_immediate_propagation(fn) {
	return function (event) {
		event.stopImmediatePropagation();
		// @ts-ignore
		return fn.call(this, event);
	};
}

/**
 * @returns {(event: any) => void} */
function self(fn) {
	return function (event) {
		// @ts-ignore
		if (event.target === this) fn.call(this, event);
	};
}

/**
 * @returns {(event: any) => void} */
function trusted(fn) {
	return function (event) {
		// @ts-ignore
		if (event.isTrusted) fn.call(this, event);
	};
}

/**
 * @param {Element} node
 * @param {string} attribute
 * @param {string} [value]
 * @returns {void}
 */
function attr(node, attribute, value) {
	if (value == null) node.removeAttribute(attribute);
	else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}
/**
 * List of attributes that should always be set through the attr method,
 * because updating them through the property setter doesn't work reliably.
 * In the example of `width`/`height`, the problem is that the setter only
 * accepts numeric values, but the attribute can also be set to a string like `50%`.
 * If this list becomes too big, rethink this approach.
 */
const always_set_through_set_attribute = ['width', 'height'];

/**
 * @param {Element & ElementCSSInlineStyle} node
 * @param {{ [x: string]: string }} attributes
 * @returns {void}
 */
function set_attributes(node, attributes) {
	// @ts-ignore
	const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
	for (const key in attributes) {
		if (attributes[key] == null) {
			node.removeAttribute(key);
		} else if (key === 'style') {
			node.style.cssText = attributes[key];
		} else if (key === '__value') {
			/** @type {any} */ (node).value = node[key] = attributes[key];
		} else if (
			descriptors[key] &&
			descriptors[key].set &&
			always_set_through_set_attribute.indexOf(key) === -1
		) {
			node[key] = attributes[key];
		} else {
			attr(node, key, attributes[key]);
		}
	}
}

/**
 * @param {Element & ElementCSSInlineStyle} node
 * @param {{ [x: string]: string }} attributes
 * @returns {void}
 */
function set_svg_attributes(node, attributes) {
	for (const key in attributes) {
		attr(node, key, attributes[key]);
	}
}

/**
 * @param {Record<string, unknown>} data_map
 * @returns {void}
 */
function set_custom_element_data_map(node, data_map) {
	Object.keys(data_map).forEach((key) => {
		set_custom_element_data(node, key, data_map[key]);
	});
}

/**
 * @returns {void} */
function set_custom_element_data(node, prop, value) {
	if (prop in node) {
		node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
	} else {
		attr(node, prop, value);
	}
}

/**
 * @param {string} tag
 */
function set_dynamic_element_data(tag) {
	return /-/.test(tag) ? set_custom_element_data_map : set_attributes;
}

/**
 * @returns {void}
 */
function xlink_attr(node, attribute, value) {
	node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
}

/**
 * @param {HTMLElement} node
 * @returns {string}
 */
function get_svelte_dataset(node) {
	return node.dataset.svelteH;
}

/**
 * @returns {unknown[]} */
function get_binding_group_value(group, __value, checked) {
	const value = new Set();
	for (let i = 0; i < group.length; i += 1) {
		if (group[i].checked) value.add(group[i].__value);
	}
	if (!checked) {
		value.delete(__value);
	}
	return Array.from(value);
}

/**
 * @param {HTMLInputElement[]} group
 * @returns {{ p(...inputs: HTMLInputElement[]): void; r(): void; }}
 */
function init_binding_group(group) {
	/**
	 * @type {HTMLInputElement[]} */
	let _inputs;
	return {
		/* push */ p(...inputs) {
			_inputs = inputs;
			_inputs.forEach((input) => group.push(input));
		},
		/* remove */ r() {
			_inputs.forEach((input) => group.splice(group.indexOf(input), 1));
		}
	};
}

/**
 * @param {number[]} indexes
 * @returns {{ u(new_indexes: number[]): void; p(...inputs: HTMLInputElement[]): void; r: () => void; }}
 */
function init_binding_group_dynamic(group, indexes) {
	/**
	 * @type {HTMLInputElement[]} */
	let _group = get_binding_group(group);

	/**
	 * @type {HTMLInputElement[]} */
	let _inputs;

	function get_binding_group(group) {
		for (let i = 0; i < indexes.length; i++) {
			group = group[indexes[i]] = group[indexes[i]] || [];
		}
		return group;
	}

	/**
	 * @returns {void} */
	function push() {
		_inputs.forEach((input) => _group.push(input));
	}

	/**
	 * @returns {void} */
	function remove() {
		_inputs.forEach((input) => _group.splice(_group.indexOf(input), 1));
	}
	return {
		/* update */ u(new_indexes) {
			indexes = new_indexes;
			const new_group = get_binding_group(group);
			if (new_group !== _group) {
				remove();
				_group = new_group;
				push();
			}
		},
		/* push */ p(...inputs) {
			_inputs = inputs;
			push();
		},
		/* remove */ r: remove
	};
}

/**
 * @returns {number} */
function to_number(value) {
	return value === '' ? null : +value;
}

/**
 * @returns {any[]} */
function time_ranges_to_array(ranges) {
	const array = [];
	for (let i = 0; i < ranges.length; i += 1) {
		array.push({ start: ranges.start(i), end: ranges.end(i) });
	}
	return array;
}

/**
 * @param {Element} element
 * @returns {ChildNode[]}
 */
function children(element) {
	return Array.from(element.childNodes);
}

/**
 * @param {ChildNodeArray} nodes
 * @returns {void}
 */
function init_claim_info(nodes) {
	if (nodes.claim_info === undefined) {
		nodes.claim_info = { last_index: 0, total_claimed: 0 };
	}
}

/**
 * @template {ChildNodeEx} R
 * @param {ChildNodeArray} nodes
 * @param {(node: ChildNodeEx) => node is R} predicate
 * @param {(node: ChildNodeEx) => ChildNodeEx | undefined} processNode
 * @param {() => R} createNode
 * @param {boolean} dontUpdateLastIndex
 * @returns {R}
 */
function claim_node(nodes, predicate, processNode, createNode, dontUpdateLastIndex = false) {
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

/**
 * @param {ChildNodeArray} nodes
 * @param {string} name
 * @param {{ [key: string]: boolean }} attributes
 * @param {(name: string) => Element | SVGElement} create_element
 * @returns {Element | SVGElement}
 */
function claim_element_base(nodes, name, attributes, create_element) {
	return claim_node(
		nodes,
		/** @returns {node is Element | SVGElement} */
		(node) => node.nodeName === name,
		/** @param {Element} node */
		(node) => {
			const remove = [];
			for (let j = 0; j < node.attributes.length; j++) {
				const attribute = node.attributes[j];
				if (!attributes[attribute.name]) {
					remove.push(attribute.name);
				}
			}
			remove.forEach((v) => node.removeAttribute(v));
			return undefined;
		},
		() => create_element(name)
	);
}

/**
 * @param {ChildNodeArray} nodes
 * @param {string} name
 * @param {{ [key: string]: boolean }} attributes
 * @returns {Element | SVGElement}
 */
function claim_element(nodes, name, attributes) {
	return claim_element_base(nodes, name, attributes, element);
}

/**
 * @param {ChildNodeArray} nodes
 * @param {string} name
 * @param {{ [key: string]: boolean }} attributes
 * @returns {Element | SVGElement}
 */
function claim_svg_element(nodes, name, attributes) {
	return claim_element_base(nodes, name, attributes, svg_element);
}

/**
 * @param {ChildNodeArray} nodes
 * @returns {Text}
 */
function claim_text(nodes, data) {
	return claim_node(
		nodes,
		/** @returns {node is Text} */
		(node) => node.nodeType === 3,
		/** @param {Text} node */
		(node) => {
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
		true // Text nodes should not update last index since it is likely not worth it to eliminate an increasing subsequence of actual elements
	);
}

/**
 * @returns {Text} */
function claim_space(nodes) {
	return claim_text(nodes, ' ');
}

/**
 * @param {ChildNodeArray} nodes
 * @returns {Comment}
 */
function claim_comment(nodes, data) {
	return claim_node(
		nodes,
		/** @returns {node is Comment} */
		(node) => node.nodeType === 8,
		/** @param {Comment} node */
		(node) => {
			node.data = '' + data;
			return undefined;
		},
		() => comment(data),
		true
	);
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

/**
 * @param {boolean} is_svg
 * @returns {HtmlTagHydration}
 */
function claim_html_tag(nodes, is_svg) {
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

/**
 * @param {Text} text
 * @param {unknown} data
 * @returns {void}
 */
function set_data(text, data) {
	data = '' + data;
	if (text.data === data) return;
	text.data = /** @type {string} */ (data);
}

/**
 * @param {Text} text
 * @param {unknown} data
 * @returns {void}
 */
function set_data_contenteditable(text, data) {
	data = '' + data;
	if (text.wholeText === data) return;
	text.data = /** @type {string} */ (data);
}

/**
 * @param {Text} text
 * @param {unknown} data
 * @param {string} attr_value
 * @returns {void}
 */
function set_data_maybe_contenteditable(text, data, attr_value) {
	if (~contenteditable_truthy_values.indexOf(attr_value)) {
		set_data_contenteditable(text, data);
	} else {
		set_data(text, data);
	}
}

/**
 * @returns {void} */
function set_input_value(input, value) {
	input.value = value == null ? '' : value;
}

/**
 * @returns {void} */
function set_input_type(input, type) {
	try {
		input.type = type;
	} catch (e) {
		// do nothing
	}
}

/**
 * @returns {void} */
function set_style(node, key, value, important) {
	if (value == null) {
		node.style.removeProperty(key);
	} else {
		node.style.setProperty(key, value, important ? 'important' : '');
	}
}

/**
 * @returns {void} */
function select_option(select, value, mounting) {
	for (let i = 0; i < select.options.length; i += 1) {
		const option = select.options[i];
		if (option.__value === value) {
			option.selected = true;
			return;
		}
	}
	if (!mounting || value !== undefined) {
		select.selectedIndex = -1; // no option should be selected
	}
}

/**
 * @returns {void} */
function select_options(select, value) {
	for (let i = 0; i < select.options.length; i += 1) {
		const option = select.options[i];
		option.selected = ~value.indexOf(option.__value);
	}
}

function select_value(select) {
	const selected_option = select.querySelector(':checked');
	return selected_option && selected_option.__value;
}

function select_multiple_value(select) {
	return [].map.call(select.querySelectorAll(':checked'), (option) => option.__value);
}
// unfortunately this can't be a constant as that wouldn't be tree-shakeable
// so we cache the result instead

/**
 * @type {boolean} */
let crossorigin;

/**
 * @returns {boolean} */
function is_crossorigin() {
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

/**
 * @param {HTMLElement} node
 * @param {() => void} fn
 * @returns {() => void}
 */
function add_iframe_resize_listener(node, fn) {
	const computed_style = getComputedStyle(node);
	if (computed_style.position === 'static') {
		node.style.position = 'relative';
	}
	const iframe = element('iframe');
	iframe.setAttribute(
		'style',
		'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
			'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;'
	);
	iframe.setAttribute('aria-hidden', 'true');
	iframe.tabIndex = -1;
	const crossorigin = is_crossorigin();

	/**
	 * @type {() => void}
	 */
	let unsubscribe;
	if (crossorigin) {
		iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
		unsubscribe = listen(
			window,
			'message',
			/** @param {MessageEvent} event */ (event) => {
				if (event.source === iframe.contentWindow) fn();
			}
		);
	} else {
		iframe.src = 'about:blank';
		iframe.onload = () => {
			unsubscribe = listen(iframe.contentWindow, 'resize', fn);
			// make sure an initial resize event is fired _after_ the iframe is loaded (which is asynchronous)
			// see https://github.com/sveltejs/svelte/issues/4233
			fn();
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
const resize_observer_content_box = /* @__PURE__ */ new ResizeObserverSingleton({
	box: 'content-box'
});
const resize_observer_border_box = /* @__PURE__ */ new ResizeObserverSingleton({
	box: 'border-box'
});
const resize_observer_device_pixel_content_box = /* @__PURE__ */ new ResizeObserverSingleton(
	{ box: 'device-pixel-content-box' }
);

/**
 * @returns {void} */
function toggle_class(element, name, toggle) {
	element.classList[toggle ? 'add' : 'remove'](name);
}

/**
 * @template T
 * @param {string} type
 * @param {T} [detail]
 * @returns {CustomEvent<T>}
 */
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
	/**
	 * @type {CustomEvent<T>} */
	const e = document.createEvent('CustomEvent');
	e.initCustomEvent(type, bubbles, cancelable, detail);
	return e;
}

/**
 * @param {string} selector
 * @param {HTMLElement} parent
 * @returns {ChildNodeArray}
 */
function query_selector_all(selector, parent = document.body) {
	return Array.from(parent.querySelectorAll(selector));
}

/**
 * @param {string} nodeId
 * @param {HTMLElement} head
 * @returns {any[]}
 */
function head_selector(nodeId, head) {
	const result = [];
	let started = 0;
	for (const node of head.childNodes) {
		if (node.nodeType === 8 /* comment node */) {
			const comment = node.textContent.trim();
			if (comment === `HEAD_${nodeId}_END`) {
				started -= 1;
				result.push(node);
			} else if (comment === `HEAD_${nodeId}_START`) {
				started += 1;
				result.push(node);
			}
		} else if (started > 0) {
			result.push(node);
		}
	}
	return result;
}
/** */
class HtmlTag {
	/**
	 * @private
	 * @default false
	 */
	__init() {this.is_svg = false;}
	// parent for creating node
	/** */
	__init2() {this.e = undefined;}
	// html tag nodes
	/** */
	__init3() {this.n = undefined;}
	// target
	/** */
	__init4() {this.t = undefined;}
	// anchor
	/** */
	__init5() {this.a = undefined;}
	constructor(is_svg = false) {HtmlTag.prototype.__init.call(this);HtmlTag.prototype.__init2.call(this);HtmlTag.prototype.__init3.call(this);HtmlTag.prototype.__init4.call(this);HtmlTag.prototype.__init5.call(this);
		this.is_svg = is_svg;
		this.e = this.n = null;
	}

	/**
	 * @param {string} html
	 * @returns {void}
	 */
	c(html) {
		this.h(html);
	}

	/**
	 * @param {string} html
	 * @param {HTMLElement | SVGElement} target
	 * @param {HTMLElement | SVGElement} anchor
	 * @returns {void}
	 */
	m(html, target, anchor = null) {
		if (!this.e) {
			if (this.is_svg)
				this.e = svg_element(/** @type {keyof SVGElementTagNameMap} */ (target.nodeName));
			/** #7364  target for <template> may be provided as #document-fragment(11) */ else
				this.e = element(
					/** @type {keyof HTMLElementTagNameMap} */ (
						target.nodeType === 11 ? 'TEMPLATE' : target.nodeName
					)
				);
			this.t =
				target.tagName !== 'TEMPLATE'
					? target
					: /** @type {HTMLTemplateElement} */ (target).content;
			this.c(html);
		}
		this.i(anchor);
	}

	/**
	 * @param {string} html
	 * @returns {void}
	 */
	h(html) {
		this.e.innerHTML = html;
		this.n = Array.from(
			this.e.nodeName === 'TEMPLATE' ? this.e.content.childNodes : this.e.childNodes
		);
	}

	/**
	 * @returns {void} */
	i(anchor) {
		for (let i = 0; i < this.n.length; i += 1) {
			insert(this.t, this.n[i], anchor);
		}
	}

	/**
	 * @param {string} html
	 * @returns {void}
	 */
	p(html) {
		this.d();
		this.h(html);
		this.i(this.a);
	}

	/**
	 * @returns {void} */
	d() {
		this.n.forEach(detach);
	}
}

/**
 * @extends HtmlTag */
class HtmlTagHydration extends HtmlTag {
	// hydration claimed nodes
	/** */
	__init6() {this.l = undefined;}
	constructor(claimed_nodes, is_svg = false) {
		super(is_svg);HtmlTagHydration.prototype.__init6.call(this);		this.e = this.n = null;
		this.l = claimed_nodes;
	}

	/**
	 * @param {string} html
	 * @returns {void}
	 */
	c(html) {
		if (this.l) {
			this.n = this.l;
		} else {
			super.c(html);
		}
	}

	/**
	 * @returns {void} */
	i(anchor) {
		for (let i = 0; i < this.n.length; i += 1) {
			insert_hydration(this.t, this.n[i], anchor);
		}
	}
}

/**
 * @param {NamedNodeMap} attributes
 * @returns {{}}
 */
function attribute_to_object(attributes) {
	const result = {};
	for (const attribute of attributes) {
		result[attribute.name] = attribute.value;
	}
	return result;
}

/**
 * @param {HTMLElement} element
 * @returns {{}}
 */
function get_custom_elements_slots(element) {
	const result = {};
	element.childNodes.forEach(
		/** @param {Element} node */ (node) => {
			result[node.slot || 'default'] = true;
		}
	);
	return result;
}

function construct_svelte_component(component, props) {
	return new component(props);
}

/**
 * @typedef {Node & {
 * 	claim_order?: number;
 * 	hydrate_init?: true;
 * 	actual_end_child?: NodeEx;
 * 	childNodes: NodeListOf<NodeEx>;
 * }} NodeEx
 */

/** @typedef {ChildNode & NodeEx} ChildNodeEx */

/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

/**
 * @typedef {ChildNodeEx[] & {
 * 	claim_info?: {
 * 		last_index: number;
 * 		total_claimed: number;
 * 	};
 * }} ChildNodeArray
 */

// we need to store the information for multiple documents because a Svelte application could also contain iframes
// https://github.com/sveltejs/svelte/issues/3624
/** @type {Map<Document | ShadowRoot, import('./private.d.ts').StyleInformation>} */
const managed_styles = new Map();

let active = 0;

// https://github.com/darkskyapp/string-hash/blob/master/index.js
/**
 * @param {string} str
 * @returns {number}
 */
function hash(str) {
	let hash = 5381;
	let i = str.length;
	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return hash >>> 0;
}

/**
 * @param {Document | ShadowRoot} doc
 * @param {Element & ElementCSSInlineStyle} node
 * @returns {{ stylesheet: any; rules: {}; }}
 */
function create_style_information(doc, node) {
	const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
	managed_styles.set(doc, info);
	return info;
}

/**
 * @param {Element & ElementCSSInlineStyle} node
 * @param {number} a
 * @param {number} b
 * @param {number} duration
 * @param {number} delay
 * @param {(t: number) => number} ease
 * @param {(t: number, u: number) => string} fn
 * @param {number} uid
 * @returns {string}
 */
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
	const step = 16.666 / duration;
	let keyframes = '{\n';
	for (let p = 0; p <= 1; p += step) {
		const t = a + (b - a) * ease(p);
		keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
	}
	const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
	const name = `__svelte_${hash(rule)}_${uid}`;
	const doc = get_root_for_style(node);
	const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
	if (!rules[name]) {
		rules[name] = true;
		stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
	}
	const animation = node.style.animation || '';
	node.style.animation = `${
		animation ? `${animation}, ` : ''
	}${name} ${duration}ms linear ${delay}ms 1 both`;
	active += 1;
	return name;
}

/**
 * @param {Element & ElementCSSInlineStyle} node
 * @param {string} [name]
 * @returns {void}
 */
function delete_rule(node, name) {
	const previous = (node.style.animation || '').split(', ');
	const next = previous.filter(
		name
			? (anim) => anim.indexOf(name) < 0 // remove specific animation
			: (anim) => anim.indexOf('__svelte') === -1 // remove all Svelte animations
	);
	const deleted = previous.length - next.length;
	if (deleted) {
		node.style.animation = next.join(', ');
		active -= deleted;
		if (!active) clear_rules();
	}
}

/** @returns {void} */
function clear_rules() {
	raf(() => {
		if (active) return;
		managed_styles.forEach((info) => {
			const { ownerNode } = info.stylesheet;
			// there is no ownerNode if it runs on jsdom.
			if (ownerNode) detach(ownerNode);
		});
		managed_styles.clear();
	});
}

let current_component;

/** @returns {void} */
function set_current_component(component) {
	current_component = component;
}

function get_current_component() {
	if (!current_component) throw new Error('Function called outside component initialization');
	return current_component;
}

/**
 * Schedules a callback to run immediately before the component is updated after any state change.
 *
 * The first time the callback runs will be before the initial `onMount`
 *
 * https://svelte.dev/docs#run-time-svelte-beforeupdate
 * @param {() => any} fn
 * @returns {void}
 */
function beforeUpdate(fn) {
	get_current_component().$$.before_update.push(fn);
}

/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
 *
 * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs#run-time-svelte-onmount
 * @template T
 * @param {() => T extends Promise<() => any>
 * 		? "Returning a function asynchronously from onMount won't call that function on destroy"
 * 		: T} fn
 * @returns {void}
 */
function onMount(fn) {
	get_current_component().$$.on_mount.push(fn);
}

/**
 * Schedules a callback to run immediately after the component has been updated.
 *
 * The first time the callback runs will be after the initial `onMount`
 * @param {() => any} fn
 * @returns {void}
 */
function afterUpdate(fn) {
	get_current_component().$$.after_update.push(fn);
}

/**
 * Schedules a callback to run immediately before the component is unmounted.
 *
 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
 * only one that runs inside a server-side component.
 *
 * https://svelte.dev/docs#run-time-svelte-ondestroy
 * @param {() => any} fn
 * @returns {void}
 */
function onDestroy(fn) {
	get_current_component().$$.on_destroy.push(fn);
}

/**
 * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
 *
 * Component events created with `createEventDispatcher` create a
 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
 * property and can contain any type of data.
 *
 * The event dispatcher can be typed to narrow the allowed event names and the type of the `detail` argument:
 * ```ts
 * const dispatch = createEventDispatcher<{
 *  loaded: never; // does not take a detail argument
 *  change: string; // takes a detail argument of type string, which is required
 *  optional: number | null; // takes an optional detail argument of type number
 * }>();
 * ```
 *
 * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
 * @template {Record<string, any>} [EventMap=any]
 * @returns {import('./public.js').EventDispatcher<EventMap>}
 */
function createEventDispatcher() {
	const component = get_current_component();
	return (type, detail, { cancelable = false } = {}) => {
		const callbacks = component.$$.callbacks[type];
		if (callbacks) {
			// TODO are there situations where events could be dispatched
			// in a server (non-DOM) environment?
			const event = custom_event(/** @type {string} */ (type), detail, { cancelable });
			callbacks.slice().forEach((fn) => {
				fn.call(component, event);
			});
			return !event.defaultPrevented;
		}
		return true;
	};
}

/**
 * Associates an arbitrary `context` object with the current component and the specified `key`
 * and returns that object. The context is then available to children of the component
 * (including slotted content) with `getContext`.
 *
 * Like lifecycle functions, this must be called during component initialisation.
 *
 * https://svelte.dev/docs#run-time-svelte-setcontext
 * @template T
 * @param {any} key
 * @param {T} context
 * @returns {T}
 */
function setContext(key, context) {
	get_current_component().$$.context.set(key, context);
	return context;
}

/**
 * Retrieves the context that belongs to the closest parent component with the specified `key`.
 * Must be called during component initialisation.
 *
 * https://svelte.dev/docs#run-time-svelte-getcontext
 * @template T
 * @param {any} key
 * @returns {T}
 */
function getContext(key) {
	return get_current_component().$$.context.get(key);
}

/**
 * Retrieves the whole context map that belongs to the closest parent component.
 * Must be called during component initialisation. Useful, for example, if you
 * programmatically create a component and want to pass the existing context to it.
 *
 * https://svelte.dev/docs#run-time-svelte-getallcontexts
 * @template {Map<any, any>} [T=Map<any, any>]
 * @returns {T}
 */
function getAllContexts() {
	return get_current_component().$$.context;
}

/**
 * Checks whether a given `key` has been set in the context of a parent component.
 * Must be called during component initialisation.
 *
 * https://svelte.dev/docs#run-time-svelte-hascontext
 * @param {any} key
 * @returns {boolean}
 */
function hasContext(key) {
	return get_current_component().$$.context.has(key);
}

// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
/**
 * @param component
 * @param event
 * @returns {void}
 */
function bubble(component, event) {
	const callbacks = component.$$.callbacks[event.type];
	if (callbacks) {
		// @ts-ignore
		callbacks.slice().forEach((fn) => fn.call(this, event));
	}
}

const dirty_components = [];
const intros = { enabled: false };
const binding_callbacks = [];

let render_callbacks = [];

const flush_callbacks = [];

const resolved_promise = /* @__PURE__ */ Promise.resolve();

let update_scheduled = false;

/** @returns {void} */
function schedule_update() {
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
}

/** @returns {Promise<void>} */
function tick() {
	schedule_update();
	return resolved_promise;
}

/** @returns {void} */
function add_render_callback(fn) {
	render_callbacks.push(fn);
}

/** @returns {void} */
function add_flush_callback(fn) {
	flush_callbacks.push(fn);
}

// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();

let flushidx = 0; // Do *not* move this inside the flush() function

/** @returns {void} */
function flush() {
	// Do not reenter flush while dirty components are updated, as this can
	// result in an infinite loop. Instead, let the inner flush handle it.
	// Reentrancy is ok afterwards for bindings etc.
	if (flushidx !== 0) {
		return;
	}
	const saved_component = current_component;
	do {
		// first, call beforeUpdate functions
		// and update components
		try {
			while (flushidx < dirty_components.length) {
				const component = dirty_components[flushidx];
				flushidx++;
				set_current_component(component);
				update(component.$$);
			}
		} catch (e) {
			// reset dirty state to not end up in a deadlocked state and then rethrow
			dirty_components.length = 0;
			flushidx = 0;
			throw e;
		}
		set_current_component(null);
		dirty_components.length = 0;
		flushidx = 0;
		while (binding_callbacks.length) binding_callbacks.pop()();
		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		for (let i = 0; i < render_callbacks.length; i += 1) {
			const callback = render_callbacks[i];
			if (!seen_callbacks.has(callback)) {
				// ...so guard against infinite loops
				seen_callbacks.add(callback);
				callback();
			}
		}
		render_callbacks.length = 0;
	} while (dirty_components.length);
	while (flush_callbacks.length) {
		flush_callbacks.pop()();
	}
	update_scheduled = false;
	seen_callbacks.clear();
	set_current_component(saved_component);
}

/** @returns {void} */
function update($$) {
	if ($$.fragment !== null) {
		$$.update();
		run_all($$.before_update);
		const dirty = $$.dirty;
		$$.dirty = [-1];
		$$.fragment && $$.fragment.p($$.ctx, dirty);
		$$.after_update.forEach(add_render_callback);
	}
}

/**
 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
 * @param {Function[]} fns
 * @returns {void}
 */
function flush_render_callbacks(fns) {
	const filtered = [];
	const targets = [];
	render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
	targets.forEach((c) => c());
	render_callbacks = filtered;
}

/**
 * @type {Promise<void> | null}
 */
let promise;

/**
 * @returns {Promise<void>}
 */
function wait() {
	if (!promise) {
		promise = Promise.resolve();
		promise.then(() => {
			promise = null;
		});
	}
	return promise;
}

/**
 * @param {Element} node
 * @param {INTRO | OUTRO | boolean} direction
 * @param {'start' | 'end'} kind
 * @returns {void}
 */
function dispatch(node, direction, kind) {
	node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}

const outroing = new Set();

/**
 * @type {Outro}
 */
let outros;

/**
 * @returns {void} */
function group_outros() {
	outros = {
		r: 0,
		c: [],
		p: outros // parent group
	};
}

/**
 * @returns {void} */
function check_outros() {
	if (!outros.r) {
		run_all(outros.c);
	}
	outros = outros.p;
}

/**
 * @param {import('./private.js').Fragment} block
 * @param {0 | 1} [local]
 * @returns {void}
 */
function transition_in(block, local) {
	if (block && block.i) {
		outroing.delete(block);
		block.i(local);
	}
}

/**
 * @param {import('./private.js').Fragment} block
 * @param {0 | 1} local
 * @param {0 | 1} detach
 * @returns {void}
 */
function transition_out(block, local, detach, callback) {
	if (block && block.o) {
		if (outroing.has(block)) return;
		outroing.add(block);
		outros.c.push(() => {
			outroing.delete(block);
			if (callback) {
				if (detach) block.d(1);
				callback();
			}
		});
		block.o(local);
	} else if (callback) {
		callback();
	}
}

/**
 * @type {import('../transition/public.js').TransitionConfig}
 */
const null_transition = { duration: 0 };

/**
 * @param {Element & ElementCSSInlineStyle} node
 * @param {TransitionFn} fn
 * @param {any} params
 * @returns {{ start(): void; invalidate(): void; end(): void; }}
 */
function create_in_transition(node, fn, params) {
	/**
	 * @type {TransitionOptions} */
	const options = { direction: 'in' };
	let config = fn(node, params, options);
	let running = false;
	let animation_name;
	let task;
	let uid = 0;

	/**
	 * @returns {void} */
	function cleanup() {
		if (animation_name) delete_rule(node, animation_name);
	}

	/**
	 * @returns {void} */
	function go() {
		const {
			delay = 0,
			duration = 300,
			easing = identity,
			tick = noop,
			css
		} = config || null_transition;
		if (css) animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
		tick(0, 1);
		const start_time = now() + delay;
		const end_time = start_time + duration;
		if (task) task.abort();
		running = true;
		add_render_callback(() => dispatch(node, true, 'start'));
		task = loop((now) => {
			if (running) {
				if (now >= end_time) {
					tick(1, 0);
					dispatch(node, true, 'end');
					cleanup();
					return (running = false);
				}
				if (now >= start_time) {
					const t = easing((now - start_time) / duration);
					tick(t, 1 - t);
				}
			}
			return running;
		});
	}
	let started = false;
	return {
		start() {
			if (started) return;
			started = true;
			delete_rule(node);
			if (is_function(config)) {
				config = config(options);
				wait().then(go);
			} else {
				go();
			}
		},
		invalidate() {
			started = false;
		},
		end() {
			if (running) {
				cleanup();
				running = false;
			}
		}
	};
}

/**
 * @param {Element & ElementCSSInlineStyle} node
 * @param {TransitionFn} fn
 * @param {any} params
 * @returns {{ end(reset: any): void; }}
 */
function create_out_transition(node, fn, params) {
	/**
	 * @type {TransitionOptions} */
	const options = { direction: 'out' };
	let config = fn(node, params, options);
	let running = true;
	let animation_name;
	const group = outros;
	group.r += 1;

	/**
	 * @returns {void} */
	function go() {
		const {
			delay = 0,
			duration = 300,
			easing = identity,
			tick = noop,
			css
		} = config || null_transition;
		if (css) animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
		const start_time = now() + delay;
		const end_time = start_time + duration;
		add_render_callback(() => dispatch(node, false, 'start'));
		loop((now) => {
			if (running) {
				if (now >= end_time) {
					tick(0, 1);
					dispatch(node, false, 'end');
					if (!--group.r) {
						// this will result in `end()` being called,
						// so we don't need to clean up here
						run_all(group.c);
					}
					return false;
				}
				if (now >= start_time) {
					const t = easing((now - start_time) / duration);
					tick(1 - t, t);
				}
			}
			return running;
		});
	}
	if (is_function(config)) {
		wait().then(() => {
			// @ts-ignore
			config = config(options);
			go();
		});
	} else {
		go();
	}
	return {
		end(reset) {
			if (reset && config.tick) {
				config.tick(1, 0);
			}
			if (running) {
				if (animation_name) delete_rule(node, animation_name);
				running = false;
			}
		}
	};
}

/**
 * @param {Element & ElementCSSInlineStyle} node
 * @param {TransitionFn} fn
 * @param {any} params
 * @param {boolean} intro
 * @returns {{ run(b: 0 | 1): void; end(): void; }}
 */
function create_bidirectional_transition(node, fn, params, intro) {
	/**
	 * @type {TransitionOptions} */
	const options = { direction: 'both' };
	let config = fn(node, params, options);
	let t = intro ? 0 : 1;

	/**
	 * @type {Program | null} */
	let running_program = null;

	/**
	 * @type {PendingProgram | null} */
	let pending_program = null;
	let animation_name = null;

	/**
	 * @returns {void} */
	function clear_animation() {
		if (animation_name) delete_rule(node, animation_name);
	}

	/**
	 * @param {PendingProgram} program
	 * @param {number} duration
	 * @returns {Program}
	 */
	function init(program, duration) {
		const d = /** @type {Program['d']} */ (program.b - t);
		duration *= Math.abs(d);
		return {
			a: t,
			b: program.b,
			d,
			duration,
			start: program.start,
			end: program.start + duration,
			group: program.group
		};
	}

	/**
	 * @param {INTRO | OUTRO} b
	 * @returns {void}
	 */
	function go(b) {
		const {
			delay = 0,
			duration = 300,
			easing = identity,
			tick = noop,
			css
		} = config || null_transition;

		/**
		 * @type {PendingProgram} */
		const program = {
			start: now() + delay,
			b
		};
		if (!b) {
			// @ts-ignore todo: improve typings
			program.group = outros;
			outros.r += 1;
		}
		if (running_program || pending_program) {
			pending_program = program;
		} else {
			// if this is an intro, and there's a delay, we need to do
			// an initial tick and/or apply CSS animation immediately
			if (css) {
				clear_animation();
				animation_name = create_rule(node, t, b, duration, delay, easing, css);
			}
			if (b) tick(0, 1);
			running_program = init(program, duration);
			add_render_callback(() => dispatch(node, b, 'start'));
			loop((now) => {
				if (pending_program && now > pending_program.start) {
					running_program = init(pending_program, duration);
					pending_program = null;
					dispatch(node, running_program.b, 'start');
					if (css) {
						clear_animation();
						animation_name = create_rule(
							node,
							t,
							running_program.b,
							running_program.duration,
							0,
							easing,
							config.css
						);
					}
				}
				if (running_program) {
					if (now >= running_program.end) {
						tick((t = running_program.b), 1 - t);
						dispatch(node, running_program.b, 'end');
						if (!pending_program) {
							// we're done
							if (running_program.b) {
								// intro — we can tidy up immediately
								clear_animation();
							} else {
								// outro — needs to be coordinated
								if (!--running_program.group.r) run_all(running_program.group.c);
							}
						}
						running_program = null;
					} else if (now >= running_program.start) {
						const p = now - running_program.start;
						t = running_program.a + running_program.d * easing(p / running_program.duration);
						tick(t, 1 - t);
					}
				}
				return !!(running_program || pending_program);
			});
		}
	}
	return {
		run(b) {
			if (is_function(config)) {
				wait().then(() => {
					const opts = { direction: b ? 'in' : 'out' };
					// @ts-ignore
					config = config(opts);
					go(b);
				});
			} else {
				go(b);
			}
		},
		end() {
			clear_animation();
			running_program = pending_program = null;
		}
	};
}

/** @typedef {1} INTRO */
/** @typedef {0} OUTRO */
/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

/**
 * @typedef {Object} Outro
 * @property {number} r
 * @property {Function[]} c
 * @property {Object} p
 */

/**
 * @typedef {Object} PendingProgram
 * @property {number} start
 * @property {INTRO|OUTRO} b
 * @property {Outro} [group]
 */

/**
 * @typedef {Object} Program
 * @property {number} a
 * @property {INTRO|OUTRO} b
 * @property {1|-1} d
 * @property {number} duration
 * @property {number} start
 * @property {number} end
 * @property {Outro} [group]
 */

function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } var _class;
/** @returns {void} */
function bind(component, name, callback) {
	const index = component.$$.props[name];
	if (index !== undefined) {
		component.$$.bound[index] = callback;
		callback(component.$$.ctx[index]);
	}
}

/** @returns {void} */
function create_component(block) {
	block && block.c();
}

/** @returns {void} */
function claim_component(block, parent_nodes) {
	block && block.l(parent_nodes);
}

/** @returns {void} */
function mount_component(component, target, anchor) {
	const { fragment, after_update } = component.$$;
	fragment && fragment.m(target, anchor);
	// onMount happens before the initial afterUpdate
	add_render_callback(() => {
		const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
		// if the component was destroyed immediately
		// it will update the `$$.on_destroy` reference to `null`.
		// the destructured on_destroy may still reference to the old array
		if (component.$$.on_destroy) {
			component.$$.on_destroy.push(...new_on_destroy);
		} else {
			// Edge case - component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});
	after_update.forEach(add_render_callback);
}

/** @returns {void} */
function destroy_component(component, detaching) {
	const $$ = component.$$;
	if ($$.fragment !== null) {
		flush_render_callbacks($$.after_update);
		run_all($$.on_destroy);
		$$.fragment && $$.fragment.d(detaching);
		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		$$.on_destroy = $$.fragment = null;
		$$.ctx = [];
	}
}

/** @returns {void} */
function make_dirty(component, i) {
	if (component.$$.dirty[0] === -1) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty.fill(0);
	}
	component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
}

/** @returns {void} */
function init(
	component,
	options,
	instance,
	create_fragment,
	not_equal,
	props,
	append_styles,
	dirty = [-1]
) {
	const parent_component = current_component;
	set_current_component(component);
	/** @type {import('./private.js').T$$} */
	const $$ = (component.$$ = {
		fragment: null,
		ctx: [],
		// state
		props,
		update: noop,
		not_equal,
		bound: blank_object(),
		// lifecycle
		on_mount: [],
		on_destroy: [],
		on_disconnect: [],
		before_update: [],
		after_update: [],
		context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
		// everything else
		callbacks: blank_object(),
		dirty,
		skip_bound: false,
		root: options.target || parent_component.$$.root
	});
	append_styles && append_styles($$.root);
	let ready = false;
	$$.ctx = instance
		? instance(component, options.props || {}, (i, ret, ...rest) => {
				const value = rest.length ? rest[0] : ret;
				if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
					if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
					if (ready) make_dirty(component, i);
				}
				return ret;
		  })
		: [];
	$$.update();
	ready = true;
	run_all($$.before_update);
	// `false` as a special case of no DOM component
	$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
	if (options.target) {
		if (options.hydrate) {
			start_hydrating();
			const nodes = children(options.target);
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment.l(nodes);
			nodes.forEach(detach);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment.c();
		}
		if (options.intro) transition_in(component.$$.fragment);
		mount_component(component, options.target, options.anchor);
		end_hydrating();
		flush();
	}
	set_current_component(parent_component);
}

let SvelteElement;

if (typeof HTMLElement === 'function') {
	SvelteElement = (_class = class extends HTMLElement {
		
		
		
		__init() {this.$$connected = false;}
		__init2() {this.$$data = {};}
		__init3() {this.$$reflecting = false;}
		/** @type {Record<string, CustomElementPropDefinition>} */
		__init4() {this.$$props_definition = {};}
		/** @type {Record<string, Function[]>} */
		__init5() {this.$$listeners = {};}
		/** @type {Map<Function, Function>} */
		__init6() {this.$$listener_unsubscribe_fns = new Map();}

		constructor($$componentCtor, $$slots, use_shadow_dom) {
			super();_class.prototype.__init.call(this);_class.prototype.__init2.call(this);_class.prototype.__init3.call(this);_class.prototype.__init4.call(this);_class.prototype.__init5.call(this);_class.prototype.__init6.call(this);			this.$$componentCtor = $$componentCtor;
			this.$$slots = $$slots;
			if (use_shadow_dom) {
				this.attachShadow({ mode: 'open' });
			}
		}

		addEventListener(type, listener, options) {
			// We can't determine upfront if the event is a custom event or not, so we have to
			// listen to both. If someone uses a custom event with the same name as a regular
			// browser event, this fires twice - we can't avoid that.
			this.$$listeners[type] = this.$$listeners[type] || [];
			this.$$listeners[type].push(listener);
			if (this.$$component) {
				const unsub = this.$$component.$on(type, listener);
				this.$$listener_unsubscribe_fns.set(listener, unsub);
			}
			super.addEventListener(type, listener, options);
		}

		removeEventListener(type, listener, options) {
			super.removeEventListener(type, listener, options);
			if (this.$$component) {
				const unsub = this.$$listener_unsubscribe_fns.get(listener);
				if (unsub) {
					unsub();
					this.$$listener_unsubscribe_fns.delete(listener);
				}
			}
		}

		async connectedCallback() {
			this.$$connected = true;
			if (!this.$$component) {
				// We wait one tick to let possible child slot elements be created/mounted
				await Promise.resolve();
				if (!this.$$connected) {
					return;
				}
				function create_slot(name) {
					return () => {
						let node;
						const obj = {
							c: function create() {
								node = document.createElement('slot');
								if (name !== 'default') {
									node.setAttribute('name', name);
								}
							},
							m: function mount(target, anchor) {
								insert(target, node, anchor);
							},
							d: function destroy(detaching) {
								if (detaching) {
									detach(node);
								}
							}
						};
						return obj;
					};
				}
				const $$slots = {};
				const existing_slots = get_custom_elements_slots(this);
				for (const name of this.$$slots) {
					if (name in existing_slots) {
						$$slots[name] = [create_slot(name)];
					}
				}
				for (const attribute of this.attributes) {
					// this.$$data takes precedence over this.attributes
					const name = this.$$get_prop_name(attribute.name);
					if (!(name in this.$$data)) {
						this.$$data[name] = get_custom_element_value(
							name,
							attribute.value,
							this.$$props_definition,
							'toProp'
						);
					}
				}
				this.$$component = new this.$$componentCtor({
					target: this.shadowRoot || this,
					props: {
						...this.$$data,
						$$slots,
						$$scope: {
							ctx: []
						}
					}
				});
				for (const type in this.$$listeners) {
					for (const listener of this.$$listeners[type]) {
						const unsub = this.$$component.$on(type, listener);
						this.$$listener_unsubscribe_fns.set(listener, unsub);
					}
				}
				this.$$listeners = {};
			}
		}

		// We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
		// and setting attributes through setAttribute etc, this is helpful
		attributeChangedCallback(attr, _oldValue, newValue) {
			if (this.$$reflecting) return;
			attr = this.$$get_prop_name(attr);
			this.$$data[attr] = get_custom_element_value(
				attr,
				newValue,
				this.$$props_definition,
				'toProp'
			);
			this.$$component.$set({ [attr]: this.$$data[attr] });
		}

		disconnectedCallback() {
			this.$$connected = false;
			// In a microtask, because this could be a move within the DOM
			Promise.resolve().then(() => {
				if (!this.$$connected) {
					this.$$component.$destroy();
					this.$$component = undefined;
				}
			});
		}

		$$get_prop_name(attribute_name) {
			return (
				Object.keys(this.$$props_definition).find(
					(key) =>
						this.$$props_definition[key].attribute === attribute_name ||
						(!this.$$props_definition[key].attribute && key.toLowerCase() === attribute_name)
				) || attribute_name
			);
		}
	}, _class);
}

/**
 * @param {string} prop
 * @param {any} value
 * @param {Record<string, CustomElementPropDefinition>} props_definition
 * @param {'toAttribute' | 'toProp'} [transform]
 */
function get_custom_element_value(prop, value, props_definition, transform) {
	const type = _optionalChain([props_definition, 'access', _ => _[prop], 'optionalAccess', _2 => _2.type]);
	value = type === 'Boolean' && typeof value !== 'boolean' ? value != null : value;
	if (!transform || !props_definition[prop]) {
		return value;
	} else if (transform === 'toAttribute') {
		switch (type) {
			case 'Object':
			case 'Array':
				return value == null ? null : JSON.stringify(value);
			case 'Boolean':
				return value ? '' : null;
			case 'Number':
				return value == null ? null : value;
			default:
				return value;
		}
	} else {
		switch (type) {
			case 'Object':
			case 'Array':
				return value && JSON.parse(value);
			case 'Boolean':
				return value; // conversion already handled above
			case 'Number':
				return value != null ? +value : value;
			default:
				return value;
		}
	}
}

/**
 * @internal
 *
 * Turn a Svelte component into a custom element.
 * @param {import('./public.js').ComponentType} Component  A Svelte component constructor
 * @param {Record<string, CustomElementPropDefinition>} props_definition  The props to observe
 * @param {string[]} slots  The slots to create
 * @param {string[]} accessors  Other accessors besides the ones for props the component has
 * @param {boolean} use_shadow_dom  Whether to use shadow DOM
 */
function create_custom_element(
	Component,
	props_definition,
	slots,
	accessors,
	use_shadow_dom
) {
	const Class = class extends SvelteElement {
		constructor() {
			super(Component, slots, use_shadow_dom);
			this.$$props_definition = props_definition;
		}
		static get observedAttributes() {
			return Object.keys(props_definition).map((key) =>
				(props_definition[key].attribute || key).toLowerCase()
			);
		}
	};
	Object.keys(props_definition).forEach((prop) => {
		Object.defineProperty(Class.prototype, prop, {
			get() {
				return this.$$component && prop in this.$$component
					? this.$$component[prop]
					: this.$$data[prop];
			},
			set(value) {
				value = get_custom_element_value(prop, value, props_definition);
				this.$$data[prop] = value;
				_optionalChain([this, 'access', _3 => _3.$$component, 'optionalAccess', _4 => _4.$set, 'call', _5 => _5({ [prop]: value })]);
				if (props_definition[prop].reflect) {
					this.$$reflecting = true;
					const attribute_value = get_custom_element_value(
						prop,
						value,
						props_definition,
						'toAttribute'
					);
					if (attribute_value == null) {
						this.removeAttribute(prop);
					} else {
						this.setAttribute(props_definition[prop].attribute || prop, attribute_value);
					}
					this.$$reflecting = false;
				}
			}
		});
	});
	accessors.forEach((accessor) => {
		Object.defineProperty(Class.prototype, accessor, {
			get() {
				return _optionalChain([this, 'access', _6 => _6.$$component, 'optionalAccess', _7 => _7[accessor]]);
			}
		});
	});
	Component.element = /** @type {any} */ (Class);
	return Class;
}

/**
 * Base class for Svelte components. Used when dev=false.
 *
 * @template {Record<string, any>} [Props=any]
 * @template {Record<string, any>} [Events=any]
 * @implements Record<string, any>
 */
class SvelteComponent {constructor() { SvelteComponent.prototype.__init7.call(this);SvelteComponent.prototype.__init8.call(this); }
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	__init7() {this.$$ = undefined;}
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	__init8() {this.$$set = undefined;}

	/** @returns {void} */
	$destroy() {
		destroy_component(this, 1);
		this.$destroy = noop;
	}

	/**
	 * @template {Extract<keyof Events, string>} K
	 * @param {K} type
	 * @param {((e: Events[K]) => void) | null | undefined} callback
	 * @returns {() => void}
	 */
	$on(type, callback) {
		if (!is_function(callback)) {
			return noop;
		}
		const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
		callbacks.push(callback);
		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	/**
	 * @param {Partial<Props>} props
	 * @returns {void}
	 */
	$set(props) {
		if (this.$$set && !is_empty(props)) {
			this.$$.skip_bound = true;
			this.$$set(props);
			this.$$.skip_bound = false;
		}
	}
}

/**
 * @typedef {Object} CustomElementPropDefinition
 * @property {string} [attribute]
 * @property {boolean} [reflect]
 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
 */

export { HtmlTag, HtmlTagHydration, ResizeObserverSingleton, SvelteComponent, SvelteElement, action_destroyer, add_flush_callback, add_iframe_resize_listener, add_location, add_render_callback, afterUpdate, append, append_empty_stylesheet, append_hydration, append_styles, assign, attr, attribute_to_object, beforeUpdate, bind, binding_callbacks, blank_object, bubble, check_outros, children, claim_comment, claim_component, claim_element, claim_html_tag, claim_space, claim_svg_element, claim_text, clear_loops, comment, component_subscribe, compute_rest_props, compute_slots, construct_svelte_component, contenteditable_truthy_values, createEventDispatcher, create_bidirectional_transition, create_component, create_custom_element, create_in_transition, create_out_transition, create_rule, create_slot, current_component, custom_event, delete_rule, destroy_component, destroy_each, detach, dirty_components, element, element_is, empty, end_hydrating, exclude_internal_props, flush, flush_render_callbacks, getAllContexts, getContext, get_all_dirty_from_scope, get_binding_group_value, get_current_component, get_custom_elements_slots, get_root_for_style, get_slot_changes, get_store_value, get_svelte_dataset, globals, group_outros, hasContext, has_prop, head_selector, identity, init, init_binding_group, init_binding_group_dynamic, insert, insert_hydration, intros, is_client, is_crossorigin, is_empty, is_function, is_promise, listen, loop, mount_component, noop, not_equal, now, null_to_empty, object_without_properties, onDestroy, onMount, once, prevent_default, query_selector_all, raf, resize_observer_border_box, resize_observer_content_box, resize_observer_device_pixel_content_box, run, run_all, safe_not_equal, schedule_update, select_multiple_value, select_option, select_options, select_value, self, setContext, set_attributes, set_current_component, set_custom_element_data, set_custom_element_data_map, set_data, set_data_contenteditable, set_data_maybe_contenteditable, set_dynamic_element_data, set_input_type, set_input_value, set_now, set_raf, set_store_value, set_style, set_svg_attributes, space, split_css_unit, src_url_equal, start_hydrating, stop_immediate_propagation, stop_propagation, subscribe, svg_element, text, tick, time_ranges_to_array, to_number, toggle_class, transition_in, transition_out, trusted, update_slot, update_slot_base, validate_store, xlink_attr };
