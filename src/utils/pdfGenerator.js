import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatToRupiah } from "./formatters";
import { format } from 'date-fns';

export const generateTransactionPDF = (transactions, dateRange = null) => {
  const doc = new jsPDF();
  
  // Add custom font for a modern look
  doc.setFont("helvetica");
  
  // Header Section
  doc.setFontSize(24);
  doc.setTextColor(33, 33, 33);
  doc.text("NexOPS Transaction Report", 20, 20);
  
  // Date Range
  doc.setFontSize(12);
  doc.setTextColor(75, 75, 75);
  let periodText = 'Period: All Time';
  
  if (dateRange && dateRange.from) {
    try {
      const fromDate = format(new Date(dateRange.from), 'dd MMM yyyy');
      const toDate = dateRange.to ? format(new Date(dateRange.to), 'dd MMM yyyy') : fromDate;
      periodText = `Period: ${fromDate} - ${toDate}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      periodText = 'Period: All Time';
    }
  }
  
  doc.text(periodText, 20, 35);

  // Summary Section
  const completedTxn = transactions.filter(t => t.status === 'completed').length;
  const voidedTxn = transactions.filter(t => t.status === 'voided').length;
  const refundedTxn = transactions.filter(t => t.status === 'refunded').length;
  const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.total), 0);

  // Summary Boxes
  const drawSummaryBox = (title, value, x, y) => {
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(x, y, 85, 25, 3, 3, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(title, x + 10, y + 10);
    
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text(value, x + 10, y + 20);
  };

  drawSummaryBox('Total Transactions', transactions.length.toString(), 20, 45);
  drawSummaryBox('Total Amount', formatToRupiah(totalAmount), 115, 45);
  drawSummaryBox('Completed', completedTxn.toString(), 20, 75);
  drawSummaryBox('Voided', voidedTxn.toString(), 115, 75);

  // Transactions Table
  let yPos = 115;
  
  transactions.forEach((transaction, index) => {
    // Transaction Header
    doc.setFillColor(243, 244, 246);
    doc.rect(20, yPos, 170, 12, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text(`Transaction ID: ${transaction.transaction_id}`, 25, yPos + 8);
    
    // Format transaction date safely
    let dateText = 'Date: Invalid';
    try {
      dateText = `Date: ${format(new Date(transaction.created_at), 'dd MMM yyyy HH:mm')}`;
    } catch (error) {
      console.error('Transaction date formatting error:', error);
    }
    doc.text(dateText, 120, yPos + 8);
    
    // Transaction Details
    yPos += 15;
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    
    // Items Table
    const itemsTableData = transaction.items.map(item => [
      item.name,
      item.quantity.toString(),
      formatToRupiah(item.price_at_time),
      formatToRupiah(item.subtotal)
    ]);

    doc.autoTable({
      startY: yPos,
      margin: { left: 25 },
      head: [['Item', 'Qty', 'Price', 'Subtotal']],
      body: itemsTableData,
      theme: 'plain',
      styles: {
        fontSize: 9,
        textColor: [75, 85, 99],
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [249, 250, 251],
        textColor: [75, 85, 99],
        fontStyle: 'bold',
      },
    });

    yPos = doc.lastAutoTable.finalY + 5;

    // Transaction Summary
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    
    const summaryX = 120;
    doc.text('Subtotal:', summaryX, yPos + 5);
    doc.text('Discount:', summaryX, yPos + 11);
    doc.text('Total:', summaryX, yPos + 17);
    doc.text('Paid:', summaryX, yPos + 23);
    doc.text('Change:', summaryX, yPos + 29);

    const valuesX = 170;
    doc.setTextColor(31, 41, 55);
    doc.text(formatToRupiah(transaction.subtotal), valuesX, yPos + 5, { align: 'right' });
    doc.text(formatToRupiah(transaction.discount_amount), valuesX, yPos + 11, { align: 'right' });
    doc.text(formatToRupiah(transaction.total), valuesX, yPos + 17, { align: 'right' });
    doc.text(formatToRupiah(transaction.total_paid), valuesX, yPos + 23, { align: 'right' });
    doc.text(formatToRupiah(transaction.total_paid - transaction.total), valuesX, yPos + 29, { align: 'right' });

    // Status Badge
    const status = transaction.status.toLowerCase();
    const statusColors = {
      completed: { fill: [209, 250, 229], text: [6, 95, 70] },
      voided: { fill: [254, 226, 226], text: [153, 27, 27] },
      refunded: { fill: [255, 237, 213], text: [154, 52, 18] },
    };
    
    const statusColor = statusColors[status];
    if (statusColor) {
      doc.setFillColor(...statusColor.fill);
      doc.setTextColor(...statusColor.text);
      doc.roundedRect(25, yPos + 35, 25, 8, 2, 2, 'F');
      doc.text(status, 28, yPos + 40);
    }

    yPos += 50;

    // Add new page if needed
    if (yPos > 250 && index < transactions.length - 1) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Save the PDF with date range in filename if present
  const filename = dateRange && dateRange.from ? 
    `transaction-report-${format(new Date(dateRange.from), 'yyyy-MM-dd')}.pdf` : 
    'transaction-report.pdf';
    
  doc.save(filename);
}; 