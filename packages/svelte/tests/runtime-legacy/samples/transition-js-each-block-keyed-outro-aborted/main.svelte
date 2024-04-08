<script>
	/**
	 * @param {HTMLElement} node
	 * @param {{ x: number, duration: number }} options
	 */
	function fly(node, { x, duration }) {
		return {
			duration,
			/**
			 * @param {number} t
			 * @param {number} u
			 */
			tick: (t, u) => {
				node.style.transform = `translate(${u * x}px, 0)`
			}
		}
	}

	let numbers = [1, 2, 3, 4, 5];
</script>

<button onclick={() => numbers = [1, 2, 5]}>a</button>
<button onclick={() => numbers = [1, 2, 3]}>b</button>

{#each numbers as n (n)}
	<p transition:fly={{ x: 200, duration: 1000 }}>{n}</p>
{/each}
