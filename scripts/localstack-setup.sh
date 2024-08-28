#!/bin/bash
echo "Carregando arquivo no S3!"

awslocal s3 mb s3://proof-payment

awslocal s3 cp /mnt/proof_payment.docx s3://proof-payment/template/proof_payment.docx

echo "Arquivo carregado com sucesso no S3!"
