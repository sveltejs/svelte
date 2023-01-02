<script>
	import Component from './Component.svelte';
</script>

<Component>
	<!-- svelte-ignore unrelated-warning -->
	<div slot='foo' on:click>hi!</div>
</Component>
