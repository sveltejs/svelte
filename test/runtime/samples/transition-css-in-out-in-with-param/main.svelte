<script>
	export let visible = false;
	export let param = false;

	function getInParam() {
		return { 
			duration: param ? 20 : 10,
			css: t => {
				return `opacity: ${t}`;
			}
		};
	}

	function getOutParam() {
		return { 
			duration: param ? 15 : 5,
			css: t => {
				return `opacity: ${t}`;
			}
		};
	}
</script>

{#if visible}
	<div in:getInParam out:getOutParam></div>
{/if}