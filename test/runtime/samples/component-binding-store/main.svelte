<script>
	import { writable } from 'svelte/store';
	import Input from './Input.svelte';

	let value = writable({ value: '' });

	export let callback = () => {};

	value.subscribe(() => {
		callback();
	})
</script>

<input bind:value={$value.value} />

<Input bind:value={$value.value}/>

<div>{$value.value}</div>