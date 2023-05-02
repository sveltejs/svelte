<svelte:options customElement={null} />

<script>
	import "./my-widget.svelte";
	export let name;
</script>

<my-widget>
	<p>default {name}</p>
</my-widget>
