// All compiler errors should be listed and accessed from here

/**
 * @internal
 */
export default {
	invalid_binding_elements: (element: string, binding: string) => ({
		code: 'invalid-binding',
		message: `'${binding}' is not a valid binding on <${element}> elements`
	}),
	invalid_binding_element_with: (elements: string, binding: string) => ({
		code: 'invalid-binding',
		message: `'${binding}' binding can only be used with ${elements}`
	}),
	invalid_binding_on: (binding: string, element: string, post?: string) => ({
		code: 'invalid-binding',
		message: `'${binding}' is not a valid binding on ${element}` + (post || '')
	}),
	invalid_binding_foreign: (binding: string) => ({
		code: 'invalid-binding',
		message: `'${binding}' is not a valid binding. Foreign elements only support bind:this`
	}),
	invalid_binding_no_checkbox: (binding: string, is_radio: boolean) => ({
		code: 'invalid-binding',
		message: `'${binding}' binding can only be used with <input type="checkbox">` + (is_radio ? ' — for <input type="radio">, use \'group\' binding' : '')
	}),
	invalid_binding: (binding: string) => ({
		code: 'invalid-binding',
		message: `'${binding}' is not a valid binding`
	}),
	invalid_binding_window: (parts: string[]) => ({
		code: 'invalid-binding',
		message: `Bindings on <svelte:window> must be to top-level properties, e.g. '${parts[parts.length - 1]}' rather than '${parts.join('.')}'`
	}),
	invalid_binding_let: {
		code: 'invalid-binding',
		message: 'Cannot bind to a variable declared with the let: directive'
	},
	invalid_binding_await: {
		code: 'invalid-binding',
		message: 'Cannot bind to a variable declared with {#await ... then} or {:catch} blocks'
	},
	invalid_binding_const: {
		code: 'invalid-binding',
		message: 'Cannot bind to a variable declared with {@const ...}'
	},
	invalid_binding_writable: {
		code: 'invalid-binding',
		message: 'Cannot bind to a variable which is not writable'
	},
	binding_undeclared: (name: string) => ({
		code: 'binding-undeclared',
		message: `${name} is not declared`
	}),
	invalid_type: {
		code: 'invalid-type',
		message: '\'type\' attribute cannot be dynamic if input uses two-way binding'
	},
	missing_type: {
		code: 'missing-type',
		message: '\'type\' attribute must be specified'
	},
	dynamic_multiple_attribute: {
		code: 'dynamic-multiple-attribute',
		message: '\'multiple\' attribute cannot be dynamic if select uses two-way binding'
	},
	missing_contenteditable_attribute: {
		code: 'missing-contenteditable-attribute',
		message: '\'contenteditable\' attribute is required for textContent and innerHTML two-way bindings'
	},
	dynamic_contenteditable_attribute: {
		code: 'dynamic-contenteditable-attribute',
		message: '\'contenteditable\' attribute cannot be dynamic if element uses two-way binding'
	},
	invalid_event_modifier_combination: (modifier1: string, modifier2: string) => ({
		code: 'invalid-event-modifier',
		message: `The '${modifier1}' and '${modifier2}' modifiers cannot be used together`
	}),
	invalid_event_modifier_legacy: (modifier: string) => ({
		code: 'invalid-event-modifier',
		message: `The '${modifier}' modifier cannot be used in legacy mode`
	}),
	invalid_event_modifier: (valid: string) => ({
		code: 'invalid-event-modifier',
		message: `Valid event modifiers are ${valid}`
	}),
	invalid_event_modifier_component: {
		code: 'invalid-event-modifier',
		message: "Event modifiers other than 'once' can only be used on DOM elements"
	},
	textarea_duplicate_value: {
		code: 'textarea-duplicate-value',
		message: 'A <textarea> can have either a value attribute or (equivalently) child content, but not both'
	},
	illegal_attribute: (name: string) => ({
		code: 'illegal-attribute',
		message: `'${name}' is not a valid attribute name`
	}),
	invalid_slot_attribute: {
		code: 'invalid-slot-attribute',
		message: 'slot attribute cannot have a dynamic value'
	},
	duplicate_slot_attribute: (name: string) => ({
		code: 'duplicate-slot-attribute',
		message: `Duplicate '${name}' slot`
	}),
	invalid_slotted_content: {
		code: 'invalid-slotted-content',
		message: 'Element with a slot=\'...\' attribute must be a child of a component or a descendant of a custom element'
	},
	invalid_attribute_head: {
		code: 'invalid-attribute',
		message: '<svelte:head> should not have any attributes or directives'
	},
	invalid_action: {
		code: 'invalid-action',
		message: 'Actions can only be applied to DOM elements, not components'
	},
	invalid_class: {
		code: 'invalid-class',
		message: 'Classes can only be applied to DOM elements, not components'
	},
	invalid_transition: {
		code: 'invalid-transition',
		message: 'Transitions can only be applied to DOM elements, not components'
	},
	invalid_let: {
		code: 'invalid-let',
		message: 'let directive value must be an identifier or an object/array pattern'
	},
	invalid_slot_directive: {
		code: 'invalid-slot-directive',
		message: '<slot> cannot have directives'
	},
	dynamic_slot_name: {
		code: 'dynamic-slot-name',
		message: '<slot> name cannot be dynamic'
	},
	invalid_slot_name: {
		code: 'invalid-slot-name',
		message: 'default is a reserved word — it cannot be used as a slot name'
	},
	invalid_slot_attribute_value_missing: {
		code: 'invalid-slot-attribute',
		message: 'slot attribute value is missing'
	},
	invalid_slotted_content_fragment: {
		code: 'invalid-slotted-content',
		message: '<svelte:fragment> must be a child of a component'
	},
	illegal_attribute_title: {
		code: 'illegal-attribute',
		message: '<title> cannot have attributes'
	},
	illegal_structure_title: {
		code: 'illegal-structure',
		message: '<title> can only contain text and {tags}'
	},
	duplicate_transition: (directive: string, parent_directive: string) => {
		function describe(_directive: string) {
			return _directive === 'transition'
				? "a 'transition'"
				: `an '${_directive}'`;
		}
		const message = directive === parent_directive
			? `An element can only have one '${directive}' directive`
			: `An element cannot have both ${describe(parent_directive)} directive and ${describe(directive)} directive`;
		return {
			code: 'duplicate-transition',
			message
		};
	},
	contextual_store: {
		code: 'contextual-store',
		message: 'Stores must be declared at the top level of the component (this may change in a future version of Svelte)'
	},
	default_export: {
		code: 'default-export',
		message: 'A component cannot have a default export'
	},
	illegal_declaration: {
		code: 'illegal-declaration',
		message: 'The $ prefix is reserved, and cannot be used for variable and import names'
	},
	illegal_subscription: {
		code: 'illegal-subscription',
		message: 'Cannot reference store value inside <script context="module">'
	},
	illegal_global: (name: string) => ({
		code: 'illegal-global',
		message: `${name} is an illegal variable name`
	}),
	illegal_variable_declaration: {
		code: 'illegal-variable-declaration',
		message: 'Cannot declare same variable name which is imported inside <script context="module">'
	},
	cyclical_reactive_declaration: (cycle: string[]) => ({
		code: 'cyclical-reactive-declaration',
		message: `Cyclical dependency detected: ${cycle.join(' → ')}`
	}),
	invalid_tag_property: {
		code: 'invalid-tag-property',
		message: "tag name must be two or more words joined by the '-' character"
	},
	invalid_tag_attribute: {
		code: 'invalid-tag-attribute',
		message: "'tag' must be a string literal"
	},
	invalid_namespace_property: (namespace: string, suggestion?: string) => ({
		code: 'invalid-namespace-property',
		message: `Invalid namespace '${namespace}'` + (suggestion ? ` (did you mean '${suggestion}'?)` : '')
	}),
	invalid_namespace_attribute: {
		code: 'invalid-namespace-attribute',
		message: "The 'namespace' attribute must be a string literal representing a valid namespace"
	},
	invalid_attribute_value: (name: string) => ({
		code: `invalid-${name}-value`,
		message: `${name} attribute must be true or false`
	}),
	invalid_options_attribute_unknown: {
		code: 'invalid-options-attribute',
		message: '<svelte:options> unknown attribute'
	},
	invalid_options_attribute: {
		code: 'invalid-options-attribute',
		message: "<svelte:options> can only have static 'tag', 'namespace', 'accessors', 'immutable' and 'preserveWhitespace' attributes"
	},
	css_invalid_global: {
		code: 'css-invalid-global',
		message: ':global(...) can be at the start or end of a selector sequence, but not in the middle'
	},
	css_invalid_global_selector: {
		code: 'css-invalid-global-selector',
		message: ':global(...) must contain a single selector'
	},
	css_invalid_global_selector_position: {
		code: 'css-invalid-global-selector-position',
		message: ':global(...) not at the start of a selector sequence should not contain type or universal selectors'
	},
	css_invalid_selector: (selector: string) => ({
		code: 'css-invalid-selector',
		message: `Invalid selector "${selector}"`
	}),
	duplicate_animation: {
		code: 'duplicate-animation',
		message: "An element can only have one 'animate' directive"
	},
	invalid_animation_immediate: {
		code: 'invalid-animation',
		message: 'An element that uses the animate directive must be the immediate child of a keyed each block'
	},
	invalid_animation_key: {
		code: 'invalid-animation',
		message: 'An element that uses the animate directive must be used inside a keyed each block. Did you forget to add a key to your each block?'
	},
	invalid_animation_sole: {
		code: 'invalid-animation',
		message: 'An element that uses the animate directive must be the sole child of a keyed each block'
	},
	invalid_animation_dynamic_element: {
		code: 'invalid-animation',
		message: '<svelte:element> cannot have a animate directive'
	},
	invalid_directive_value: {
		code: 'invalid-directive-value',
		message: 'Can only bind to an identifier (e.g. `foo`) or a member expression (e.g. `foo.bar` or `foo[baz]`)'
	},
	invalid_const_placement: {
		code: 'invalid-const-placement',
		message: '{@const} must be the immediate child of {#if}, {:else if}, {:else}, {#each}, {:then}, {:catch}, <svelte:fragment> or <Component>'
	},
	invalid_const_declaration: (name: string) => ({
		code: 'invalid-const-declaration',
		message: `'${name}' has already been declared`
	}),
	invalid_const_update: (name: string) => ({
		code: 'invalid-const-update',
		message: `'${name}' is declared using {@const ...} and is read-only`
	}),
	cyclical_const_tags: (cycle: string[]) => ({
		code: 'cyclical-const-tags',
		message: `Cyclical dependency detected: ${cycle.join(' → ')}`
	}),
	invalid_component_style_directive: {
		code: 'invalid-component-style-directive',
		message: 'Style directives cannot be used on components'
	},
	invalid_style_directive_modifier: (valid: string) => ({
		code: 'invalid-style-directive-modifier',
		message: `Valid modifiers for style directives are: ${valid}`
	})
};
