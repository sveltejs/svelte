<script lang="ts">
	/** some comment */
	export let readonly: number;
	export let optional = 'foo';
	export let binding: string;
	export let bindingOptional: string | undefined = 'bar';
	/** this should stay a comment */
	export let no_type_but_comment = 0;
</script>

{readonly}
{optional}
<input bind:value={binding} />
<input bind:value={bindingOptional} />
