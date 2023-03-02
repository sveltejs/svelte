<script>
	let visible = true;
	let data = 'Foo';

	export function show() {
		visible = true;
	}
	export function hide() {
		visible = false;
		data = 'Bar';
	}

	function fade(node) {
		return {
			duration: 100,
			tick: t => {
				node.foo = t;
			}
		};
	}
</script>

{#if visible}
	<div transition:fade>
		<slot>{data}</slot>
	</div>
{/if}