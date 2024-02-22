<svelte:options runes={false} />

<script>
	import { beforeUpdate } from 'svelte';
	import { logs } from './logs.js'

	export let object;

	beforeUpdate(() => {
		logs.push('changed');
	});
</script>
