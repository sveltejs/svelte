<script>
	let a = $state(0);
	let b = $state(0);

	const queue = [];

	function push(v) {
		if (!v) return v;
		return new Promise(r => queue.push(() => r(v)));
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => queue.pop()?.()}>pop</button>

{await push(a)}
{await push(b)}

{#if a < b}
	hello
{:else}
	bye
{/if}
