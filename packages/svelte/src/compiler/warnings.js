/* This file is generated by scripts/process-messages/index.js. Do not edit! */

import { warnings, ignore_stack, ignore_map, warning_filter } from './state.js';
import { CompileDiagnostic } from './utils/compile_diagnostic.js';

/** @typedef {{ start?: number, end?: number }} NodeLike */
class InternalCompileWarning extends CompileDiagnostic {
	name = 'CompileWarning';

	/**
	 * @param {string} code
	 * @param {string} message
	 * @param {[number, number] | undefined} position
	 */
	constructor(code, message, position) {
		super(code, message, position);
	}
}

/**
 * @param {null | NodeLike} node
 * @param {string} code
 * @param {string} message
 */
function w(node, code, message) {
	let stack = ignore_stack;

	if (node) {
		stack = ignore_map.get(node) ?? ignore_stack;
	}

	if (stack && stack.at(-1)?.has(code)) return;

	const warning = new InternalCompileWarning(code, message, node && node.start !== undefined ? [node.start, node.end ?? node.start] : undefined);

	if (!warning_filter(warning)) return;

	warnings.push(warning);
}

export const codes = [
	'a11y_accesskey',
	'a11y_aria_activedescendant_has_tabindex',
	'a11y_aria_attributes',
	'a11y_autocomplete_valid',
	'a11y_autofocus',
	'a11y_click_events_have_key_events',
	'a11y_consider_explicit_label',
	'a11y_distracting_elements',
	'a11y_figcaption_index',
	'a11y_figcaption_parent',
	'a11y_hidden',
	'a11y_img_redundant_alt',
	'a11y_incorrect_aria_attribute_type',
	'a11y_incorrect_aria_attribute_type_boolean',
	'a11y_incorrect_aria_attribute_type_id',
	'a11y_incorrect_aria_attribute_type_idlist',
	'a11y_incorrect_aria_attribute_type_integer',
	'a11y_incorrect_aria_attribute_type_token',
	'a11y_incorrect_aria_attribute_type_tokenlist',
	'a11y_incorrect_aria_attribute_type_tristate',
	'a11y_interactive_supports_focus',
	'a11y_invalid_attribute',
	'a11y_label_has_associated_control',
	'a11y_media_has_caption',
	'a11y_misplaced_role',
	'a11y_misplaced_scope',
	'a11y_missing_attribute',
	'a11y_missing_content',
	'a11y_mouse_events_have_key_events',
	'a11y_no_abstract_role',
	'a11y_no_interactive_element_to_noninteractive_role',
	'a11y_no_noninteractive_element_interactions',
	'a11y_no_noninteractive_element_to_interactive_role',
	'a11y_no_noninteractive_tabindex',
	'a11y_no_redundant_roles',
	'a11y_no_static_element_interactions',
	'a11y_positive_tabindex',
	'a11y_role_has_required_aria_props',
	'a11y_role_supports_aria_props',
	'a11y_role_supports_aria_props_implicit',
	'a11y_unknown_aria_attribute',
	'a11y_unknown_role',
	'bidirectional_control_characters',
	'legacy_code',
	'unknown_code',
	'options_deprecated_accessors',
	'options_deprecated_immutable',
	'options_missing_custom_element',
	'options_removed_enable_sourcemap',
	'options_removed_hydratable',
	'options_removed_loop_guard_timeout',
	'options_renamed_ssr_dom',
	'custom_element_props_identifier',
	'export_let_unused',
	'legacy_component_creation',
	'non_reactive_update',
	'perf_avoid_inline_class',
	'perf_avoid_nested_class',
	'reactive_declaration_invalid_placement',
	'reactive_declaration_module_script_dependency',
	'state_referenced_locally',
	'store_rune_conflict',
	'css_unused_selector',
	'attribute_avoid_is',
	'attribute_global_event_reference',
	'attribute_illegal_colon',
	'attribute_invalid_property_name',
	'attribute_quoted',
	'bind_invalid_each_rest',
	'block_empty',
	'component_name_lowercase',
	'element_implicitly_closed',
	'element_invalid_self_closing_tag',
	'event_directive_deprecated',
	'node_invalid_placement_ssr',
	'script_context_deprecated',
	'script_unknown_attribute',
	'slot_element_deprecated',
	'svelte_component_deprecated',
	'svelte_element_invalid_this',
	'svelte_self_deprecated'
];

/**
 * Avoid using accesskey
 * @param {null | NodeLike} node
 */
export function a11y_accesskey(node) {
	w(node, 'a11y_accesskey', `Avoid using accesskey\nhttps://svelte.dev/e/a11y_accesskey`);
}

