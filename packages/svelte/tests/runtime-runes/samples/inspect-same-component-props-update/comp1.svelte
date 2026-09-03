<script>
	let { prop1 } = $props();
	$inspect('prop1', prop1).with((type, label, value) => console.log(label, type, value));
</script>

Comp1: {prop1}
