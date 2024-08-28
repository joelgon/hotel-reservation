import { Logger } from "pino";
import { PreconditionFailed } from 'http-errors'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as dayjs from 'dayjs';

import { CustomerRepository } from "../repositories/customer.repository";
import { SaveFileProvider } from "../providers/save-file.provider";
import { logger } from "../utils/logger.util";
import { ProofPaymentDto } from "../dtos/proof-payment.dto";
import { PROOF_PAYMENT_BUCKET } from "../common/constant/cloud-storage.constant";

import 'dayjs/locale/pt-br';
dayjs.locale('pt-br');

export class ProofPaymentService {
    private readonly logger: Logger;
    private readonly customerRepository: CustomerRepository;
    private readonly saveFileProvider: SaveFileProvider;

    constructor() {
        this.logger = logger;
        this.customerRepository = new CustomerRepository();
        this.saveFileProvider = new SaveFileProvider();
    }

    async execute(proofPaymentMessaging: ProofPaymentDto) {
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

        const isSuccess = await this.saveFileProvider.execute({ 
            file: pdfBytes,
            bucket: PROOF_PAYMENT_BUCKET,
            contentType: 'application/pdf',
            key: `${proofPaymentMessaging.customerId}/${proofPaymentMessaging.reservationId}`
        });

        if (!isSuccess) throw new PreconditionFailed();
    }
}