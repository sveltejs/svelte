<script>
	let toggle = $state(false);
	const onclick = $derived(toggle ? () => { console.log('works') } : () => { console.log('fails')})
	const props = $derived({ onclick });
</script>

<div {...props}>
	<button onclick={() => { toggle = true }}>
		click me
	</button>
</div>
