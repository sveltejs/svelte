<script>
	export let things;
	export let tag;

	function flip(node, animation, params) {
		const dx = animation.from.left - animation.to.left;
		const dy = animation.from.top - animation.to.top;

		return {
			duration: 100,
			tick: (t, u) => {
				node.dx = u * dx;
				node.dy = u * dy;
			}
		};
	}

	export function update(new_tag, new_things) {
		things = new_things;
		tag = new_tag;
	}
</script>

{#each things as thing (thing.id)}
	<svelte:element this={tag} animate:flip>{thing.name}</svelte:element>
{/each}