import React from 'react';
import down from 'js-file-download';
import moment from 'moment';
import ReactCountup from 'react-countup';
import queryString from 'query-string';
import async from 'async';
import {ff} from './ff';
import 'nes.css/css/nes.css';
import './app.css';

const fullList = [];

class App extends React.Component {
	state = {
		loged: false,
		user: null,
		message: [],
		currentPage: 0,
		pageCount: 0,
		prevStatusCount: 0,
		statusCount: 0,
		done: false
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
		}));

		const pages = Array.from({length: pageCount}, (v, i) => i + 1);

		async.eachLimit(pages, 6, (page, cb) => {
			ff.get('/statuses/user_timeline', {page, count: 60, format: 'html'})
				.then(list => {
					const prevCount = fullList.length;
					list.forEach(status => {
						fullList.push(status);
					});
					this.setState(state => ({
						currentPage: state.currentPage + 1,
						prevStatusCount: prevCount,
						statusCount: fullList.length
					}));
					cb();
				})
				.catch(error => {
					console.log(error.message);
					cb();
				});
		}, error => {
			if (error) {
				// Console.log(error);
			} else {
				fullList.sort((a, b) => b.rawid - a.rawid);
				this.setState({done: true});
			}
		});
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

			const time = moment(new Date(status.created_at))
				.local()
				.format('YYYY-MM-DD HH:mm:ss');

			const line = `${name} ${text} ${time}`;
			return line;
		});
		const txt = parsedData.join('\n');
		down(txt, 'backup.txt');
	}

	render() {
		const {user, loged, message, currentPage, pageCount, prevStatusCount, statusCount, done} = this.state;

		return (
			<div>
				<div className="nes-container with-title is-centered" style={{width: 800, margin: '40px auto 20px auto'}}>
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
									<p>实际已获取 <ReactCountup start={prevStatusCount} end={statusCount} duration={done ? 1 : 5}/> 条消息。</p>
									{done ? <p>获取完毕。</p> : null}
									{/* {done ? <p>选择需要导出格式类型：</p> : null} */}
									{/* {done ? (
									<p>
										<label>
											<input
												checked={exportType === 'nofan'}
												type="radio"
												className="nes-radio"
												name="exportType"
												onChange={() => {
													this.setState({exportType: 'nofan'});
												}}
											/>
											<span>Nofan</span>
										</label>
										<label>
											<input
												checked={exportType === 'tsv'}
												type="radio"
												className="nes-radio"
												name="exportType"
												onChange={() => {
													this.setState({exportType: 'tsv'});
												}}
											/>
											<span>TSV</span>
										</label>
									</p>
								) : null} */}
									<p><button disabled={!done} type="button" className={`nes-btn ${done ? 'is-success' : 'is-disabled'}`} onClick={this.downloadAsNofan}>导出</button></p>
								</>
							) : (
								<p className="nes-pointer" onClick={this.startAnalyze}>{'> 点击这里开始备份 <'}</p>
							)}

							{/* <a
								className="nes-btn"
								style={{
									position: 'absolute',
									left: -4,
									bottom: -4
								}}
								href="https://github.com/LitoMore/fanfou-export/issues"
							>
								意见反馈
							</a> */}

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

					{/* {opened ? (
						<Popout
							url={`https://fanfou.com/oauth/authorize?oauth_token=${this.state.requestToken}&oauth_callback=${window.location.href}`}
							title="饭否登录"
							onClosing={() => {
								this.setState({opened: false, requestToken: null}, () => {
									this.reloadWindow();
								});
							}}
						/>
					) : null} */}
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
