<script>
	export let condition;
	function foo(node, params) {
		return {
			duration: 100,
			tick: t => {
				node.foo = t;
			}
		};
	}
	let bool = true;
</script>

<button on:click={() => (condition = false)} />
<button on:click={() => (bool = !bool)} />
{#if bool}
	<div out:foo />
{/if}
