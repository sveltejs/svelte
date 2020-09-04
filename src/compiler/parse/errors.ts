// All parser errors should be listed and accessed from here

/**
 * @internal
 */
export default {
	unexpected_eof: {
		code: 'unexpected-eof',
		message: 'Unexpected end of input'
	},
	attribute_duplicate: {
		code: 'duplicate-attribute',
		message: 'Attributes need to be unique'
	},
	expected_token_equal: {
		code: 'unexpected-token',
		message: 'Expected ='
	},
	directive_value_invalid: {
		code: 'invalid-directive-value',
		message: 'Directive value must be a JavaScript expression enclosed in curly braces'
	},
	duplicate_style: {
		code: 'duplicate-style',
		message: 'You can only have one top-level <style> tag per component'
	},
	duplicate_instance_script: () => ({
		code: 'invalid-script',
		message: 'A component can only have one instance-level <script> element'
	}),
	duplicate_module_script: () => ({
		code: 'invalid-script',
		message: 'A component can only have one <script context="module"> element'
	}),
	dynamic_context_attribute: () => ({
		code: 'invalid-script',
		message: 'context attribute must be static'
	}),
	fixed_context_attribute: () => ({
		code: 'invalid-script',
		message: 'If the context attribute is supplied, its value must be "module"'
	}),
	invalid_elseif: {
		code: 'invalid-elseif',
		message: '\'elseif\' should be \'else if\''
	},
	else_if_without_if: {
		code: 'invalid-elseif-placement',
		message: 'Cannot have an {:else if ...} block outside an {#if ...} block'
	},
	else_if_before_block_close: (block) => ({
		code: 'invalid-elseif-placement',
		message: `Expected to close ${block} before seeing {:else if ...} block`
	}),
	else_without_if_each: () => ({
		code: 'invalid-else-placement',
		message: 'Cannot have an {:else} block outside an {#if ...} or {#each ...} block'
	}),
	else_before_block_close: (block) => ({
		code: 'invalid-else-placement',
		message: `Expected to close ${block} before seeing {:else} block`
	}),
	then_before_close_block: (block) => ({
		code: 'invalid-then-placement',
		message: `Expected to close ${block} before seeing {:then} block`
	}),
	then_without_await: {
		code: 'invalid-then-placement',
		message: 'Cannot have an {:then} block outside an {#await ...} block'
	},
	catch_before_close_block: (block) => ({
		code: 'invalid-catch-placement',
		message: `Expected to close ${block} before seeing {:catch} block`
	}),
	catch_without_await: {
		code: 'invalid-catch-placement',
		message: 'Cannot have an {:catch} block outside an {#await ...} block'
	},
	component_definition_invalid: {
		code: 'invalid-component-definition',
		message: 'invalid component definition'
	},
	component_definition_missing: {
		code: 'missing-component-definition',
		message: '<svelte:component> must have a \'this\' attribute'
	},
	expected_block_type: {
		code: 'expected-block-type',
		message: 'Expected if, each or await'
	},
	expected_name: {
		code: 'expected-name',
		message: 'Expected name'
	},
	unexpected_block_close: {
		code: 'unexpected-block-close',
		message: 'Unexpected block closing tag'
	},
	debug_args: () => ({
		code: 'invalid-debug-args',
		message:
			'{@debug ...} arguments must be identifiers, not arbitrary expressions'
	}),
	element_unopened: (name) => ({
		code: 'invalid-closing-tag',
		message: `</${name}> attempted to close an element that was not open`
	}),
	element_autoclosed: (name, reason) => ({
		code: 'invalid-closing-tag',
		message: `</${name}> attempted to close <${name}> that was already automatically closed by <${reason}>`
	}),
	element_tag_name_invalid: {
		code: 'invalid-tag-name',
		message: 'Expected valid tag name'
	},
	meta_no_children: (slug, name) => ({
		code: `invalid-${slug}-content`,
		message: `<${name}> cannot have children`
	}),
	meta_duplicate: (slug, name) => ({
		code: `duplicate-${slug}`,
		message: `A component can only have one <${name}> tag`
	}),
	meta_top_level: (slug, name) => ({
		code: `invalid-${slug}-placement`,
		message: `<${name}> tags cannot be inside elements or blocks`
	}),
	self_placement_invalid: {
		code: 'invalid-self-placement',
		message: '<svelte:self> components can only exist inside {#if} blocks, {#each} blocks, or slots passed to components'
	},
	meta_tag_name_invalid: (tags, match) => ({
		code: 'invalid-tag-name',
		message: `Valid <svelte:...> tag names are ${tags}${
			match ? '(did you mean ' + match + '?)' : ''
		}`
	}),
	ref_directive_invalid: (name) => ({
		code: 'invalid-ref-directive',
		message: `The ref directive is no longer supported — use \`bind:this={${name}}\` instead`
	}),
	void_no_children: (name) => ({
		code: 'invalid-void-content',
		message: `<${name}> is a void element and cannot have children, or a closing tag`
	}),
	unclosed_script: () => ({
		code: 'unclosed-script',
		message: '<script> must have a closing tag'
	}),
	unclosed_style: () => ({
		code: 'unclosed-style',
		message: '<style> must have a closing tag'
	}),
	unclosed_comment: () => ({
		code: 'unclosed-comment',
		message: 'comment was left open, expected -->'
	}),
	unexpected_token: () => ({
		code: 'unexpected-token',
		message: 'Expected )'
	}),
	invalid_ref_selector: () => ({
		code: 'invalid-ref-selector',
		message: 'ref selectors are no longer supported'
	}),
	invalid_declaration: () => ({
		code: 'invalid-declaration',
		message: 'Declaration cannot be empty'
	}),
	empty_global_selector: () => ({
		code: 'css-syntax-error',
		message: ':global() must contain a selector'
	}),
	syntax_error: (message) => ({
		code: 'css-syntax-error',
		message
	})
};
