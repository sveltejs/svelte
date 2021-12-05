<script>
	export let x;
</script>

before-{#if x > 10}if{:else if x < 5}elseif{:else}else{/if}-after
