{#each animals as animal}
	({animal})
{/each}

({animal})

<script>
	export let animal = 'lemur';
	export let animals = ['alpaca', 'baboon', 'capybara'];
</script>