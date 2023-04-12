<svelte:options tag="custom-element" shadowdom="none" />

<script>
	export let name;
</script>

<h1>Hello {name}!</h1>

<style>
	h1 {
		color: red;
	}
</style>
