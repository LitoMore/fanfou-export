import Fanfou from 'fanfou-sdk-browser';

export const consumerKey = '7008b986b162eb6ed2db8f50f26bc03e';
export const consumerSecret = '0caea751b828756dca59a8ea7330384b';

export const ff = new Fanfou({
	consumerKey,
	consumerSecret,
	apiDomain: 'cors.fanfou.pro',
	oauthDomain: 'cors.fanfou.pro',
	hooks: {
		baseString: str => str
			.replace('%2F%2Fcors.fanfou.pro%2Foauth', 'http%3A%2F%2Ffanfou.com%2Foauth')
			.replace('%2F%2Fcors.fanfou.pro', 'http%3A%2F%2Fapi.fanfou.com')
	}
});
