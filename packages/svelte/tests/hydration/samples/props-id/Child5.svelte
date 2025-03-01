<script>
	let id = $props.id();
</script>

<p id={id} {...{id:'x'}}>{id}</p>
