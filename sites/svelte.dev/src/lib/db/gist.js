import { client } from './client.js';

/** @typedef {import('./types').User} User */
/** @typedef {import('./types').UserID} UserID */
/** @typedef {import('./types').Gist} Gist */

const PAGE_SIZE = 90;

/**
 * @param {User} user
 * @param {{
 *   offset: number;
 *   search: string | null;
 * }} opts
 */
export async function list(user, { offset, search }) {
	const { data, error } = await client.rpc('gist_list', {
		list_search: search || '',
		list_userid: user.id,
		list_count: PAGE_SIZE,
		list_start: offset
	});

	if (error) throw new Error(error.message);

	// normalize IDs
	data.forEach(
		/** @param {{id:string}} gist */ (gist) => {
			gist.id = gist.id.replace(/-/g, '');
		}
	);

	return {
		gists: data.slice(0, PAGE_SIZE),
		next: data.length > PAGE_SIZE ? offset + PAGE_SIZE : null
	};
}

/**
 * @param {User} user
 * @param {Pick<Gist, 'name'|'files'>} gist
 * @returns {Promise<Gist>}
 */
export async function create(user, gist) {
	const { data, error } = await client.rpc('gist_create', {
		name: gist.name,
		files: gist.files,
		userid: user.id
	});

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

/**
 * @param {string} id
 * @returns {Promise<Partial<Gist>>}
 */
export async function read(id) {
	const { data, error } = await client
		.from('gist')
		.select('id,name,files,userid')
		.eq('id', id)
		.is('deleted_at', null);

	if (error) throw new Error(error.message);
	return data[0];
}

/**
 * @param {User} user
 * @param {string} gistid
 * @param {Pick<Gist, 'name'|'files'>} gist
 * @returns {Promise<Gist>}
 */
export async function update(user, gistid, gist) {
	const { data, error } = await client.rpc('gist_update', {
		gist_id: gistid,
		gist_name: gist.name,
		gist_files: gist.files,
		gist_userid: user.id
	});

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

/**
 * @param {number} userid
 * @param {string[]} ids
 */
export async function destroy(userid, ids) {
	const { error } = await client.rpc('gist_destroy', {
		gist_ids: ids,
		gist_userid: userid
	});

	if (error) {
		throw new Error(error.message);
	}
}
