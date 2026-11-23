<script lang="ts">
	import {
		SvelteDate,
		SvelteMap,
		SvelteSet,
		SvelteURL,
		SvelteURLSearchParams
	} from 'svelte/reactivity';

	const map = new SvelteMap([[1, 'a']]);
	const empty_map = new SvelteMap();
	const empty_set = new SvelteSet();
	const set = new SvelteSet([1]);
	const date = new SvelteDate(0);
	const url = new SvelteURL('https://a.com/x?q=1');
	const params = new SvelteURLSearchParams('a=1&c=3');
	const obj: Record<string, number> = $state({ a: 1 });
	const arr = $state([1, 2, 3]);

	let callbacks = 0;

	// every one of these must be refused inside a derived, whether or not it would change anything,
	// and leave the underlying data untouched
	const writes: Record<string, () => unknown> = {
		'map.set (existing)': () => map.set(1, 'z'),
		'map.set (new)': () => map.set(2, 'b'),
		'map.delete': () => map.delete(1),
		'map.clear': () => map.clear(),
		'map.set (unchanged)': () => map.set(1, 'a'),
		'map.delete (missing)': () => map.delete(99),
		'map.clear (empty)': () => empty_map.clear(),
		'map.getOrInsert': () => map.getOrInsert(3, 'c'),
		'map.getOrInsertComputed': () => map.getOrInsertComputed(4, () => (callbacks++, 'd')),
		'set.add': () => set.add(2),
		'set.delete': () => set.delete(1),
		'set.clear': () => set.clear(),
		'set.add (existing)': () => set.add(1),
		'set.delete (missing)': () => set.delete(99),
		'set.clear (empty)': () => empty_set.clear(),
		'date.setTime': () => date.setTime(1000),
		'date.setFullYear': () => date.setFullYear(2000),
		'url.hash': () => (url.hash = '#h'),
		'url.host': () => (url.host = 'b.com:8080'),
		'url.hostname': () => (url.hostname = 'b.com'),
		'url.href': () => (url.href = 'https://c.com/'),
		'url.password': () => (url.password = 'p'),
		'url.pathname': () => (url.pathname = '/y'),
		'url.port': () => (url.port = '8080'),
		'url.protocol': () => (url.protocol = 'http:'),
		'url.search': () => (url.search = '?x=1'),
		'url.username': () => (url.username = 'u'),
		'url.searchParams.append': () => url.searchParams.append('z', '2'),
		'url.searchParams.delete': () => url.searchParams.delete('q'),
		'url.searchParams.set': () => url.searchParams.set('q', '2'),
		'url.searchParams.sort': () => url.searchParams.sort(),
		'params.append': () => params.append('b', '2'),
		'params.delete': () => params.delete('a'),
		'params.set': () => params.set('a', '2'),
		'params.sort': () => params.sort(),
		'params.delete (missing)': () => params.delete('missing'),
		'params.set (unchanged)': () => params.set('c', '3'),
		'obj.a =': () => (obj.a = 2),
		'obj.b =': () => (obj.b = 2),
		'delete obj.a': () => delete obj.a,
		'delete obj.missing': () => delete obj.missing,
		'defineProperty obj.c': () =>
			Object.defineProperty(obj, 'c', {
				value: 3,
				writable: true,
				enumerable: true,
				configurable: true
			}),
		'arr.length =': () => (arr.length = 0),
		'arr.push': () => arr.push(4),
		'arr[5] =': () => (arr[5] = 6)
	};

	function refused(write: () => unknown) {
		try {
			write();
			return false;
		} catch {
			return true;
		}
	}

	// read the underlying data directly, bypassing the reactive layer
	function take() {
		return JSON.stringify({
			map: [...Map.prototype.entries.call(map)],
			set: [...Set.prototype.values.call(set)],
			date: Date.prototype.getTime.call(date),
			url: URL.prototype.toString.call(url),
			params: URLSearchParams.prototype.toString.call(params),
			obj: $state.snapshot(obj),
			keys: Object.keys(obj),
			arr: $state.snapshot(arr),
			length: arr.length,
			callbacks
		});
	}

	const initial = take();

	const written = $derived(Object.keys(writes).filter((name) => !refused(writes[name])));

	// writes to things created inside the derived itself are allowed
	const local = $derived.by(() => {
		const m = new SvelteMap();
		m.set(1, 1);
		const s = new SvelteSet();
		s.add(1);
		const d = new SvelteDate(0);
		d.setTime(5);
		const u = new SvelteURL('https://a.com');
		u.pathname = '/b';
		u.searchParams.append('c', 'd');

		// sources created lazily by a nested reaction still belong to the object
		const n = new SvelteMap([[1, 1]]);
		const n1 = $derived(n.get(1));
		n1;
		n.set(1, 2);
		const o = $state({ a: 1 });
		const oa = $derived(o.a);
		oa;
		o.a = 2;

		return [m.size, s.size, d.getTime(), u.href, n.get(1), o.a].join(' ');
	});

	let snapshot = $state('');
</script>

<output>{written.join(', ')}</output>
<output>{local}</output>
<button onclick={() => (snapshot = take() === initial ? 'unchanged' : take())}>check</button>
<output>{snapshot}</output>
