let archiver = require('archiver');
let aws = require('aws-sdk');
const S3 = new aws.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_KEY,
	region: process.env.AWS_REGION,
	signatureVersion: 'v4',
});
const { PassThrough } = require('stream');

const createZipFile = (fileName) => {
	let zip = new archiver.create('zip');
	return new Promise(function (resolve, reject) {
		S3.getObject(
			{ Bucket: process.env.S3_BUCKET_NAME, Key: fileName },
			function (err, data) {
				if (err) {
					console.log(err);
					reject(err);
				} else {
					zip.append(data.Body, {
						name: fileName,
					});
					zip.finalize();
					resolve(zip);
				}
			}
		);
	});
};

async function emptyS3Directory(bucket, dir) {
	const listParams = {
		Bucket: bucket,
		Prefix: dir,
	};

	const listedObjects = await S3.listObjectsV2(listParams).promise();

	if (listedObjects.Contents.length === 0) return;

	const deleteParams = {
		Bucket: bucket,
		Delete: { Objects: [] },
	};

	listedObjects.Contents.forEach(({ Key }) => {
		deleteParams.Delete.Objects.push({ Key });
	});

	await S3.deleteObjects(deleteParams).promise();

	if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
}

const multiFilesStream = (infos) => {
	// using archiver package to create archive object with zip setting -> level from 0(fast, low compression) to 10(slow, high compression)
	const archive = archiver('zip', { zlib: { level: 5 } });

	const items = infos;
	const labels = [...new Set(items.map((item) => item.label))];
	const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
	const header = Object.keys(items[0]);
	const csv = [
		header.join(';'), // header row first
		...items.map((row) =>
			header
				.map((fieldName) => JSON.stringify(row[fieldName], replacer))
				.join(';')
		),
	].join('\r\n');

	let csvName = '';

	if (labels.length > 1) {
		csvName = 'metadata.csv';
	} else {
		csvName =
			infos.length > 1
				? `${infos[0].label}/metadata_${infos[0].label}.csv`
				: `metadata_${infos[0].fileName.replace('.wav', '')}.csv`;
	}

	archive.append(csv, {
		name: csvName,
	});

	// console.log('infos:', infos);

	for (let i = 0; i < infos.length; i += 1) {
		// using pass through stream object to wrap the stream from aws s3
		const passthrough = new PassThrough();
		S3.getObject({
			Bucket: process.env.S3_BUCKET_NAME,
			Key: `${infos[i].label}/${infos[i].fileName}`,
		})
			.createReadStream()
			.pipe(passthrough);
		// name parameter is the name of the file that the file needs to be when unzipped.
		archive.append(passthrough, {
			name:
				infos.length > 1
					? `${infos[i].label}/${infos[i].fileName}`
					: `${infos[i].fileName}`,
		});
	}
	return archive;
};
module.exports = { createZipFile, multiFilesStream };
