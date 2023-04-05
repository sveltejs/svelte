<svelte:options tag="custom-element" />

<script>
	import "./my-widget.svelte";
	export let red;
	red;
</script>

<div>hi</div>
<p>hi</p>
<my-widget red white />

<style>
	:host([red]) div {
		color: red;
	}
	:host([white]) p {
		color: white;
	}
</style>
