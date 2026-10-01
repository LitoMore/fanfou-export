import {useEffect, useRef, useState} from 'react';
import type {User} from 'fanfou-sdk';
import {ff} from '../ff/index.ts';
import {toExportUser} from '../utils/export-data.ts';
import type {ApiError, ExportUser} from '../types.ts';

async function restoreSession(): Promise<ExportUser | undefined> {
	const oauthToken = new URLSearchParams(location.search).get('oauth_token');
	if (oauthToken !== null && oauthToken !== '') {
		const oauthTokenSecret = localStorage.getItem('requestTokenSecret');
		if (oauthTokenSecret === null || oauthTokenSecret === '') {
			throw new Error('授权信息已过期，请重新登录。');
		}

		const result = await ff.getAccessToken({oauthToken, oauthTokenSecret});
		localStorage.setItem('oauthToken', result.oauthToken);
		localStorage.setItem('oauthTokenSecret', result.oauthTokenSecret);
		localStorage.removeItem('requestTokenSecret');
		history.replaceState(null, '', location.pathname + location.hash);
	}

	const token = localStorage.getItem('oauthToken');
	const tokenSecret = localStorage.getItem('oauthTokenSecret');
	if (
		token === null ||
		token === '' ||
		tokenSecret === null ||
		tokenSecret === ''
	) {
		return undefined;
	}

	ff.oauthToken = token;
	ff.oauthTokenSecret = tokenSecret;
	const user = await ff.get<User | ApiError>('/users/show');
	if ('error' in user) {
		throw new Error(user.error);
	}

	return toExportUser(user);
}

export default function useSession() {
	const [user, setUser] = useState<ExportUser>();
	const [isLoggingIn, setIsLoggingIn] = useState(true);
	const [error, setError] = useState('');
	const sessionRequestRef = useRef<Promise<ExportUser | undefined> | undefined>(
		undefined,
	);

	useEffect(() => {
		let isCancelled = false;
		// Reuse the request when StrictMode re-runs the effect: OAuth tokens are single-use.
		sessionRequestRef.current ??= restoreSession();
		sessionRequestRef.current
			.then((result) => {
				if (!isCancelled) {
					setUser(result);
				}
			})
			.catch(() => {
				if (!isCancelled) {
					setError('登录失败，请重新登录。');
				}
			})
			.finally(() => {
				if (!isCancelled) {
					setIsLoggingIn(false);
				}
			});

		return () => {
			isCancelled = true;
		};
	}, []);

	async function login() {
		setError('');
		setIsLoggingIn(true);
		try {
			const result = await ff.getRequestToken();
			localStorage.setItem('requestTokenSecret', result.oauthTokenSecret);
			const url = new URL('https://fanfou.com/oauth/authorize');
			url.searchParams.set('oauth_token', result.oauthToken);
			url.searchParams.set(
				'oauth_callback',
				location.origin + location.pathname,
			);
			location.replace(url.href);
		} catch {
			setError('登录失败，请重试。');
			setIsLoggingIn(false);
		}
	}

	function logout() {
		localStorage.removeItem('oauthToken');
		localStorage.removeItem('oauthTokenSecret');
		localStorage.removeItem('requestTokenSecret');
		location.replace(location.origin + location.pathname);
	}

	return {user, isLoggingIn, error, login, logout};
}
