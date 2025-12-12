<script>
	function fade(node) {
		return {
			duration: 1000,
			tick(t) {
				node.style.opacity = t;
			}
		}
	}

	let items = $state(['a', 'b', 'c']);
</script>

<button onclick={() => items = []}>clear</button>
<button onclick={() => items = ['c', 'b', 'a']}>reverse</button>

{#each items as item (item)}
	<span transition:fade={{duration: 1000}}>{item}</span>
{/each}
