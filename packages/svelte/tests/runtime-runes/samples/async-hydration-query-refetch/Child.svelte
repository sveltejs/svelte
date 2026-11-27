<script lang="ts">
	import { get_user, other, params, slow } from './query.svelte.js';

	let { browser }: { browser: boolean } = $props();

	const user = $derived(await (other.n, get_user(params.id)));
	const loaded = $derived(await (browser ? slow.promise : Promise.resolve('loaded')));
</script>

<p>Hello {user.name}: {loaded}</p>
