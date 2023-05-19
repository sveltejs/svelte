<script>
	export let things;

	export function linear(t) {
		return t;
	}

	function flip(node, animation, params) {
		const dx = animation.from.left - animation.to.left;
		const dy = animation.from.top - animation.to.top;

		return {
			duration: 100,
			easing: linear,
			tick: (t, u) => {
				node.dx = u * dx;
				node.dy = u * dy;
			}
		};
	}
</script>

{#each things as thing (thing.id)}
	<div animate:flip>{thing.name}</div>
{/each}