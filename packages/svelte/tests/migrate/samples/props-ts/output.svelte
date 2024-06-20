<script lang="ts">
	
	interface Props {
		/** some comment */
		readonly: number;
		optional?: string;
		binding: string;
		bindingOptional?: string | undefined;
	}

	let {
		readonly,
		optional = 'foo',
		binding = $bindable(),
		bindingOptional = $bindable('bar')
	}: Props = $props();
</script>

{readonly}
{optional}
<input bind:value={binding} />
<input bind:value={bindingOptional} />