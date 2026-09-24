<svelte:options customElement={{ tag: "custom-element", shadow: "none" }} />

<script>
	export let name;
</script>

<h1>Hello {name}!</h1>
<slot>fallback</slot>

<style>
	h1 {
		color: red;
	}
</style>
