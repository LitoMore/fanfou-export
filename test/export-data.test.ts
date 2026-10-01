import {readFile} from 'node:fs/promises';
import test, {type TestContext} from 'node:test';
import Fanfou, {type Status} from 'fanfou-sdk';
import FileSaver from 'file-saver';
import type {ExportStatus} from '../src/types.ts';
import {toExportStatus, toExportUser} from '../src/utils/export-data.ts';
import {toTxt, toCsv, toTsv, toJson, toMarkdown} from '../src/utils/parser.ts';

const response = JSON.parse(
	await readFile(
		new URL('fixtures/fanfou-response.json', import.meta.url),
		'utf8',
	),
) as Array<{created_at: string; user: {screen_name: string}}>;
// Recorded from fanfou-sdk-browser 0.8.0 before migrating the SDK.
const legacy = JSON.parse(
	await readFile(
		new URL('fixtures/legacy-statuses.json', import.meta.url),
		'utf8',
	),
) as ExportStatus[];

await test('SDK beta responses retain the legacy export representation', async (t: TestContext) => {
	t.mock.method(globalThis, 'fetch', async (request: Request) => {
		const url = new URL(request.url);
		t.assert.strictEqual(url.pathname, '/statuses/user_timeline.json');
		t.assert.strictEqual(url.searchParams.get('format'), 'html');
		t.assert.ok(request.headers.get('Authorization')?.startsWith('OAuth '));
		return Response.json(response);
	});

	const ff = new Fanfou({
		consumerKey: 'fixture-key',
		consumerSecret: 'fixture-secret',
	});
	const statuses = await ff.get<Status[]>('/statuses/user_timeline', {
		format: 'html',
	});
	const before = JSON.stringify(statuses);
	const firstStatus = statuses[0];
	const firstResponse = response[0];
	const firstLegacy = legacy[0];
	t.assert.ok(firstStatus);
	t.assert.ok(firstResponse);
	t.assert.ok(firstLegacy);
	t.assert.strictEqual(statuses.length, legacy.length);
	t.assert.strictEqual(firstStatus.createdAt, firstResponse.created_at);
	t.assert.strictEqual(
		firstStatus.user.screenName,
		firstResponse.user.screen_name,
	);

	for (const [index, status] of statuses.entries()) {
		await t.test(status.id, (t: TestContext) => {
			// Also check key order: nested reposts are serialized by the JSON exporter.
			t.assert.strictEqual(
				JSON.stringify(toExportStatus(status)),
				JSON.stringify(legacy[index]),
			);
		});
	}

	t.assert.strictEqual(
		JSON.stringify(toExportUser(firstStatus.user)),
		JSON.stringify(firstLegacy.user),
	);
	t.assert.strictEqual(
		JSON.stringify(statuses),
		before,
		'conversion must not modify the SDK response',
	);

	const fullList = statuses
		.map((status) => toExportStatus(status))
		.toSorted((a, b) => b.rawid - a.rawid);
	const legacyList = legacy.toSorted((a, b) => b.rawid - a.rawid);
	const fullListBefore = JSON.stringify(fullList);
	const downloads: Array<{blob: Blob; filename: string}> = [];
	// Mock the namespace alias; its deprecated annotation comes from a separate overload.
	// eslint-disable-next-line @typescript-eslint/no-deprecated
	t.mock.method(FileSaver, 'saveAs', (blob: Blob, filename: string) => {
		downloads.push({blob, filename});
	});

	for (const exporter of [toJson, toTxt, toCsv, toTsv, toMarkdown]) {
		await t.test(
			`${exporter.name} preserves the downloaded file`,
			async (t: TestContext) => {
				exporter(legacyList);
				const expected = downloads.pop();
				exporter(fullList);
				const download = downloads.pop();
				t.assert.ok(expected);
				t.assert.ok(download);
				t.assert.strictEqual(download.filename, expected.filename);
				t.assert.strictEqual(download.blob.type, expected.blob.type);
				t.assert.deepStrictEqual(
					await download.blob.arrayBuffer(),
					await expected.blob.arrayBuffer(),
				);
				t.assert.strictEqual(JSON.stringify(fullList), fullListBefore);
			},
		);
	}
});
