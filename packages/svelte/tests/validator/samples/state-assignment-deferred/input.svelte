<script>
	let count = $state(0);
</script>

<Component
	Model={class {
		value = count++;
	}}
/>
