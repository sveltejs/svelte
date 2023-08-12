<script>
	import Component from './Component.svelte';
</script>

<Component>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div slot='foo' on:click>hi!</div>
</Component>
