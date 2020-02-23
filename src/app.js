import React from 'react';
import moment from 'moment';
import ReactCountup from 'react-countup';
import queryString from 'query-string';
import FileSaver from 'file-saver';
import Papa from 'papaparse';
import async from 'async';
import {ff} from './ff';
import 'nes.css/css/nes.css';
import './app.css';

const fullList = [];
let erroredPages = [];

const exportTypes = {
	TXT: 'TXT',
	CSV: 'CSV',
	TSV: 'TSV',
	JSON: 'JSON',
	Markdown: 'Markdown'
};

class App extends React.Component {
	state = {
		loged: false,
		user: null,
		message: [],
		currentPage: 0,
		pageCount: 0,
		prevStatusCount: 0,
		statusCount: 0,
		done: false,
		exportType: 'TXT'
	}

	async componentDidMount() {
		const {location} = window;
		if (location && location.search) {
			this.setState({loged: true});
			const parsed = queryString.parse(location.search);
			const {oauth_token: oauthToken} = parsed;
			const oauthTokenSecret = localStorage.getItem('requestTokenSecret');
			if (oauthTokenSecret) {
				const res = await ff.getAccessToken({oauthToken, oauthTokenSecret});
				localStorage.setItem('oauthToken', res.oauthToken);
				localStorage.setItem('oauthTokenSecret', res.oauthTokenSecret);
				localStorage.removeItem('requestTokenSecret');
				window.location.replace(window.location.origin + window.location.pathname);
			}
		} else {
			const oauthToken = localStorage.getItem('oauthToken');
			const oauthTokenSecret = localStorage.getItem('oauthTokenSecret');

			if (oauthToken && oauthTokenSecret) {
				this.setState({loged: true});
				ff.oauthToken = oauthToken;
				ff.oauthTokenSecret = oauthTokenSecret;
				const user = await ff.get('/users/show');
				this.setState({user});
			}
		}
	}

	goAuth = async () => {
		const res = await ff.getRequestToken();
		localStorage.setItem('requestTokenSecret', res.oauthTokenSecret);
		window.location.replace(`https://fanfou.com/oauth/authorize?oauth_token=${res.oauthToken}&oauth_callback=${window.location.href}`);
	}

	getErroredPages = () => {
		return erroredPages;
	}

	fetchStatuses = () => {
		const {done, pageCount} = this.state;

		if (done) {
			return;
		}

		let pages = Array.from({length: pageCount}, (v, i) => i + 1);

		if (erroredPages.length > 0) {
			pages = erroredPages;
			console.log('Retry pages', erroredPages);
		}

		async.eachLimit(pages, 6, (page, cb) => {
			ff.get('/statuses/user_timeline', {page, count: 60, format: 'html'})
				.then(list => {
					const prevCount = fullList.length;
					list.forEach(status => {
						fullList.push(status);
					});
					erroredPages = this.getErroredPages().filter(p => p !== page);
					this.setState(state => ({
						currentPage: state.currentPage + 1,
						prevStatusCount: prevCount,
						statusCount: fullList.length
					}), cb);
				})
				.catch(error => {
					console.error(`Page ${page} errored`, error);
					erroredPages.push(page);
					cb();
				});
		}, error => {
			if (error) {
				console.error(error);
			}

			fullList.sort((a, b) => b.rawid - a.rawid);

			this.setState({done: this.getErroredPages().length === 0}, () => {
				this.fetchStatuses();
			});
		});
	}

	saveFile = (text, filename) => {
		const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
		FileSaver.saveAs(blob, filename);
	}

	startAnalyze = () => {
		const {user} = this.state;
		const {statuses_count: statusesCount} = user;
		const pageCount = Math.ceil(statusesCount / 60);

		this.setState(state => ({
			message: state.message.concat([
				`你有 ${pageCount} 页预计 ${statusesCount} 条消息待导出，`,
				'开始获取消息..'
			]),
			pageCount
		}), this.fetchStatuses);
	}

	exportTypes = () => {
		const {exportType} = this.state;

		return (
			<>
				<p>选择导出格式：</p>
				<p>
					{Object.values(exportTypes).map(type => (
						<label key={type} style={{marginRight: 5}}>
							<input
								checked={exportType === type}
								value={type}
								type="radio"
								className="nes-radio"
								name="export-type"
								onChange={this.onChangeExportType}
							/>
							<span>{type}</span>
						</label>
					))}
				</p>
			</>
		);
	}

