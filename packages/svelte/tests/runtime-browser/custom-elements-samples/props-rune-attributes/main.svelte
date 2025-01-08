<svelte:options
	customElement={{
		tag: "custom-element",
		props: { foo: { attribute: 'foo-bar' } },
	}}
/>

<script>
	let { bar, 'b-az': baz, ...rest } = $props();
</script>

<p>{rest.foo}</p>
<p>{bar}</p>
<p>{baz}</p>
