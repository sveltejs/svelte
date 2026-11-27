<script>
	const defaults = { theme: 'dark' };
	const settings = Object.create(defaults);
	settings.id = 1;
	settings.size = 12;
	Object.defineProperty(settings, 'hidden', { value: 'hidden' });
	Object.defineProperty(settings, 'hasOwnProperty', { value: null });

	let { id, ...rest } = $derived(settings);
	let { id: state_id, ...state_rest } = $state(settings);
	let { id: raw_id, ...raw_rest } = $state.raw(settings);

	const dictionary = Object.assign(Object.create(null), { id: 1, size: 12 });
	let { id: dictionary_id, ...dictionary_rest } = $derived(dictionary);
</script>

<p>{JSON.stringify(rest)}</p>
<p>{JSON.stringify(state_rest)}</p>
<p>{JSON.stringify(raw_rest)}</p>
<p>{JSON.stringify(dictionary_rest)}</p>

{#each [settings] as { id: each_id, ...each_rest }}
	<p>{JSON.stringify(each_rest)}</p>
{/each}

{#snippet show({ id: snippet_id, ...snippet_rest })}
	<p>{JSON.stringify(snippet_rest)}</p>
{/snippet}

{@render show(settings)}
