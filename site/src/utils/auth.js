export const to_user = obj => obj && ({
	uid: obj.uid,
	username: obj.username,
	name: obj.name,
	avatar: obj.avatar
});