<svelte:options
	customElement={{
		tag: "custom-element",
		props: {
			camelCase: { attribute: "camel-case" },
			camelCase2: { reflect: true },
			anArray: { attribute: "an-array", type: "Array", reflect: true },
			aNumber: { attribute: "a-number", type: "Number", reflect: true },
			aBoolean: { attribute: "a-boolean", type: "Boolean", reflect: true },
		},
	}}
/>

<script>
	export let camelCase;
	export let camelCase2;
	export let anArray;
	export let aNumber;
	export let aBoolean;
</script>

<h1>{camelCase2} {camelCase}! {aNumber} {aBoolean}</h1>
{#each anArray as item}
	<p>{item}</p>
{/each}
