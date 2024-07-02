<script>
	import { writable } from "svelte/store";

	const store = writable({
		url: {
			pathname: '123'
		}
	})
	const page = {
		subscribe(fn) {
			return store.subscribe(fn);
		}
	}

	let data = $state({
		event: {
			author: 'John Doe',
			body: 'Body',
			foo: '123'
		},
	});

	const { event } = $derived(data);
</script>

{#if event}
	<h1>{event.author}</h1>
	<p>{event.body}</p>
	<div>{$page.url.pathname}</div>
{/if}

<button onclick={() => {
	data = {}
	store.update(v => ({...v}));
}}>hide</button>

<button onclick={() => {
	data = {
		event: {
			author: 'John Doe',
			body: 'Body',
			foo: '123'
		},
	}
	queueMicrotask(() => {
		store.update(v => ({...v}));
	})
}}>show</button>

