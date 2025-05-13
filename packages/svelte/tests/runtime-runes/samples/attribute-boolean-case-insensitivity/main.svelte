<script>
	let runesMode = $state('using a rune so that we trigger runes mode');

	const attributeValues = [true, 'test', false];
</script>

{#each attributeValues as val}
	<script NOMODULE={val} ASYNC={val} DEFER={val}></script>
	<form NOVALIDATE={val}></form>
	<input READONLY={val} REQUIRED={val} CHECKED={val} WEBKITDIRECTORY={val} />
	<select MULTIPLE={val} DISABLED={val}></select>
	<button FORMNOVALIDATE={val}></button>
	<img ISMAP={val} />
	<video AUTOPLAY={val} CONTROLS={val} LOOP={val} MUTED={val} PLAYSINLINE={val} DISABLEPICTUREINPICTURE={val} DISABLEREMOTEPLAYBACK={val}></video>
	<audio DISABLEREMOTEPLAYBACK={val}></audio>
	<track DEFAULT={val} />
	<iframe ALLOWFULLSCREEN={val}></iframe>
	<details OPEN={val}></details>
	<ol REVERSED={val}></ol>
	<div AUTOFOCUS={val}></div>
	<span INERT={val}></span>
{/each}
