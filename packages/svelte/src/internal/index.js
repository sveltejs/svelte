export {
	get,
	set,
	set_sync,
	invalidate_inner_signals,
	flushSync,
	tick,
	untrack,
	update,
	update_prop,
	update_pre,
	update_pre_prop,
	mutate,
	value_or_fallback,
	exclude_from_object,
	pop,
	push,
	inspect,
	unwrap,
	freeze,
	deep_read
} from './client/runtime.js';
export * from './client/dev/ownership.js';
export { await_block as await } from './client/dom/blocks/await.js';
export { if_block as if } from './client/dom/blocks/if.js';
export { key_block as key } from './client/dom/blocks/key.js';
export { snippet_effect } from './client/dom/blocks/render-tag.js';
export { component } from './client/dom/blocks/svelte-component.js';
export { element } from './client/dom/blocks/svelte-element.js';
export * from './client/dom/blocks/each.js';
export * from './client/reactivity/computations.js';
export * from './client/reactivity/sources.js';
export * from './client/reactivity/equality.js';
export * from './client/reactivity/store.js';
export * from './client/render.js';
export * from './client/validate.js';
export { raf } from './client/timing.js';
export { proxy, unstate } from './client/proxy.js';
export { create_custom_element } from './client/custom-element.js';
export {
	child,
	child_frag,
	sibling,
	$window as window,
	$document as document
} from './client/operations.js';
export { noop } from './common.js';
