<script>
	export let things;

	function foo(node, animation, params) {
		const dx = animation.from.left - animation.to.left;
		const dy = animation.from.top - animation.to.top;

		return {
			delay: params.delay,
			duration: 100,
			tick: (t, u) => {
				node.dx = u * dx;
				node.dy = u * dy;
			}
		};
	}
</script>

{#each things as thing (thing.id)}
	<div animate:foo>{thing.name}</div>
{/each}