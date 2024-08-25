#!/bin/sh 
echo "Inicializando localstack S3"

awslocal sqs create-queue --queue-name create_reservation_dlq
awslocal sqs create-queue --queue-name create_reservation --attributes '{"RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:create_reservation_dlq\",\"maxReceiveCount\":\"5\"}"}'
awslocal sqs create-queue --queue-name generate_proof_dlq
awslocal sqs create-queue --queue-name generate_proof_sqs --attributes '{"RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:generate_proof_dlq\",\"maxReceiveCount\":\"5\"}"}'
