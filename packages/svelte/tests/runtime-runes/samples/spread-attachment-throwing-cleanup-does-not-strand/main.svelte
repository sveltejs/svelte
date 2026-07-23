<script>
	import { createAttachmentKey } from 'svelte/attachments';

	let { attached, oncleanup } = $props();

	const attrs = {
		[createAttachmentKey()]: (node) => () => {
			oncleanup('first');
			throw new Error('first cleanup');
		},
		[createAttachmentKey()]: (node) => () => {
			oncleanup('second');
		}
	};
</script>

<div {...(attached ? attrs : {})}>x</div>
