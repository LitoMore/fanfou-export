import {lazy, Suspense, useEffect, useId, useState} from 'react';
import {useCountUp} from 'react-countup';
import 'nes.css/css/nes.css';
import {toTxt, toCsv, toTsv, toJson, toMarkdown} from './utils/parser.ts';
import PlaystaMore from './utils/playsta.tsx';
import useSession from './hooks/use-session.ts';
import useBackup from './hooks/use-backup.ts';
import type {ExportUser} from './types.ts';
import './app.css';

const PdfExport = lazy(async () => import('./utils/pdf-template.tsx'));

const dataTypes = {
	userTimeline: '消息',
	favorites: '收藏',
} as const;

const exportTypes = {
	txt: 'TXT',
	csv: 'CSV',
	tsv: 'TSV',
	json: 'JSON',
	markdown: 'Markdown',
	pdf: 'PDF',
} as const;

const exporters = {
	[exportTypes.txt]: toTxt,
	[exportTypes.csv]: toCsv,
	[exportTypes.tsv]: toTsv,
	[exportTypes.json]: toJson,
	[exportTypes.markdown]: toMarkdown,
};

function StatusCount({
	start,
	end,
	duration,
}: {
	start: number;
	end: number;
	duration: number;
}) {
	const id = useId();
	const {update} = useCountUp({ref: id, start, end, duration});
	useEffect(() => {
		update(end);
	}, [end, update]);
	return <span id={id} />;
}

type RadioOptionsProps<Value extends string> = {
	name: string;
	options: readonly Value[];
	value: Value;
	onChange: (value: Value) => void;
	disabled?: boolean;
};

function RadioOptions<Value extends string>({
	name,
	options,
	value,
	onChange,
	disabled = false,
}: RadioOptionsProps<Value>) {
	return (
		<p>
			{options.map((option) => (
				<label key={option} style={{marginRight: 5}}>
					<input
						checked={value === option}
						value={option}
						type="radio"
						className="nes-radio"
						name={name}
						disabled={disabled}
						onChange={() => {
							onChange(option);
						}}
					/>
					<span>{option}</span>
				</label>
			))}
		</p>
	);
}

export default function App() {
	const {user, isLoggingIn, error: sessionError, login, logout} = useSession();
	const {
		started,
		isFetching,
		currentPage,
		pageCount,
		prevStatusCount,
		statusCount,
		done,
		error: backupError,
		fullList,
		start,
		retry,
	} = useBackup();
	const [exportType, setExportType] = useState<
		(typeof exportTypes)[keyof typeof exportTypes]
	>(exportTypes.txt);
	const [dataType, setDataType] = useState<
		(typeof dataTypes)[keyof typeof dataTypes]
	>(dataTypes.userTimeline);
	const statusesCount = user
		? dataType === dataTypes.userTimeline
			? user.statuses_count
			: user.favourites_count
		: 0;
	const {pdf} = exportTypes;

	function startAnalyze() {
		start(
			statusesCount,
			dataType === dataTypes.userTimeline
				? '/statuses/user_timeline'
				: '/favorites',
		);
	}

	function doExport() {
		if (exportType !== exportTypes.pdf) {
			exporters[exportType](fullList);
		}
	}

	return (
		<div>
			<div
				className="nes-container with-title is-centered"
				style={{width: '90vw', maxWidth: 800, margin: '40px auto 20px auto'}}
			>
				<p className="title" style={{fontSize: 24, margin: '-3rem auto 1rem'}}>
					饭否消息备份工具
				</p>

				{sessionError !== '' && <p role="alert">{sessionError}</p>}
				{user ? (
					<>
						<p>
							你好，
							<img
								className="nes-avatar is-small"
								alt="avatar"
								src={user.profile_image_url}
								style={{imageRendering: 'pixelated'}}
							/>{' '}
							{user.name}。
						</p>

						<p>选择你要备份的内容：</p>

						<RadioOptions
							name="data-type"
							options={Object.values(dataTypes)}
							value={dataType}
							disabled={started}
							onChange={(value) => {
								setDataType(value);
							}}
						/>

						{started ? (
							<>
								<p>
									你有 {pageCount} 页预计 {statusesCount} 条{dataType}待导出，
								</p>
								<p>开始获取{dataType}..</p>
								<p>
									<progress
										className="nes-progress is-pattern"
										value={currentPage}
										max={Math.max(1, pageCount)}
									/>
								</p>
								<p>
									实际已获取{' '}
									<StatusCount
										start={prevStatusCount}
										end={statusCount}
										duration={done ? 1 : 3}
									/>{' '}
									条{dataType}。
								</p>
								{done && <p>获取完毕。</p>}
								{backupError !== '' && <p role="alert">{backupError}</p>}
								{backupError !== '' && !isFetching && (
									<p>
										<button
											type="button"
											className="nes-btn"
											onClick={() => {
												void retry();
											}}
										>
											重试
										</button>
									</p>
								)}
								{done && (
									<>
										<p>选择导出格式：</p>
										<RadioOptions
											name="export-type"
											options={Object.values(exportTypes)}
											value={exportType}
											onChange={(value) => {
												setExportType(value);
											}}
										/>
									</>
								)}
								{done && fullList.length > 1000 && (
									<p style={{color: 'grey'}}>
										消息数量超过 1000 条，PDF 类型在线导出较慢。建议选择
										MARKDOWN 导出后自行使用其他工具转换为 PDF。
									</p>
								)}
								<p>
									{done && exportType === pdf ? (
										<Suspense fallback={<span>正在加载 PDF 导出..</span>}>
											<PdfExport fullList={fullList} />
										</Suspense>
									) : (
										<button
											className={`nes-btn ${
												done ? 'is-success' : 'is-disabled'
											}`}
											disabled={!done}
											type="button"
											onClick={doExport}
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
										location.reload();
									}}
								>
									{done ? '返回' : '停止'}
								</button>
							</>
						) : (
							<p>
								<button
									type="button"
									className="start-backup nes-pointer"
									onClick={startAnalyze}
								>
									{'> 点击这里开始备份 <'}
								</button>
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
							onClick={logout}
						>
							退出
						</button>
					</>
				) : isLoggingIn ? (
					<p>正在登录..</p>
				) : (
					<p>
						<button
							type="button"
							className="nes-btn is-primary"
							onClick={() => {
								void login();
							}}
						>
							登录
						</button>
					</p>
				)}
			</div>
			{/* <aside className="mobile-client-notice" aria-label="小饭手机客户端">
				<p>
					我还做了一个手机版饭否客户端
					<a
						href="https://testflight.apple.com/join/1rnhbU9N"
						rel="noopener noreferrer"
						target="_blank"
					>
						「小饭 iOS」
					</a>
					，也支持数据备份和导出。
				</p>
			</aside> */}
			<Footer user={user} />
		</div>
	);
}

function Footer({user}: {user: ExportUser | undefined}) {
	const heartColor = user?.profile_link_color ?? '#ff4321';
	return (
		<p style={{textAlign: 'center'}}>
			<span style={{fontWeight: 700}}>{'<'}</span>
			<span style={{fontWeight: 700, marginLeft: 2}}>{'>'}</span>
			{' with '}
			<PlaystaMore
				id={user?.id}
				uniqueId={user?.unique_id}
				heartColor={heartColor === '' ? '#ff4321' : heartColor}
				fallback={
					<i
						className="nes-icon is-small heart nes-pointer"
						style={{marginTop: -4, marginBottom: -4}}
					/>
				}
			/>
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
	);
}
