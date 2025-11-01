import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface WorkerPayrollData {
  name: string;
  role: string;
  daysWorked: number;
  dailyRate: number;
  grossAmount: number;
  lunchDeductions: number;
  netAmount: number;
  status: 'pending' | 'paid';
}

interface PayrollReportData {
  period: { start: Date; end: Date };
  workers: WorkerPayrollData[];
  summary: {
    totalWorkers: number;
    totalGross: number;
    totalLunchDeductions: number;
    netPayroll: number;
    averagePerWorker: number;
  };
}

export function generatePayrollPDF(data: PayrollReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  let yPos = 20;
  
  // ==================== HEADER ====================
  doc.setFillColor(139, 92, 246); // Purple
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSTRY', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Construction Management System', pageWidth / 2, 23, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text('Payroll Report', pageWidth / 2, 30, { align: 'center' });
  
  yPos = 45;
  
  // ==================== REPORT INFO ====================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Period:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${format(data.period.start, 'MMM dd, yyyy')} - ${format(data.period.end, 'MMM dd, yyyy')}`,
    55,
    yPos
  );
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Generated:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(), 'MMM dd, yyyy HH:mm'), 55, yPos);
  
  yPos += 12;
  
  // ==================== NET PAYROLL TOTAL (HIGHLIGHTED) ====================
  doc.setFillColor(139, 92, 246); // Purple background
  doc.roundedRect(14, yPos - 8, pageWidth - 28, 20, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('NET PAYROLL TOTAL', pageWidth / 2, yPos, { align: 'center' });
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`RWF ${data.summary.netPayroll.toLocaleString()}`, pageWidth / 2, yPos + 10, { align: 'center' });
  
  yPos += 25;
  
  // ==================== SUMMARY STATISTICS ====================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SUMMARY', 14, yPos);
  yPos += 3;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: [
      ['Total Workers', `${data.summary.totalWorkers} workers`],
      ['Total Gross Amount', `RWF ${data.summary.totalGross.toLocaleString()}`],
      ['Total Lunch Deductions', `RWF ${data.summary.totalLunchDeductions.toLocaleString()}`],
      ['Net Payroll Amount', `RWF ${data.summary.netPayroll.toLocaleString()}`],
      ['Average per Worker', `RWF ${data.summary.averagePerWorker.toLocaleString()}`],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [139, 92, 246],
      fontSize: 10,
      fontStyle: 'bold',
      textColor: [255, 255, 255],
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });
  
  yPos = doc.lastAutoTable.finalY + 15;
  
  // ==================== WORKER DETAILS ====================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('WORKER DETAILS', 14, yPos);
  yPos += 3;
  
  // Prepare worker data for table
  const workerTableData = data.workers.map(w => [
    w.name,
    w.role,
    w.daysWorked.toString(),
    `RWF ${w.dailyRate.toLocaleString()}`,
    `RWF ${w.grossAmount.toLocaleString()}`,
    `RWF ${w.lunchDeductions.toLocaleString()}`,
    `RWF ${w.netAmount.toLocaleString()}`,
    w.status.toUpperCase(),
  ]);
  
  if (data.workers.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Worker', 'Role', 'Days', 'Daily Rate', 'Gross', 'Lunch', 'Net Pay', 'Status']],
      body: workerTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [6, 182, 212],
        fontSize: 9,
        fontStyle: 'bold',
        textColor: [255, 255, 255],
      },
      bodyStyles: {
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 15 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 30 },
        7: { cellWidth: 20 },
      },
      margin: { left: 14, right: 14 },
    });
    
    yPos = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(107, 114, 128);
    doc.text('No workers found for this period', 14, yPos + 5);
    yPos += 15;
  }
  
  // Check if we need a new page
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }
  
  // ==================== PAYMENT STATUS SUMMARY ====================
  const paidWorkers = data.workers.filter(w => w.status === 'paid').length;
  const pendingWorkers = data.workers.filter(w => w.status === 'pending').length;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('PAYMENT STATUS SUMMARY', 14, yPos);
  yPos += 10;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Status', 'Count', 'Amount']],
    body: [
      ['Paid', `${paidWorkers} workers`, `RWF ${data.workers.filter(w => w.status === 'paid').reduce((sum, w) => sum + w.netAmount, 0).toLocaleString()}`],
      ['Pending', `${pendingWorkers} workers`, `RWF ${data.workers.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.netAmount, 0).toLocaleString()}`],
      ['Total', `${data.workers.length} workers`, `RWF ${data.summary.netPayroll.toLocaleString()}`],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [34, 197, 94],
      fontSize: 10,
      fontStyle: 'bold',
      textColor: [255, 255, 255],
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 30 },
      2: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });
  
  yPos = doc.lastAutoTable.finalY + 20;
  
  // ==================== FOOTER ====================
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Generated by Constry Construction Management System | ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  
  doc.setDrawColor(139, 92, 246);
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
  
  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, footerY, { align: 'right' });
  }
  
  // Save the PDF
  const filename = `Constry_Payroll_Report_${format(data.period.start, 'yyyy-MM-dd')}_to_${format(data.period.end, 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}

