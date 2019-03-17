const fs = require('fs');
const puppeteer = require('puppeteer');
const Jimp = require('jimp');
const c = require('kleur');

const slugs = [];

fs.readdirSync(`content/examples`).forEach(group_dir => {
	fs.readdirSync(`content/examples/${group_dir}`).filter(file => file !== 'meta.json').map(example_dir => {
		const slug = example_dir.replace(/^\d+-/, '');
		slugs.push(slug);
	});
});

async function main() {
	const browser = await puppeteer.launch({
		defaultViewport: {
			width: 1280,
			height: 960,
			deviceScaleFactor: 2
		}
	});

	const page = await browser.newPage();

	for (const slug of slugs) {
		try {
			const output_file = `static/examples/thumbnails/${slug}.png`;
			if (fs.existsSync(output_file)) {
				console.log(c.gray(`skipping ${slug}`));
				continue;
			}

			console.log(slug);
			await page.goto(`http://localhost:3000/repl?example=${slug}`);

			await page.waitForSelector('iframe.inited[title=Result]');
			await page.waitFor(1500);
			const iframe = await page.$('iframe.inited[title=Result]');
			const buffer = await iframe.screenshot();

			const image = await Jimp.read(buffer);
			image.crop(3, 3, image.bitmap.width - 6, image.bitmap.height - 6);
			image.autocrop();

			if (image.bitmap.width > 300 || image.bitmap.width > 200) {
				const scale = Math.min(
					300 / image.bitmap.width,
					200 / image.bitmap.height
				);

				image.scale(scale);
			}

			await image.write(output_file);
		} catch (err) {
			console.log(c.bold().red(`failed to screenshot ${slug}`));
		}
	}

	await browser.close();
}

main();