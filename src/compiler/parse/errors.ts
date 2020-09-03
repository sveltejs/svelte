// All parser errors should be listed and accessed from here

/**
 * @internal
 */
export const template_errors = {
	duplicate_style: () => ({
		code: 'duplicate-style',
		message: 'You can only have one top-level <style> tag per component'
	}),
	duplicate_instance_script: () => ({
		code: `invalid-script`,
		message: `A component can only have one instance-level <script> element`
	}),
	duplicate_module_script: () => ({
		code: `invalid-script`,
		message: `A component can only have one <script context="module"> element`
	}),
	dynamic_context_attribute: () => ({
		code: 'invalid-script',
		message: `context attribute must be static`
	}),
	fixed_context_attribute: () => ({
		code: `invalid-script`,
		message: `If the context attribute is supplied, its value must be "module"`
	}),
	invalid_elseif: () => ({
		code: 'invalid-elseif',
		message: `'elseif' should be 'else if'`
	}),
	else_if_without_if: () => ({
		code: `invalid-elseif-placement`,
		message: `Cannot have an {:else if ...} block outside an {#if ...} block`
	}),
	else_if_before_block_close: (block) => ({
		code: `invalid-elseif-placement`,
		message: `Expected to close ${block} before seeing {:else if ...} block`
	}),
	else_without_if_each: () => ({
		code: `invalid-else-placement`,
		message: `Cannot have an {:else} block outside an {#if ...} or {#each ...} block`
	}),
	else_before_block_close: (block) => ({
		code: `invalid-else-placement`,
		message: `Expected to close ${block} before seeing {:else} block`
	}),

	unexpected_block_close: () => ({
		code: `unexpected-block-close`,
		message: `Unexpected block closing tag`
	}),
	
	unclosed_script: () => ({
		code: `unclosed-script`,
		message: `<script> must have a closing tag`
	}),
	unclosed_style: () => ({
		code: `unclosed-style`,
		message: `<style> must have a closing tag`
	}),
	unclosed_comment: () => ({
		code: `unclosed-comment`,
		message: `comment was left open, expected -->`
	}),
	unexpected_token: () => ({
		code: 'unexpected-token',
		message: 'Expected )'
	})
};

export const css_errors = {
	invalid_ref_selector: () => ({
		code: `invalid-ref-selector`,
		message: 'ref selectors are no longer supported'
	}),
	invalid_declaration: () => ({
		code: `invalid-declaration`,
		message: `Declaration cannot be empty`
	}),
	empty_global_selector: () => ({
		code: `css-syntax-error`,
		message: `:global() must contain a selector`
	}),
	syntax_error: (message) => ({
		code: `css-syntax-error`,
		message
	})
};

export const js_errors = {
	invalid_ref_selector: () => ({
		code: `invalid-ref-selector`,
		message: 'ref selectors are no longer supported'
	})
};

