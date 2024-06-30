<script>
	import Card from './Card.svelte'

	const x = [{
		fav: false,
		x: 1
	}, {
		fav: false,
		x: 2
	}, {
		fav: false,
		x: 3
	}, {
		fav: false,
		x: 4
	}];

	let p_cards = Promise.resolve(JSON.parse(JSON.stringify(x)));
</script>

{#await p_cards then cards}
	{#each cards.filter((card) => !card.fav) as card}
		<Card {card} onfav={() => {card.fav = !card.fav}}></Card>
	{/each}
	-------
	{#each  cards.filter((card) => card.fav) as card}
		<Card {card} onfav={() => {card.fav = !card.fav}}></Card>
	{/each}
{/await}

