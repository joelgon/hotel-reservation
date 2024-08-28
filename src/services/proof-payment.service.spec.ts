import dayjs from 'dayjs';
import { PreconditionFailed } from 'http-errors';

import { ProofPaymentService } from './proof-payment.service';
import { PROOF_PAYMENT_BUCKET } from '../common/constant/cloud-storage.constant';
import { logger } from '../common/utils/logger.util';
import { ProofPaymentDto } from '../dtos/proof-payment.dto';
import { GenerateProofProvider } from '../providers/generate-prof.provider';
import { SaveFileProvider } from '../providers/save-file.provider';
import { CustomerRepository } from '../repositories/customer.repository';

jest.mock('../repositories/customer.repository');
jest.mock('../providers/save-file.provider');
jest.mock('../providers/generate-prof.provider');
jest.mock('../common/utils/logger.util');

describe('ProofPaymentService', () => {
  let proofPaymentService: ProofPaymentService;
  let customerRepository: jest.Mocked<CustomerRepository>;
  let saveFileProvider: jest.Mocked<SaveFileProvider>;
  let generateProofProvider: jest.Mocked<GenerateProofProvider>;

  beforeEach(() => {
    proofPaymentService = new ProofPaymentService();
    customerRepository = CustomerRepository.prototype as jest.Mocked<CustomerRepository>;
    saveFileProvider = SaveFileProvider.prototype as jest.Mocked<SaveFileProvider>;
    generateProofProvider = GenerateProofProvider.prototype as jest.Mocked<GenerateProofProvider>;
  });

  it('should generate proof of payment successfully', async () => {
    const proofPaymentMessaging: ProofPaymentDto = {
      customerId: '123',
      reservationId: '456',
      totalValue: 1000,
      days: 4,
      dailyValue: 250,
      checkIn: '2024-01-01' as any as Date,
      checkOut: '2024-01-05' as any as Date,
    };

    const customer = { name: 'John Doe' };
    const pdfBytes = new Uint8Array([1, 2, 3]);

    customerRepository.findById.mockResolvedValue(<any>customer);
    generateProofProvider.execute.mockResolvedValue(pdfBytes);
    saveFileProvider.execute.mockResolvedValue(true);

    await proofPaymentService.execute(proofPaymentMessaging);

    expect(customerRepository.findById).toHaveBeenCalledWith('123');
    expect(generateProofProvider.execute).toHaveBeenCalledWith({
      name: 'John Doe',
      totalValue: 1000,
      days: 4,
      dailyValue: 250,
      checkIn: dayjs('2024-01-01').format('D [de] MMMM [de] YYYY'),
      checkOut: dayjs('2024-01-05').format('D [de] MMMM [de] YYYY'),
    });
    expect(saveFileProvider.execute).toHaveBeenCalledWith({
      file: pdfBytes,
      bucket: PROOF_PAYMENT_BUCKET,
      contentType: 'application/pdf',
      key: '123/456.pdf',
    });
    expect(logger.info).toHaveBeenCalledWith({ proofPaymentMessaging }, 'Start generate proof');
    expect(logger.info).toHaveBeenCalledWith({ proofPaymentMessaging }, 'End generate proof');
  });

  it('should throw PreconditionFailed if customer is not found', async () => {
    const proofPaymentMessaging: ProofPaymentDto = {
      customerId: '123',
      reservationId: '456',
      totalValue: 1000,
      days: 4,
      dailyValue: 250,
      checkIn: '2024-01-01' as any as Date,
      checkOut: '2024-01-05' as any as Date,
    };

    customerRepository.findById.mockResolvedValue(<any>null);

    await expect(proofPaymentService.execute(proofPaymentMessaging)).rejects.toThrow(PreconditionFailed);

    expect(logger.info).toHaveBeenCalledWith({ proofPaymentMessaging }, 'Start generate proof');
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('should throw PreconditionFailed if saving file fails', async () => {
    const proofPaymentMessaging: ProofPaymentDto = {
      customerId: '123',
      reservationId: '456',
      totalValue: 1000,
      days: 4,
      dailyValue: 250,
      checkIn: '2024-01-01' as any as Date,
      checkOut: '2024-01-05' as any as Date,
    };

    const customer = { name: 'John Doe' };
    const pdfBytes = new Uint8Array([1, 2, 3]);

    customerRepository.findById.mockResolvedValue(<any>customer);
    generateProofProvider.execute.mockResolvedValue(pdfBytes);
    saveFileProvider.execute.mockResolvedValue(false);

    await expect(proofPaymentService.execute(proofPaymentMessaging)).rejects.toThrow(PreconditionFailed);

    expect(saveFileProvider.execute).toHaveBeenCalledWith({
      file: pdfBytes,
      bucket: PROOF_PAYMENT_BUCKET,
      contentType: 'application/pdf',
      key: '123/456.pdf',
    });
    expect(logger.info).toHaveBeenCalledWith({ proofPaymentMessaging }, 'Start generate proof');
    expect(logger.error).not.toHaveBeenCalled();
  });
});
