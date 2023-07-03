<script>
	export let name;
	export let version;
	export let speed;
	export let website;
</script>

<p>
	Le composant <code>{name}</code> est {speed} rapide.
	Télécharger la version {version} depuis <a href="https://www.npmjs.com/package/{name}">npm</a>
	et <a href={website}>apprenez-en plus ici</a>
</p>
