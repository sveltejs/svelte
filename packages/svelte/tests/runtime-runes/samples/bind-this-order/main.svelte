<script>
	function fly(node, params) {
		return {};
	}

	let show = $state(false);
	let sidebar = $state();
</script>

<button onclick={() => (show = !show)}>toggle</button>

{#if show}
	<!-- bind:this should be applied before any of the directives -->
	<nav transition:fly={{ x: sidebar.offsetWidth }} bind:this={sidebar}>hello</nav>
{/if}
