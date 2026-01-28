<script>
	let state = {
		count: 0,
		attachment(){
			console.log('up');
			return () => console.log('down');
		}
	};
</script>

<button onclick={() => state.count++}>{state.count}</button>

{#if state.count < 2}
	<div {@attach state.attachment}></div>
{/if}
