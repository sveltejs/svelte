/** @import { Effect, Source } from '#client' */
import { DEV } from 'esm-env';
import {
	get,
	active_effect,
	update_version,
	active_reaction,
	set_update_version,
	set_active_reaction
} from './runtime.js';
import { destroy_effect, eager_effect } from './reactivity/effects.js';
import {
	array_prototype,
	get_descriptor,
	get_prototype_of,
	is_array,
	object_prototype
} from '../shared/utils.js';
import {
	state as source,
	set,
	increment,
	set_eager_effects_deferred,
	unset_eager_effects_deferred
} from './reactivity/sources.js';
import {
	COMPONENT_SYMBOL,
	PROXY_META_SYMBOL,
	PROXY_PATH_SYMBOL,
	STATE_SYMBOL
} from '#client/constants';
import { UNINITIALIZED } from '../../constants.js';
import * as e from './errors.js';
import { tag } from './dev/tracing.js';
import { get_error } from '../shared/dev.js';
import { tracing_mode_flag } from '../flags/index.js';

// TODO move all regexes into shared module?
const regex_is_valid_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

/**
 * @typedef {{
 *   self: any;
 *   sources: Map<any, Source<any>>;
 *   links: Array<{ pm: ProxyMeta, k: any }>;
 *   fires: Array<{ cb: () => void, n: Source<number>, e: Effect }>;
 *   observed: boolean;
 * }} ProxyMeta
 */

/**
 * Creates the dispatch half of an `onchange` root: a notifier source paired with an
 * eager effect, so callbacks run synchronously inside `set()` and inherit the existing
 * fork gating and deferral behaviour. The original callback is kept alongside so it
 * can be detached again by identity
 * @param {() => void} onchange
 * @returns {{ cb: () => void, n: Source<number>, e: Effect }}
 */
function create_fire(onchange) {
	var notifier = source(0);
	var initial = true;
	var running = false;

	var effect = eager_effect(() => {
		get(notifier);

		if (initial) {
			initial = false;
			return;
		}

		// guard against the callback synchronously mutating its own tree
		if (running) return;
		running = true;

		// the callback is user code, not part of the effect: it may write state
		// (which `set` forbids inside eager effects) and must not track its reads
		var previous_reaction = active_reaction;
		set_active_reaction(null);

		try {
			onchange();
		} finally {
			set_active_reaction(previous_reaction);
			running = false;
		}
	});

	return { cb: onchange, n: notifier, e: effect };
}

/**
 * Whether `link` still describes where `meta.self` sits in its parent: the parent's
 * source for that key holds this proxy, or a user wrapper that forwards to it
 * @param {{ pm: ProxyMeta, k: any }} link
 * @param {ProxyMeta} meta
 */
function is_live(link, meta) {
	var s = link.pm.sources.get(link.k);
	if (s === undefined) return false;

	var v = s.v;
	return (
		v === meta.self ||
		(v !== null &&
			typeof v === 'object' &&
			STATE_SYMBOL in v &&
			/** @type {any} */ (v)[PROXY_META_SYMBOL] === meta)
	);
}

/**
 * Registers `parent_meta[key]` as a (possibly stale) way to reach a root from `child`.
 * Links are never eagerly removed — they are verified and pruned during `collect_roots`
 * @param {any} child
 * @param {ProxyMeta} parent_meta
 * @param {any} key
 */
function link_child(child, parent_meta, key) {
	if (child === null || typeof child !== 'object' || !(STATE_SYMBOL in child)) return;

	var meta = /** @type {ProxyMeta | undefined} */ (child[PROXY_META_SYMBOL]);
	if (meta === undefined) return;

	var links = meta.links;

	var linked = false;

	// links to this parent under other keys survive only while those slots still hold
	// the child, so index churn (`unshift`, `sort`) cannot grow the list
	for (var i = links.length - 1; i >= 0; i -= 1) {
		var link = links[i];
		if (link.pm !== parent_meta) continue;

		if (link.k === key) {
			linked = true;
		} else if (!is_live(link, meta)) {
			links.splice(i, 1);
		}
	}

	if (linked) return;

	links.push({ pm: parent_meta, k: key });
	observe(meta);
}

