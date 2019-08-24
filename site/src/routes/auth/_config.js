export const oauth = 'https://github.com/login/oauth';
export const baseurl = process.env.BASEURL;
export const secure = baseurl.startsWith('https:');

export const client_id = process.env.GITHUB_CLIENT_ID;
export const client_secret = process.env.GITHUB_CLIENT_SECRET;