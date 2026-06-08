<script>
	const data = $derived(await Promise.reject(new Error('oops')));
	const model = $derived({ title: data.title });
</script>

<h4>{model.title}</h4>
