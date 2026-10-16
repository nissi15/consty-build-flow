import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ReportCell = string | number;

const safeFileName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function downloadReportCsv(headers: string[], rows: ReportCell[][], title: string) {
  const quote = (value: ReportCell) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.map(quote).join(','), ...rows.map(row => row.map(quote).join(','))].join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${safeFileName(title)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

export function downloadReportPdf(headers: string[], rows: ReportCell[][], title: string, subtitle: string) {
  const landscape = headers.length > 5;
  const doc = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(15, 15, 16);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CONSTY', 14, 13);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 22);

  doc.setTextColor(60, 60, 64);
  doc.setFontSize(9);
  doc.text(subtitle, 14, 39);
  doc.text(`Generated ${new Date().toLocaleString('en-GB')}`, 14, 45);

  autoTable(doc, {
    startY: 52,
    head: [headers],
    body: rows,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 2.2, textColor: [35, 35, 38], lineColor: [225, 226, 229], lineWidth: 0.15 },
    headStyles: { fillColor: [242, 243, 245], textColor: [25, 25, 27], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 249, 250] },
    margin: { left: 14, right: 14 },
    didDrawPage: data => {
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 124);
      doc.text(`Musanze Town Buildings · Page ${data.pageNumber}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 7, { align: 'right' });
    },
  });

  doc.save(`${safeFileName(title)}.pdf`);
}
