import { jsPDF } from 'jspdf';
import { CartItem, ShippingInfo } from '../types';

interface InvoiceData {
  orderId: string;
  shipping: ShippingInfo;
  cart: CartItem[];
  subtotal: number;
  shippingFee: number;
  promoCode?: string;
  discountAmount?: number;
  total: number;
  paymentMethod: string;
}

export function downloadInvoicePdf(orderData: InvoiceData): boolean {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const today = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    // Header background bar
    doc.setFillColor(15, 46, 110); // Deep Duari Blue
    doc.rect(0, 0, pageWidth, 38, 'F');

    // Brand title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('DUARI SHOP', 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('DOORSTEP DELIVERY - FAST, RELIABLE, CONVENIENT', 14, 25);
    doc.text('Web: duarishop.com | Hotline: +880 1621871225', 14, 30);

    // Invoice label on the right
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', pageWidth - 14, 18, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: #${orderData.orderId}`, pageWidth - 14, 25, { align: 'right' });
    doc.text(`Date: ${today}`, pageWidth - 14, 30, { align: 'right' });

    // Bill To & Shipping Info Section
    doc.setTextColor(40, 50, 70);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DELIVERY TO:', 14, 48);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Customer Name: ${orderData.shipping.fullName}`, 14, 54);
    doc.text(`Phone Number: ${orderData.shipping.phoneNumber}`, 14, 59);
    doc.text(`Address: ${orderData.shipping.fullAddress}`, 14, 64);
    doc.text(
      `Area: ${orderData.shipping.area}, ${orderData.shipping.zone}, ${orderData.shipping.city}`,
      14,
      69
    );

    // Order Details on the right
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER INFO:', 125, 48);

    doc.setFont('helvetica', 'normal');
    const payLabel =
      orderData.paymentMethod === 'cod'
        ? 'Cash On Delivery (COD)'
        : orderData.paymentMethod === 'pathao'
        ? 'Pathao Pay'
        : 'Digital Online Payment';

    doc.text(`Payment Method: ${payLabel}`, 125, 54);
    doc.text(`Order Status: Confirmed & Dispatched`, 125, 59);
    doc.text(`Estimated Delivery: Within 24-48 Hours`, 125, 64);
    doc.text(`Courier Service: Duari Express Doorstep`, 125, 69);

    // Items Table Header
    const startY = 78;
    doc.setFillColor(240, 244, 250);
    doc.rect(14, startY, pageWidth - 28, 8, 'F');
    doc.setDrawColor(210, 220, 235);
    doc.rect(14, startY, pageWidth - 28, 8, 'S');

    doc.setTextColor(20, 40, 80);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('SL', 18, startY + 5.5);
    doc.text('PRODUCT DESCRIPTION', 30, startY + 5.5);
    doc.text('QTY', 120, startY + 5.5, { align: 'center' });
    doc.text('UNIT PRICE', 150, startY + 5.5, { align: 'right' });
    doc.text('TOTAL (BDT)', pageWidth - 18, startY + 5.5, { align: 'right' });

    // Items Table Body
    let currentY = startY + 8;
    doc.setFont('helvetica', 'normal');

    orderData.cart.forEach((item, index) => {
      doc.setDrawColor(230, 235, 245);
      doc.line(14, currentY + 9, pageWidth - 14, currentY + 9);

      doc.setTextColor(50, 60, 80);
      doc.text(`${index + 1}`, 18, currentY + 6);

      const cleanTitle =
        item.product.title.length > 55
          ? item.product.title.substring(0, 52) + '...'
          : item.product.title;

      doc.text(cleanTitle, 30, currentY + 6);
      doc.text(`${item.quantity}`, 120, currentY + 6, { align: 'center' });
      doc.text(`BDT ${item.product.price.toLocaleString()}`, 150, currentY + 6, { align: 'right' });
      doc.text(
        `BDT ${(item.product.price * item.quantity).toLocaleString()}`,
        pageWidth - 18,
        currentY + 6,
        { align: 'right' }
      );

      currentY += 9;
    });

    // Summary section
    currentY += 6;
    const summaryX = 125;

    doc.setDrawColor(210, 220, 235);
    doc.line(summaryX, currentY, pageWidth - 14, currentY);

    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 90, 110);
    doc.text('Subtotal:', summaryX, currentY);
    doc.text(`BDT ${orderData.subtotal.toLocaleString()}`, pageWidth - 18, currentY, { align: 'right' });

    currentY += 6;
    doc.text('Doorstep Delivery Fee:', summaryX, currentY);
    doc.text(`BDT ${orderData.shippingFee.toLocaleString()}`, pageWidth - 18, currentY, { align: 'right' });

    if (orderData.discountAmount && orderData.discountAmount > 0) {
      currentY += 6;
      doc.setTextColor(22, 163, 74); // green
      const promoLabel = orderData.promoCode ? `Promo Discount (${orderData.promoCode}):` : 'Promo Discount:';
      doc.text(promoLabel, summaryX, currentY);
      doc.text(`- BDT ${orderData.discountAmount.toLocaleString()}`, pageWidth - 18, currentY, { align: 'right' });
    }

    currentY += 7;
    doc.setFillColor(245, 248, 255);
    doc.rect(summaryX - 2, currentY - 5, pageWidth - summaryX - 12, 10, 'F');
    doc.setDrawColor(15, 46, 110);
    doc.rect(summaryX - 2, currentY - 5, pageWidth - summaryX - 12, 10, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 46, 110);
    doc.setFontSize(11);
    doc.text('Total Payable:', summaryX + 2, currentY + 2);
    doc.text(`BDT ${orderData.total.toLocaleString()}`, pageWidth - 18, currentY + 2, { align: 'right' });

    // Seal / Status Stamp
    currentY += 20;
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.6);
    doc.roundedRect(14, currentY - 14, 45, 14, 2, 2, 'S');
    doc.setTextColor(22, 163, 74);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('VERIFIED ORDER', 36.5, currentY - 5.5, { align: 'center' });

    // Terms and conditions footer
    currentY = 250;
    doc.setDrawColor(220, 225, 235);
    doc.line(14, currentY, pageWidth - 14, currentY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 110, 130);
    doc.text('TERMS & WARRANTY POLICY:', 14, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(
      '1. Please check the product in front of our delivery executive. 7 days replacement warranty for manufacturing defects.',
      14,
      currentY + 9
    );
    doc.text(
      '2. Keep this invoice and original packaging intact for any warranty or customer service claims.',
      14,
      currentY + 13
    );
    doc.text(
      '3. For help, contact Duari Shop Customer Support Helpline: 01621871225 or email support@duarishop.com.',
      14,
      currentY + 17
    );

    doc.setFont('helvetica', 'italic');
    doc.text(
      'Thank you for shopping with Duari Shop - Doorstep Delivery Across Bangladesh!',
      pageWidth / 2,
      currentY + 26,
      { align: 'center' }
    );

    // Save with Blob approach to ensure 100% download across iframe sandboxes
    const fileName = `DuariShop_Invoice_${orderData.orderId}.pdf`;
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 10000);

    return true;
  } catch (error) {
    console.error('PDF Generation failed, triggering fallback print:', error);
    window.print();
    return false;
  }
}
