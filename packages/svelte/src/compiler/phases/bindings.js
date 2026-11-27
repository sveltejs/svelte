/** @import { AST } from '#compiler' */
import { is_custom_element_node } from './nodes.js';

/**
 * @typedef BindingProperty
 * @property {string} [event] This is set if the binding corresponds to the property name on the dom element it's bound to
 * 							  and there's an event that notifies of a change to that property
 * @property {boolean} [bidirectional] Set this to `true` if updates are written to the dom property
 * @property {boolean} [omit_in_ssr] Set this to true if the binding should not be included in SSR
 * @property {string[]} [valid_elements] If this is set, the binding is only valid on the given elements
 * @property {string[]} [invalid_elements] If this is set, the binding is invalid on the given elements
 */

/**
 * @type {Record<string, BindingProperty>}
 */
export const binding_properties = {
	// media
	currentTime: {
		valid_elements: ['audio', 'video'],
		omit_in_ssr: true,
		bidirectional: true
	},
	duration: {
		valid_elements: ['audio', 'video'],
		event: 'durationchange',
		omit_in_ssr: true
	},
	focused: {
		omit_in_ssr: true // no corresponding HTML attribute
	},
	paused: {
		valid_elements: ['audio', 'video'],
		omit_in_ssr: true,
		bidirectional: true
	},
	buffered: {
		valid_elements: ['audio', 'video'],
		omit_in_ssr: true
	},
	seekable: {
		valid_elements: ['audio', 'video'],
		omit_in_ssr: true
	},
	played: {
		valid_elements: ['audio', 'video'],
		omit_in_ssr: true
	},
	volume: {
		valid_elements: ['audio', 'video'],
		omit_in_ssr: true,
		bidirectional: true
	},
	muted: {
		valid_elements: ['audio', 'video'],
		omit_in_ssr: true,
		bidirectional: true
	},
	playbackRate: {
		valid_elements: ['audio', 'video'],
		omit_in_ssr: true,
		bidirectional: true
	},
	seeking: {
		valid_elements: ['audio', 'video'],
		omit_in_ssr: true
	},
	ended: {
		valid_elements: ['audio', 'video'],
		omit_in_ssr: true
	},
	readyState: {
		valid_elements: ['audio', 'video'],
		omit_in_ssr: true
	},
	// video
	videoHeight: {
		valid_elements: ['video'],
		event: 'resize',
		omit_in_ssr: true
	},
	videoWidth: {
		valid_elements: ['video'],
		event: 'resize',
		omit_in_ssr: true
	},
	// img
	naturalWidth: {
		valid_elements: ['img'],
		event: 'load',
		omit_in_ssr: true
	},
	naturalHeight: {
		valid_elements: ['img'],
		event: 'load',
		omit_in_ssr: true
	},
	// document
	activeElement: {
		valid_elements: ['svelte:document'],
		omit_in_ssr: true
	},
	fullscreenElement: {
		valid_elements: ['svelte:document'],
		event: 'fullscreenchange',
		omit_in_ssr: true
	},
	pointerLockElement: {
		valid_elements: ['svelte:document'],
		event: 'pointerlockchange',
		omit_in_ssr: true
	},
	visibilityState: {
		valid_elements: ['svelte:document'],
		event: 'visibilitychange',
		omit_in_ssr: true
	},
	// window
	innerWidth: {
		valid_elements: ['svelte:window'],
		omit_in_ssr: true
	},
	innerHeight: {
		valid_elements: ['svelte:window'],
		omit_in_ssr: true
	},
	outerWidth: {
		valid_elements: ['svelte:window'],
		omit_in_ssr: true
	},
	outerHeight: {
		valid_elements: ['svelte:window'],
		omit_in_ssr: true
	},
	scrollX: {
		valid_elements: ['svelte:window'],
		omit_in_ssr: true,
		bidirectional: true
	},
	scrollY: {
		valid_elements: ['svelte:window'],
		omit_in_ssr: true,
		bidirectional: true
	},
	online: {
		valid_elements: ['svelte:window'],
		omit_in_ssr: true
	},
	devicePixelRatio: {
		valid_elements: ['svelte:window'],
		event: 'resize',
		omit_in_ssr: true
	},
	// dimensions
	clientWidth: {
		omit_in_ssr: true,
		invalid_elements: ['svelte:window', 'svelte:document']
	},
	clientHeight: {
		omit_in_ssr: true,
		invalid_elements: ['svelte:window', 'svelte:document']
	},
	offsetWidth: {
		omit_in_ssr: true,
		invalid_elements: ['svelte:window', 'svelte:document']
	},
	offsetHeight: {
		omit_in_ssr: true,
		invalid_elements: ['svelte:window', 'svelte:document']
	},
	contentRect: {
		omit_in_ssr: true,
		invalid_elements: ['svelte:window', 'svelte:document']
	},
	contentBoxSize: {
		omit_in_ssr: true,
		invalid_elements: ['svelte:window', 'svelte:document']
	},
	borderBoxSize: {
		omit_in_ssr: true,
		invalid_elements: ['svelte:window', 'svelte:document']
	},
	devicePixelContentBoxSize: {
		omit_in_ssr: true,
		invalid_elements: ['svelte:window', 'svelte:document']
	},
	// checkbox/radio
	indeterminate: {
		event: 'change',
		bidirectional: true,
		valid_elements: ['input'],
		omit_in_ssr: true // no corresponding attribute
	},
	checked: {
		valid_elements: ['input'],
		bidirectional: true
	},
	group: {
		valid_elements: ['input'],
		bidirectional: true
	},
	// various
	this: {
		omit_in_ssr: true
	},
	innerText: {
		invalid_elements: ['svelte:window', 'svelte:document'],
		bidirectional: true
	},
	innerHTML: {
		invalid_elements: ['svelte:window', 'svelte:document'],
		bidirectional: true
	},
	textContent: {
		invalid_elements: ['svelte:window', 'svelte:document'],
		bidirectional: true
	},
	open: {
		event: 'toggle',
		bidirectional: true,
		valid_elements: ['details']
	},
	value: {
		valid_elements: ['input', 'textarea', 'select'],
		bidirectional: true
	},
	files: {
		valid_elements: ['input'],
		omit_in_ssr: true,
		bidirectional: true
	}
};

/**
 * Returns `true` if `bind:name` on the given element is a binding to a property of a custom element
 * rather than one of the built-in bindings — i.e. `bind:foo={x}` is sugar for
 * `foo={x} onfoochange={() => x = element.foo}`.
 * Built-in bindings that are valid on any element (such as `bind:this` or `bind:clientWidth`) take precedence.
 * @param {string} name
 * @param {AST.SvelteNode | undefined} element
 */
export function is_custom_element_binding(name, element) {
	if (element?.type !== 'RegularElement' || !is_custom_element_node(element)) {
		return false;
	}

	const property = Object.hasOwn(binding_properties, name) ? binding_properties[name] : undefined;

	if (!property) return true;
	if (property.valid_elements) return !property.valid_elements.includes(element.name);

	return !!property.invalid_elements?.includes(element.name);
}
