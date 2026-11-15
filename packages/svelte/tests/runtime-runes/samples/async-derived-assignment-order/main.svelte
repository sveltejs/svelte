<script lang="ts">
	let n = $state(0);
	let gate = $state(0);
	let d = $derived(await delay('d', n));

	const pending: Record<string, () => void> = {};

	function delay(key: string, value: number) {
		if (value === 0) return value;
		return new Promise<number>((resolve) => pending[key] = () => resolve(value));
	}
</script>

<button onclick={() => { d = 1; gate = 1; }}>assign</button>
<button onclick={() => n++}>compute</button>
<button onclick={() => pending.d()}>resolve d</button>
<button onclick={() => pending.gate()}>resolve gate</button>

<output>
	<p>{d}</p>
	<p>{await delay('gate', gate)}</p>
</output>
