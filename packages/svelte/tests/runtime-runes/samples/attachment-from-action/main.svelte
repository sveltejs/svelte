<script>
	import { fromAction } from 'svelte/attachments';
	let { count = 0 } = $props();

	function test(node, thing) {
		const kind = node.dataset.kind;
		console.log('create', thing, kind);
		let t = thing;
		const controller = new AbortController();
		node.addEventListener(
			'click',
			() => {
				console.log(t);
			},
			{
				signal: controller.signal
			}
		);
		return {
			update(new_thing) {
				console.log('update', new_thing, kind);
				t = new_thing;
			},
			destroy() {
				console.log('destroy', kind);
				controller.abort();
			}
		};
	}
</script>

{#if count < 2}
	<button data-kind="action" use:test={count}></button>
	<button data-kind="attachment" {@attach fromAction(test, ()=>count)}></button>
{/if}

<button onclick={()=> count++}></button>