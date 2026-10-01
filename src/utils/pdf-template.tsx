import {Fragment} from 'react';
import {
	PDFDownloadLink,
	Document,
	Page,
	Text,
	Link,
	StyleSheet,
	Font,
} from '@react-pdf/renderer';
import moment from 'moment';
import type {ExportStatus} from '../types.ts';
import Zpix from '../fonts/Zpix.ttf';

// Register the font when this lazy-loaded module is initialized, before rendering PDF text.
// eslint-disable-next-line unicorn/no-top-level-side-effects
Font.register({family: 'Zpix', src: Zpix});

const styles = StyleSheet.create({
	body: {
		paddingTop: 35,
		paddingBottom: 65,
		paddingHorizontal: 35,
		fontFamily: 'Zpix',
	},
	status: {
		margin: 5,
		fontSize: 12,
	},
	text: {
		lineHeight: 1.5,
	},
	time: {
		fontSize: 12,
		lineHeight: 1.5,
		textAlign: 'right',
	},
	link: {
		color: '#00ccff',
	},
	image: {
		width: 100,
		marginLeft: 'auto',
		marginRight: 0,
		marginBottom: 10,
	},
	header: {
		fontSize: 12,
		marginBottom: 20,
		textAlign: 'center',
		color: 'grey',
	},
	pageNumber: {
		position: 'absolute',
		fontSize: 12,
		bottom: 30,
		left: 0,
		right: 0,
		textAlign: 'center',
		color: 'grey',
	},
});

const StatusText = ({status}: {status: ExportStatus}) =>
	status.txt.map((item, i) => {
		switch (item.type) {
			case 'at': {
				return (
					<Link
						key={`at-${status.id}-${String(i)}`}
						style={{...styles.text, ...styles.link}}
						src={`https://fanfou.com/${item.id}`}
					>
						{item.text}
					</Link>
				);
			}

			case 'link': {
				return (
					<Link
						key={`link-${status.id}-${String(i)}`}
						style={{...styles.text, ...styles.link}}
						src={item.text}
					>
						{item.text}
					</Link>
				);
			}

			case 'tag': {
				return (
					<Link
						key={`tag-${status.id}-${String(i)}`}
						style={{...styles.text, ...styles.link}}
						src={`https://fanfou.com/q/${item.query}`}
					>
						{item.text.split('')}
					</Link>
				);
			}

			case 'text': {
				return (
					<Text key={`text-${status.id}-${String(i)}`} style={styles.text}>
						{item.text.split('')}
					</Text>
				);
			}
		}

		throw new Error('Unknown export entity type');
	});

const PdfDocument = ({fullList}: {fullList: readonly ExportStatus[]}) => (
	<Document>
		<Page style={styles.body}>
			<Text style={styles.header}>饭否消息备份</Text>
			{fullList.map((status, i) => (
				<Fragment key={`status-${status.id}-${String(i)}`}>
					<Text style={styles.status}>
						<StatusText status={status} />
					</Text>
					{status.photo && (
						<Link
							style={{...styles.time, ...styles.link}}
							src={status.photo.originurl}
						>
							[图]
						</Link>
					)}
					<Text style={styles.time}>
						通过{' '}
						{status.source_url === '' ? (
							<Text style={styles.link}>{status.source_name}</Text>
						) : (
							<Link style={styles.link} src={status.source_url}>
								{status.source_name}
							</Link>
						)}
					</Text>
					<Text style={styles.time}>
						{moment(new Date(status.created_at))
							.local()
							.format('YYYY-MM-DD HH:mm:ss')}
					</Text>
				</Fragment>
			))}
		</Page>
	</Document>
);

export default function PdfExport({
	fullList,
}: {
	fullList: readonly ExportStatus[];
}) {
	return (
		<PDFDownloadLink
			document={<PdfDocument fullList={fullList} />}
			fileName="backup.pdf"
		>
			{({url, loading, error}) => (
				<span
					className={`nes-btn ${url !== null && url !== '' && !loading && !error ? 'is-success' : 'is-disabled'}`}
				>
					{error
						? 'PDF 生成失败'
						: loading || url === null || url === ''
							? '正在生成 PDF'
							: '导出'}
				</span>
			)}
		</PDFDownloadLink>
	);
}
