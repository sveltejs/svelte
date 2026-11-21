<script>
	import { writable } from 'svelte/store';
	import Child from './Child.svelte';

	const store = writable({
		contactInfo: { phone: { value: '1' } },
		rules: [{ contactInfo: { phone: { value: '1' } } }]
	});
</script>

<Child bind:contactInfo={$store.contactInfo} />
<Child bind:contactInfo={$store.rules[0].contactInfo} />
<p>{$store.contactInfo.phone.value}</p>
<p>{$store.rules[0].contactInfo.phone.value}</p>
