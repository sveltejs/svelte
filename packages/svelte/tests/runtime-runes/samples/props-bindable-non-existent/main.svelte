<script>
    import Input from './Input.svelte';
    import InputEditable from './InputEditable.svelte';

		const components = [
			Input,
			InputEditable
		]

		const results = $state([{}, {}]);
</script>

{#each components as Component, i}
	<Component bind:content={results[i].content} bind:value={results[i].value} />
{/each}
