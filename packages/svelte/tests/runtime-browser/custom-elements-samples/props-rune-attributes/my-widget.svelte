<svelte:options
	customElement={{
		tag: "my-widget",
		props: { foo: { attribute: 'foo-bar' } },
	}}
/>

<script>
	let { bar, 'b-az': baz, ...rest } = $props();
</script>

<p>{rest.foo}</p>
<p>{bar}</p>
<p>{baz}</p>