/**
 * An element with an aria-activedescendant attribute should have a tabindex value
 * @param {null | NodeLike} node
 */
export function a11y_aria_activedescendant_has_tabindex(node) {
	w(node, 'a11y_aria_activedescendant_has_tabindex', `An element with an aria-activedescendant attribute should have a tabindex value\nhttps://svelte.dev/e/a11y_aria_activedescendant_has_tabindex`);
}

/**
 * `<%name%>` should not have aria-* attributes
 * @param {null | NodeLike} node
 * @param {string} name
 */
export function a11y_aria_attributes(node, name) {
	w(node, 'a11y_aria_attributes', `\`<${name}>\` should not have aria-* attributes\nhttps://svelte.dev/e/a11y_aria_attributes`);
}

/**
 * '%value%' is an invalid value for 'autocomplete' on `<input type="%type%">`
 * @param {null | NodeLike} node
 * @param {string} value
 * @param {string} type
 */
export function a11y_autocomplete_valid(node, value, type) {
	w(node, 'a11y_autocomplete_valid', `'${value}' is an invalid value for 'autocomplete' on \`<input type="${type}">\`\nhttps://svelte.dev/e/a11y_autocomplete_valid`);
}

/**
 * Avoid using autofocus
 * @param {null | NodeLike} node
 */
export function a11y_autofocus(node) {
	w(node, 'a11y_autofocus', `Avoid using autofocus\nhttps://svelte.dev/e/a11y_autofocus`);
}

/**
 * Visible, non-interactive elements with a click event must be accompanied by a keyboard event handler. Consider whether an interactive element such as `<button type="button">` or `<a>` might be more appropriate
 * @param {null | NodeLike} node
 */
export function a11y_click_events_have_key_events(node) {
	w(node, 'a11y_click_events_have_key_events', `Visible, non-interactive elements with a click event must be accompanied by a keyboard event handler. Consider whether an interactive element such as \`<button type="button">\` or \`<a>\` might be more appropriate\nhttps://svelte.dev/e/a11y_click_events_have_key_events`);
}

/**
 * Buttons and links should either contain text or have an `aria-label` or `aria-labelledby` attribute
 * @param {null | NodeLike} node
 */
export function a11y_consider_explicit_label(node) {
	w(node, 'a11y_consider_explicit_label', `Buttons and links should either contain text or have an \`aria-label\` or \`aria-labelledby\` attribute\nhttps://svelte.dev/e/a11y_consider_explicit_label`);
}

/**
 * Avoid `<%name%>` elements
 * @param {null | NodeLike} node
 * @param {string} name
 */
export function a11y_distracting_elements(node, name) {
	w(node, 'a11y_distracting_elements', `Avoid \`<${name}>\` elements\nhttps://svelte.dev/e/a11y_distracting_elements`);
}

/**
 * `<figcaption>` must be first or last child of `<figure>`
 * @param {null | NodeLike} node
 */
export function a11y_figcaption_index(node) {
	w(node, 'a11y_figcaption_index', `\`<figcaption>\` must be first or last child of \`<figure>\`\nhttps://svelte.dev/e/a11y_figcaption_index`);
}

/**
 * `<figcaption>` must be an immediate child of `<figure>`
 * @param {null | NodeLike} node
 */
export function a11y_figcaption_parent(node) {
	w(node, 'a11y_figcaption_parent', `\`<figcaption>\` must be an immediate child of \`<figure>\`\nhttps://svelte.dev/e/a11y_figcaption_parent`);
}

/**
 * `<%name%>` element should not be hidden
 * @param {null | NodeLike} node
 * @param {string} name
 */
export function a11y_hidden(node, name) {
	w(node, 'a11y_hidden', `\`<${name}>\` element should not be hidden\nhttps://svelte.dev/e/a11y_hidden`);
}

/**
 * Screenreaders already announce `<img>` elements as an image
 * @param {null | NodeLike} node
 */
export function a11y_img_redundant_alt(node) {
	w(node, 'a11y_img_redundant_alt', `Screenreaders already announce \`<img>\` elements as an image\nhttps://svelte.dev/e/a11y_img_redundant_alt`);
}

/**
 * The value of '%attribute%' must be a %type%
 * @param {null | NodeLike} node
 * @param {string} attribute
 * @param {string} type
 */
export function a11y_incorrect_aria_attribute_type(node, attribute, type) {
	w(node, 'a11y_incorrect_aria_attribute_type', `The value of '${attribute}' must be a ${type}\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type`);
}

/**
 * The value of '%attribute%' must be either 'true' or 'false'. It cannot be empty
 * @param {null | NodeLike} node
 * @param {string} attribute
 */
