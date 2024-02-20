<script>
	import { writable } from 'svelte/store';

	let { data } = $props();
	let form = writable(data.form);

	function addTag() {
		$form.data.tags['third'] = 3;
	}
</script>

<pre>{JSON.stringify($form, null, 2)}</pre>

<button on:click={addTag}>add</button>
