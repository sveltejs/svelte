<script>
	export let index = '2';
	export let active = true;
	export let spread = { disabled: true, hidden: true };
</script>

<div aria-rowindex={index} data-active={active}></div>
<button {...spread}>x</button>
