<script>
	import { getAbortSignal } from 'svelte';

	let a = $state(0);
	let show = $state(false);
	const pending = [];

	function push(key, value) {
		const signal = getAbortSignal();

		return new Promise((resolve, reject) => {
			const entry = { key, value, resolve };

			signal.onabort = () => {
				console.log(`aborted ${key} ${value}`);
				if (pending.includes(entry)) pending.splice(pending.indexOf(entry), 1);
				reject(signal.reason);
			};

			pending.push(entry);
		});
	}

	function resolve(key) {
		const entry = pending.find((d) => d.key === key);
		if (!entry) return;
		pending.splice(pending.indexOf(entry), 1);
		entry.resolve(entry.value);
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => resolve('b')}>shift b</button>
<button onclick={() => resolve('p')}>shift p</button>

<svelte:boundary>
	<p>b: {await push('b', a)}</p>
	{#snippet pending()}<p>loading b...</p>{/snippet}
</svelte:boundary>

{#if show}
	<svelte:boundary>
		<p>p: {await push('p', a)}</p>
		{#snippet pending()}<p>loading p...</p>{/snippet}
	</svelte:boundary>
{/if}
