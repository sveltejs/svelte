<script>
	let [first, second, ...[third, ...[, fifth]]] = [1, 2, 3, 4, 5];
	let [one, two, ...[three, ...{ length }]] = [10, 20, 30, 40, 50, 60, 70, 80, 90];
</script>

<h1>{first}</h1>
<h1>{second}</h1>
<h1>{third}</h1>
<h1>{fifth}</h1>

<h1>{one}</h1>
<h1>{two}</h1>
<h1>{three}</h1>
<h1>{length}</h1>

