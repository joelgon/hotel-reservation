import dayjs from 'dayjs';
import { PreconditionFailed } from 'http-errors';
import { Logger } from 'pino';

import { PROOF_PAYMENT_BUCKET } from '../common/constant/cloud-storage.constant';
import { ProofPaymentDto } from '../dtos/proof-payment.dto';
import { GenerateProofProvider } from '../providers/generate-prof.provider';
import { SaveFileProvider } from '../providers/save-file.provider';
import { CustomerRepository } from '../repositories/customer.repository';
import { logger } from '../common/utils/logger.util';

import 'dayjs/locale/pt-br';
dayjs.locale('pt-br');

export class ProofPaymentService {
  private readonly logger: Logger;
  private readonly customerRepository: CustomerRepository;
  private readonly saveFileProvider: SaveFileProvider;
  private readonly generateProofProvider: GenerateProofProvider;

  constructor() {
    this.logger = logger;
    this.customerRepository = new CustomerRepository();
    this.saveFileProvider = new SaveFileProvider();
    this.generateProofProvider = new GenerateProofProvider();
  }

  async execute(proofPaymentMessaging: ProofPaymentDto) {
    this.logger.info({ proofPaymentMessaging }, 'Start generate proof');

    const customer = await this.customerRepository.findById(proofPaymentMessaging.customerId);
    if (!customer) throw new PreconditionFailed();

    const pdfBytes = await this.generateProofProvider.execute({
      name: customer.name,
      totalValue: proofPaymentMessaging.totalValue,
      days: proofPaymentMessaging.days,
      dailyValue: proofPaymentMessaging.dailyValue,
      checkIn: dayjs(proofPaymentMessaging.checkIn).format('D [de] MMMM [de] YYYY'),
      checkOut: dayjs(proofPaymentMessaging.checkOut).format('D [de] MMMM [de] YYYY'),
    });

    const isSuccess = await this.saveFileProvider.execute({
      file: pdfBytes,
      bucket: PROOF_PAYMENT_BUCKET,
      contentType: 'application/pdf',
      key: `${proofPaymentMessaging.customerId}/${proofPaymentMessaging.reservationId}.pdf`,
    });

    if (!isSuccess) throw new PreconditionFailed();

    this.logger.info({ proofPaymentMessaging }, 'End generate proof');
  }
}