/**
 * Marks a node observed and links its already-materialized children, so references
 * captured before the node joined an observed tree still reach a root
 * @param {ProxyMeta} meta
 */
function observe(meta) {
	if (meta.observed) return;
	meta.observed = true;

	for (var [key, s] of meta.sources) {
		if (s.v !== UNINITIALIZED) {
			link_child(s.v, meta, key);
		}
	}
}

/**
 * Walks rootward from `meta`, verifying each link against the parent's backing source.
 * Dead links are pruned in place; live chains contribute their root notifiers to `fires`
 * @param {ProxyMeta} meta
 * @param {Set<ProxyMeta>} visited
 * @param {Set<Source<number>>} fires
 */
function collect_roots(meta, visited, fires) {
	if (visited.has(meta)) return;
	visited.add(meta);

	for (var i = 0; i < meta.fires.length; i += 1) {
		fires.add(meta.fires[i].n);
	}

	var links = meta.links;

	for (var j = links.length - 1; j >= 0; j -= 1) {
		if (is_live(links[j], meta)) {
			collect_roots(links[j].pm, visited, fires);
		} else {
			links.splice(j, 1);
		}
	}
}

/** @param {ProxyMeta} meta */
function notify_onchange(meta) {
	/** @type {Set<ProxyMeta>} */
	var visited = new Set();
	/** @type {Set<Source<number>>} */
	var fires = new Set();
	collect_roots(meta, visited, fires);

	if (fires.size === 0) {
		// nothing reachable fires any more (roots detached, or every route pruned), so the
		// whole visited region leaves the observed state instead of walking on every write
		for (var m of visited) {
			m.links.length = 0;
			m.observed = false;
		}
		return;
	}

	for (var n of fires) increment(n);
}

/**
 * Detaches a callback previously attached with `proxy(value, onchange)`, used by the
 * `$state` shell so a reassigned variable's old tree stops firing its callback
 * @param {any} value
 * @param {() => void} onchange
 */
export function remove_onchange(value, onchange) {
	if (value === null || typeof value !== 'object' || !(STATE_SYMBOL in value)) return;

	var meta = /** @type {ProxyMeta | undefined} */ (value[PROXY_META_SYMBOL]);
	if (meta === undefined) return;

	var fires = meta.fires;

	for (var i = 0; i < fires.length; i += 1) {
		if (fires[i].cb === onchange) {
			destroy_effect(fires[i].e);
			fires.splice(i, 1);
			break;
		}
	}

	if (fires.length === 0 && meta.links.length === 0) {
		meta.observed = false;
	}
}

/** @type {WeakMap<Function, Function>} */
var batched_methods = new WeakMap();

/**
 * Wraps an array mutating method so eager effects run once per method call rather than
 * once per internal `set` (e.g. `push` writes an element and `length`). Memoised per
 * method, so `arr.push === arr.push` holds and reads allocate nothing
 * @param {Function} fn
 */
function batch_eager_method(fn) {
	var wrapped = batched_methods.get(fn);

	if (wrapped === undefined) {
		wrapped = function (/** @type {any[]} */ ...args) {
			set_eager_effects_deferred();

			try {
				// @ts-ignore
				return fn.apply(this, args);
			} finally {
				unset_eager_effects_deferred();
			}
		};

		batched_methods.set(fn, wrapped);
	}

	return wrapped;
}

/**
 * @template T
 * @param {T} value
 * @param {() => void} [onchange] fires synchronously when anything in the proxied tree changes. Only plain objects and arrays are proxied, so writes inside class instances or reactive built-ins like `SvelteMap` do not notify
 * @returns {T}
 */
