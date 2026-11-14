<script>
	const later = new Promise((r) => setTimeout(() => r('later'), 50));
</script>

{#await later}<i>pending</i>{:then v}<b>{v}</b>{/await}
