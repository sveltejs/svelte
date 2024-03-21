<script>
	export let visible;

	function foo() {
		return {
			duration: 100,
			css: t => {
				return `opacity: ${t}`;
			}
		};
	}
</script>

{#if visible}
	<div transition:foo></div>
{/if}
