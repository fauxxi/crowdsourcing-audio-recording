const aws = require('aws-sdk');

const client = new aws.DynamoDB.DocumentClient({
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_KEY,
	region: process.env.AWS_REGION,
	params: {
		TableName: process.env.DYNAMODB_TABLE_NAME,
	},
});

module.exports = {
	get: (params) => client.get(params).promise(),
	put: (params) => client.put(params).promise(),
	query: (params) => client.query(params).promise(),
	update: (params) => client.update(params).promise(),
	delete: (params) => client.delete(params).promise(),
	batchWrite: (params) => client.batchWrite(params).promise(),
};
