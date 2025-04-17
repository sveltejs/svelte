export { FILENAME, HMR, NAMESPACE_SVG } from '../../constants.js';
export { push, pop } from './context.js';
export { assign, assign_and, assign_or, assign_nullish } from './dev/assign.js';
export { cleanup_styles } from './dev/css.js';
export { add_locations } from './dev/elements.js';
export { hmr } from './dev/hmr.js';
export { create_ownership_validator } from './dev/ownership.js';
export { check_target, legacy_api } from './dev/legacy.js';
export { trace } from './dev/tracing.js';
export { inspect } from './dev/inspect.js';
export { validate_snippet_args } from './dev/validation.js';
export { await_block as await } from './dom/blocks/await.js';
export { if_block as if } from './dom/blocks/if.js';
export { key_block as key } from './dom/blocks/key.js';
export { css_props } from './dom/blocks/css-props.js';
export { index, each } from './dom/blocks/each.js';
export { html } from './dom/blocks/html.js';
export { sanitize_slots, slot } from './dom/blocks/slot.js';
export { snippet, wrap_snippet } from './dom/blocks/snippet.js';
export { component } from './dom/blocks/svelte-component.js';
export { element } from './dom/blocks/svelte-element.js';
export { head } from './dom/blocks/svelte-head.js';
export { append_styles } from './dom/css.js';
export { action } from './dom/elements/actions.js';
export {
	remove_input_defaults,
	set_attribute,
	set_attributes,
	set_custom_element_data,
	set_xlink_attribute,
	set_value,
	set_checked,
	set_selected,
	set_default_checked,
	set_default_value,
	CLASS,
	STYLE
} from './dom/elements/attributes.js';
export { set_class } from './dom/elements/class.js';
export { apply, event, delegate, replay_events } from './dom/elements/events.js';
export { autofocus, remove_textarea_child } from './dom/elements/misc.js';
export { set_style } from './dom/elements/style.js';
export { animation, transition } from './dom/elements/transitions.js';
export { bind_active_element } from './dom/elements/bindings/document.js';
export { bind_checked, bind_files, bind_group, bind_value } from './dom/elements/bindings/input.js';
export {
	bind_buffered,
	bind_current_time,
	bind_ended,
	bind_muted,
	bind_paused,
	bind_playback_rate,
	bind_played,
	bind_ready_state,
	bind_seekable,
	bind_seeking,
	bind_volume
} from './dom/elements/bindings/media.js';
export { bind_online } from './dom/elements/bindings/navigator.js';
export { bind_prop } from './dom/elements/bindings/props.js';
export { bind_select_value, init_select, select_option } from './dom/elements/bindings/select.js';
export { bind_element_size, bind_resize_observer } from './dom/elements/bindings/size.js';
export { bind_this } from './dom/elements/bindings/this.js';
export {
	bind_content_editable,
	bind_property,
	bind_focused
} from './dom/elements/bindings/universal.js';
export { bind_window_scroll, bind_window_size } from './dom/elements/bindings/window.js';
export { hydrate_template, next, reset } from './dom/hydration.js';
export {
	once,
	preventDefault,
	self,
	stopImmediatePropagation,
	stopPropagation,
	trusted
} from './dom/legacy/event-modifiers.js';
export { init } from './dom/legacy/lifecycle.js';
export {
	add_legacy_event_listener,
	bubble_event,
	reactive_import,
	update_legacy_props
} from './dom/legacy/misc.js';
export {
	append,
	comment,
	ns_template,
	svg_template_with_script,
	mathml_template,
	template,
	template_with_script,
	text,
	props_id
} from './dom/template.js';
export { user_derived as derived, derived_safe_equal } from './reactivity/deriveds.js';
export {
	effect_tracking,
	effect_root,
	legacy_pre_effect,
	legacy_pre_effect_reset,
	render_effect,
	template_effect,
	effect,
	user_effect,
	user_pre_effect
} from './reactivity/effects.js';
export { mutable_source, mutate, set, state, update, update_pre } from './reactivity/sources.js';
export {
	prop,
	rest_props,
	legacy_rest_props,
	spread_props,
	update_pre_prop,
	update_prop
} from './reactivity/props.js';
export {
	invalidate_store,
	store_mutate,
	setup_stores,
	store_get,
	store_set,
	store_unsub,
	update_pre_store,
	update_store,
	mark_store_binding
} from './reactivity/store.js';
export { boundary } from './dom/blocks/boundary.js';
export { set_text } from './render.js';
export {
	get,
	safe_get,
	invalidate_inner_signals,
	flushSync as flush,
	tick,
	untrack,
	exclude_from_object,
	deep_read,
	deep_read_state
} from './runtime.js';
export { validate_binding, validate_each_keys } from './validate.js';
export { raf } from './timing.js';
export { proxy } from './proxy.js';
export { create_custom_element } from './dom/elements/custom-element.js';
export {
	child,
	first_child,
	sibling,
	$window as window,
	$document as document
} from './dom/operations.js';
export { attr, clsx } from '../shared/attributes.js';
export { snapshot } from '../shared/clone.js';
export { noop, fallback } from '../shared/utils.js';
export {
	invalid_default_snippet,
	validate_dynamic_element_tag,
	validate_store,
	validate_void_dynamic_element,
	prevent_snippet_stringification
} from '../shared/validate.js';
export { strict_equals, equals } from './dev/equality.js';
export { log_if_contains_state } from './dev/console-log.js';