export function a11y_incorrect_aria_attribute_type_boolean(node, attribute) {
	w(node, 'a11y_incorrect_aria_attribute_type_boolean', `The value of '${attribute}' must be either 'true' or 'false'. It cannot be empty\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type_boolean`);
}

/**
 * The value of '%attribute%' must be a string that represents a DOM element ID
 * @param {null | NodeLike} node
 * @param {string} attribute
 */
export function a11y_incorrect_aria_attribute_type_id(node, attribute) {
	w(node, 'a11y_incorrect_aria_attribute_type_id', `The value of '${attribute}' must be a string that represents a DOM element ID\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type_id`);
}

/**
 * The value of '%attribute%' must be a space-separated list of strings that represent DOM element IDs
 * @param {null | NodeLike} node
 * @param {string} attribute
 */
export function a11y_incorrect_aria_attribute_type_idlist(node, attribute) {
	w(node, 'a11y_incorrect_aria_attribute_type_idlist', `The value of '${attribute}' must be a space-separated list of strings that represent DOM element IDs\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type_idlist`);
}

/**
 * The value of '%attribute%' must be an integer
 * @param {null | NodeLike} node
 * @param {string} attribute
 */
export function a11y_incorrect_aria_attribute_type_integer(node, attribute) {
	w(node, 'a11y_incorrect_aria_attribute_type_integer', `The value of '${attribute}' must be an integer\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type_integer`);
}

/**
 * The value of '%attribute%' must be exactly one of %values%
 * @param {null | NodeLike} node
 * @param {string} attribute
 * @param {string} values
 */
export function a11y_incorrect_aria_attribute_type_token(node, attribute, values) {
	w(node, 'a11y_incorrect_aria_attribute_type_token', `The value of '${attribute}' must be exactly one of ${values}\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type_token`);
}

/**
 * The value of '%attribute%' must be a space-separated list of one or more of %values%
 * @param {null | NodeLike} node
 * @param {string} attribute
 * @param {string} values
 */
export function a11y_incorrect_aria_attribute_type_tokenlist(node, attribute, values) {
	w(node, 'a11y_incorrect_aria_attribute_type_tokenlist', `The value of '${attribute}' must be a space-separated list of one or more of ${values}\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type_tokenlist`);
}

/**
 * The value of '%attribute%' must be exactly one of true, false, or mixed
 * @param {null | NodeLike} node
 * @param {string} attribute
 */
export function a11y_incorrect_aria_attribute_type_tristate(node, attribute) {
	w(node, 'a11y_incorrect_aria_attribute_type_tristate', `The value of '${attribute}' must be exactly one of true, false, or mixed\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type_tristate`);
}

/**
 * Elements with the '%role%' interactive role must have a tabindex value
 * @param {null | NodeLike} node
 * @param {string} role
 */
export function a11y_interactive_supports_focus(node, role) {
	w(node, 'a11y_interactive_supports_focus', `Elements with the '${role}' interactive role must have a tabindex value\nhttps://svelte.dev/e/a11y_interactive_supports_focus`);
}

/**
 * '%href_value%' is not a valid %href_attribute% attribute
 * @param {null | NodeLike} node
 * @param {string} href_value
 * @param {string} href_attribute
 */
export function a11y_invalid_attribute(node, href_value, href_attribute) {
	w(node, 'a11y_invalid_attribute', `'${href_value}' is not a valid ${href_attribute} attribute\nhttps://svelte.dev/e/a11y_invalid_attribute`);
}

/**
 * A form label must be associated with a control
 * @param {null | NodeLike} node
 */
export function a11y_label_has_associated_control(node) {
	w(node, 'a11y_label_has_associated_control', `A form label must be associated with a control\nhttps://svelte.dev/e/a11y_label_has_associated_control`);
}

/**
 * `<video>` elements must have a `<track kind="captions">`
 * @param {null | NodeLike} node
 */
export function a11y_media_has_caption(node) {
	w(node, 'a11y_media_has_caption', `\`<video>\` elements must have a \`<track kind="captions">\`\nhttps://svelte.dev/e/a11y_media_has_caption`);
}

/**
 * `<%name%>` should not have role attribute
 * @param {null | NodeLike} node
 * @param {string} name
 */
export function a11y_misplaced_role(node, name) {
	w(node, 'a11y_misplaced_role', `\`<${name}>\` should not have role attribute\nhttps://svelte.dev/e/a11y_misplaced_role`);
}

/**
 * The scope attribute should only be used with `<th>` elements
 * @param {null | NodeLike} node
 */
export function a11y_misplaced_scope(node) {
	w(node, 'a11y_misplaced_scope', `The scope attribute should only be used with \`<th>\` elements\nhttps://svelte.dev/e/a11y_misplaced_scope`);
}

