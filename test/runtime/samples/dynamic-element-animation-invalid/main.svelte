<script>
	let tag = 'div';
	let things = [
		{ id: 1, name: 'a' },
	];

	function flip(node, animation, params) {
		const dx = animation.from.left - animation.to.left;
		const dy = animation.from.top - animation.to.top;

		return {
			duration: 100,
			css: (t, u) => `transform: translate(${u + dx}px, ${u * dy}px)`
		};
	}
</script>

{#each things as thing (thing.id)}
	<svelte:element this={tag} animate:flip></svelte:element>
{/each}
