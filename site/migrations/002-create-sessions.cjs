exports.up = DB => {
	DB.sql(`
		create table if not exists sessions (
			uid uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id integer REFERENCES users(id) not null,
			expiry timestamp without time zone DEFAULT now() + interval '1 year'
		);
	`);
};

exports.down = DB => {
	DB.sql(`
		drop table if exists sessions;
	`);
};
