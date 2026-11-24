<script module lang="ts">
	import { other, params, requests, slow } from './query.svelte.js';

	export { other, params, requests, slow };
</script>

<script lang="ts">
	import Child from './Child.svelte';
	import { get_user } from './query.svelte.js';

	let { browser = true } = $props();

	const user = $derived(await get_user(params.id));
</script>

<p>{user.name}</p>

<Child {browser} />
