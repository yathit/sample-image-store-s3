#!/bin/sh

# setup S3 bucket using aws cli
export S3BK=ydn-db-sample-image-store-s3

aws s3 mb s3://$S3BK
aws s3api put-bucket-policy --bucket $S3BK --policy file://policy.json

aws s3api put-bucket-cors --bucket $S3BK --cors-configuration file://cors.json