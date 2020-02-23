import moment from 'moment';
import Papa from 'papaparse';
import FileSaver from 'file-saver';

const saveFile = (text, filename) => {
	const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
	FileSaver.saveAs(blob, filename);
};

export const toTxt = fullList => {
	const parsedData = fullList.map(status => {
		const name = `[${status.user.screen_name}]`;
		let text = '';

		status.txt.forEach(item => {
			switch (item.type) {
				case 'at':
					text += `${item.text}:${item.id}`;
					break;
				case 'link':
					text += item.text;
					break;
				case 'tag':
					text += item._text;
					break;
				default:
					text += item._text;
					break;
			}
		});

		if (status.photo) {
			const photoTag = `图:${status.photo.originurl}`;
			if (text.length > 0) {
				text += ` ${photoTag}`;
			} else {
				text += photoTag;
			}
		}

		const time = moment(new Date(status.created_at)).local().format('YYYY-MM-DD HH:mm:ss');
		const line = `${name} ${text} ${time}`;

		return line;
	});
	const txt = parsedData.join('\n');
	saveFile(txt, 'backup.txt');
};

export const toCsv = (fullList, type = 'CSV') => {
	const parsedData = fullList.map(status => {
		const name = status.user.screen_name;
		const photo = status.photo ? status.photo.originurl : '';
		const time = moment(new Date(status.created_at)).local().format('YYYY-MM-DD HH:mm:ss');
		let text = '';

		status.txt.forEach(item => {
			switch (item.type) {
				case 'at':
					text += `${item.text}:${item.id}`;
					break;
				case 'link':
					text += item.text;
					break;
				case 'tag':
					text += item._text;
					break;
				default:
					text += item._text;
					break;
			}
		});

		const record = {ID: name, 消息内容: text, 图片: photo, 时间: time};

		return record;
	});

	let delimiter = ',';
	if (type === 'TSV') {
		delimiter = '\t';
	}

	const output = Papa.unparse(parsedData, {delimiter, header: true});
	saveFile(output, 'backup.' + type.toLowerCase());
};

export const toTsv = fullList => {
	toCsv(fullList, 'TSV');
};

export const toJson = fullList => {
	const parsedData = fullList.map(status => {
		delete status.txt;
		delete status.user;
		return status;
	});
	const output = JSON.stringify(parsedData, null, 2);
	saveFile(output, 'backup.json');
};

export const toMarkdown = fullList => {
	const parsedData = fullList.map(status => {
		const photo = status.photo ? status.photo.originurl : '';
		const time = moment(new Date(status.created_at)).local().format('YYYY-MM-DD HH:mm:ss');
		let text = '';

		status.txt.forEach(item => {
			switch (item.type) {
				case 'at':
					text += `<a href="https://fanfou.com/${item.id}">${item.text}</a>`;
					break;
				case 'link':
					text += `<a href="${item.text}">${item.text}</a>`;
					break;
				case 'tag':
					text += `<a href="https://fanfou.com/q/${item.query}">${item._text.replace(/\n/g, ' ')}</a>`;
					break;
				default:
					text += item._text.replace(/\n/g, ' ');
					break;
			}
		});
		const block = `| <div>${text}</div>${photo ? `<div align="right"><a href="${photo}"><img width="100px" src="${photo}"/></a></div>` : ''} <div align="right">${time} 通过 ${status.source_url ? `<a href="${status.source_url}">${status.source_name}</a>` : status.source_name}</div> |`;

		return block;
	});

	const output = '| 饭否消息备份 |\n| :-- |\n' + parsedData.join('\n');
	saveFile(output, 'backup.md');
};
