<script>
	export let scrollY;
	$: console.log(scrollY);
</script>

<svelte:window bind:scrollY />
<div style="height: 200vh; background-image: linear-gradient(green, pink)"></div>
