<svelte:options
	tag="custom-element"
	cePropsDefinition={{
		camelCase: { attribute: "camel-case" },
		anArray: { attribute: "an-array", type: "Array", reflect: true },
	}}
/>

<script>
	export let camelCase;
	export let anArray;
</script>

<h1>Hello {camelCase}!</h1>
{#each anArray as item}
	<p>{item}</p>
{/each}
