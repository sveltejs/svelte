<script lang="ts">
	let resolve_gate: (value?: unknown) => void;
	let resolve_second: (value: string) => void;
	const gate = new Promise((resolve) => (resolve_gate = resolve));
	const second = new Promise<string>((resolve) => (resolve_second = resolve));
	let closed = $state<boolean>();
</script>

<button onclick={() => resolve_gate()}>gate</button>
<button onclick={() => resolve_second('second')}>second</button>

{#await gate then}
	{#if true}
		<details bind:open={() => !closed, (open) => (closed = !open)}>
			<summary>group</summary>
		</details>
		<output>{await second} / {closed}</output>
	{/if}
{/await}
