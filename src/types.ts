import type {Photo, Status, User} from 'fanfou-sdk';

type SnakeCase<Key extends string> = Key extends `${infer Head}${infer Tail}`
	? `${Head extends Lowercase<Head> ? Head : `_${Lowercase<Head>}`}${SnakeCase<Tail>}`
	: Key;

type LegacyFields<Value> = {
	[
		Key in keyof Value as Key extends string ? SnakeCase<Key> : never
	]: Value[Key];
};

export type ExportEntity = (
	| {type: 'text'; text: string; _text: string}
	| {type: 'tag'; text: string; _text: string; query: string}
	| {type: 'at'; text: string; name: string; id: string}
	| {type: 'link'; text: string; link: string}
) & {bold_arr?: Array<{text: string; bold: boolean}>};

export type ExportPhoto = Photo & {originurl: string; type: string};

export type ExportUser = Omit<LegacyFields<User>, 'status'> & {
	status?: unknown;
	profile_image_origin: string;
	profile_image_origin_large: string;
};

export type ExportStatus = Omit<
	LegacyFields<Status>,
	'in_reply_to_lastmsg_id' | 'repost_status' | 'user' | 'photo'
> & {
	repost_status?: ExportStatus;
	user: ExportUser;
	photo?: ExportPhoto;
	type: 'reply' | 'repost' | 'origin';
	source_url: string;
	source_name: string;
	txt: ExportEntity[];
	plain_text: string;
};

export type ApiError = {error: string};
export type TimelineUri = '/statuses/user_timeline' | '/favorites';