/**
 * `<%name%>` element should have %article% %sequence% attribute
 * @param {null | NodeLike} node
 * @param {string} name
 * @param {string} article
 * @param {string} sequence
 */
export function a11y_missing_attribute(node, name, article, sequence) {
	w(node, 'a11y_missing_attribute', `\`<${name}>\` element should have ${article} ${sequence} attribute\nhttps://svelte.dev/e/a11y_missing_attribute`);
}

/**
 * `<%name%>` element should contain text
 * @param {null | NodeLike} node
 * @param {string} name
 */
export function a11y_missing_content(node, name) {
	w(node, 'a11y_missing_content', `\`<${name}>\` element should contain text\nhttps://svelte.dev/e/a11y_missing_content`);
}

/**
 * '%event%' event must be accompanied by '%accompanied_by%' event
 * @param {null | NodeLike} node
 * @param {string} event
 * @param {string} accompanied_by
 */
export function a11y_mouse_events_have_key_events(node, event, accompanied_by) {
	w(node, 'a11y_mouse_events_have_key_events', `'${event}' event must be accompanied by '${accompanied_by}' event\nhttps://svelte.dev/e/a11y_mouse_events_have_key_events`);
}

/**
 * Abstract role '%role%' is forbidden
 * @param {null | NodeLike} node
 * @param {string} role
 */
export function a11y_no_abstract_role(node, role) {
	w(node, 'a11y_no_abstract_role', `Abstract role '${role}' is forbidden\nhttps://svelte.dev/e/a11y_no_abstract_role`);
}

/**
 * `<%element%>` cannot have role '%role%'
 * @param {null | NodeLike} node
 * @param {string} element
 * @param {string} role
 */
export function a11y_no_interactive_element_to_noninteractive_role(node, element, role) {
	w(node, 'a11y_no_interactive_element_to_noninteractive_role', `\`<${element}>\` cannot have role '${role}'\nhttps://svelte.dev/e/a11y_no_interactive_element_to_noninteractive_role`);
}

/**
 * Non-interactive element `<%element%>` should not be assigned mouse or keyboard event listeners
 * @param {null | NodeLike} node
 * @param {string} element
 */
export function a11y_no_noninteractive_element_interactions(node, element) {
	w(node, 'a11y_no_noninteractive_element_interactions', `Non-interactive element \`<${element}>\` should not be assigned mouse or keyboard event listeners\nhttps://svelte.dev/e/a11y_no_noninteractive_element_interactions`);
}

/**
 * Non-interactive element `<%element%>` cannot have interactive role '%role%'
 * @param {null | NodeLike} node
 * @param {string} element
 * @param {string} role
 */
export function a11y_no_noninteractive_element_to_interactive_role(node, element, role) {
	w(node, 'a11y_no_noninteractive_element_to_interactive_role', `Non-interactive element \`<${element}>\` cannot have interactive role '${role}'\nhttps://svelte.dev/e/a11y_no_noninteractive_element_to_interactive_role`);
}

/**
 * noninteractive element cannot have nonnegative tabIndex value
 * @param {null | NodeLike} node
 */
export function a11y_no_noninteractive_tabindex(node) {
	w(node, 'a11y_no_noninteractive_tabindex', `noninteractive element cannot have nonnegative tabIndex value\nhttps://svelte.dev/e/a11y_no_noninteractive_tabindex`);
}

/**
 * Redundant role '%role%'
 * @param {null | NodeLike} node
 * @param {string} role
 */
export function a11y_no_redundant_roles(node, role) {
	w(node, 'a11y_no_redundant_roles', `Redundant role '${role}'\nhttps://svelte.dev/e/a11y_no_redundant_roles`);
}

/**
 * `<%element%>` with a %handler% handler must have an ARIA role
 * @param {null | NodeLike} node
 * @param {string} element
 * @param {string} handler
 */
export function a11y_no_static_element_interactions(node, element, handler) {
	w(node, 'a11y_no_static_element_interactions', `\`<${element}>\` with a ${handler} handler must have an ARIA role\nhttps://svelte.dev/e/a11y_no_static_element_interactions`);
}

/**
 * Avoid tabindex values above zero
 * @param {null | NodeLike} node
 */
export function a11y_positive_tabindex(node) {
	w(node, 'a11y_positive_tabindex', `Avoid tabindex values above zero\nhttps://svelte.dev/e/a11y_positive_tabindex`);
}

/**
 * Elements with the ARIA role "%role%" must have the following attributes defined: %props%
 * @param {null | NodeLike} node
 * @param {string} role
 * @param {string} props
 */
