// All parser errors should be listed and accessed from here

import list from '../utils/list';

/**
 * @internal
 */
export default {
	css_syntax_error: (message) => ({
		code: 'css-syntax-error',
		message
	}),
	duplicate_attribute: {
		code: 'duplicate-attribute',
		message: 'Attributes need to be unique'
	},
	duplicate_element: (slug: string, name: string) => ({
		code: `duplicate-${slug}`,
		message: `A component can only have one <${name}> tag`
	}),
	duplicate_style: {
		code: 'duplicate-style',
		message: 'You can only have one top-level <style> tag per component'
	},
	empty_attribute_shorthand: {
		code: 'empty-attribute-shorthand',
		message: 'Attribute shorthand cannot be empty'
	},
	empty_directive_name: (type: string) => ({
		code: 'empty-directive-name',
		message: `${type} name cannot be empty`
	}),
	empty_global_selector: {
		code: 'css-syntax-error',
		message: ':global() must contain a selector'
	},
	expected_block_type: {
		code: 'expected-block-type',
		message: 'Expected if, each or await'
	},
	expected_name: {
		code: 'expected-name',
		message: 'Expected name'
	},
	invalid_catch_placement_unclosed_block: (block) => ({
		code: 'invalid-catch-placement',
		message: `Expected to close ${block} before seeing {:catch} block`
	}),
	invalid_catch_placement_without_await: {
		code: 'invalid-catch-placement',
		message: 'Cannot have an {:catch} block outside an {#await ...} block'
	},
	invalid_component_definition: {
		code: 'invalid-component-definition',
		message: 'invalid component definition'
	},
	invalid_closing_tag_unopened: (name: string) => ({
		code: 'invalid-closing-tag',
		message: `</${name}> attempted to close an element that was not open`
	}),
	invalid_closing_tag_autoclosed: (name: string, reason: string) => ({
		code: 'invalid-closing-tag',
		message: `</${name}> attempted to close <${name}> that was already automatically closed by <${reason}>`
	}),
	invalid_debug_args: {
		code: 'invalid-debug-args',
		message:
			'{@debug ...} arguments must be identifiers, not arbitrary expressions'
	},
	invalid_declaration: {
		code: 'invalid-declaration',
		message: 'Declaration cannot be empty'
	},
	invalid_directive_value: {
		code: 'invalid-directive-value',
		message: 'Directive value must be a JavaScript expression enclosed in curly braces'
	},
	invalid_elseif: {
		code: 'invalid-elseif',
		message: '\'elseif\' should be \'else if\''
	},
	invalid_elseif_placement_outside_if: {
		code: 'invalid-elseif-placement',
		message: 'Cannot have an {:else if ...} block outside an {#if ...} block'
	},
	invalid_elseif_placement_unclosed_block: (block) => ({
		code: 'invalid-elseif-placement',
		message: `Expected to close ${block} before seeing {:else if ...} block`
	}),
	invalid_else_placement_outside_if: {
		code: 'invalid-else-placement',
		message: 'Cannot have an {:else} block outside an {#if ...} or {#each ...} block'
	},
	invalid_else_placement_unclosed_block: (block) => ({
		code: 'invalid-else-placement',
		message: `Expected to close ${block} before seeing {:else} block`
	}),
	invalid_element_content: (slug: string, name: string) => ({
		code: `invalid-${slug}-content`,
		message: `<${name}> cannot have children`
	}),
	invalid_element_definition: {
		code: 'invalid-element-definition',
		message: 'Invalid element definition'
	},
	invalid_element_placement: (slug: string, name: string) => ({
		code: `invalid-${slug}-placement`,
		message: `<${name}> tags cannot be inside elements or blocks`
	}),
	invalid_logic_block_placement: (location: string, name: string) => ({
		code: 'invalid-logic-block-placement',
		message: `{#${name}} logic block cannot be ${location}`
	}),
	invalid_tag_placement: (location: string, name: string) => ({
		code: 'invalid-tag-placement',
		message: `{@${name}} tag cannot be ${location}`
	}),
	invalid_ref_directive: (name: string) => ({
		code: 'invalid-ref-directive',
		message: `The ref directive is no longer supported — use \`bind:this={${name}}\` instead`
	}),
	invalid_ref_selector: {
		code: 'invalid-ref-selector',
		message: 'ref selectors are no longer supported'
	},
	invalid_self_placement: {
		code: 'invalid-self-placement',
		message: '<svelte:self> components can only exist inside {#if} blocks, {#each} blocks, or slots passed to components'
	},
	invalid_script_instance: {
		code: 'invalid-script',
		message: 'A component can only have one instance-level <script> element'
	},
	invalid_script_module: {
		code: 'invalid-script',
		message: 'A component can only have one <script context="module"> element'
	},
	invalid_script_context_attribute: {
		code: 'invalid-script',
		message: 'context attribute must be static'
	},
	invalid_script_context_value: {
		code: 'invalid-script',
		message: 'If the context attribute is supplied, its value must be "module"'
	},
	invalid_tag_name: {
		code: 'invalid-tag-name',
		message: 'Expected valid tag name'
	},
	invalid_tag_name_svelte_element: (tags: string[], match: string) => ({
		code: 'invalid-tag-name',
		message: `Valid <svelte:...> tag names are ${list(tags)}${
			match ? ' (did you mean ' + match + '?)' : ''
		}`
	}),
	invalid_then_placement_unclosed_block: (block) => ({
		code: 'invalid-then-placement',
		message: `Expected to close ${block} before seeing {:then} block`
	}),
	invalid_then_placement_without_await: {
		code: 'invalid-then-placement',
		message: 'Cannot have an {:then} block outside an {#await ...} block'
	},
	invalid_void_content: (name: string) => ({
		code: 'invalid-void-content',
		message: `<${name}> is a void element and cannot have children, or a closing tag`
	}),
	missing_component_definition: {
		code: 'missing-component-definition',
		message: '<svelte:component> must have a \'this\' attribute'
	},
	missing_attribute_value: {
		code: 'missing-attribute-value',
		message: 'Expected value for the attribute'
	},
	missing_element_definition: {
		code: 'missing-element-definition',
		message: '<svelte:element> must have a \'this\' attribute'
	},
	unclosed_script: {
		code: 'unclosed-script',
		message: '<script> must have a closing tag'
	},
	unclosed_style: {
		code: 'unclosed-style',
		message: '<style> must have a closing tag'
	},
	unclosed_comment: {
		code: 'unclosed-comment',
		message: 'comment was left open, expected -->'
	},
	unclosed_attribute_value: (token: string) => ({
		code: 'unclosed-attribute-value',
		message: `Expected to close the attribute value with ${token}`
	}),
	unexpected_block_close: {
		code: 'unexpected-block-close',
		message: 'Unexpected block closing tag'
	},
	unexpected_eof: {
		code: 'unexpected-eof',
		message: 'Unexpected end of input'
	},
	unexpected_eof_token: (token: string) => ({
		code: 'unexpected-eof',
		message: `Unexpected ${token}`
	}),
	unexpected_token: (token: string) => ({
		code: 'unexpected-token',
		message: `Expected ${token}`
	}),
	unexpected_token_destructure: {
		code: 'unexpected-token',
		message: 'Expected identifier or destructure pattern'
	}
};
