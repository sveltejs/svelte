<script lang="ts">
	/** some comment */
	export let readonly: number;
	export let optional = 'foo';
	export let binding: string;
	export let bindingOptional: string | undefined = 'bar';
	/** this should stay a comment */
	export let no_type_but_comment = 0;
	export let type_and_inline_comment:number; // this should also stay a comment
	export let no_type_and_inline_comment = 0;         // this should stay as well

	/*
	* this is a same-line leading multiline comment
	**/ export let inline_multiline_leading_comment = 'world';

	export let inline_multiline_trailing_comment = 'world'; /*
	* this is a same-line trailing multiline comment
	**/
</script>

{readonly}
{optional}
<input bind:value={binding} />
<input bind:value={bindingOptional} />
