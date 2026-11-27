<script lang="ts">
	let { promise }: { promise: Promise<number> } = $props();

	let count = $state(1);
	const holder: { value?: number } = {};

	function track(name: string, value: unknown) {
		console.log(`${name}: ${value}`);
		return value;
	}

	function format(n: number) {
		return `${n} items`;
	}

	// reads `data` on the right-hand side of an assignment, so it has to wait for it
	function read() {
		holder.value = data;
		return holder.value;
	}

	const data = await promise;

	// `format` doesn't modify `count`, so `count` doesn't have to wait for this
	const label = format(count);
</script>

<!-- each in its own block, so that each has its own blockers -->
<output>
	{#if track('count', count)}count{/if}
	{#if track('read', read())}read{/if}
	{#if track('label', label)}label{/if}
</output>
