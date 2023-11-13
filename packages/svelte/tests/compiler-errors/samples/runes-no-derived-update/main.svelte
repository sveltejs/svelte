<script>
	const a = $state(0);
	const b = $derived({ a });
	b.a++;
</script>
