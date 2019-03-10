<script>
	import AudioPlayer, { stopAll } from './AudioPlayer.svelte';
</script>

<button on:click={stopAll}>
	stop all audio
</button>

<!-- https://musopen.org/music/9862-the-blue-danube-op-314/ -->
<AudioPlayer
	src="tutorial/music/strauss.mp3"
	title="The Blue Danube Waltz"
	composer="Johann Strauss"
	performer="European Archive"
/>

<!-- https://musopen.org/music/43775-the-planets-op-32/ -->
<AudioPlayer
	src="tutorial/music/holst.mp3"
	title="Mars, the Bringer of War"
	composer="Gustav Holst"
	performer="USAF Heritage of America Band"
/>

<!-- https://musopen.org/music/8010-3-gymnopedies/ -->
<AudioPlayer
	src="tutorial/music/satie.mp3"
	title="Gymnopédie no. 1"
	composer="Erik Satie"
	performer="Prodigal Procrastinator"
/>

<!-- https://musopen.org/music/2567-symphony-no-5-in-c-minor-op-67/ -->
<AudioPlayer
	src="tutorial/music/beethoven.mp3"
	title="Symphony no. 5 in Cm, Op. 67 - I. Allegro con brio"
	composer="Ludwig van Beethoven"
	performer="European Archive"
/>

<!-- https://musopen.org/music/43683-requiem-in-d-minor-k-626/ -->
<AudioPlayer
	src="tutorial/music/mozart.mp3"
	title="Requiem in D minor, K. 626 - III. Sequence - Lacrymosa"
	composer="Wolfgang Amadeus Mozart"
	performer="Markus Staab"
/>
