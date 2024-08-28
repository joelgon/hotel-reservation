#!/bin/bash
echo "Criando bucket no S3!"

awslocal s3 mb s3://proof-payment

echo "Bucket criado com sucesso no S3!"
