<script>
	let count = $derived({ value: 1 });
</script>

<button onclick={() => count.value++}>mutate</button>
<button onclick={() => count = count}>assign self</button>
<button onclick={() => count = {...count} }>assign copy</button>

<div>{count.value}</div>