export function a11y_role_has_required_aria_props(node, role, props) {
	w(node, 'a11y_role_has_required_aria_props', `Elements with the ARIA role "${role}" must have the following attributes defined: ${props}\nhttps://svelte.dev/e/a11y_role_has_required_aria_props`);
}

/**
 * The attribute '%attribute%' is not supported by the role '%role%'
 * @param {null | NodeLike} node
 * @param {string} attribute
 * @param {string} role
 */
export function a11y_role_supports_aria_props(node, attribute, role) {
	w(node, 'a11y_role_supports_aria_props', `The attribute '${attribute}' is not supported by the role '${role}'\nhttps://svelte.dev/e/a11y_role_supports_aria_props`);
}

/**
 * The attribute '%attribute%' is not supported by the role '%role%'. This role is implicit on the element `<%name%>`
 * @param {null | NodeLike} node
 * @param {string} attribute
 * @param {string} role
 * @param {string} name
 */
export function a11y_role_supports_aria_props_implicit(node, attribute, role, name) {
	w(node, 'a11y_role_supports_aria_props_implicit', `The attribute '${attribute}' is not supported by the role '${role}'. This role is implicit on the element \`<${name}>\`\nhttps://svelte.dev/e/a11y_role_supports_aria_props_implicit`);
}

/**
 * Unknown aria attribute 'aria-%attribute%'. Did you mean '%suggestion%'?
 * @param {null | NodeLike} node
 * @param {string} attribute
 * @param {string | undefined | null} [suggestion]
 */
export function a11y_unknown_aria_attribute(node, attribute, suggestion) {
	w(node, 'a11y_unknown_aria_attribute', `${suggestion
		? `Unknown aria attribute 'aria-${attribute}'. Did you mean '${suggestion}'?`
		: `Unknown aria attribute 'aria-${attribute}'`}\nhttps://svelte.dev/e/a11y_unknown_aria_attribute`);
}

/**
 * Unknown role '%role%'. Did you mean '%suggestion%'?
 * @param {null | NodeLike} node
 * @param {string} role
 * @param {string | undefined | null} [suggestion]
 */
export function a11y_unknown_role(node, role, suggestion) {
	w(node, 'a11y_unknown_role', `${suggestion
		? `Unknown role '${role}'. Did you mean '${suggestion}'?`
		: `Unknown role '${role}'`}\nhttps://svelte.dev/e/a11y_unknown_role`);
}

/**
 * A bidirectional control character was detected in your code. These characters can be used to alter the visual direction of your code and could have unintended consequences
 * @param {null | NodeLike} node
 */
export function bidirectional_control_characters(node) {
	w(node, 'bidirectional_control_characters', `A bidirectional control character was detected in your code. These characters can be used to alter the visual direction of your code and could have unintended consequences\nhttps://svelte.dev/e/bidirectional_control_characters`);
}

/**
 * `%code%` is no longer valid — please use `%suggestion%` instead
 * @param {null | NodeLike} node
 * @param {string} code
 * @param {string} suggestion
 */
export function legacy_code(node, code, suggestion) {
	w(node, 'legacy_code', `\`${code}\` is no longer valid — please use \`${suggestion}\` instead\nhttps://svelte.dev/e/legacy_code`);
}

/**
 * `%code%` is not a recognised code (did you mean `%suggestion%`?)
 * @param {null | NodeLike} node
 * @param {string} code
 * @param {string | undefined | null} [suggestion]
 */
export function unknown_code(node, code, suggestion) {
	w(node, 'unknown_code', `${suggestion
		? `\`${code}\` is not a recognised code (did you mean \`${suggestion}\`?)`
		: `\`${code}\` is not a recognised code`}\nhttps://svelte.dev/e/unknown_code`);
}

/**
 * The `accessors` option has been deprecated. It will have no effect in runes mode
 * @param {null | NodeLike} node
 */
export function options_deprecated_accessors(node) {
	w(node, 'options_deprecated_accessors', `The \`accessors\` option has been deprecated. It will have no effect in runes mode\nhttps://svelte.dev/e/options_deprecated_accessors`);
}

/**
 * The `immutable` option has been deprecated. It will have no effect in runes mode
 * @param {null | NodeLike} node
 */
export function options_deprecated_immutable(node) {
	w(node, 'options_deprecated_immutable', `The \`immutable\` option has been deprecated. It will have no effect in runes mode\nhttps://svelte.dev/e/options_deprecated_immutable`);
}

/**
 * The `customElement` option is used when generating a custom element. Did you forget the `customElement: true` compile option?
 * @param {null | NodeLike} node
 */
export function options_missing_custom_element(node) {
	w(node, 'options_missing_custom_element', `The \`customElement\` option is used when generating a custom element. Did you forget the \`customElement: true\` compile option?\nhttps://svelte.dev/e/options_missing_custom_element`);
}

