import {
	getEntities,
	getPlainText,
	getSourceName,
	getSourceUrl,
	getType,
	type Photo,
	type Status,
	type StatusEntity,
	type User,
} from 'fanfou-sdk';
import type {
	ExportEntity,
	ExportPhoto,
	ExportStatus,
	ExportUser,
} from '../types.ts';

// Keep the field order and shape previously produced by fanfou-sdk-browser.
const statusFields = {
	created_at: 'createdAt',
	id: 'id',
	rawid: 'rawid',
	text: 'text',
	source: 'source',
	truncated: 'truncated',
	in_reply_to_status_id: 'inReplyToStatusId',
	in_reply_to_user_id: 'inReplyToUserId',
	favorited: 'favorited',
	in_reply_to_screen_name: 'inReplyToScreenName',
	is_self: 'isSelf',
	location: 'location',
} as const satisfies Record<string, keyof Status>;

const userFields = {
	id: 'id',
	name: 'name',
	screen_name: 'screenName',
	unique_id: 'uniqueId',
	location: 'location',
	gender: 'gender',
	birthday: 'birthday',
	description: 'description',
	profile_image_url: 'profileImageUrl',
	profile_image_url_large: 'profileImageUrlLarge',
	url: 'url',
	protected: 'protected',
	followers_count: 'followersCount',
	friends_count: 'friendsCount',
	favourites_count: 'favouritesCount',
	statuses_count: 'statusesCount',
	photo_count: 'photoCount',
	following: 'following',
	notifications: 'notifications',
	created_at: 'createdAt',
	utc_offset: 'utcOffset',
	profile_background_color: 'profileBackgroundColor',
	profile_text_color: 'profileTextColor',
	profile_link_color: 'profileLinkColor',
	profile_sidebar_fill_color: 'profileSidebarFillColor',
	profile_sidebar_border_color: 'profileSidebarBorderColor',
	profile_background_image_url: 'profileBackgroundImageUrl',
	profile_background_tile: 'profileBackgroundTile',
} as const satisfies Record<string, keyof User>;

function legacyFields<Data, Mapping extends Record<string, keyof Data>>(
	data: Data,
	fields: Mapping,
) {
	// Object.fromEntries loses the relationship between mapped keys and values.
	return Object.fromEntries(
		Object.entries(fields).map(([field, value]) => [field, data[value]]),
	) as {
		[Key in keyof Mapping]: Data[Mapping[Key]];
	};
}

function snakeCaseResponse(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map((item) => snakeCaseResponse(item));
	}

	if (value !== null && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [
				key.replaceAll(/[A-Z]/gv, (letter) => `_${letter.toLowerCase()}`),
				snakeCaseResponse(item),
			]),
		);
	}

	return value;
}

export function toExportUser(user: User): ExportUser {
	return {
		...legacyFields(user, userFields),
		// The old User entity kept its embedded status as the original API response.
		...(user.status && {status: snakeCaseResponse(user.status)}),
		profile_image_origin: user.profileImageUrl.replace(/\?\d{10}/v, ''),
		profile_image_origin_large: user.profileImageUrlLarge.replace(
			/\?\d{10}/v,
			'',
		),
	};
}

function toExportEntity(entity: StatusEntity): ExportEntity {
	const bold = entity.boldTexts
		? {
				bold_arr: entity.boldTexts.map(({text, isBold}) => ({
					text,
					bold: isBold,
				})),
			}
		: {};

	switch (entity.type) {
		case 'text': {
			return {
				type: entity.type,
				text: entity.text,
				_text: entity.text.replaceAll(/\n{3,}/gv, '\n\n'),
				...bold,
			};
		}

		case 'tag': {
			return {
				type: entity.type,
				text: entity.text,
				_text: entity.text.replaceAll(/\n{2,}/gv, '\n'),
				query: entity.query,
				...bold,
			};
		}

		case 'at': {
			return {
				type: entity.type,
				text: entity.text,
				name: entity.name,
				id: entity.id,
				...bold,
			};
		}

		case 'link': {
			return {type: entity.type, text: entity.text, link: entity.link, ...bold};
		}
	}
}

function toExportPhoto(photo: Photo): ExportPhoto {
	// Preserve the old SDK’s image URL cleanup exactly.

	const originurl = photo.largeurl.replaceAll(
		// eslint-disable-next-line regexp/no-super-linear-move
		/@.[^\n\r.\u{2028}\u{2029}]*\..+$/gv,
		'',
	);
	// Preserve the legacy final-extension capture, including unusual URLs.
	// eslint-disable-next-line regexp/no-super-linear-backtracking
	const extension = /^.+\.(?<extension>.+)$/v.exec(originurl)?.groups
		?.extension;
	if (extension === undefined || extension === '') {
		throw new Error('图片地址缺少文件类型');
	}

	return {
		url: photo.url,
		imageurl: photo.imageurl,
		thumburl: photo.thumburl,
		largeurl: photo.largeurl,
		originurl,
		type: extension.toLowerCase(),
	};
}

export function toExportStatus(status: Status): ExportStatus {
	const entities = getEntities(status.text);
	return {
		...legacyFields(status, statusFields),
		// API responses can contain null even when the SDK declares an optional string.
		...(Boolean(status.repostStatusId) && {
			repost_status_id: status.repostStatusId,
		}),
		...(Boolean(status.repostUserId) && {
			repost_user_id: status.repostUserId,
		}),
		...(Boolean(status.repostScreenName) && {
			repost_screen_name: status.repostScreenName,
		}),
		...(status.repostStatus && {
			repost_status: toExportStatus(status.repostStatus),
		}),
		user: toExportUser(status.user),
		...(status.photo && {photo: toExportPhoto(status.photo)}),
		type: getType(status),
		source_url: getSourceUrl(status.source),
		source_name: getSourceName(status.source),
		txt: entities.map((entity) => toExportEntity(entity)),
		plain_text: getPlainText(entities),
	};
}
