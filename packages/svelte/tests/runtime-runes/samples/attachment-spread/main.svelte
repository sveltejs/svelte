<script>
	import { createAttachmentKey } from 'svelte/attachments';

	let stuff = $state({
		[createAttachmentKey()]: () => console.log('hello')
	});
</script>

<div {...stuff}></div>
