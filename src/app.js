import React from 'react';
import ReactCountup from 'react-countup';
import queryString from 'query-string';
import async from 'async';
import {ff} from './ff';
import {toTxt, toCsv, toTsv, toJson, toMarkdown} from './utils/parser';
import {PDFDocument, DownloadLink} from './utils/pdf-template';
import 'nes.css/css/nes.css';
import './app.css';

const fullList = [];
let erroredPages = [];

const dataTypes = {
	USER_TIMELINE: '消息',
	FAVORITES: '收藏',
};

const exportTypes = {
	TXT: 'TXT',
	CSV: 'CSV',
	TSV: 'TSV',
	JSON: 'JSON',
	Markdown: 'Markdown',
	PDF: 'PDF',
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
		exportType: 'TXT',
		dataType: '消息',
	};

	async componentDidMount() {
		const {location} = window;
		if (location && location.search) {
			this.setState({loged: true});
			const parsed = queryString.parse(location.search);
			const {oauth_token: oauthToken} = parsed;
			const oauthTokenSecret = localStorage.getItem('requestTokenSecret');
			if (oauthTokenSecret) {
				const result = await ff.getAccessToken({oauthToken, oauthTokenSecret});
				localStorage.setItem('oauthToken', result.oauthToken);
				localStorage.setItem('oauthTokenSecret', result.oauthTokenSecret);
				localStorage.removeItem('requestTokenSecret');
				window.location.replace(
					window.location.origin + window.location.pathname,
				);
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
		const result = await ff.getRequestToken();
		localStorage.setItem('requestTokenSecret', result.oauthTokenSecret);
		window.location.replace(
			`https://fanfou.com/oauth/authorize?oauth_token=${result.oauthToken}&oauth_callback=${window.location.href}`,
		);
	};

	getErroredPages = () => erroredPages;

	fetchStatuses = () => {
		const {done, pageCount, dataType} = this.state;
		const {USER_TIMELINE, FAVORITES} = dataTypes;

		if (done) {
			return;
		}

		let pages = Array.from({length: pageCount}, (v, i) => i + 1);
		let timelineUri = '';

		if (erroredPages.length > 0) {
			pages = erroredPages;
			console.log('Retry pages', erroredPages);
		}

		switch (dataType) {
			case USER_TIMELINE:
				timelineUri = '/statuses/user_timeline';
				break;
			case FAVORITES:
				timelineUri = '/favorites';
				break;
			default:
				return;
		}

		async.eachLimit(
			pages,
			6,
			(page, cb) => {
				ff.get(timelineUri, {page, count: 60, format: 'html'})
					.then(list => {
						const previousCount = fullList.length;
						for (const status of list) {
							fullList.push(status);
						}

						erroredPages = this.getErroredPages().filter(p => p !== page);
						this.setState(
							state => ({
								currentPage: state.currentPage + 1,
								prevStatusCount: previousCount,
								statusCount: fullList.length,
							}),
							cb,
						);
					})
					.catch(error => {
						console.error(`Page ${page} errored`, error);
						erroredPages.push(page);
						cb();
					});
			},
			error => {
				if (error) {
					console.error(error);
				}

				fullList.sort((a, b) => b.rawid - a.rawid);

				this.setState({done: this.getErroredPages().length === 0}, () => {
					this.fetchStatuses();
				});
			},
		);
	};

	startAnalyze = () => {
		const {user, dataType} = this.state;
		const {USER_TIMELINE, FAVORITES} = dataTypes;
		let statusesCount = 0;

		switch (dataType) {
			case USER_TIMELINE:
				statusesCount = user.statuses_count;
				break;
			case FAVORITES:
				statusesCount = user.favourites_count;
				break;
			default:
				return;
		}

		const pageCount = Math.ceil(statusesCount / 60);

		this.setState(
			state => ({
				message: state.message.concat([
					`你有 ${pageCount} 页预计 ${statusesCount} 条${dataType}待导出，`,
					`开始获取${dataType}..`,
				]),
				pageCount,
			}),
			this.fetchStatuses,
		);
	};

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
	};

	onChangeExportType = event => {
		const {value: exportType} = event.currentTarget;
		this.setState({exportType});
	};

	onChangeDataType = event => {
		if (this.state.message.length === 0) {
			const {value: dataType} = event.currentTarget;
			this.setState({dataType});
		}
	};

	doExport = () => {
		const {exportType} = this.state;
		const {TXT, CSV, TSV, JSON, Markdown} = exportTypes;

		switch (exportType) {
			case TXT:
				toTxt(fullList);
				break;
			case CSV:
				toCsv(fullList);
				break;
			case TSV:
				toTsv(fullList);
				break;
			case JSON:
				toJson(fullList);
				break;
			case Markdown:
				toMarkdown(fullList);
				break;
			default:
				break;
		}
	};

	render() {
		const {
			user,
			loged,
			dataType,
			message,
			currentPage,
			pageCount,
			prevStatusCount,
			statusCount,
			done,
			exportType,
		} = this.state;
		const {PDF} = exportTypes;

		return (
			<div>
				<div
					className="nes-container with-title is-centered"
					style={{width: '90vw', maxWidth: 800, margin: '40px auto 20px auto'}}
				>
					<p
						className="title"
						style={{fontSize: 24, margin: '-3rem auto 1rem'}}
					>
						饭否消息备份工具
					</p>

					{user ? (
						<>
							<p>
								你好，<img
									className="nes-avatar is-small"
									alt="avatar"
									src={user.profile_image_url}
									style={{imageRendering: 'pixelated'}}
								/>{' '}
								{user.name}。
							</p>

							<p>选择你要备份的内容：</p>

							<p>
								{Object.values(dataTypes).map(d => (
									<label key={d} style={{marginRight: 5}}>
										<input
											checked={dataType === d}
											value={d}
											type="radio"
											className="nes-radio"
											name="data-type"
											onChange={this.onChangeDataType}
										/>
										<span>{d}</span>
									</label>
								))}
							</p>

							{message.length > 0 ? (
								<>
									{message.map((m, i) => (
										<p key={String(i)}>{m}</p>
									))}
									<p>
										<progress
											className="nes-progress is-pattern"
											value={currentPage}
											max={pageCount}
										/>
									</p>
									<p>
										实际已获取{' '}
										<ReactCountup
											start={prevStatusCount}
											end={statusCount}
											duration={done ? 1 : 3}
										/>{' '}
										条{dataType}。
									</p>
									{done && <p>获取完毕。</p>}
									{done && this.exportTypes()}
									{done && fullList.length > 1000 && (
										<p style={{color: 'grey'}}>
											消息数量超过 1000 条，PDF 类型在线导出较慢。建议选择
											MARKDOWN 导出后自行使用其他工具转换为 PDF。
										</p>
									)}
									<p>
										{exportType === PDF ? (
											<DownloadLink
												done={done}
												document={<PDFDocument fullList={fullList}/>}
											/>
										) : (
											<button
												className={`nes-btn ${
													done ? 'is-success' : 'is-disabled'
												}`}
												disabled={!done}
												type="button"
												onClick={this.doExport}
											>
												导出
											</button>
										)}
									</p>

									<button
										type="button"
										className="nes-btn"
										style={{
											position: 'absolute',
											left: -4,
											bottom: -4,
										}}
										onClick={() => {
											window.location.reload();
										}}
									>
										{done ? '返回' : '停止'}
									</button>
								</>
							) : (
								<p className="nes-pointer" onClick={this.startAnalyze}>
									{'> 点击这里开始备份 <'}
								</p>
							)}

							<button
								type="button"
								className="nes-btn is-error"
								style={{
									position: 'absolute',
									right: -4,
									bottom: 0,
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
					) : (loged ? (
						<p>正在登录..</p>
					) : (
						<p>
							<button
								type="button"
								className="nes-btn is-primary"
								onClick={this.goAuth}
							>
								登录
							</button>
						</p>
					))}
				</div>
				<p style={{textAlign: 'center'}}>
					<span style={{fontWeight: 700}}>{'<'}</span>
					<span style={{fontWeight: 700, marginLeft: 2}}>{'>'}</span>
					{' with '}
					<a
						href="https://fanfou.com/lito"
						target="_blank"
						rel="noopener noreferrer"
					>
						<i
							className="nes-icon is-small heart nes-pointer"
							style={{marginTop: -4, marginBottom: -4}}
						/>
					</a>
					{' on '}
					<a
						href="https://github.com/LitoMore/fanfou-export"
						target="_blank"
						rel="noopener noreferrer"
					>
						<i
							className="nes-icon github is-small"
							style={{marginTop: -4, marginBottom: -4}}
						/>
					</a>
				</p>
			</div>
		);
	}
}

export default App;