/**
 * The `enableSourcemap` option has been removed. Source maps are always generated now, and tooling can choose to ignore them
 * @param {null | NodeLike} node
 */
export function options_removed_enable_sourcemap(node) {
	w(node, 'options_removed_enable_sourcemap', `The \`enableSourcemap\` option has been removed. Source maps are always generated now, and tooling can choose to ignore them\nhttps://svelte.dev/e/options_removed_enable_sourcemap`);
}

/**
 * The `hydratable` option has been removed. Svelte components are always hydratable now
 * @param {null | NodeLike} node
 */
export function options_removed_hydratable(node) {
	w(node, 'options_removed_hydratable', `The \`hydratable\` option has been removed. Svelte components are always hydratable now\nhttps://svelte.dev/e/options_removed_hydratable`);
}

/**
 * The `loopGuardTimeout` option has been removed
 * @param {null | NodeLike} node
 */
export function options_removed_loop_guard_timeout(node) {
	w(node, 'options_removed_loop_guard_timeout', `The \`loopGuardTimeout\` option has been removed\nhttps://svelte.dev/e/options_removed_loop_guard_timeout`);
}

/**
 * `generate: "dom"` and `generate: "ssr"` options have been renamed to "client" and "server" respectively
 * @param {null | NodeLike} node
 */
export function options_renamed_ssr_dom(node) {
	w(node, 'options_renamed_ssr_dom', `\`generate: "dom"\` and \`generate: "ssr"\` options have been renamed to "client" and "server" respectively\nhttps://svelte.dev/e/options_renamed_ssr_dom`);
}

/**
 * Using a rest element or a non-destructured declaration with `$props()` means that Svelte can't infer what properties to expose when creating a custom element. Consider destructuring all the props or explicitly specifying the `customElement.props` option.
 * @param {null | NodeLike} node
 */
export function custom_element_props_identifier(node) {
	w(node, 'custom_element_props_identifier', `Using a rest element or a non-destructured declaration with \`$props()\` means that Svelte can't infer what properties to expose when creating a custom element. Consider destructuring all the props or explicitly specifying the \`customElement.props\` option.\nhttps://svelte.dev/e/custom_element_props_identifier`);
}

/**
 * Component has unused export property '%name%'. If it is for external reference only, please consider using `export const %name%`
 * @param {null | NodeLike} node
 * @param {string} name
 */
export function export_let_unused(node, name) {
	w(node, 'export_let_unused', `Component has unused export property '${name}'. If it is for external reference only, please consider using \`export const ${name}\`\nhttps://svelte.dev/e/export_let_unused`);
}

/**
 * Svelte 5 components are no longer classes. Instantiate them using `mount` or `hydrate` (imported from 'svelte') instead.
 * @param {null | NodeLike} node
 */
export function legacy_component_creation(node) {
	w(node, 'legacy_component_creation', `Svelte 5 components are no longer classes. Instantiate them using \`mount\` or \`hydrate\` (imported from 'svelte') instead.\nhttps://svelte.dev/e/legacy_component_creation`);
}

/**
 * `%name%` is updated, but is not declared with `$state(...)`. Changing its value will not correctly trigger updates
 * @param {null | NodeLike} node
 * @param {string} name
 */
export function non_reactive_update(node, name) {
	w(node, 'non_reactive_update', `\`${name}\` is updated, but is not declared with \`$state(...)\`. Changing its value will not correctly trigger updates\nhttps://svelte.dev/e/non_reactive_update`);
}

/**
 * Avoid 'new class' — instead, declare the class at the top level scope
 * @param {null | NodeLike} node
 */
export function perf_avoid_inline_class(node) {
	w(node, 'perf_avoid_inline_class', `Avoid 'new class' — instead, declare the class at the top level scope\nhttps://svelte.dev/e/perf_avoid_inline_class`);
}

/**
 * Avoid declaring classes below the top level scope
 * @param {null | NodeLike} node
 */
export function perf_avoid_nested_class(node) {
	w(node, 'perf_avoid_nested_class', `Avoid declaring classes below the top level scope\nhttps://svelte.dev/e/perf_avoid_nested_class`);
}

/**
 * Reactive declarations only exist at the top level of the instance script
 * @param {null | NodeLike} node
 */
export function reactive_declaration_invalid_placement(node) {
	w(node, 'reactive_declaration_invalid_placement', `Reactive declarations only exist at the top level of the instance script\nhttps://svelte.dev/e/reactive_declaration_invalid_placement`);
}

/**
 * Reassignments of module-level declarations will not cause reactive statements to update
 * @param {null | NodeLike} node
 */
