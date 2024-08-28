import { PDFDocument, StandardFonts } from 'pdf-lib';
import { GenerateProofProvider } from './generate-prof.provider';

jest.mock('pdf-lib');

describe('GenerateProofProvider', () => {
  let generateProofProvider: GenerateProofProvider;

  beforeEach(() => {
    generateProofProvider = new GenerateProofProvider();
  });

  it('should generate a PDF with the correct content', async () => {
    const mockPdfDoc = {
      addPage: jest.fn().mockReturnValue({
        getSize: jest.fn().mockReturnValue({ width: 595.28, height: 841.89 }),
        drawText: jest.fn(),
      }),
      embedFont: jest.fn().mockResolvedValue('mocked_font'),
      save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    };

    (PDFDocument.create as jest.Mock).mockResolvedValue(mockPdfDoc);

    const proofPayment = {
      name: 'John Doe',
      totalValue: 1000,
      checkIn: '2024-01-01',
      checkOut: '2024-01-05',
      days: 4,
      dailyValue: 250,
    };

    const result = await generateProofProvider.execute(proofPayment);

    expect(PDFDocument.create).toHaveBeenCalled();
    expect(mockPdfDoc.addPage).toHaveBeenCalledWith([595.28, 841.89]);
    expect(mockPdfDoc.embedFont).toHaveBeenCalledWith(StandardFonts.Helvetica);

    expect(mockPdfDoc.addPage().drawText).toHaveBeenCalledWith('Comprovante de Pagamento', expect.objectContaining({ x: 50, y: 791.89 }));
    expect(mockPdfDoc.addPage().drawText).toHaveBeenCalledWith(`Nome do Cliente: ${proofPayment.name}`, expect.objectContaining({ x: 50, y: 761.89 }));
    expect(mockPdfDoc.addPage().drawText).toHaveBeenCalledWith(`Valor Total: R$ ${proofPayment.totalValue}`, expect.objectContaining({ x: 50, y: 741.89 }));
    expect(mockPdfDoc.addPage().drawText).toHaveBeenCalledWith('Período da Estadia:', expect.objectContaining({ x: 50, y: 721.89 }));
    expect(mockPdfDoc.addPage().drawText).toHaveBeenCalledWith(`Check-in: ${proofPayment.checkIn}`, expect.objectContaining({ x: 70, y: 701.89 }));
    expect(mockPdfDoc.addPage().drawText).toHaveBeenCalledWith(`Check-out: ${proofPayment.checkOut}`, expect.objectContaining({ x: 70, y: 681.89 }));
    expect(mockPdfDoc.addPage().drawText).toHaveBeenCalledWith(`Número de Dias: ${proofPayment.days}`, expect.objectContaining({ x: 50, y: 661.89 }));
    expect(mockPdfDoc.addPage().drawText).toHaveBeenCalledWith('Detalhamento do Pagamento:', expect.objectContaining({ x: 50, y: 641.89 }));
    expect(mockPdfDoc.addPage().drawText).toHaveBeenCalledWith(`Valor da Diária: R$ ${proofPayment.dailyValue} por noite`, expect.objectContaining({ x: 70, y: 621.89 }));
    expect(mockPdfDoc.addPage().drawText).toHaveBeenCalledWith(`Valor Total da Estadia: R$ ${proofPayment.totalValue} (Calculado como ${proofPayment.days} noites x R$ ${proofPayment.dailyValue} por noite)`, expect.objectContaining({ x: 50, y: 601.89 }));
    expect(mockPdfDoc.addPage().drawText).toHaveBeenCalledWith('Obrigado por escolher nossos serviços. Desejamos a você uma excelente estadia!', expect.objectContaining({ x: 50, y: 571.89 }));

    expect(mockPdfDoc.save).toHaveBeenCalled();
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
  });
});
