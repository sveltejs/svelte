exports.up = DB => {
	DB.sql(`
		create table if not exists gists (
			id serial primary key,
			uid uuid NOT NULL DEFAULT gen_random_uuid(),
			user_id integer REFERENCES users(id) not null,
			name character varying(255) not null,
			files json not null,
			created_at timestamp with time zone NOT NULL DEFAULT now(),
			updated_at timestamp with time zone
		);

		create unique index if not exists gists_pkey ON gists(id int4_ops);
		create index if not exists gists_user_id_key ON gists(user_id int4_ops);
	`);
};

exports.down = DB => {
	DB.sql(`
		drop table if exists gists cascade;
		drop index if exists gists_user_id_key;
		drop index if exists gists_pkey;
	`);
};
