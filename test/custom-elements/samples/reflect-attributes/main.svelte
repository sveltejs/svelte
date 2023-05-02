<svelte:options
	customElement={{
		tag: "custom-element",
		props: { red: { reflect: true, type: "Boolean" } },
	}}
/>

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
