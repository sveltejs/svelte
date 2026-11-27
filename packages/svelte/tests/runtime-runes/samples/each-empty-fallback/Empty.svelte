<script lang="ts">
	// Components without markup must still be initialized.
	$effect(() => {
		document.body.dataset.emptyFallback = 'mounted';
		return () => delete document.body.dataset.emptyFallback;
	});
</script>
