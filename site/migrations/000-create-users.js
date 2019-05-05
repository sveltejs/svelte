exports.up = DB => {
	DB.sql(`
		create table if not exists users (
			id serial primary key,
			uid character varying(255) not null unique,
			name character varying(255),
			username character varying(255) not null,
			avatar text,
			github_token character varying(255),
			created_at timestamp with time zone NOT NULL DEFAULT now(),
			updated_at timestamp with time zone
		);

		create unique index if not exists users_pkey ON users(id int4_ops);
		create unique index if not exists users_uid_key ON users(uid text_ops);
	`);
};

exports.down = DB => {
	DB.sql(`
		drop table if exists users cascade;
		drop index if exists users_uid_key;
		drop index if exists users_pkey;
	`);
};
