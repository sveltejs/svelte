<script>
	import InputOne from './InputOne.svelte';
	import InputTwo from './InputTwo.svelte';
	export let val1 = '';
	export let val2 = '';
</script>

<InputOne bind:value={val1} required minlength="10" />
<InputTwo bind:value={val2} required minlength="10" />