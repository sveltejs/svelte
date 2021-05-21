const fs = require('fs');
const fetch = require('node-fetch');
const Jimp = require('jimp');

process.chdir(__dirname);

const base = `https://api.github.com/repos/sveltejs/svelte/contributors`;

const SIZE = 64;

async function main() {
	const contributors = [];
	let page = 1;

	while (true) {
		const res = await fetch(`${base}?per_page=100&page=${page++}`);
		const list = await res.json();

		if (list.length === 0) break;

		contributors.push(...list);
	}

	const authors = contributors
		.sort((a, b) => b.contributions - a.contributions);

	const sprite = new Jimp(SIZE * authors.length, SIZE);

	for (let i = 0; i < authors.length; i += 1) {
		const author = authors[i];
		console.log(`${i + 1} / ${authors.length}: ${author.login}`);

		const image_data = await fetch(author.avatar_url);
		const buffer = await image_data.arrayBuffer();

		const image = await Jimp.read(buffer);
		image.resize(SIZE, SIZE);

		sprite.composite(image, i * SIZE, 0);
	}

	await sprite.quality(80).getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
		let quality = 75;

		let content = `--xxxxxxxxxx\r\nContent-Disposition: form-data; name="qlty"; \r\n\r\n${quality}\r\n--xxxxxxxxxx\r\nContent-Disposition: form-data; name="files"; filename="contributors.jpg"\r\nContent-Type:application/octet-stream\r\n\r\n`;
		let end = `\r\n--xxxxxxxxxx--\r\n`;

		let body = Buffer.concat([Buffer.from(content, "utf8"), new Buffer(buffer, "binary"), Buffer.from(end)]);

		fetch('https://api.resmush.it/ws.php', {
		    method: 'POST',
		    headers: {
		        "Content-type": 'multipart/form-data; boundary=xxxxxxxxxx',
		    },
		    body: body
		}).then(async (res) => {
			let response = await res.json()
			console.log(`Reduced file size by ${response.percent}%`)

		    fetch(response.dest).then(async image => {
		    	fs.writeFileSync('../static/contributors.jpg', await image.buffer());
		    });
		});
	});

	const str = `[\n\t${authors.map(a => `'${a.login}'`).join(',\n\t')}\n]`;

	fs.writeFileSync(`../src/routes/_contributors.js`, `export default ${str};`);
}

main();