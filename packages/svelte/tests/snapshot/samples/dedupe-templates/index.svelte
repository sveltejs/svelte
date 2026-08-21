<script>
	let { a, b } = $props();
</script>

<!-- identical static markup repeated across branches should share one hoisted template -->
{#if a}
	<p class="x">hello</p>
{:else}
	<p class="x">hello</p>
{/if}

{#if b}
	<p class="x">hello</p>
{/if}
