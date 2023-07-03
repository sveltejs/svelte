<script>
	let files;

	$: if (files) {
		// Notez que `files` est de type `FileList`, ce n'est pas un tableau :
		// https://developer.mozilla.org/fr/docs/Web/API/FileList
		console.log(files);

		for (const file of files) {
			console.log(`${file.name}: ${file.size} octets`);
		}
	}
</script>

<label for="avatar">Sélectionnez une image :</label>
<input accept="image/png, image/jpeg" bind:files id="avatar" name="avatar" type="file" />

<label for="many">Sélectionnez plusieurs images de n'importe quel type :</label>
<input bind:files id="many" multiple type="file" />

{#if files}
	<h2>Images sélectionnées :</h2>
	{#each Array.from(files) as file}
		<p>{file.name} ({file.size} octets)</p>
	{/each}
{/if}
