import React from 'react';
import {
	PDFDownloadLink,
	Document,
	Page,
	Text,
	Image,
	Link,
	StyleSheet,
	Font
} from '@react-pdf/renderer';
import moment from 'moment';
import Zpix from '../fonts/Zpix.ttf';

Font.register({family: 'Zpix', src: Zpix});

const styles = StyleSheet.create({
	body: {
		paddingTop: 35,
		paddingBottom: 65,
		paddingHorizontal: 35,
		fontFamily: 'Zpix'
	},
	status: {
		margin: 5,
		fontSize: 12,
		textAlign: 'justify'
	},
	text: {
		lineHeight: 1.5
	},
	time: {
		fontSize: 12,
		lineHeight: 1.5,
		textAlign: 'right'
	},
	link: {
		color: '#00ccff'
	},
	image: {
		width: 100,
		marginLeft: 'auto',
		marginRight: 0,
		marginBottom: 10
	},
	header: {
		fontSize: 12,
		marginBottom: 20,
		textAlign: 'center',
		color: 'grey'
	},
	pageNumber: {
		position: 'absolute',
		fontSize: 12,
		bottom: 30,
		left: 0,
		right: 0,
		textAlign: 'center',
		color: 'grey'
	}
});

const StatusText = ({status}) =>
	status.txt.map((item, i) => {
		switch (item.type) {
			case 'at':
				return (
					<Link
						key={`at-${status.id}-${String(i)}`}
						style={{...styles.text, ...styles.link}}
						src={`https://fanfou.com/${item.id}`}
					>
						{item.text}
					</Link>
				);
			case 'link':
				return (
					<Link
						key={`link-${status.id}-${String(i)}`}
						style={{...styles.text, ...styles.link}}
						src={item.text}
					>
						{item.text}
					</Link>
				);
			case 'tag':
				return (
					<Link
						key={`tag-${status.id}-${String(i)}`}
						style={{...styles.text, ...styles.link}}
						src={`https://fanfou.com/q/${item.query}`}
					>
						{item._text.replace(/\n/g, ' ')}
					</Link>
				);
			default:
				return (
					<Text key={`text-${status.id}-${String(i)}`} style={styles.text}>
						{item.text}
					</Text>
				);
		}
	});

export const PDFDocument = ({fullList}) => (
	<Document>
		<Page style={styles.body}>
			<Text style={styles.header}>饭否消息备份</Text>
			{fullList.map((status, i) => (
				<React.Fragment key={`status-${status.id}-${String(i)}`}>
					<Text style={styles.status}>
						<StatusText status={status} />
					</Text>
					{status.photo && (
						<Link src={status.photo.originurl}>
							<Image style={styles.image} src={status.photo.originurl} />
						</Link>
					)}
					<Text style={styles.time}>
						通过{' '}
						{status.source_url ? (
							<Link style={styles.link} src={status.source_url}>
								{status.source_name}
							</Link>
						) : (
							<Text style={styles.link}>{status.source_name}</Text>
						)}
					</Text>
					<Text style={styles.time}>
						{moment(new Date(status.created_at))
							.local()
							.format('YYYY-MM-DD HH:mm:ss')}
					</Text>
				</React.Fragment>
			))}
		</Page>
	</Document>
);

export const DownloadLink = ({document, done}) => (
	<PDFDownloadLink document={document} fileName="backup.pdf">
		{({_blob, _url, loading, _error}) =>
			done && !loading ? (
				<button className="nes-btn is-success" type="button">
					导出
				</button>
			) : (
				<button disabled className="nes-btn is-disabled" type="button">
					正在生成 PDF
				</button>
			)
		}
	</PDFDownloadLink>
);
