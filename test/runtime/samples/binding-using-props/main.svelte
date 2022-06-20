<script>
	import Input from './TextInput.svelte';
	export let actualValue = '';
</script>

<Input bind:actualValue />
<p>{actualValue}</p>