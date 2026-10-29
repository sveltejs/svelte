<script>
	import Ref from './Ref.svelte';

	let id = $state(0);
	let loading = $state(false);
	const resolvers = [];

	export function stop_loading() {
		loading = false;
	}

	function slow(value) {
		if (value === 0) return Promise.resolve(0);
		return new Promise((resolve) => resolvers.push(() => resolve(value)));
	}
</script>

<button onclick={() => {
	loading = true;
	id++;
}}>next</button>
<button onclick={() => resolvers.splice(0).forEach((resolve) => resolve())}>resolve</button>

{#snippet pending()}
	<Ref />
{/snippet}

<svelte:boundary pending={loading ? pending : undefined}>
	<h1>{await slow(id)}</h1>
</svelte:boundary>