export function proxy(value, onchange) {
	// if non-proxyable or a component instance, return `value`
	if (typeof value !== 'object' || value === null || COMPONENT_SYMBOL in value) {
		return value;
	}

	if (STATE_SYMBOL in value) {
		if (onchange !== undefined) {
			// attach an additional root callback to an existing proxy
			var m = /** @type {ProxyMeta} */ (/** @type {any} */ (value)[PROXY_META_SYMBOL]);
			m.fires.push(create_fire(onchange));
			observe(m);
		}
		return value;
	}

	const prototype = get_prototype_of(value);

	if (prototype !== object_prototype && prototype !== array_prototype) {
		return value;
	}

	/** @type {Map<any, Source<any>>} */
	var sources = new Map();
	var is_proxied_array = is_array(value);
	var version = source(0);

	/**
	 * Only allocated once this proxy participates in an observed tree —
	 * proxies outside onchange trees never pay for this beyond a null check
	 * @type {ProxyMeta | null}
	 */
	var meta = null;

	var stack = DEV && tracing_mode_flag ? get_error('created at') : null;
	var parent_version = update_version;

	/**
	 * Executes the proxy in the context of the reaction it was originally created in, if any
	 * @template T
	 * @param {() => T} fn
	 */
	var with_parent = (fn) => {
		if (update_version === parent_version) {
			return fn();
		}

		// child source is being created after the initial proxy —
		// prevent it from being associated with the current reaction
		var reaction = active_reaction;
		var version = update_version;

		set_active_reaction(null);
		set_update_version(parent_version);

		var result = fn();

		set_active_reaction(reaction);
		set_update_version(version);

		return result;
	};

	if (is_proxied_array) {
		// We need to create the length source eagerly to ensure that
		// mutations to the array are properly synced with our proxy
		sources.set('length', source(/** @type {any[]} */ (value).length, stack));
		if (DEV) {
			value = /** @type {any} */ (inspectable_array(/** @type {any[]} */ (value)));
		}
	}

	/** Used in dev for $inspect.trace() */
	var path = '';
	let updating = false;
	/** @param {string} new_path */
	function update_path(new_path) {
		if (updating) return;
		updating = true;
		path = new_path;

		tag(version, `${path} version`);

		// rename all child sources and child proxies
		for (const [prop, source] of sources) {
			tag(source, get_label(path, prop));
		}
		updating = false;
	}

	var p = new Proxy(/** @type {any} */ (value), {
		defineProperty(_, prop, descriptor) {
			if (
				!('value' in descriptor) ||
				descriptor.configurable === false ||
				descriptor.enumerable === false ||
				descriptor.writable === false
			) {
				// we disallow non-basic descriptors, because unless they are applied to the
				// target object — which we avoid, so that state can be forked — we will run
				// afoul of the various invariants
				// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/getOwnPropertyDescriptor#invariants
				e.state_descriptors_fixed();
			}
			var s = sources.get(prop);
			var changed = s === undefined || s.v !== descriptor.value;

			if (s === undefined) {
				with_parent(() => {
					var s = source(descriptor.value, stack);
					sources.set(prop, s);
					if (DEV && typeof prop === 'string') {
						tag(s, get_label(path, prop));
					}
					return s;
				});
			} else {
				set(s, descriptor.value, true);
			}

			if (changed && meta !== null && meta.observed) {
				link_child(/** @type {Source<any>} */ (sources.get(prop)).v, meta, prop);
				notify_onchange(meta);
			}

			return true;
		},

		deleteProperty(target, prop) {
			var s = sources.get(prop);
			var changed = false;

			if (s === undefined) {
				if (prop in target) {
					const s = with_parent(() => source(UNINITIALIZED, stack));
					sources.set(prop, s);
					increment(version);
					changed = true;

					if (DEV) {
						tag(s, get_label(path, prop));
					}
				}
			} else {
				if (s.v !== UNINITIALIZED) changed = true;
				set(s, UNINITIALIZED);
				increment(version);
			}

			if (changed && meta !== null && meta.observed) {
				notify_onchange(/** @type {ProxyMeta} */ (meta));
			}

			return true;
		},

		get(target, prop, receiver) {
			if (prop === STATE_SYMBOL) {
				return value;
			}

			if (DEV && prop === PROXY_PATH_SYMBOL) {
				return update_path;
			}

			var s = sources.get(prop);
			var exists = prop in target;

			// symbols are never own properties, so this check can live off the hot path
			if (s === undefined && prop === PROXY_META_SYMBOL) {
				return (meta ??= { self: p, sources, links: [], fires: [], observed: false });
			}

			// create a source, but only if it's an own property and not a prototype property
			if (s === undefined && (!exists || get_descriptor(target, prop)?.writable)) {
				s = with_parent(() => {
					var p = proxy(exists ? target[prop] : UNINITIALIZED);
					var s = source(p, stack);

					if (DEV) {
						tag(s, get_label(path, prop));
					}

					return s;
				});

				sources.set(prop, s);
			}

			if (s !== undefined) {
				var v = get(s);

				// reads through an observed proxy establish (or refresh) the child's rootward link
				if (meta !== null && meta.observed && v !== UNINITIALIZED) {
					link_child(v, meta, prop);
				}

				return v === UNINITIALIZED ? undefined : v;
			}

			var reflected = Reflect.get(target, prop, receiver);

			if (
				meta !== null &&
				meta.observed &&
				is_proxied_array &&
				typeof prop === 'string' &&
				typeof reflected === 'function' &&
				ARRAY_MUTATING_METHODS.has(prop)
			) {
				// batch array methods so e.g. `push` (element + length) fires roots once
				return batch_eager_method(reflected);
			}

			return reflected;
		},

		getOwnPropertyDescriptor(target, prop) {
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);

			if (descriptor && 'value' in descriptor) {
				var s = sources.get(prop);
				if (s) {
					descriptor.value = get(s);

					if (meta !== null && meta.observed) {
						link_child(descriptor.value, meta, prop);
					}
				}
			} else if (descriptor === undefined) {
				var source = sources.get(prop);
				var value = source?.v;

				if (source !== undefined && value !== UNINITIALIZED) {
					if (meta !== null && meta.observed) {
						link_child(value, meta, prop);
					}

					return {
						enumerable: true,
						configurable: true,
						value,
						writable: true
					};
				}
			}

			return descriptor;
		},

		has(target, prop) {
			if (prop === STATE_SYMBOL) {
				return true;
			}

			var s = sources.get(prop);
			var has = (s !== undefined && s.v !== UNINITIALIZED) || Reflect.has(target, prop);

			if (
				s !== undefined ||
				(active_effect !== null && (!has || get_descriptor(target, prop)?.writable))
			) {
				if (s === undefined) {
					s = with_parent(() => {
						var p = has ? proxy(target[prop]) : UNINITIALIZED;
						var s = source(p, stack);

						if (DEV) {
							tag(s, get_label(path, prop));
						}

						return s;
					});

					sources.set(prop, s);
				}

				var value = get(s);
				if (value === UNINITIALIZED) {
					return false;
				}

				if (meta !== null && meta.observed) {
					link_child(value, meta, prop);
				}
			}

			return has;
		},

		set(target, prop, value, receiver) {
			var s = sources.get(prop);
			var has = prop in target;
			var changed = false;

			// variable.length = value -> clear all signals with index >= value
			if (is_proxied_array && prop === 'length') {
				for (var i = value; i < /** @type {Source<number>} */ (s).v; i += 1) {
					var other_s = sources.get(i + '');
					if (other_s !== undefined) {
						set(other_s, UNINITIALIZED);
					} else if (i in target) {
						// If the item exists in the original, we need to create an uninitialized source,
						// else a later read of the property would result in a source being created with
						// the value of the original item at that index.
						other_s = with_parent(() => source(UNINITIALIZED, stack));
						sources.set(i + '', other_s);

						if (DEV) {
							tag(other_s, get_label(path, i));
						}
					}
				}
			}

			// If we haven't yet created a source for this property, we need to ensure
			// we do so otherwise if we read it later, then the write won't be tracked and
			// the heuristics of effects will be different vs if we had read the proxied
			// object property before writing to that property.
			if (s === undefined) {
				if (!has || get_descriptor(target, prop)?.writable) {
					s = with_parent(() => source(undefined, stack));

					if (DEV) {
						tag(s, get_label(path, prop));
					}

					var np = proxy(value);
					set(s, np);
					changed = !has || target[prop] !== value;

					sources.set(prop, s);
				}
			} else {
				has = s.v !== UNINITIALIZED;

				np = with_parent(() => proxy(value));
				changed = s.v !== np;
				set(s, np);
			}

			if (meta !== null && meta.observed) {
				link_child(np, meta, prop);
			}

			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);

			// Set the new value before updating any signals so that any listeners get the new value
			if (descriptor?.set) {
				descriptor.set.call(receiver, value);
			}

			if (!has) {
				// If we have mutated an array directly, we might need to
				// signal that length has also changed. Do it before updating metadata
				// to ensure that iterating over the array as a result of a metadata update
				// will not cause the length to be out of sync.
				if (is_proxied_array && typeof prop === 'string') {
					var ls = /** @type {Source<number>} */ (sources.get('length'));
					var n = Number(prop);

					if (Number.isInteger(n) && n >= ls.v) {
						set(ls, n + 1);
					}
				}

				increment(version);
				changed = true;
			}

			if (changed && meta !== null && meta.observed) {
				notify_onchange(/** @type {ProxyMeta} */ (meta));
			}

			return true;
		},

		ownKeys(target) {
			get(version);

			var own_keys = Reflect.ownKeys(target).filter((key) => {
				var source = sources.get(key);
				return source === undefined || source.v !== UNINITIALIZED;
			});

			for (var [key, source] of sources) {
				if (source.v !== UNINITIALIZED && !(key in target)) {
					own_keys.push(key);
				}
			}

			return own_keys;
		},

		setPrototypeOf() {
			e.state_prototype_fixed();
		}
	});

	if (onchange !== undefined) {
		meta = { self: p, sources, links: [], fires: [create_fire(onchange)], observed: true };
	}

	return p;
}

