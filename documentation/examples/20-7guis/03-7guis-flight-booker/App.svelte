<!-- https://eugenkiss.github.io/7guis/tasks/#flight -->
<script>
	const tomorrow = new Date(Date.now() + 86400000);

	let start = [
		tomorrow.getFullYear(),
		pad(tomorrow.getMonth() + 1, 2),
		pad(tomorrow.getDate(), 2)
	].join('-');

	let end = start;
	let isReturn = false;

	$: startDate = convertToDate(start);
	$: endDate = convertToDate(end);

	function bookFlight() {
		const type = isReturn ? 'A-R' : 'aller simple';

		let message = `Vous avez réservé un vol ${type}, qui décolle le ${startDate.toDateString()}`;
		if (type === 'A-R') {
			message += ` et revient le ${endDate.toDateString()}`;
		}

		alert(message);
	}

	function convertToDate(str) {
		const split = str.split('-');
		return new Date(+split[0], +split[1] - 1, +split[2]);
	}

	function pad(x, len) {
		x = String(x);
		while (x.length < len) x = `0${x}`;
		return x;
	}
</script>

<select bind:value={isReturn}>
	<option value={false}>Aller simple</option>
	<option value={true}>Aller-retour</option>
</select>

<input type="date" bind:value={start} />
<input type="date" bind:value={end} disabled={!isReturn} />

<button on:click={bookFlight} disabled={isReturn && startDate >= endDate}>réserver</button>

<style>
	select,
	input,
	button {
		display: block;
		margin: 0.5em 0;
		font-size: inherit;
	}
</style>
