/**
 * @internal
 */
export default {
	tag_option_deprecated: {
		code: 'tag-option-deprecated',
		message: "'tag' option is deprecated — use 'customElement' instead"
	},
	unused_export_let: /**
	 * @param {string} component
	 * @param {string} property
	 */ (component, property) => ({
		code: 'unused-export-let',
		message: `${component} has unused export property '${property}'. If it is for external reference only, please consider using \`export const ${property}\``
	}),
	module_script_reactive_declaration: {
		code: 'module-script-reactive-declaration',
		message: '$: has no effect in a module script'
	},
	non_top_level_reactive_declaration: {
		code: 'non-top-level-reactive-declaration',
		message: '$: has no effect outside of the top-level'
	},
	module_script_variable_reactive_declaration: /** @param {string[]} names */ (names) => ({
		code: 'module-script-reactive-declaration',
		message: `${names.map((name) => `"${name}"`).join(', ')} ${
			names.length > 1 ? 'are' : 'is'
		} declared in a module script and will not be reactive`
	}),
	missing_declaration: /**
	 * @param {string} name
	 * @param {boolean} has_script
	 */ (name, has_script) => ({
		code: 'missing-declaration',
		message:
			`'${name}' is not defined` +
			(has_script
				? ''
				: `. Consider adding a <script> block with 'export let ${name}' to declare a prop`)
	}),
	missing_custom_element_compile_options: {
		code: 'missing-custom-element-compile-options',
		message:
			"The 'customElement' option is used when generating a custom element. Did you forget the 'customElement: true' compile option?"
	},
	css_unused_selector: /** @param {string} selector */ (selector) => ({
		code: 'css-unused-selector',
		message: `Unused CSS selector "${selector}"`
	}),
	empty_block: {
		code: 'empty-block',
		message: 'Empty block'
	},
	reactive_component: /** @param {string} name */ (name) => ({
		code: 'reactive-component',
		message: `<${name}/> will not be reactive if ${name} changes. Use <svelte:component this={${name}}/> if you want this reactivity.`
	}),
	component_name_lowercase: /** @param {string} name */ (name) => ({
		code: 'component-name-lowercase',
		message: `<${name}> will be treated as an HTML element unless it begins with a capital letter`
	}),
	avoid_is: {
		code: 'avoid-is',
		message: "The 'is' attribute is not supported cross-browser and should be avoided"
	},
	invalid_html_attribute: /**
	 * @param {string} name
	 * @param {string} suggestion
	 */ (name, suggestion) => ({
		code: 'invalid-html-attribute',
		message: `'${name}' is not a valid HTML attribute. Did you mean '${suggestion}'?`
	}),
	a11y_aria_attributes: /** @param {string} name */ (name) => ({
		code: 'a11y-aria-attributes',
		message: `A11y: <${name}> should not have aria-* attributes`
	}),
	a11y_incorrect_attribute_type: /**
	 * @param {import('aria-query').ARIAPropertyDefinition} schema
	 * @param {string} attribute
	 */ (schema, attribute) => {
		let message;
		switch (schema.type) {
			case 'boolean':
				message = `The value of '${attribute}' must be exactly one of true or false`;
				break;
			case 'id':
				message = `The value of '${attribute}' must be a string that represents a DOM element ID`;
				break;
			case 'idlist':
				message = `The value of '${attribute}' must be a space-separated list of strings that represent DOM element IDs`;
				break;
			case 'tristate':
				message = `The value of '${attribute}' must be exactly one of true, false, or mixed`;
				break;
			case 'token':
				message = `The value of '${attribute}' must be exactly one of ${(schema.values || []).join(
					', '
				)}`;
				break;
			case 'tokenlist':
				message = `The value of '${attribute}' must be a space-separated list of one or more of ${(
					schema.values || []
				).join(', ')}`;
				break;
			default:
				message = `The value of '${attribute}' must be of type ${schema.type}`;
		}
		return {
			code: 'a11y-incorrect-aria-attribute-type',
			message: `A11y: ${message}`
		};
	},
	a11y_unknown_aria_attribute: /**
	 * @param {string} attribute
	 * @param {string} [suggestion]
	 */ (attribute, suggestion) => ({
		code: 'a11y-unknown-aria-attribute',
		message:
			`A11y: Unknown aria attribute 'aria-${attribute}'` +
			(suggestion ? ` (did you mean '${suggestion}'?)` : '')
	}),
	a11y_hidden: /** @param {string} name */ (name) => ({
		code: 'a11y-hidden',
		message: `A11y: <${name}> element should not be hidden`
	}),
	a11y_misplaced_role: /** @param {string} name */ (name) => ({
		code: 'a11y-misplaced-role',
		message: `A11y: <${name}> should not have role attribute`
	}),
	a11y_unknown_role: /**
	 * @param {string | boolean} role
	 * @param {string} [suggestion]
	 */ (role, suggestion) => ({
		code: 'a11y-unknown-role',
		message: `A11y: Unknown role '${role}'` + (suggestion ? ` (did you mean '${suggestion}'?)` : '')
	}),
	a11y_no_abstract_role: /** @param {string | boolean} role */ (role) => ({
		code: 'a11y-no-abstract-role',
		message: `A11y: Abstract role '${role}' is forbidden`
	}),
	a11y_no_redundant_roles: /** @param {string | boolean} role */ (role) => ({
		code: 'a11y-no-redundant-roles',
		message: `A11y: Redundant role '${role}'`
	}),
	a11y_no_static_element_interactions: /**
	 * @param {string} element
	 * @param {string[]} handlers
	 */ (element, handlers) => ({
		code: 'a11y-no-static-element-interactions',
		message: `A11y: <${element}> with ${handlers.join(', ')} ${
			handlers.length === 1 ? 'handler' : 'handlers'
		} must have an ARIA role`
	}),
	a11y_no_interactive_element_to_noninteractive_role: /**
	 * @param {string | boolean} role
	 * @param {string} element
	 */ (role, element) => ({
		code: 'a11y-no-interactive-element-to-noninteractive-role',
		message: `A11y: <${element}> cannot have role '${role}'`
	}),
	a11y_no_noninteractive_element_interactions: /** @param {string} element */ (element) => ({
		code: 'a11y-no-noninteractive-element-interactions',
		message: `A11y: Non-interactive element <${element}> should not be assigned mouse or keyboard event listeners.`
	}),
	a11y_no_noninteractive_element_to_interactive_role: /**
	 * @param {string | boolean} role
	 * @param {string} element
	 */ (role, element) => ({
		code: 'a11y-no-noninteractive-element-to-interactive-role',
		message: `A11y: Non-interactive element <${element}> cannot have interactive role '${role}'`
	}),
	a11y_role_has_required_aria_props: /**
	 * @param {string} role
	 * @param {string[]} props
	 */ (role, props) => ({
		code: 'a11y-role-has-required-aria-props',
		message: `A11y: Elements with the ARIA role "${role}" must have the following attributes defined: ${props
			.map((name) => `"${name}"`)
			.join(', ')}`
	}),
	a11y_role_supports_aria_props: /**
	 * @param {string} attribute
	 * @param {string} role
	 * @param {boolean} is_implicit
	 * @param {string} name
	 */ (attribute, role, is_implicit, name) => {
		let message = `The attribute '${attribute}' is not supported by the role '${role}'.`;
		if (is_implicit) {
			message += ` This role is implicit on the element <${name}>.`;
		}
		return {
			code: 'a11y-role-supports-aria-props',
			message: `A11y: ${message}`
		};
	},
	a11y_accesskey: {
		code: 'a11y-accesskey',
		message: 'A11y: Avoid using accesskey'
	},
	a11y_autofocus: {
		code: 'a11y-autofocus',
		message: 'A11y: Avoid using autofocus'
	},
	a11y_misplaced_scope: {
		code: 'a11y-misplaced-scope',
		message: 'A11y: The scope attribute should only be used with <th> elements'
	},
	a11y_positive_tabindex: {
		code: 'a11y-positive-tabindex',
		message: 'A11y: avoid tabindex values above zero'
	},
	a11y_invalid_attribute: /**
	 * @param {string} href_attribute
	 * @param {string} href_value
	 */ (href_attribute, href_value) => ({
		code: 'a11y-invalid-attribute',
		message: `A11y: '${href_value}' is not a valid ${href_attribute} attribute`
	}),
	a11y_missing_attribute: /**
	 * @param {string} name
	 * @param {string} article
	 * @param {string} sequence
	 */ (name, article, sequence) => ({
		code: 'a11y-missing-attribute',
		message: `A11y: <${name}> element should have ${article} ${sequence} attribute`
	}),
	a11y_autocomplete_valid: /**
	 * @param {null | true | string} type
	 * @param {null | true | string} value
	 */ (type, value) => ({
		code: 'a11y-autocomplete-valid',
		message: `A11y: The value '${value}' is not supported by the attribute 'autocomplete' on element <input type="${
			type || '...'
		}">`
	}),
	a11y_img_redundant_alt: {
		code: 'a11y-img-redundant-alt',
		message: 'A11y: Screenreaders already announce <img> elements as an image.'
	},
	a11y_interactive_supports_focus: /** @param {string} role */ (role) => ({
		code: 'a11y-interactive-supports-focus',
		message: `A11y: Elements with the '${role}' interactive role must have a tabindex value.`
	}),
	a11y_label_has_associated_control: {
		code: 'a11y-label-has-associated-control',
		message: 'A11y: A form label must be associated with a control.'
	},
	a11y_media_has_caption: {
		code: 'a11y-media-has-caption',
		message: 'A11y: <video> elements must have a <track kind="captions">'
	},
	a11y_distracting_elements: /** @param {string} name */ (name) => ({
		code: 'a11y-distracting-elements',
		message: `A11y: Avoid <${name}> elements`
	}),
	a11y_structure_immediate: {
		code: 'a11y-structure',
		message: 'A11y: <figcaption> must be an immediate child of <figure>'
	},
	a11y_structure_first_or_last: {
		code: 'a11y-structure',
		message: 'A11y: <figcaption> must be first or last child of <figure>'
	},
	a11y_mouse_events_have_key_events: /**
	 * @param {string} event
	 * @param {string} accompanied_by
	 */ (event, accompanied_by) => ({
		code: 'a11y-mouse-events-have-key-events',
		message: `A11y: on:${event} must be accompanied by on:${accompanied_by}`
	}),
	a11y_click_events_have_key_events: {
		code: 'a11y-click-events-have-key-events',
		message:
			'A11y: visible, non-interactive elements with an on:click event must be accompanied by a keyboard event handler. Consider whether an interactive element such as <button type="button"> or <a> might be more appropriate. See https://svelte.dev/docs/accessibility-warnings#a11y-click-events-have-key-events for more details.'
	},
	a11y_missing_content: /** @param {string} name */ (name) => ({
		code: 'a11y-missing-content',
		message: `A11y: <${name}> element should have child content`
	}),
	a11y_no_noninteractive_tabindex: {
		code: 'a11y-no-noninteractive-tabindex',
		message: 'A11y: noninteractive element cannot have nonnegative tabIndex value'
	},
	a11y_aria_activedescendant_has_tabindex: {
		code: 'a11y-aria-activedescendant-has-tabindex',
		message: 'A11y: Elements with attribute aria-activedescendant should have tabindex value'
	},
	redundant_event_modifier_for_touch: {
		code: 'redundant-event-modifier',
		message: "Touch event handlers that don't use the 'event' object are passive by default"
	},
	redundant_event_modifier_passive: {
		code: 'redundant-event-modifier',
		message: 'The passive modifier only works with wheel and touch events'
	},
	invalid_rest_eachblock_binding: /** @param {string} rest_element_name */ (rest_element_name) => ({
		code: 'invalid-rest-eachblock-binding',
		message: `The rest operator (...) will create a new object and binding '${rest_element_name}' with the original object will not work`
	}),
	avoid_mouse_events_on_document: {
		code: 'avoid-mouse-events-on-document',
		message:
			'Mouse enter/leave events on the document are not supported in all browsers and should be avoided'
	},
	illegal_attribute_character: {
		code: 'illegal-attribute-character',
		message:
			"Attributes should not contain ':' characters to prevent ambiguity with Svelte directives"
	}
};
