<script>
	import Input from './TextInput.svelte';
	export let actualValue = {
		foo: 1,
		bar: 2
	};
</script>

<Input {...bind:actualValue} />
<p>{actualValue.foo}</p>