// All compiler warnings should be listed and accessed from here

/**
 * @internal
 */
export default {
	custom_element_no_tag: {
		code: 'custom-element-no-tag',
		message: 'No custom element \'tag\' option was specified. To automatically register a custom element, specify a name with a hyphen in it, e.g. <svelte:options tag="my-thing"/>. To hide this warning, use <svelte:options tag={null}/>'			
	},
	unused_export_let: (component: string, property: string) => ({
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
	module_script_variable_reactive_declaration: (names: string[]) => ({
		code: 'module-script-reactive-declaration',
		message: `${names.map(name => `"${name}"`).join(', ')} ${names.length > 1 ? 'are' : 'is'} declared in a module script and will not be reactive`
	}),
	missing_declaration: (name: string, has_script: boolean) => ({
		code: 'missing-declaration',
		message: `'${name}' is not defined` + (has_script ? '' : `. Consider adding a <script> block with 'export let ${name}' to declare a prop`)
	}),
	missing_custom_element_compile_options: {
		code: 'missing-custom-element-compile-options',
		message: "The 'tag' option is used when generating a custom element. Did you forget the 'customElement: true' compile option?"
	},
	css_unused_selector: (selector: string) => ({
		code: 'css-unused-selector',
		message: `Unused CSS selector "${selector}"`
	}),
	empty_block: {
		code: 'empty-block',
		message: 'Empty block'
	},
	reactive_component: (name: string) => ({
		code: 'reactive-component',
		message: `<${name}/> will not be reactive if ${name} changes. Use <svelte:component this={${name}}/> if you want this reactivity.`
	}),
	component_name_lowercase: (name: string) => ({
		code: 'component-name-lowercase',
		message: `<${name}> will be treated as an HTML element unless it begins with a capital letter`
	}),
	avoid_is: {
		code: 'avoid-is',
		message: 'The \'is\' attribute is not supported cross-browser and should be avoided'
	},
	invalid_html_attribute: (name: string, suggestion: string) => ({
		code: 'invalid-html-attribute',
		message: `'${name}' is not a valid HTML attribute. Did you mean '${suggestion}'?`
	}),
	a11y_aria_attributes: (name: string) => ({
		code: 'a11y-aria-attributes',
		message: `A11y: <${name}> should not have aria-* attributes`
	}),
	a11y_unknown_aria_attribute: (attribute: string, suggestion?: string) => ({
		code: 'a11y-unknown-aria-attribute',
		message: `A11y: Unknown aria attribute 'aria-${attribute}'` + (suggestion ? ` (did you mean '${suggestion}'?)` : '')
	}),
	a11y_hidden: (name: string) => ({
		code: 'a11y-hidden',
		message: `A11y: <${name}> element should not be hidden`
	}),
	a11y_misplaced_role: (name: string) => ({
		code: 'a11y-misplaced-role',
		message: `A11y: <${name}> should not have role attribute`
	}),
	a11y_unknown_role: (role: string | boolean, suggestion?: string) => ({
		code: 'a11y-unknown-role',
		message: `A11y: Unknown role '${role}'` + (suggestion ? ` (did you mean '${suggestion}'?)` : '')
	}),
	a11y_no_redundant_roles: (role: string | boolean) => ({
		code: 'a11y-no-redundant-roles',
		message: `A11y: Redundant role '${role}'`
	}),
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
	a11y_invalid_attribute: (href_attribute: string, href_value: string) => ({
		code: 'a11y-invalid-attribute',
		message: `A11y: '${href_value}' is not a valid ${href_attribute} attribute`
	}),
	a11y_missing_attribute: (name: string, article: string, sequence: string) => ({
		code: 'a11y-missing-attribute',
		message: `A11y: <${name}> element should have ${article} ${sequence} attribute`
	}),
	a11y_img_redundant_alt: {
		code: 'a11y-img-redundant-alt',
		message: 'A11y: Screenreaders already announce <img> elements as an image.'
	},
	a11y_label_has_associated_control: {
		code: 'a11y-label-has-associated-control',
		message: 'A11y: A form label must be associated with a control.'
	},
	a11y_media_has_caption: {
		code: 'a11y-media-has-caption',
		message: 'A11y: <video> elements must have a <track kind="captions">'
	},
	a11y_distracting_elements: (name: string) => ({
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
	a11y_mouse_events_have_key_events: (event: string, accompanied_by: string) => ({
		code: 'a11y-mouse-events-have-key-events',
		message: `A11y: on:${event} must be accompanied by on:${accompanied_by}`
	}),
	a11y_missing_content: (name: string) => ({
		code: 'a11y-missing-content',
		message: `A11y: <${name}> element should have child content`
	}),
	redundant_event_modifier_for_touch: {
		code: 'redundant-event-modifier',
		message: 'Touch event handlers that don\'t use the \'event\' object are passive by default'
	},
	redundant_event_modifier_passive: {
		code: 'redundant-event-modifier',
		message: 'The passive modifier only works with wheel and touch events'
	}
};
