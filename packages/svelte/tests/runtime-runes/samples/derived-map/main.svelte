<script>
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	const cache = new SvelteMap();

	function get_async(id) {
		const model = cache.get(id);

		if (!model) {
			const promise = new Promise(async () => {
				await Promise.resolve();
				cache.set(id, id.toString());
			}).then(() => cache.get(id));

			untrack(() => {
				cache.set(id, promise);
			});

			return promise;
		}

		return model;
	}

	const value = $derived(get_async(1));
</script>

{#if value instanceof Promise}
	Loading
{:else}
	{value}
{/if}

