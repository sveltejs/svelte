<script>
	function fade(node) {
		return {
			duration: 400,
			tick(t) {
				node.setAttribute('t', t);
			}
		};
	}

	let shown = true;
	let _id = 1;
	let items = [];

	export const toggle = () => (shown = !shown);
	export const add = () => {
		items = items.concat({ _id, name: `Thing ${_id}` });
		_id++;
	};
	export const remove = (id) => (items = items.filter(({ _id }) => _id !== id));
</script>

{#if shown}
	<section transition:fade>
		{#each items as thing (thing._id)}
			<div in:fade|local out:fade|local>{thing.name}</div>
		{/each}
	</section>
{/if}
