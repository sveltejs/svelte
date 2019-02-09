<script>
	import Widget from './Widget.svelte';
	export let widget;
</script>

<div>
	<Widget bind:this={widget}/>
</div>