import moment from 'moment';
import Papa from 'papaparse';
import FileSaver from 'file-saver';
import type {ExportEntity, ExportStatus} from '../types.ts';

const saveFile = (text: string, filename: string) => {
	const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
	// The namespace inherits a deprecated overload in @types/file-saver; this uses its options overload.
	// eslint-disable-next-line @typescript-eslint/no-deprecated
	FileSaver.saveAs(blob, filename, {autoBom: false});
};

function plainEntityText(item: ExportEntity): string {
	switch (item.type) {
		case 'at': {
			return `${item.text}:${item.id}`;
		}

		case 'link': {
			return item.text;
		}

		case 'tag':
		case 'text': {
			return item._text;
		}
	}
}

function markdownEntityText(item: ExportEntity): string {
	switch (item.type) {
		case 'at': {
			return `<a href="https://fanfou.com/${item.id}">${item.text}</a>`;
		}

		case 'link': {
			return `<a href="${item.text}">${item.text}</a>`;
		}

		case 'tag': {
			return `<a href="https://fanfou.com/q/${item.query}">${item._text.replaceAll('\n', ' ')}</a>`;
		}

		case 'text': {
			return item._text.replaceAll('\n', ' ');
		}
	}
}

export const toTxt = (fullList: readonly ExportStatus[]) => {
	const parsedData = fullList.map((status) => {
		const name = `[${status.user.screen_name}]`;
		let text = status.txt.map((item) => plainEntityText(item)).join('');

		if (status.photo) {
			const photoTag = `图:${status.photo.originurl}`;
			text += text.length > 0 ? ` ${photoTag}` : photoTag;
		}

		const time = moment(new Date(status.created_at))
			.local()
			.format('YYYY-MM-DD HH:mm:ss');
		const line = `${name} ${text} ${time}`;

		return line;
	});
	const txt = parsedData.join('\n');
	saveFile(txt, 'backup.txt');
};

export const toCsv = (
	fullList: readonly ExportStatus[],
	type: 'CSV' | 'TSV' = 'CSV',
) => {
	const parsedData = fullList.map((status) => {
		const name = status.user.screen_name;
		const photo = status.photo ? status.photo.originurl : '';
		const time = moment(new Date(status.created_at))
			.local()
			.format('YYYY-MM-DD HH:mm:ss');
		const text = status.txt.map((item) => plainEntityText(item)).join('');

		const record = {ID: name, 消息内容: text, 图片: photo, 时间: time};

		return record;
	});

	const delimiter = type === 'TSV' ? '\t' : ',';

	const output = Papa.unparse(parsedData, {delimiter, header: true});
	saveFile(output, 'backup.' + type.toLowerCase());
};

export const toTsv = (fullList: readonly ExportStatus[]) => {
	toCsv(fullList, 'TSV');
};

export const toJson = (fullList: readonly ExportStatus[]) => {
	const parsedData = fullList.map((status) => {
		const record: Partial<ExportStatus> = {...status};
		delete record.txt;
		delete record.user;
		return record;
	});
	const output = JSON.stringify(parsedData, null, 2);
	saveFile(output, 'backup.json');
};

export const toMarkdown = (fullList: readonly ExportStatus[]) => {
	const parsedData = fullList.map((status) => {
		const photo = status.photo ? status.photo.originurl : '';
		const time = moment(new Date(status.created_at))
			.local()
			.format('YYYY-MM-DD HH:mm:ss');
		const text = status.txt.map((item) => markdownEntityText(item)).join('');

		const block = `| <div>${text}</div>${
			photo === ''
				? ''
				: `<div align="right"><a href="${photo}"><img width="100px" src="${photo}"/></a></div>`
		} <div align="right">${time} 通过 ${
			status.source_url === ''
				? status.source_name
				: `<a href="${status.source_url}">${status.source_name}</a>`
		}</div> |`;

		return block;
	});

	const output = '| 饭否消息备份 |\n| :-- |\n' + parsedData.join('\n');
	saveFile(output, 'backup.md');
};
