<script>
	import Modal from './Modal.svelte';

	let showModal = false;
</script>

<button on:click={() => (showModal = true)}> afficher la modale </button>

<Modal bind:showModal>
	<h2 slot="header">
		modal
		<small><em>adjectif</em> mod·al \ˈmō-dəl\</small>
	</h2>

	<h3>Définitions</h3>
	<ol class="definition-list">
		<li>qui concerne le mode des verbes</li>
		<li>qui a rapport au mode en musique</li>
		<li>
			se dit d'une musique employant d'autres échelles que les deux modes classiques majeur et
			mineur (par opposition à tonal)
		</li>
		<li>
			auxiliaire ou verbe modal ou modal (nom masculin), verbe qui sert à exprimer les modalités
			logiques de l'action (contingent vs nécessaire, probable vs possible, etc.).
		</li>
		<li>
			classe modale, pour un caractère continu dont les valeurs sont groupées en classes de même
			étendue, classe logique dont la fréquence est maximale
		</li>
		<li>
			logique modale, système de logique qui comporte, en sus des connecteurs et quantificateurs de
			la logique classique, deux opérateurs unaires de modalité, l'un pour la nécessité (« il est
			nécessaire que… »), l'autre pour la possibilité (« il est possible que… »)
		</li>
	</ol>

	<h3>Expressions</h3>
	<ol class="expression-list">
		<li>
			auxiliaire ou verbe modal ou modal (nom masculin), verbe qui sert à exprimer les modalités
			logiques de l'action (contingent vs nécessaire, probable vs possible, etc.).
		</li>
		<li>
			classe modale, pour un caractère continu dont les valeurs sont groupées en classes de même
			étendue, classe logique dont la fréquence est maximale
		</li>
		<li>
			logique modale, système de logique qui comporte, en sus des connecteurs et quantificateurs de
			la logique classique, deux opérateurs unaires de modalité, l'un pour la nécessité (« il est
			nécessaire que… »), l'autre pour la possibilité (« il est possible que… »)
		</li>
	</ol>

	<a href="https://www.larousse.fr/dictionnaires/francais/modal/51904">larousse.fr</a>
</Modal>
