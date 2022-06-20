<script>
	export let items = ['foo', 'bar', 'baz'];
	export let fromDom = '';
	export let fromState = '';
	export let x = 0;
	export let y = 0;

	function tap(node, callback) {
		node.addEventListener('click', callback, false);

		return {
			destroy() {
				node.addEventListener('click', callback, false);
			}
		};
	}
</script>

{#each items as item}
	<button use:tap='{e => (fromDom = e.target.textContent, fromState = item)}'>{item}</button>
{/each}

<p>fromDom: {fromDom}</p>
<p>fromState: {fromState}</p>
