<script>
	import { settled } from "svelte";

	let count = $state(0);
	let queued = [];

	function push(v) {
		if (!v) return v;

		return new Promise((resolve) => {
			queued.push(() => resolve(v));
		});
	}
</script>

{await push(count)}
<button onclick={async () => {
	count++;
	await settled();
	console.log('settled ' + count);
}}>increment</button>
<button onclick={() => queued.pop()?.()}>pop</button>
