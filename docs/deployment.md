[Home](../README.md) > Development

# Development

The following steps should be performed to run the web development by assuming the [preparation steps](preparation.md) are already performed and have an [AWS account](https://aws.amazon.com/):

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
            "https://YOUR-DOMAIN"
        ],
        "ExposeHeaders": []
    }
]
```

3. Create an [AWS Route 53 public hosted zone](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html).
4. Request a public certificate from AWS Certificate Manager (ACM)
5. Create an [AWS EC2 instance](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html).
6. Create an [Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-listeners.html). This will add an HTTPS to the proposed web app, without HTTPS, the proposed web app would not work.
7. Create a Load Balancer record in Route 53 to redirect the Load Balancer to the actual domain.
8. Connect to the newly created instance using an SSH client. Then install Docker following this [instruction](https://gist.github.com/npearce/6f3c7826c7499587f00957fee62f8ee9).
9. Acquire [AWS security credentials](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html), then replace all the `YOUR_AWS_ACCESS_KEY` and `YOUR_AWS_SECRET_KEY` accordingly with your actual keys inside the project directory.

10. Finally run `docker-compose up --build` command to serve the proposed web app in the production environment.

Now the proposed web app is working and ready to use on a crowdsourcing platform like AWS MTurk.
