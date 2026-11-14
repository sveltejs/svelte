<script>
	let { ref = $bindable(null) } = $props();
</script>

<div {@attach (node) => (ref = node)}></div>
<p>{ref?.tagName}</p>
