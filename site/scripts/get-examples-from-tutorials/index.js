import sander from 'sander';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
process.chdir(`${__dirname}/../..`);

function extract_frontmatter(markdown) {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(markdown);
	const frontMatter = match[1];
	const content = markdown.slice(match[0].length);

	const metadata = {};
	frontMatter.split('\n').forEach(pair => {
		const colonIndex = pair.indexOf(':');
		metadata[pair.slice(0, colonIndex).trim()] = pair
			.slice(colonIndex + 1)
			.trim();
	});

	return { metadata, content };
}

const tutorial_sections = sander.readdirSync(`content/tutorial`).map(section_dir => {
	const section_slug = section_dir.replace(/^\d+-/, '');

	const meta = JSON.parse(sander.readFileSync(`content/tutorial/${section_dir}/meta.json`, { encoding: 'utf-8' }));

	const chapters = sander.readdirSync(`content/tutorial/${section_dir}`).map(chapter_dir => {
		const app_dir = `content/tutorial/${section_dir}/${chapter_dir}/app-b`;
		if (!sander.existsSync(app_dir)) return;

		const markdown = sander.readFileSync(`content/tutorial/${section_dir}/${chapter_dir}/text.md`, { encoding: 'utf-8' });
		const { metadata } = extract_frontmatter(markdown);

		const chapter_slug = chapter_dir.replace(/^\d+-/, '');

		return {
			slug: chapter_slug,
			title: metadata.title,
			files: sander.readdirSync(app_dir).map(name => {
				return {
					name,
					source: sander.readFileSync(`${app_dir}/${name}`, { encoding: 'utf-8' })
				};
			})
		};
	}).filter(Boolean);

	return {
		slug: section_slug,
		title: meta.title,
		chapters
	};
}).filter(section => section.chapters.length > 0);

const pad = i => i < 10 ? `0${i}` : i;

tutorial_sections.forEach((section, i) => {
	const section_dir = `${pad(i)}-${section.slug}`;

	sander.writeFileSync(`content/examples/${section_dir}/meta.json`, JSON.stringify({
		title: section.title
	}, null, '\t'));

	section.chapters.forEach((chapter, i) => {
		const chapter_dir = `${pad(i)}-${chapter.slug}`;

		sander.writeFileSync(`content/examples/${section_dir}/${chapter_dir}/meta.json`, JSON.stringify({
			title: chapter.title
		}, null, '\t'));

		chapter.files.forEach(file => {
			sander.writeFileSync(`content/examples/${section_dir}/${chapter_dir}/${file.name}`, file.source);
		});
	});
});