<script>
	export let visible = false;
	export let param = false;

	function getInParam() {
		return {
			duration: 100,
			css: (t) => {
				return `color: ${param ? 'red' : 'blue'}`;
			}
		};
	}

	function getOutParam() {
		return {
			duration: 100,
			css: (t) => {
				return `color: ${param ? 'green' : 'yellow'}`;
			}
		};
	}
</script>

{#if visible}
	<div in:getInParam out:getOutParam></div>
{/if}
