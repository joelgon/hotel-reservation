import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface IProofPayment {
  name: string;
  totalValue: number;
  checkIn: string;
  checkOut: string;
  days: number;
  dailyValue: number;
}

export class GenerateProofProvider {
  async execute({ name, totalValue, checkIn, checkOut, days, dailyValue }: IProofPayment): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();

    const titleFontSize = 18;
    const textFontSize = 12;

    page.drawText('Comprovante de Pagamento', {
      x: 50,
      y: height - 50,
      size: titleFontSize,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Nome do Cliente: ${name}`, {
      x: 50,
      y: height - 80,
      size: textFontSize,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Valor Total: R$ ${totalValue}`, {
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

    page.drawText(`Check-in: ${checkIn}`, {
      x: 70,
      y: height - 140,
      size: textFontSize,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Check-out: ${checkOut}`, {
      x: 70,
      y: height - 160,
      size: textFontSize,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Número de Dias: ${days}`, {
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

    page.drawText(`Valor da Diária: R$ ${dailyValue} por noite`, {
      x: 70,
      y: height - 220,
      size: textFontSize,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Valor Total da Estadia: R$ ${totalValue} (Calculado como ${days} noites x R$ ${dailyValue} por noite)`, {
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

    return pdfDoc.save();
  }
}
