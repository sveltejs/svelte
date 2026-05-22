<script>
	let selectedId = $state(1);
	let selectedOption = $derived(selectedId ? await selectedId : null);
</script>

<button onclick={() => (selectedId = null)}>run</button>

{selectedId ?? "none"} {selectedOption ?? "none"} {$effect.pending()}
