<script>
	let questions = [
		{ id: 1, text: `Où alliez-vous à l'école ?` },
		{ id: 2, text: `Quel est le nom de jeune de fille de votre mère ?` },
		{
			id: 3,
			text: `Donnez-nous un autre élément personnel qu'une personne mal intentionnée pourrait facilement trouver sur Google`
		}
	];

	let selected;

	let answer = '';

	function handleSubmit() {
		alert(`la réponse à la question ${selected.id} (${selected.text}) est "${answer}"`);
	}
</script>

<h2>Questions de non-sécurité</h2>

<form on:submit|preventDefault={handleSubmit}>
	<select bind:value={selected} on:change={() => (answer = '')}>
		{#each questions as question}
			<option value={question}>
				{question.text}
			</option>
		{/each}
	</select>

	<input bind:value={answer} />

	<button disabled={!answer} type="submit"> Envoyer </button>
</form>

<p>question choisie {selected ? selected.id : '[en attente...]'}</p>

<style>
	input {
		display: block;
		width: 500px;
		max-width: 100%;
	}
</style>