/**
 * @param {string} path
 * @param {string | symbol} prop
 */
function get_label(path, prop) {
	if (typeof prop === 'symbol') return `${path}[Symbol(${prop.description ?? ''})]`;
	if (regex_is_valid_identifier.test(prop)) return `${path}.${prop}`;
	return /^\d+$/.test(prop) ? `${path}[${prop}]` : `${path}['${prop}']`;
}

/**
 * @param {any} value
 */
export function get_proxied_value(value) {
	try {
		if (value !== null && typeof value === 'object' && STATE_SYMBOL in value) {
			return value[STATE_SYMBOL];
		}
	} catch {
		// the above if check can throw an error if the value in question
		// is the contentWindow of an iframe on another domain, in which
		// case we want to just return the value (because it's definitely
		// not a proxied value) so we don't break any JavaScript interacting
		// with that iframe (such as various payment companies client side
		// JavaScript libraries interacting with their iframes on the same
		// domain)
	}

	return value;
}

/**
 * @param {any} a
 * @param {any} b
 */
export function is(a, b) {
	return Object.is(get_proxied_value(a), get_proxied_value(b));
}

const ARRAY_MUTATING_METHODS = new Set([
	'copyWithin',
	'fill',
	'pop',
	'push',
	'reverse',
	'shift',
	'sort',
	'splice',
	'unshift'
]);

/**
 * Wrap array mutating methods so $inspect is triggered only once and
 * to prevent logging an array in intermediate state (e.g. with an empty slot)
 * @param {any[]} array
 */
function inspectable_array(array) {
	return new Proxy(array, {
		get(target, prop, receiver) {
			var value = Reflect.get(target, prop, receiver);
			if (!ARRAY_MUTATING_METHODS.has(/** @type {string} */ (prop))) {
				return value;
			}

			return batch_eager_method(value);
		}
	});
}
