/** ----------------------------------------------------------------------
This script gets a list of global objects/interfaces of browser.
This process is simple for now, so it is handled without AST parser.
see: https://github.com/microsoft/TypeScript/tree/main/lib
 ---------------------------------------------------------------------- */

import http from 'https';

const get_url = (name) => `https://raw.githubusercontent.com/microsoft/TypeScript/main/lib/lib.${name}.d.ts`;
const extract_name = (split) => split.match(/^[a-zA-Z0-9_$]+/)[0];

const extract_interfaces_and_references = (data) => {
	const interfaces = [];
	const references = [];
	data.split('\n').forEach(line => {
		const trimmed = line.trim();
		const split = trimmed.replace(/[\s+]/, ' ').split(' ');
		if (split[0] === 'interface') interfaces.push(extract_name(split[1]));
		else if (split[0] === 'declare') interfaces.push(extract_name(split[2]));
		else if (trimmed.startsWith('/// <reference')) {
			const reference = trimmed.match(/lib="(.+)"/)[1];
			if (reference) references.push(reference);
		}
	});
	return { interfaces, references };
};

const do_get = (url) => new Promise((resolve, reject) => {
	http.get(url, (res) => {
		let body = '';
		res.setEncoding('utf8');
		res.on('data', (chunk) => body += chunk);
		res.on('end', () => resolve(body));
	}).on('error', (e) => {
		console.error(e.message);
		reject(e);
	});
});

const get_interfaces = async (name) => {
	const res = [];
	const body = await do_get(get_url(name));
	const { interfaces, references } = extract_interfaces_and_references(body);
	res.push(...interfaces);
	const chile_interfaces = await Promise.all(references.map(get_interfaces));
	chile_interfaces.forEach(i => res.push(...i));
	return res;
};

(async () => {
	const interfaces = await get_interfaces('es2021.full');
	// MEMO: add additional objects/interfaces which existed in `src/compiler/utils/names.ts`
	//       before this script was introduced but could not be retrieved by this process.
	interfaces.push(...['globalThis', 'InternalError', 'process', 'undefined']);
	new Set(interfaces.sort()).forEach((i) => console.log(`'${i}',`));
})();
