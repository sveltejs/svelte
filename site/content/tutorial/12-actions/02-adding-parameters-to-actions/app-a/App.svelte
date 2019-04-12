<script>
	import { tooltip } from './tooltip.js';
	let language = "english";
	let tooltipText;

	$: tooltipText = translations[language].tooltip;

	const translations = {
		english: {
			tooltip: "Switch Languages",
		},
		latin: {
			tooltip: "Itchsway Anguageslay",
		}
	};

	function toggleLanguage() {
		language = language === 'english' ? 'latin' : 'english'
	}
</script>

<button on:click={toggleLanguage} use:tooltip={tooltipText}>
	{language}
</button>
