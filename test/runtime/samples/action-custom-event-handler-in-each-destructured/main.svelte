<script>
	export let items = [[0, 'foo'], [1, 'bar'], [2, 'baz']];
	export let first = '';
	export let second = '';
	export let x = 0;
	export let y = 0;

	function tap(node, callback) {
		function clickHandler(event) {
			callback();
		}

		node.addEventListener('click', clickHandler, false);

		return {
			destroy() {
				node.addEventListener('click', clickHandler, false);
			}
		};
	}
</script>

{#each items as [item0, item1]}
	<button use:tap='{() => (first = item0, second = item1)}'>
		{item0}: {item1}
	</button>
{/each}

<p>first: {first}</p>
<p>second: {second}</p>
