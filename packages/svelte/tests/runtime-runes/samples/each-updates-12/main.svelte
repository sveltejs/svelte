<script>
	function fade(node) {
		return {
			duration: 1000,
			tick(t) {
				node.style.opacity = t;
			}
		}
	}

	let items = $state([1, 2]);
</script>

<button onclick={() => items = []}>clear</button>
<button onclick={() => items.push(items.length + 1)}>push</button>

{#each items as item}
	<span transition:fade={{duration: 1000}}>{item}</span>
{/each}
