import Fanfou from 'fanfou-sdk-browser';

export const consumerKey = '7008b986b162eb6ed2db8f50f26bc03e';
export const consumerSecret = '0caea751b828756dca59a8ea7330384b';

export const ff = new Fanfou({
	consumerKey,
	consumerSecret,
	apiDomain: 'api.fanfou.com',
	oauthDomain: 'fanfou.com',
	protocol: 'https:',
	hooks: {
		baseString: (string) => string.replace('https', 'http')
	}
});
