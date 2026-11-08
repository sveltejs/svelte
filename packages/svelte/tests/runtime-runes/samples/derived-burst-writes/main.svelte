<script>
	let count = $state(0);
	let calls = 0;

	function fmt(value) {
		calls++;
		return `[${value}]`;
	}

	export function burst(writes) {
		calls = 0;
		for (let i = 0; i < writes; i++) count++;
	}

	export function executions() {
		return calls;
	}
</script>

{#each Array(1000) as _}
	<span>{fmt(count)}</span>
{/each}
