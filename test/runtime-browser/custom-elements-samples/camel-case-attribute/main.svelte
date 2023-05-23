<svelte:options
	customElement={{
		tag: "custom-element",
		props: {
			camelCase: { attribute: "camel-case" },
			camelCase2: { reflect: true },
			anArray: { attribute: "an-array", type: "Array", reflect: true },
		},
	}}
/>

<script>
	export let camelCase;
	export let camelCase2;
	export let anArray;
</script>

<h1>{camelCase2} {camelCase}!</h1>
{#each anArray as item}
	<p>{item}</p>
{/each}
