<script>
	let name = { value: 0 };
</script>

<button onclick={() => name.value++}>{name.value}</button>
<button onclick={() => (name = { value: name.value + 1 })}>{name.value}</button>
