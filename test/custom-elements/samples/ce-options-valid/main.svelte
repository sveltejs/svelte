<svelte:options
	tag="custom-element"
	ceProps={{
		name: { reflect: false, type: "String", attribute: "name" },
	}}
/>

<script>
	export let name;
</script>

<h1>Hello {name}!</h1>
