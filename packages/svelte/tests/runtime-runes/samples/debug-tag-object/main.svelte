<script>
	let count = $state({ current: 0 });
</script>

{@debug count}

<button onclick={()=> count.current++}>+</button>