export function reactive_declaration_module_script_dependency(node) {
	w(node, 'reactive_declaration_module_script_dependency', `Reassignments of module-level declarations will not cause reactive statements to update\nhttps://svelte.dev/e/reactive_declaration_module_script_dependency`);
}

/**
 * This reference only captures the initial value of `%name%`. Did you mean to reference it inside a %type% instead?
 * @param {null | NodeLike} node
 * @param {string} name
 * @param {string} type
 */
export function state_referenced_locally(node, name, type) {
	w(node, 'state_referenced_locally', `This reference only captures the initial value of \`${name}\`. Did you mean to reference it inside a ${type} instead?\nhttps://svelte.dev/e/state_referenced_locally`);
}

/**
 * It looks like you're using the `$%name%` rune, but there is a local binding called `%name%`. Referencing a local variable with a `$` prefix will create a store subscription. Please rename `%name%` to avoid the ambiguity
 * @param {null | NodeLike} node
 * @param {string} name
 */
export function store_rune_conflict(node, name) {
	w(node, 'store_rune_conflict', `It looks like you're using the \`$${name}\` rune, but there is a local binding called \`${name}\`. Referencing a local variable with a \`$\` prefix will create a store subscription. Please rename \`${name}\` to avoid the ambiguity\nhttps://svelte.dev/e/store_rune_conflict`);
}

/**
 * Unused CSS selector "%name%"
 * @param {null | NodeLike} node
 * @param {string} name
 */
export function css_unused_selector(node, name) {
	w(node, 'css_unused_selector', `Unused CSS selector "${name}"\nhttps://svelte.dev/e/css_unused_selector`);
}

/**
 * The "is" attribute is not supported cross-browser and should be avoided
 * @param {null | NodeLike} node
 */
export function attribute_avoid_is(node) {
	w(node, 'attribute_avoid_is', `The "is" attribute is not supported cross-browser and should be avoided\nhttps://svelte.dev/e/attribute_avoid_is`);
}

/**
 * You are referencing `globalThis.%name%`. Did you forget to declare a variable with that name?
 * @param {null | NodeLike} node
 * @param {string} name
 */
export function attribute_global_event_reference(node, name) {
	w(node, 'attribute_global_event_reference', `You are referencing \`globalThis.${name}\`. Did you forget to declare a variable with that name?\nhttps://svelte.dev/e/attribute_global_event_reference`);
}

/**
 * Attributes should not contain ':' characters to prevent ambiguity with Svelte directives
 * @param {null | NodeLike} node
 */
export function attribute_illegal_colon(node) {
	w(node, 'attribute_illegal_colon', `Attributes should not contain ':' characters to prevent ambiguity with Svelte directives\nhttps://svelte.dev/e/attribute_illegal_colon`);
}

/**
 * '%wrong%' is not a valid HTML attribute. Did you mean '%right%'?
 * @param {null | NodeLike} node
 * @param {string} wrong
 * @param {string} right
 */
export function attribute_invalid_property_name(node, wrong, right) {
	w(node, 'attribute_invalid_property_name', `'${wrong}' is not a valid HTML attribute. Did you mean '${right}'?\nhttps://svelte.dev/e/attribute_invalid_property_name`);
}

/**
 * Quoted attributes on components and custom elements will be stringified in a future version of Svelte. If this isn't what you want, remove the quotes
 * @param {null | NodeLike} node
 */
export function attribute_quoted(node) {
	w(node, 'attribute_quoted', `Quoted attributes on components and custom elements will be stringified in a future version of Svelte. If this isn't what you want, remove the quotes\nhttps://svelte.dev/e/attribute_quoted`);
}

/**
 * The rest operator (...) will create a new object and binding '%name%' with the original object will not work
 * @param {null | NodeLike} node
 * @param {string} name
 */
export function bind_invalid_each_rest(node, name) {
	w(node, 'bind_invalid_each_rest', `The rest operator (...) will create a new object and binding '${name}' with the original object will not work\nhttps://svelte.dev/e/bind_invalid_each_rest`);
}

/**
 * Empty block
 * @param {null | NodeLike} node
 */
export function block_empty(node) {
	w(node, 'block_empty', `Empty block\nhttps://svelte.dev/e/block_empty`);
}

/**
 * `<%name%>` will be treated as an HTML element unless it begins with a capital letter
 * @param {null | NodeLike} node
 * @param {string} name
 */
export function component_name_lowercase(node, name) {
	w(node, 'component_name_lowercase', `\`<${name}>\` will be treated as an HTML element unless it begins with a capital letter\nhttps://svelte.dev/e/component_name_lowercase`);
}

