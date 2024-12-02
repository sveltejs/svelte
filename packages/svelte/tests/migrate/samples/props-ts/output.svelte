<script lang="ts">
	
	

	

	interface Props {
		/** some comment */
		readonly: number;
		optional?: string;
		binding: string;
		bindingOptional?: string | undefined;
		/** this should stay a comment */
		no_type_but_comment?: number;
		type_and_inline_comment: number; // this should also stay a comment
		no_type_and_inline_comment?: number; // this should stay as well
		/*
	* this is a same-line leading multiline comment
	**/
		inline_multiline_leading_comment?: string;
		inline_multiline_trailing_comment?: string; /*
	* this is a same-line trailing multiline comment
	**/
	}

	let {
		readonly,
		optional = 'foo',
		binding = $bindable(),
		bindingOptional = $bindable('bar'),
		no_type_but_comment = 0,
		type_and_inline_comment,
		no_type_and_inline_comment = 0,
		inline_multiline_leading_comment = 'world',
		inline_multiline_trailing_comment = 'world'
	}: Props = $props();
</script>

{readonly}
{optional}
<input bind:value={binding} />
<input bind:value={bindingOptional} />