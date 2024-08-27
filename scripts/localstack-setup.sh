#!/bin/sh 
echo "Inicializando localstack S3"

# Criar uma fila FIFO para 'create_reservation' com suporte a Dead Letter Queue (DLQ)
awslocal sqs create-queue --queue-name create_reservation_dlq.fifo --attributes '{"FifoQueue":"true"}'
awslocal sqs create-queue --queue-name create_reservation.fifo --attributes '{"FifoQueue":"true", "RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:create_reservation_dlq.fifo\",\"maxReceiveCount\":\"5\"}"}'

# Criar uma fila FIFO para 'generate_proof' com suporte a DLQ
awslocal sqs create-queue --queue-name generate_proof_dlq.fifo --attributes '{"FifoQueue":"true"}'
awslocal sqs create-queue --queue-name generate_proof_sqs.fifo --attributes '{"FifoQueue":"true", "RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:generate_proof_dlq.fifo\",\"maxReceiveCount\":\"5\"}"}'
