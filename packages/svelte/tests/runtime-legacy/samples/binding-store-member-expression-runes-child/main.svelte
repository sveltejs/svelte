<script>
	import { writable } from 'svelte/store';
	import Child from './Child.svelte';

	const store = writable({ contactInfo: { phone: { value: '1' } } });
</script>

<Child bind:contactInfo={$store.contactInfo} />
<p>{$store.contactInfo.phone.value}</p>
