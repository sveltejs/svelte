<script>
	import { createAttachmentKey } from 'svelte/attachments';
	import Child from './Child.svelte';

	let stuff = $state({
		[createAttachmentKey()]: (node) => {
			console.log(`one ${node.nodeName}`);

			return () => {
				console.log('cleanup one');
			};
		}
	});

	function update() {
		stuff = {
			[createAttachmentKey()]: (node) => {
				console.log(`two ${node.nodeName}`);

				return () => {
					console.log('cleanup two');
				}
			}
		};
	}
</script>

<button onclick={update}>update</button>

<Child {...stuff} />
