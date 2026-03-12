import { jsPDF } from 'jspdf';

/**
 * Generate a professional certificate PDF
 * @param {Object} certData - Certificate data
 * @param {string} certData.recipientName - Name of the certificate recipient
 * @param {string} certData.certificateName - Name/title of the certificate
 * @param {string} certData.issuer - Organization/issuer name
 * @param {string} certData.date - Issue date
 * @param {string} certData.credentialId - Credential/certificate ID
 * @param {string} certData.description - Achievement description
 * @param {string} certData.authorityName - Name of signing authority (optional)
 * @param {string} certData.authorityTitle - Title of signing authority (optional)
 */
export const generateCertificatePDF = (certData) => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Colors inspired by the new certificate style
  const navy = [22, 53, 95];
  const gold = [237, 184, 48];
  const gray = [90, 90, 90];

  const drawTopLeftLogo = () => {
    const logoX = 10;
    const logoY = 10;
    const logoWidth = 32;
    const logoHeight = 32;
    const logoUrl = 'https://static.vecteezy.com/system/resources/previews/009/634/721/non_2x/vrd-letter-logo-design-with-polygon-shape-vrd-polygon-and-cube-shape-logo-design-vrd-hexagon-logo-template-white-and-black-colors-vrd-monogram-business-and-real-estate-logo-vector.jpg';
    pdf.addImage(logoUrl, 'JPEG', logoX, logoY, logoWidth, logoHeight);
  };

  // Base white card with subtle border
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.6);
  pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Decorative corner ribbons (blue + gold)
  pdf.setFillColor(...navy);
  pdf.triangle(0, 0, 70, 0, 0, 22, 'F');
  pdf.triangle(pageWidth, pageHeight, pageWidth - 70, pageHeight, pageWidth, pageHeight - 22, 'F');

  pdf.setFillColor(...gold);
  pdf.triangle(pageWidth, 0, pageWidth - 26, 0, pageWidth, 26, 'F');
  pdf.triangle(0, pageHeight, 26, pageHeight, 0, pageHeight - 26, 'F');

  // Side decorative wave-like accents
  pdf.setDrawColor(190, 190, 190);
  pdf.setLineWidth(0.2);
  for (let i = 0; i < 6; i++) {
    pdf.ellipse(14, 78 + i * 2, 20 + i * 2, 8 + i, 'S');
    pdf.ellipse(pageWidth - 14, 120 + i * 2, 20 + i * 2, 8 + i, 'S');
  }

  // Top-left logo
  drawTopLeftLogo();

  // Header
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(24);
  pdf.text('Certificate of Achievement', pageWidth / 2, 34, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(20, 20, 20);
  pdf.text('This certificate is proudly awarded to', pageWidth / 2, 54, { align: 'center' });

  // Recipient name
  const recipientName = certData.recipientName || 'Recipient Name';
  pdf.setFont('times', 'italic');
  pdf.setFontSize(28);
  pdf.setTextColor(0, 0, 0);
  pdf.text(recipientName, pageWidth / 2, 72, { align: 'center' });

  const nameWidth = pdf.getTextWidth(recipientName);
  pdf.setDrawColor(120, 120, 120);
  pdf.setLineWidth(0.35);
  pdf.line(pageWidth / 2 - (nameWidth / 2) - 8, 75, pageWidth / 2 + (nameWidth / 2) + 8, 75);

  // Description
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(11.5);
  pdf.setTextColor(...gray);
  const description = certData.description ||
    `${recipientName} has successfully completed ${certData.certificateName || 'the certification program'} and demonstrated outstanding performance.`;
  const descLines = pdf.splitTextToSize(description, pageWidth - 90);
  pdf.text(descLines, pageWidth / 2, 88, { align: 'center', maxWidth: pageWidth - 90 });

  // Center medal/ribbon motif
  const medalX = pageWidth / 2;
  const medalY = 132;

  pdf.setFillColor(255, 215, 80);
  pdf.circle(medalX, medalY, 10, 'F');
  pdf.setFillColor(245, 195, 55);
  pdf.circle(medalX, medalY, 7, 'F');

  pdf.setDrawColor(227, 168, 33);
  pdf.setLineWidth(0.8);
  for (let i = 0; i < 14; i++) {
    const angle = (i * Math.PI * 2) / 14;
    const x1 = medalX + Math.cos(angle) * 10;
    const y1 = medalY + Math.sin(angle) * 10;
    const x2 = medalX + Math.cos(angle) * 14;
    const y2 = medalY + Math.sin(angle) * 14;
    pdf.line(x1, y1, x2, y2);
  }

  pdf.setFillColor(247, 201, 58);
  pdf.triangle(medalX - 6, medalY + 9, medalX - 1.5, medalY + 30, medalX - 11, medalY + 26, 'F');
  pdf.triangle(medalX + 6, medalY + 9, medalX + 11, medalY + 26, medalX + 1.5, medalY + 30, 'F');

  // Signature section
  const leftX = pageWidth / 4;
  const rightX = (3 * pageWidth) / 4;
  const signatureY = 178;

  pdf.setDrawColor(90, 90, 90);
  pdf.setLineWidth(0.35);
  pdf.line(leftX - 26, signatureY, leftX + 26, signatureY);
  pdf.line(rightX - 26, signatureY, rightX + 26, signatureY);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(35, 35, 35);
  pdf.text(certData.authorityName || certData.issuer || 'Authorized Signatory', leftX, signatureY + 8, { align: 'center' });
  pdf.text(certData.mentorName || 'Program Mentor', rightX, signatureY + 8, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(certData.authorityTitle || 'SIGNATURE', leftX, signatureY + 14, { align: 'center' });
  pdf.text(certData.mentorTitle || 'SIGNATURE', rightX, signatureY + 14, { align: 'center' });

  // Footer
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);

  const footerY = pageHeight - 12;
  if (certData.credentialId) {
    pdf.text(`Credential ID: ${certData.credentialId}`, 18, footerY);
  }

  const dateText = certData.date
    ? new Date(certData.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  pdf.text(`Issue Date: ${dateText}`, pageWidth - 18, footerY, { align: 'right' });

  return pdf;
};

/**
 * Download certificate as PDF
 */
export const downloadCertificate = (certData) => {
  const pdf = generateCertificatePDF(certData);
  const fileName = `Certificate_${certData.recipientName?.replace(/\s+/g, '_') || 'Download'}_${Date.now()}.pdf`;
  pdf.save(fileName);
};

/**
 * Preview certificate in new tab
 */
export const previewCertificate = (certData) => {
  const pdf = generateCertificatePDF(certData);
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};
