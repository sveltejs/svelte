<script>
	import Component from './Component.svelte';
</script>

<Component>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div slot='foo' on:click>hi!</div>
</Component>
