<script>
	export let visible;

	function foo() {
		return {
			duration: 100,
			css: t => {
				return `scale: ${t}`;
			}
		};
	}

	function bar() {
		return {
			duration: 100,
			css: t => {
				return `rotate: ${t * 360}deg; opacity: ${t}`;
			}
		};
	}
</script>

{#if visible}
	<div in:foo out:bar></div>
{/if}
