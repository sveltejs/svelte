<script>
	// https://github.com/sveltejs/svelte/issues/15819
	const cond = true;
</script>

<p>start</p>{#if cond}<p>cond</p>{/if}
