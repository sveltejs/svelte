<script>
export let visible = false;

function foo(node, params) {
	return {
		duration: 100,
		css: () => ''
	};
}
</script>

{#if visible}
	<div transition:foo></div>
{/if}