<script>
	import { createAttachmentKey } from 'svelte/attachments';
	import Child from './Child.svelte';

	let stuff = $state({
		[createAttachmentKey()]: (node) => node.textContent = 'set from component'
	});
</script>

<Child {...stuff} />
