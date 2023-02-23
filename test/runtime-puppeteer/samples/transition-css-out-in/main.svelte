<script>
	export let visible;

	function foo() {
		return {
			duration: 10,
			css: t => {
				return `opacity: ${t}`;
			}
		};
	}
</script>

{#if visible}
	<div transition:foo></div>
{/if}

{#if !visible}
	<div transition:foo></div>
{/if}
