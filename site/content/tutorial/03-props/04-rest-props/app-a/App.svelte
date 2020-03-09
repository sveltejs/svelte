<script>
	import Input from './Input.svelte';

	export let value = '';

	$: ({ value, ...rest } = $$props);
</script>

<Input {value} name="email" aria-label="Email" />