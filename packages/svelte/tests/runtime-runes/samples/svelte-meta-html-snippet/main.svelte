<script lang="ts">
	import Child from './Child.svelte';
	import Receiver from './Receiver.svelte';
</script>

<Receiver>
	<Child />
	{@html '<b>html</b>'}
</Receiver>
