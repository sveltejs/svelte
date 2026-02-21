<script>
	let count = $derived(0);
	let postfix = count++;
	let postfix_minus = count--;
	let prefix = ++count;
	let prefix_minus = --count;

	let count_n = $derived(0n);
	let postfix_n = count_n++;
	let postfix_minus_n = count_n--;
	let prefix_n = ++count_n;
	let prefix_minus_n = --count_n;
</script>

<p>postfix: {postfix}, postfix_minus: {postfix_minus}, prefix: {prefix}, prefix_minus: {prefix_minus}, count: {count}</p>
<p>postfix_n: {postfix_n}, postfix_minus_n: {postfix_minus_n}, prefix_n: {prefix_n}, prefix_minus_n: {prefix_minus_n}, count_n: {count_n}</p>

