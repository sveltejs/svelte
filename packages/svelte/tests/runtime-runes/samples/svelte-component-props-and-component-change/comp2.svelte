<script>
	let { prop2 } = $props();
	$inspect('prop2', prop2).with((type, label, value) => console.log(label, type, value));
</script>

Comp2: {prop2}
