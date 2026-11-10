<script>
	import { getAbortSignal } from 'svelte';

	let w = $state(0);
	let x = $state(0);
	let show = $state(false);

	const pending = new Map();

	function load(label, signal) {
		console.log(`load ${label}`);
		if (label === '0,0') return Promise.resolve(label);

		const d = Promise.withResolvers();
		signal.addEventListener('abort', () => {
			console.log(`aborted ${label}`);
			d.reject(signal.reason);
		});
		pending.set(label, () => d.resolve(label));
		d.promise.catch(() => {});
		return d.promise;
	}

	function delay(label) {
		return new Promise((fulfil) => pending.set(label, () => fulfil(label)));
	}

	let d = $derived(load(`${w},${x}`, getAbortSignal()));
</script>

<button onclick={() => w++}>w++</button>
<button onclick={() => x++}>x++</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => pending.get('content')?.()}>resolve content</button>
<button onclick={() => pending.get('0,1')?.()}>resolve 0,1</button>

<i>{w ? await delay('w') : 0}</i>

{#if x}
	<p>{await d}</p>
{/if}

{#if show}
	<svelte:boundary>
		<!-- no dependencies: no other batch runs it, so it doesn't make batches intersect -->
		{#if await delay('content')}
			<!-- reads `d` without an async expression of its own -->
			{#if d}<b>content</b>{/if}
		{/if}

		{#snippet pending()}
			<b>pending</b>
		{/snippet}
	</svelte:boundary>
{/if}
