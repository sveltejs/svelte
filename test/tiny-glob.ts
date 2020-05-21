import { readdirSync, lstatSync, statSync } from 'fs';
import { normalize, dirname, join, resolve, relative } from 'path';

// MIT
// tiny-glob, globrex and globalyzer by Terkel Gjervig

const CHARS = { '{': '}', '(': ')', '[': ']' };
const STRICT = /\\(.)|(^!|\*|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\)|(\\).|([@?!+*]\(.*\)))/;
const RELAXED = /\\(.)|(^!|[*?{}()[\]]|\(\?)/;
const isWin = process.platform === 'win32';
const SEP = isWin ? `\\\\+` : `\\/`;
const SEP_ESC = isWin ? `\\\\` : `/`;
const GLOBSTAR = `((?:[^/]*(?:/|$))*)`;
const WILDCARD = `([^/]*)`;
const GLOBSTAR_SEGMENT = `((?:[^${SEP_ESC}]*(?:${SEP_ESC}|$))*)`;
const WILDCARD_SEGMENT = `([^${SEP_ESC}]*)`;
const isHidden = /(^|[\\/])\.[^\\/.]/g;
let CACHE = {};
function isglob(str, { strict = true } = {}) {
	if (str === '') return false;
	let match;
	const rgx = strict ? STRICT : RELAXED;
	while ((match = rgx.exec(str))) {
		if (match[2]) return true;
		let idx = match.index + match[0].length;
		const open = match[1];
		const close = open ? CHARS[open] : null;
		let n;
		if (open && close) if ((n = str.indexOf(close, idx)) !== -1) idx = n + 1;
		str = str.slice(idx);
	}
	return false;
}
function parent(str, { strict = false } = {}) {
	str = normalize(str).replace(/\/|\\/, '/');
	if (/[{[].*[/]*.*[}]]$/.test(str)) str += '/';
	str += 'a';
	do str = dirname(str);
	while (isglob(str, { strict }) || /(^|[^\\])([{[]|\([^)]+$)/.test(str));
	return str.replace(/\\([*?|[\](){}])/g, '$1');
}
function globalyzer(pattern, opts = {}) {
	let base = parent(pattern, opts);
	const isGlob = isglob(pattern, opts);
	let glob;
	if (base != '.') {
		if ((glob = pattern.substr(base.length)).startsWith('/')) glob = glob.substr(1);
	} else glob = pattern;
	if (!isGlob) glob = (base = dirname(pattern)) !== '.' ? pattern.substr(base.length) : pattern;
	if (glob.startsWith('./')) glob = glob.substr(2);
	if (glob.startsWith('/')) glob = glob.substr(1);
	return { base, glob, isGlob };
}
function globrex(glob, { extended = false, globstar = false, strict = false, filepath = false, flags = '' } = {}) {
	let regex = '';
	let segment = '';
	const path = {
		regex: '',
		segments: [],
		globstar: undefined,
	};
	let inGroup = false;
	let inRange = false;
	const ext = [];
	function add(str, { split = false, last = false, only = '' } = {}) {
		if (only !== 'path') regex += str;
		if (filepath && only !== 'regex') {
			path.regex += str === '\\/' ? SEP : str;
			if (split) {
				if (last) segment += str;
				if (segment !== '') {
					if (!flags.includes('g')) segment = `^${segment}$`; // change it 'includes'
					path.segments.push(new RegExp(segment, flags));
				}
				segment = '';
			} else {
				segment += str;
			}
		}
	}
	const escaped = (condition, str = c) => add(condition ? str : `//${c}`);
	let c;
	let n;
	for (let i = 0; i < glob.length; i++) {
		c = glob[i];
		n = glob[i + 1];
		if (['\\', '$', '^', '.', '='].includes(c)) {
			add(`\\${c}`);
			continue;
		}
		switch (c) {
			case '/': {
				add(`\\${c}`, { split: true });
				if (n === '/' && !strict) regex += '?';
				break;
			}
			case '|':
			case '(': {
				escaped(ext.length);
				break;
			}
			case ')': {
				if (ext.length) {
					add(c);
					const type = ext.pop();
					if (type === '@') {
						add('{1}');
					} else if (type === '!') {
						add('([^/]*)');
					} else {
						add(type);
					}
				} else add(`\\${c}`);
				break;
			}
			case '+': {
				if (n === '(' && extended) {
					ext.push(c);
				} else add(`\\${c}`);
				break;
			}
			case '!': {
				if (extended) {
					if (inRange) {
						add('^');
						break;
					} else if (n === '(') {
						ext.push(c);
						i++;
					}
				}
				escaped(extended && n === '(', '(?!');
				break;
			}
			case '?': {
				if (extended && n === '(') {
					ext.push(c);
				} else {
					escaped(extended, '.');
				}
				break;
			}
			case '[': {
				if (inRange && n === ':') {
					i++; // skip [
					let value = '';
					while (glob[++i] !== ':') value += glob[i];
					if (value === 'alnum') add('(\\w|\\d)');
					else if (value === 'space') add('\\s');
					else if (value === 'digit') add('\\d');
					i++; // skip last ]
					break;
				} else if (extended) inRange = true;
				escaped(extended);
				break;
			}
			case ']': {
				if (extended) inRange = false;
				escaped(extended);
				break;
			}
			case '{': {
				if (extended) inGroup = true;
				escaped(extended, '(');
				break;
			}
			case '}': {
				if (extended) inGroup = false;
				escaped(extended, ')');
				break;
			}
			case ',': {
				escaped(inGroup, '|');
				break;
			}
			case '*': {
				if (n === '(' && extended) {
					ext.push(c);
					break;
				}
				const prevChar = glob[i - 1];
				let starCount = 1;
				while (glob[i + 1] === '*') {
					starCount++;
					i++;
				}
				const nextChar = glob[i + 1];
				if (!globstar) add('.*');
				else {
					const isGlobstar =
						starCount > 1 && (prevChar === '/' || prevChar === void 0) && (nextChar === '/' || nextChar === void 0);
					if (isGlobstar) {
						add(GLOBSTAR, { only: 'regex' });
						add(GLOBSTAR_SEGMENT, { only: 'path', last: true, split: true });
						i++;
					} else {
						add(WILDCARD, { only: 'regex' });
						add(WILDCARD_SEGMENT, { only: 'path' });
					}
				}
				break;
			}
			case '@': {
				if (extended && n === '(') ext.push(c);
				else add(c);
				break;
			}
			default:
				add(c);
		}
	}
	const g = flags.includes('g');
	return {
		regex: new RegExp(g ? regex : `^${regex}$`, flags),
		path: filepath
			? {
					segments: [...path.segments, new RegExp(g ? segment : `^${segment}$`, flags)],
					regex: new RegExp(g ? path.regex : `^${path.regex}$`, flags),
					globstar: new RegExp(!g ? `^${GLOBSTAR_SEGMENT}$` : GLOBSTAR_SEGMENT, flags),
			  }
			: undefined,
	};
}
function walk(output, prefix, lexer, filesOnly, dot, cwd, dirname = '', level = 0) {
	const rgx = lexer.segments[level];
	const dir = join(cwd, prefix, dirname);
	const files = readdirSync(dir);
	let i = 0;
	let	file;
	const len = files.length;

	let fullpath;
	let relpath;
	let stats;
	let isMatch;
	for (; i < len; i++) {
		fullpath = join(dir, (file = files[i]));
		relpath = dirname ? join(dirname, file) : file;
		if (!dot && isHidden.test(relpath)) continue;
		isMatch = lexer.regex.test(relpath);
		if ((stats = CACHE[relpath]) === void 0) CACHE[relpath] = stats = lstatSync(fullpath);
		if (!stats.isDirectory()) {
			isMatch && output.push(relative(cwd, fullpath));
			continue;
		}
		if (rgx && !rgx.test(file)) continue;
		if (!filesOnly && isMatch) output.push(join(prefix, relpath));
		walk(output, prefix, lexer, filesOnly, dot, cwd, relpath, rgx && rgx.toString() !== lexer.globstar && ++level);
	}
}
export function glob(str: string, { cwd = '.', absolute = false, filesOnly = false, dot = false, flush = false }) {
	if (!str) return [];
	const glob = globalyzer(str);
	if (!glob.isGlob) {
		try {
			const resolved = resolve(cwd, str);
			const dirent = statSync(resolved);
			if (filesOnly && !dirent.isFile()) return [];

			return absolute ? [resolved] : [str];
		} catch (err) {
			if (err.code != 'ENOENT') throw err;

			return [];
		}
	}
	if (flush) CACHE = {};
	const matches = [];
	const { path } = globrex(glob.glob, { filepath: true, globstar: true, extended: true });
	//@ts-ignore
	path.globstar = path.globstar.toString();
	walk(matches, glob.base, path, filesOnly, dot, cwd, '.', 0);
	return absolute ? matches.map((x) => resolve(cwd, x)) : matches;
}