/**
 * This element is implicitly closed by the following `%tag%`, which can cause an unexpected DOM structure. Add an explicit `%closing%` to avoid surprises.
 * @param {null | NodeLike} node
 * @param {string} tag
 * @param {string} closing
 */
export function element_implicitly_closed(node, tag, closing) {
	w(node, 'element_implicitly_closed', `This element is implicitly closed by the following \`${tag}\`, which can cause an unexpected DOM structure. Add an explicit \`${closing}\` to avoid surprises.\nhttps://svelte.dev/e/element_implicitly_closed`);
}

/**
 * Self-closing HTML tags for non-void elements are ambiguous — use `<%name% ...></%name%>` rather than `<%name% ... />`
 * @param {null | NodeLike} node
 * @param {string} name
 */
export function element_invalid_self_closing_tag(node, name) {
	w(node, 'element_invalid_self_closing_tag', `Self-closing HTML tags for non-void elements are ambiguous — use \`<${name} ...></${name}>\` rather than \`<${name} ... />\`\nhttps://svelte.dev/e/element_invalid_self_closing_tag`);
}

/**
 * Using `on:%name%` to listen to the %name% event is deprecated. Use the event attribute `on%name%` instead
 * @param {null | NodeLike} node
 * @param {string} name
 */
export function event_directive_deprecated(node, name) {
	w(node, 'event_directive_deprecated', `Using \`on:${name}\` to listen to the ${name} event is deprecated. Use the event attribute \`on${name}\` instead\nhttps://svelte.dev/e/event_directive_deprecated`);
}

/**
 * %message%. When rendering this component on the server, the resulting HTML will be modified by the browser (by moving, removing, or inserting elements), likely resulting in a `hydration_mismatch` warning
 * @param {null | NodeLike} node
 * @param {string} message
 */
export function node_invalid_placement_ssr(node, message) {
	w(node, 'node_invalid_placement_ssr', `${message}. When rendering this component on the server, the resulting HTML will be modified by the browser (by moving, removing, or inserting elements), likely resulting in a \`hydration_mismatch\` warning\nhttps://svelte.dev/e/node_invalid_placement_ssr`);
}

/**
 * `context="module"` is deprecated, use the `module` attribute instead
 * @param {null | NodeLike} node
 */
export function script_context_deprecated(node) {
	w(node, 'script_context_deprecated', `\`context="module"\` is deprecated, use the \`module\` attribute instead\nhttps://svelte.dev/e/script_context_deprecated`);
}

/**
 * Unrecognized attribute — should be one of `generics`, `lang` or `module`. If this exists for a preprocessor, ensure that the preprocessor removes it
 * @param {null | NodeLike} node
 */
export function script_unknown_attribute(node) {
	w(node, 'script_unknown_attribute', `Unrecognized attribute — should be one of \`generics\`, \`lang\` or \`module\`. If this exists for a preprocessor, ensure that the preprocessor removes it\nhttps://svelte.dev/e/script_unknown_attribute`);
}

/**
 * Using `<slot>` to render parent content is deprecated. Use `{@render ...}` tags instead
 * @param {null | NodeLike} node
 */
export function slot_element_deprecated(node) {
	w(node, 'slot_element_deprecated', `Using \`<slot>\` to render parent content is deprecated. Use \`{@render ...}\` tags instead\nhttps://svelte.dev/e/slot_element_deprecated`);
}

/**
 * `<svelte:component>` is deprecated in runes mode — components are dynamic by default
 * @param {null | NodeLike} node
 */
export function svelte_component_deprecated(node) {
	w(node, 'svelte_component_deprecated', `\`<svelte:component>\` is deprecated in runes mode — components are dynamic by default\nhttps://svelte.dev/e/svelte_component_deprecated`);
}

/**
 * `this` should be an `{expression}`. Using a string attribute value will cause an error in future versions of Svelte
 * @param {null | NodeLike} node
 */
export function svelte_element_invalid_this(node) {
	w(node, 'svelte_element_invalid_this', `\`this\` should be an \`{expression}\`. Using a string attribute value will cause an error in future versions of Svelte\nhttps://svelte.dev/e/svelte_element_invalid_this`);
}

/**
 * `<svelte:self>` is deprecated — use self-imports (e.g. `import %name% from './%basename%'`) instead
 * @param {null | NodeLike} node
 * @param {string} name
 * @param {string} basename
 */
export function svelte_self_deprecated(node, name, basename) {
	w(node, 'svelte_self_deprecated', `\`<svelte:self>\` is deprecated — use self-imports (e.g. \`import ${name} from './${basename}'\`) instead\nhttps://svelte.dev/e/svelte_self_deprecated`);
}