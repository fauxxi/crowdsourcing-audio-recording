const { sign, verify } = require('jsonwebtoken');

const createToken = (payload) => {
	const accessToken = sign(payload, process.env.JWT_TOKEN_SECRET);

	return accessToken;
};

const validateToken = (req, res, next) => {
	const accessToken = req.cookies['access-token'];

	if (!accessToken) {
		return res.json({ auth: false, error: 'Access Token Not Found' });
	}

	try {
		const validToken = verify(accessToken, process.env.JWT_TOKEN_SECRET);
		console.log('validToken', validToken);
		if (validToken) {
			req.authenticated = true;
			req.username = validToken.username;
			return next();
		}
	} catch (err) {
		return res.json({ auth: false, error: 'Access Token is not valid' });
	}
};

module.exports = { createToken, validateToken };
