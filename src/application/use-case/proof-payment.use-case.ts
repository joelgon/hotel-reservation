import { Logger } from "pino";
import { PreconditionFailed } from 'http-errors'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

import { ICustomerRepository } from "../../domain/repositories/customer.repository";
import { IProofPaymentMessaging } from "../../domain/messaging/proof-payment.messaging";
import { PROOF_PAYMENT_BUCKET, PROOF_PAYMENT_KEY } from "../../common/constant/cloud-storage.constant";
import dayjs = require("dayjs");

import 'dayjs/locale/pt-br';
import { SaveFile } from "../../infra/cloud-storage/save-file";
dayjs.locale('pt-br');

export class ProofPaymentUseCase {
    private readonly logger: Logger;
    private readonly customerRepository: ICustomerRepository;
    private readonly saveFile: SaveFile;

    constructor(logger: Logger, customerRepository: ICustomerRepository) {
        this.logger = logger;
        this.customerRepository = customerRepository;
    }

    async execute(proofPaymentMessaging: IProofPaymentMessaging) {
        const customer = await this.customerRepository.findById(proofPaymentMessaging.customerId);
        if (!customer) throw new PreconditionFailed();

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const { width, height } = page.getSize();

        const titleFontSize = 18;
        const textFontSize = 12;

        page.drawText('Comprovante de Pagamento', {
            x: 50,
            y: height - 50,
            size: titleFontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Nome do Cliente: ${customer.name}`, {
            x: 50,
            y: height - 80,
            size: textFontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Valor Total: R$ ${proofPaymentMessaging.totalValue}`, {
            x: 50,
            y: height - 100,
            size: textFontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        page.drawText('Período da Estadia:', {
            x: 50,
            y: height - 120,
            size: textFontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Check-in: ${proofPaymentMessaging.checkIn}`, {
            x: 70,
            y: height - 140,
            size: textFontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Check-out: ${proofPaymentMessaging.checkOut}`, {
            x: 70,
            y: height - 160,
            size: textFontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Número de Dias: ${proofPaymentMessaging.days}`, {
            x: 50,
            y: height - 180,
            size: textFontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        page.drawText('Detalhamento do Pagamento:', {
            x: 50,
            y: height - 200,
            size: textFontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Valor da Diária: R$ ${proofPaymentMessaging.dailyValue} por noite`, {
            x: 70,
            y: height - 220,
            size: textFontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Valor Total da Estadia: R$ ${proofPaymentMessaging.totalValue} (Calculado como ${proofPaymentMessaging.days} noites x R$ ${proofPaymentMessaging.dailyValue} por noite)`, {
            x: 50,
            y: height - 240,
            size: textFontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        page.drawText('Obrigado por escolher nossos serviços. Desejamos a você uma excelente estadia!', {
            x: 50,
            y: height - 270,
            size: textFontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        const pdfBytes = await pdfDoc.save();

        const isSuccess = await this.saveFile.execute({ 
            file: pdfBytes, 
            bucket: PROOF_PAYMENT_BUCKET, 
            contentType: 'application/pdf', 
            key: `${proofPaymentMessaging.customerId}/${proofPaymentMessaging.reservationId}`
        });

        if (!isSuccess) throw new PreconditionFailed();
    }
}