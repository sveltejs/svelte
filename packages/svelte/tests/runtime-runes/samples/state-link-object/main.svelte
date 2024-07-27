<script>
	let a = $state({ value: 0 });
	let b = $state.link(a);
	let c = $state.link({ ...a });
</script>

<button onclick={() => a.value++}>{a.value}</button>
<button onclick={() => b.value++}>{b.value}</button>
<button onclick={() => c.value++}>{c.value}</button>
