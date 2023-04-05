<svelte:options tag="my-widget" />

<script>
	export let red = false;
	red;
</script>

<div>hi</div>
<p>hi</p>

<style>
	:host([red]) div {
		color: red;
	}
	:host([white]) p {
		color: white;
	}
</style>
