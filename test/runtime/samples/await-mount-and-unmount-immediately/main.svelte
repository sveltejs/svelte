<script>
	import { tick } from 'svelte';
	import Component from './Component.svelte';

	let promise;
	let resolve;
	let value = 0;
	export let logs = [];
	
	async function new_promise() {
		promise = new Promise(r => {
			resolve = r;
		});
	}

	async function resolve_promise() {
		await Promise.resolve();
		resolve(value++);
	}

	export async function test() {
		resolve_promise();
		await Promise.resolve();
		new_promise();
		resolve_promise();
		return tick();
	}

	new_promise();
</script>

{#await promise}
	Loading...
{:then state}
	<Component {state} {logs} />
{/await}