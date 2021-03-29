<script>
	export let visible;

	function foo() {
		return {
			duration: 100,
			static_css: 'display: block',
			css: t => {
				return `opacity: ${t}`;
			}
		};
	}

	function bar() {
		return {
			duration: 100,
			static_css: 'display: inline-block',
			css: t => {
				return `opacity: ${t}`;
			}
		};
	}
</script>

{#if visible}
	<div in:foo out:bar></div>
{/if}