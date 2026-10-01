import {useEffect, useRef, useState} from 'react';
import type {Status} from 'fanfou-sdk';
import {ff} from '../ff/index.ts';
import {toExportStatus} from '../utils/export-data.ts';
import type {ApiError, ExportStatus, TimelineUri} from '../types.ts';

type BackupProgress = {
	started: boolean;
	isFetching: boolean;
	currentPage: number;
	pageCount: number;
	prevStatusCount: number;
	statusCount: number;
	done: boolean;
	error: string;
	fullList: ExportStatus[];
};

const initialProgress: BackupProgress = {
	started: false,
	isFetching: false,
	currentPage: 0,
	pageCount: 0,
	prevStatusCount: 0,
	statusCount: 0,
	done: false,
	error: '',
	fullList: [],
};

export default function useBackup() {
	const [progress, setProgress] = useState(initialProgress);
	const statusesRef = useRef<ExportStatus[]>([]);
	const pendingPagesRef = useRef<number[]>([]);
	const timelineUriRef = useRef<TimelineUri>('/statuses/user_timeline');
	const fetchingRef = useRef(false);
	const mountedRef = useRef(false);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	async function fetchPages() {
		if (fetchingRef.current) {
			return;
		}

		fetchingRef.current = true;
		setProgress((state) => ({...state, isFetching: true, error: ''}));

		// Retry only failed pages, with at most three attempts per batch.
		for (
			let attempt = 0;
			attempt < 3 && pendingPagesRef.current.length > 0;
			attempt++
		) {
			const pages = [...pendingPagesRef.current];
			const failedPages: number[] = [];
			let nextPage = 0;
			await Promise.all(
				Array.from({length: Math.min(6, pages.length)}, async () => {
					while (mountedRef.current && nextPage < pages.length) {
						const page = pages[nextPage++];
						if (page === undefined) {
							return;
						}

						try {
							const list = await ff.get<Status[] | ApiError>(
								timelineUriRef.current,
								{page, count: 60, format: 'html'},
							);
							if (!Array.isArray(list)) {
								throw new TypeError(
									list.error === '' ? '消息获取失败' : list.error,
								);
							}

							if (!mountedRef.current) {
								return;
							}

							const previousCount = statusesRef.current.length;
							statusesRef.current.push(
								...list.map((status) => toExportStatus(status)),
							);
							const statusCount = statusesRef.current.length;
							setProgress((state) => ({
								...state,
								currentPage: state.currentPage + 1,
								prevStatusCount: previousCount,
								statusCount,
							}));
						} catch {
							failedPages.push(page);
						}
					}
				}),
			);
			pendingPagesRef.current = failedPages;
			if (!mountedRef.current) {
				fetchingRef.current = false;
				return;
			}
		}

		fetchingRef.current = false;
		const isDone = pendingPagesRef.current.length === 0;
		setProgress((state) => ({
			...state,
			isFetching: false,
			done: isDone,
			fullList: isDone
				? statusesRef.current.toSorted((a, b) => b.rawid - a.rawid)
				: [],
			error: isDone
				? ''
				: `还有 ${pendingPagesRef.current.length} 页获取失败，请重试。`,
		}));
	}

	function start(statusesCount: number, uri: TimelineUri) {
		if (fetchingRef.current || progress.started) {
			return;
		}

		const pageCount = Math.ceil(statusesCount / 60);
		statusesRef.current = [];
		pendingPagesRef.current = Array.from({length: pageCount}, (_, i) => i + 1);
		timelineUriRef.current = uri;
		setProgress({...initialProgress, started: true, pageCount});
		void fetchPages();
	}

	return {...progress, start, retry: fetchPages};
}
