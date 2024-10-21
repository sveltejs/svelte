<script lang="ts">
	
	
	interface Props {
		/** some comment */
		readonly: number;
		optional?: string;
		binding: string;
		bindingOptional?: string | undefined;
		/** this should stay a comment */
		no_type_but_comment?: number;
	}

	let {
		readonly,
		optional = 'foo',
		binding = $bindable(),
		bindingOptional = $bindable('bar'),
		no_type_but_comment = 0
	}: Props = $props();
</script>

{readonly}
{optional}
<input bind:value={binding} />
<input bind:value={bindingOptional} />