<script>
	$effect(() => {
		const doc_listener = (e) => {
			console.log('document', e.currentTarget === document);
		}

		document.addEventListener('click', doc_listener);
		document.getElementById('app')?.addEventListener('click', (e) => {
			console.log('#app', e.currentTarget === document.getElementById('app'));
		});

		return () => {
			document.removeEventListener('click', doc_listener);
		};
	});

	function onclick() {}
</script>

<div id="app">
	<button {onclick}>click me</button>
</div>
