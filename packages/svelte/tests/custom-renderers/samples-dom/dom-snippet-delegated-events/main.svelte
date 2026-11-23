<svelte:options customRenderer={null} />

<script>
	import Scene from './Scene.svelte';

	let count = $state(0);
</script>

<Scene>
	<button onclick={() => (count += 1)}>{count}</button>
</Scene>
