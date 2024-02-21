<svelte:head>
	<script>
		// A comment
		const val = 'Hello world';
		document.addEventListener('DOMContentLoaded', () => {
			document.querySelector('button').textContent = val;
		});
	</script>
</svelte:head>
<button />
