[Home](../README.md) > Development

# Development

The following steps should be performed to run the web development by assuming the [preparation steps](preparation.md) are already performed and have an [AWS account](https://aws.amazon.com/):

1. Acquire [AWS security credentials](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html), then replace all the `YOUR_AWS_ACCESS_KEY` and `YOUR_AWS_SECRET_KEY` accordingly with your actual generated keys inside the project directory.
1. Create a `recorded-audio` AWS DynamoDB table. Set `id` (String) as the Partition key, and `fileId` (String) as the Sort key.
1. Create a `recorded-audio-files` AWS S3 bucket. Go to _Permissions_, set _Block all access_ to `Off`, set the _Bucket policy_ and _CORS_ as follows:

Bucket policy:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicListGet",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:List*",
                "s3:Get*"
            ],
            "Resource": [
                "arn:aws:s3:::recorded-audio-files",
                "arn:aws:s3:::recorded-audio-files/*"
            ]
        }
    ]
}
```

CORS:

```
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "POST",
            "GET",
            "PUT",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3080"
        ],
        "ExposeHeaders": []
    }
]
```

5. Update all the `AWS_REGION` environment variables inside the project directory.

6. Finally run `docker-compose -f docker-compose-dev.yml up --build` command to serve the proposed web app in the development environment.