	onChangeExportType = e => {
		const {value: exportType} = e.currentTarget;
		this.setState({exportType});
	}

	downloadAsNofan = () => {
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
		this.saveFile(txt, 'backup.txt');
	}

	downloadAsCsv = (type = exportTypes.CSV) => {
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
		if (type === exportTypes.TSV) {
			delimiter = '\t';
		}

		const output = Papa.unparse(parsedData, {delimiter, header: true});
		this.saveFile(output, 'backup.' + type.toLowerCase());
	}

	downloadJson = () => {
		const parsedData = fullList.map(status => {
			delete status.txt;
			delete status.user;
			return status;
		});
		const output = window.JSON.stringify(parsedData, null, 2);
		this.saveFile(output, 'backup.json');
	}

	downloadMarkdown = () => {
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
		this.saveFile(output, 'backup.md');
	}

	doExport = () => {
		const {exportType} = this.state;
		const {TXT, CSV, TSV, JSON, Markdown} = exportTypes;

		switch (exportType) {
			case TXT:
				this.downloadAsNofan();
				break;
			case CSV:
				this.downloadAsCsv();
				break;
			case TSV:
				this.downloadAsCsv(TSV);
				break;
			case JSON:
				this.downloadJson();
				break;
			case Markdown:
				this.downloadMarkdown();
				break;
			default:
				break;
		}
	}

	render() {
		const {user, loged, message, currentPage, pageCount, prevStatusCount, statusCount, done} = this.state;

		return (
			<div>
				<div className="nes-container with-title is-centered" style={{width: '90vw', maxWidth: 800, margin: '40px auto 20px auto'}}>
					<p className="title" style={{fontSize: 24, margin: '-3rem auto 1rem'}}>饭否消息备份工具</p>

					{user ? (
						<>
							<p>
								你好，<img className="nes-avatar is-small" alt="avatar" src={user.profile_image_url} style={{imageRendering: 'pixelated'}}/> {user.name}。
							</p>

							{message.length > 0 ? (
								<>
									{message.map((m, i) => <p key={String(i)}>{m}</p>)}
									<p><progress className="nes-progress is-pattern" value={currentPage} max={pageCount}/></p>
									<p>实际已获取 <ReactCountup start={prevStatusCount} end={statusCount} duration={done ? 1 : 3}/> 条消息。</p>
									{done && <p>获取完毕。</p>}
									{done && this.exportTypes()}
									<p><button disabled={!done} type="button" className={`nes-btn ${done ? 'is-success' : 'is-disabled'}`} onClick={this.doExport}>导出</button></p>
								</>
							) : (
								<p className="nes-pointer" onClick={this.startAnalyze}>{'> 点击这里开始备份 <'}</p>
							)}

							<button
								type="button"
								className="nes-btn is-error"
								style={{
									position: 'absolute',
									right: -4,
									bottom: 0
								}}
								onClick={() => {
									localStorage.removeItem('oauthToken');
									localStorage.removeItem('oauthTokenSecret');
									window.location.reload();
								}}
							>
								退出
							</button>
						</>
					) : (
						loged ? (
							<p>
								正在登录..
							</p>
						) : (
							<p>
								<button type="button" className="nes-btn is-primary" onClick={this.goAuth}>登录</button>
							</p>
						)
					)}
				</div>
				<p style={{textAlign: 'center'}}>
					<span style={{fontWeight: 700}}>{'<'}</span>
					<span style={{fontWeight: 700, marginLeft: 2}}>{'>'}</span>
					{' with '}
					<a href="https://fanfou.com/lito" target="_blank" rel="noopener noreferrer">
						<i className="nes-icon is-small heart nes-pointer" style={{marginTop: -4, marginBottom: -4}}/>
					</a>
					{' on '}
					<a href="https://github.com/LitoMore/fanfou-export" target="_blank" rel="noopener noreferrer">
						<i className="nes-icon github is-small" style={{marginTop: -4, marginBottom: -4}}/>
					</a>
				</p>
			</div>
		);
	}
}

export default App;
