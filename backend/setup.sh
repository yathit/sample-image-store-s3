#!/bin/sh

# setup S3 bucket using aws cli

aws s3 mb s3://ydn-db-sample-image-store-s3
aws s3api put-bucket-policy --bucket ydn-db-sample-image-store-s3 --policy file://policy.json

aws s3api put-bucket-cors --bucket ydn-db-sample-image-store-s3 --cors-configuration file://cors.json