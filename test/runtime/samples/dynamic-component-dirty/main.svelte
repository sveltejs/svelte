<script>
	export let current_path = 'foo';
	export let calls;
	let i = 0;
	function getComponent(path) {
		calls.push(path);
		return null;
	}
	function onClick() {
		i = i + 1;
	}
</script>

<svelte:component this={getComponent(current_path)} />
<button on:click={onClick}>click me</button>
{i}
