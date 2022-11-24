const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const _ = require('lodash');
const S3 = require('aws-sdk/clients/s3');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const { createToken, validateToken } = require('./JWT');
const dynamoDb = require('./db');
const zipFile = require('./zipper');

const PORT = 5000;

const config = {
	api: {
		bodyParser: {
			sizeLimit: '8mb', // Set desired value here
		},
	},
};

const s3 = new S3({
	region: process.env.AWS_REGION,
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_KEY,
	signatureVersion: 'v4',
});

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.get('/verify', validateToken, async (req, res) => {
	res.json({ auth: true, username: req.username });
});

app.post('/auth', async (req, res) => {
	const authenticatedUser = process.env.USERNAME;
	const authenticatedPassword = process.env.PASSWORD;

	const { username, password } = req.body.credential;

	console.log('auth req.body', req.body);

	if (username === authenticatedUser && password === authenticatedPassword) {
		const accessToken = createToken({ username });
		res.cookie('access-token', accessToken, {
			maxAge: 60 * 60 * 24 * 30 * 1000,
			httpOnly: true,
		});
		// req.session.user = username;

		res.json({ auth: true, token: accessToken, user: username });
	} else {
		res.json({ auth: false, err: 'Authentication failed' });
	}
});

app.get('/db', validateToken, async (req, res) => {
	const { Item } = await dynamoDb.get({
		Key: {
			id: req.query.id,
			fileId: req.query.fileId,
		},
	});

	res.status(200).json(Item);
});

app.put('/db', async (req, res) => {
	const recordedAudio = { ...req.body, date: Date.now() };
	await dynamoDb.put({
		Item: { ...req.body, date: Date.now() },
	});

	res.status(201).json(recordedAudio);
});

app.post('/db', async (req, res) => {
	const { Attributes } = await dynamoDb.update({
		Key: {
			id: req.query.id,
			fileId: req.query.fileId,
		},
		UpdateExpression:
			'SET sessionId = :sessionId, date = :date, url = :url, label = :label, fileName = :fileName, duration = :duration, fileSize = :fileSize',
		ExpressionAttributeValues: {
			':sessionId': req.body.sessionId || null,
			':label': req.body.label || null,
			':fileName': req.body.fileName || null,
			':duration': req.body.duration || null,
			':fileSize': req.body.fileSize || null,
			':url': req.body.url || null,
			':date': Date.now(),
		},
		ReturnValues: 'ALL_NEW',
	});

	res.status(200).json(Attributes);
});

app.delete('/db', validateToken, async (req, res) => {
	await dynamoDb.delete({
		Key: {
			id: req.query.id,
			fileId: req.query.fileId,
		},
	});

	res.status(204).json({});
});

app.post('/delete-labels', validateToken, async (req, res) => {
	console.log('req.body', req.body.labels);
	const tableItems = [];
	req.body.labels.forEach((label) => {
		const par = {
			DeleteRequest: {
				Key: {
					id: label.id,
					fileId: label.fileId,
				},
			},
		};

		tableItems.push(par);
	});
	const params = {
		RequestItems: {
			// delete 2 items in a batch for one table
			[process.env.DYNAMODB_TABLE_NAME]: tableItems,
		},
	};

	await dynamoDb.batchWrite(params);

	res.status(200).json({ message: 'table items deleted' });
});

app.get('/recordings', validateToken, async (req, res) => {
	const queryParams = {
		KeyConditionExpression: 'id = :id',
		ExpressionAttributeValues: {
			':id': 'RECORDING',
		},
	};

	const data = await dynamoDb.query(queryParams);

	res.status(200).json(data.Items);
});

app.post('/upload', async (req, res) => {
	let { label, name, type } = req.body;

	const fileParams = {
		Bucket: process.env.S3_BUCKET_NAME,
		Key: `${label}/${name}`,
		Expires: 600,
		ContentType: type,
	};

	try {
		const url = await s3.getSignedUrlPromise('putObject', fileParams);

		res.status(200).json({ url });
	} catch (err) {
		console.log(err);
		res.status(400).json({ message: err });
	}
});

app.post('/zip', validateToken, async function (req, res) {
	if (req.body) {
		const files = req.body.labels;
		const mfStream = zipFile.multiFilesStream(files);
		res.setHeader('Content-Type', 'application/zip');
		// res is the response object in the http request. You may want to create your own write stream object to write files in your local machine
		mfStream.pipe(res);

		// use finalize function to start the process
		mfStream.finalize();
	}
});

app.listen(PORT, () => {
	console.log(process.env.AWS_REGION);
	console.log('Server listening on port 5000');
});
