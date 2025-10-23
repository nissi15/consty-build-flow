import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface WeeklyReportData {
  expenses: any[];
  attendance: any[];
  workers: any[];
  budget: any;
  weekStart?: Date;
}

export function generateWeeklyPDFReport(data: WeeklyReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Use provided week or current week
  const weekStartDate = data.weekStart || startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStartDate, end: weekEndDate });
  
  // Filter data for the selected week
  const weekExpenses = data.expenses.filter(e => {
    const expenseDate = new Date(e.date || e.created_at);
    return expenseDate >= weekStartDate && expenseDate <= weekEndDate;
  });
  
  const weekAttendance = data.attendance.filter(a => {
    const attendanceDate = new Date(a.date);
    return attendanceDate >= weekStartDate && attendanceDate <= weekEndDate;
  });
  
  let yPos = 20;
  
  // ==================== HEADER ====================
  // Company Name with gradient effect (simulated with color)
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
  doc.text('Weekly Performance Report', pageWidth / 2, 30, { align: 'center' });
  
  yPos = 45;
  
  // ==================== REPORT INFO ====================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Period:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${format(weekStartDate, 'MMM dd, yyyy')} - ${format(weekEndDate, 'MMM dd, yyyy')}`,
    55,
    yPos
  );
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Generated:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(), 'MMM dd, yyyy HH:mm'), 55, yPos);
  
  yPos += 12;
  
  // ==================== SUMMARY STATISTICS ====================
  const totalExpenses = weekExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalDaysWorked = weekAttendance.filter(a => a.status === 'present' || a.status === 'half-day').length;
  const activeWorkers = [...new Set(weekAttendance.map(a => a.worker_id))].length;
  const laborCost = weekExpenses.filter(e => e.category === 'Labor').reduce((sum, e) => sum + Number(e.amount), 0);
  const materialCost = weekExpenses.filter(e => e.category === 'Materials').reduce((sum, e) => sum + Number(e.amount), 0);
  const avgDailyExpense = totalExpenses / 7;
  const budgetRemaining = (data.budget?.total_budget || 0) - (data.budget?.used_budget || 0);
  
  // Summary table instead of cards
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('WEEK SUMMARY', 14, yPos);
  yPos += 3;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: [
      ['Total Expenses', `RWF ${totalExpenses.toLocaleString()}`],
      ['Active Workers', `${activeWorkers} workers`],
      ['Total Worker Days', `${totalDaysWorked} days`],
      ['Labor Cost', `RWF ${laborCost.toLocaleString()}`],
      ['Material Cost', `RWF ${materialCost.toLocaleString()}`],
      ['Budget Remaining', `RWF ${budgetRemaining.toLocaleString()}`],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [139, 92, 246],
      fontSize: 10,
      fontStyle: 'bold',
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
  
  // ==================== EXPENSE BREAKDOWN WITH PIE CHART ====================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('EXPENSE BREAKDOWN BY CATEGORY', 14, yPos);
  yPos += 8;
  
  const expensesByCategory = [
    { category: 'Labor', amount: laborCost, color: [139, 92, 246] },
    { category: 'Materials', amount: materialCost, color: [6, 182, 212] },
    { category: 'Equipment', amount: weekExpenses.filter(e => e.category === 'Equipment').reduce((sum, e) => sum + Number(e.amount), 0), color: [59, 130, 246] },
    { category: 'Other', amount: weekExpenses.filter(e => !['Labor', 'Materials', 'Equipment'].includes(e.category)).reduce((sum, e) => sum + Number(e.amount), 0), color: [245, 158, 11] },
  ].filter(item => item.amount > 0);
  
  if (totalExpenses > 0) {
    // Draw simple pie chart
    const pieX = 45;
    const pieY = yPos + 25;
    const pieRadius = 20;
    let currentAngle = 0;
    
    expensesByCategory.forEach(item => {
      const percentage = item.amount / totalExpenses;
      const angle = percentage * 2 * Math.PI;
      
      // Draw pie slice
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.circle(pieX, pieY, pieRadius, 'F');
      
      // Draw outline for visual separation
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(1);
      const endAngle = currentAngle + angle;
      doc.line(pieX, pieY, pieX + pieRadius * Math.cos(currentAngle), pieY + pieRadius * Math.sin(currentAngle));
      doc.line(pieX, pieY, pieX + pieRadius * Math.cos(endAngle), pieY + pieRadius * Math.sin(endAngle));
      
      currentAngle = endAngle;
    });
    
    // Draw center circle to make it a donut chart
    doc.setFillColor(255, 255, 255);
    doc.circle(pieX, pieY, pieRadius * 0.5, 'F');
    
    // Add total in center
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Total', pieX, pieY - 2, { align: 'center' });
    doc.setFontSize(7);
    doc.text(`RWF ${(totalExpenses / 1000).toFixed(0)}K`, pieX, pieY + 3, { align: 'center' });
    
    // Legend
    let legendY = yPos;
    const legendX = 75;
    doc.setFontSize(10);
    expensesByCategory.forEach((item, idx) => {
      // Color box
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.roundedRect(legendX, legendY + (idx * 12), 4, 4, 1, 1, 'F');
      
      // Text
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(item.category, legendX + 7, legendY + (idx * 12) + 3);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      const percent = ((item.amount / totalExpenses) * 100).toFixed(1);
      doc.text(`RWF ${item.amount.toLocaleString()} (${percent}%)`, legendX + 35, legendY + (idx * 12) + 3);
    });
    
    yPos += 55;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(107, 114, 128);
    doc.text('No expenses recorded for this week', 14, yPos);
    yPos += 15;
  }
  
  // ==================== WORKER ATTENDANCE ====================
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('WORKER ATTENDANCE SUMMARY', 14, yPos);
  yPos += 3;
  
  // Group attendance by worker
  const workerAttendanceMap = new Map();
  
  data.workers.forEach(worker => {
    const workerDays = weekAttendance.filter(a => a.worker_id === worker.id);
    const presentDays = workerDays.filter(a => a.status === 'present').length;
    const halfDays = workerDays.filter(a => a.status === 'half-day').length;
    const totalHours = workerDays.reduce((sum, a) => sum + (Number(a.hours) || 0), 0);
    
    if (workerDays.length > 0) {
      workerAttendanceMap.set(worker.id, {
        name: worker.name,
        role: worker.role,
        days: presentDays + (halfDays * 0.5),
        hours: totalHours,
        rate: worker.daily_rate,
      });
    }
  });
  
  const workerTableData = Array.from(workerAttendanceMap.values()).map(w => [
    w.name,
    w.role,
    w.days.toString(),
    w.hours.toFixed(1),
    `RWF ${Number(w.rate).toLocaleString()}`,
    `RWF ${(w.days * Number(w.rate)).toLocaleString()}`,
  ]);
  
  if (workerTableData.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Worker', 'Role', 'Days', 'Hours', 'Daily Rate', 'Total Pay']],
      body: workerTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [6, 182, 212],
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(107, 114, 128);
    doc.text('No attendance records for this week', 14, yPos + 5);
    yPos += 15;
  }
  
  // Check if we need a new page
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }
  
  // ==================== DAILY EXPENSE TREND WITH BAR CHART ====================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DAILY EXPENSE TREND', 14, yPos);
  yPos += 10;
  
  const dailyExpenses = weekDays.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayExpenses = weekExpenses.filter(e => {
      const expenseDate = format(new Date(e.date || e.created_at), 'yyyy-MM-dd');
      return expenseDate === dayStr;
    });
    return {
      day: format(day, 'EEE'),
      fullDay: format(day, 'MMM dd'),
      amount: dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0),
    };
  });
  
  // Draw bar chart
  const chartWidth = pageWidth - 28;
  const chartHeight = 40;
  const barWidth = (chartWidth - 70) / 7;
  const maxExpense = Math.max(...dailyExpenses.map(d => d.amount), 1);
  
  // Y-axis labels
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.text(`${(maxExpense / 1000).toFixed(0)}K`, 12, yPos);
  doc.text('0', 12, yPos + chartHeight);
  
  // Draw bars
  dailyExpenses.forEach((day, idx) => {
    const barHeight = (day.amount / maxExpense) * chartHeight;
    const x = 20 + (idx * barWidth);
    const y = yPos + chartHeight - barHeight;
    
    // Bar
    const barColor = day.amount > avgDailyExpense ? [220, 38, 38] : [34, 197, 94]; // Red if above avg, green if below
    doc.setFillColor(barColor[0], barColor[1], barColor[2], 0.8 * 255);
    doc.roundedRect(x, y, barWidth - 2, barHeight, 1, 1, 'F');
    
    // Day label
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text(day.day, x + (barWidth - 2) / 2, yPos + chartHeight + 6, { align: 'center' });
    
    // Amount on top of bar
    if (day.amount > 0) {
      doc.setFontSize(6);
      doc.setTextColor(barColor[0], barColor[1], barColor[2]);
      doc.text(`${(day.amount / 1000).toFixed(0)}K`, x + (barWidth - 2) / 2, y - 2, { align: 'center' });
    }
  });
  
  // Average line
  const avgY = yPos + chartHeight - (avgDailyExpense / maxExpense) * chartHeight;
  doc.setDrawColor(245, 158, 11);
  doc.setLineDash([2, 2]);
  doc.setLineWidth(0.5);
  doc.line(20, avgY, 20 + (7 * barWidth), avgY);
  doc.setLineDash([]);
  
  // Average label
  doc.setFontSize(7);
  doc.setTextColor(245, 158, 11);
  doc.text(`Avg: RWF ${avgDailyExpense.toFixed(0)}`, 20 + (7 * barWidth) + 2, avgY + 2);
  
  yPos += chartHeight + 15;
  
  // ==================== BUDGET STATUS ====================
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('BUDGET STATUS', 14, yPos);
  yPos += 8;
  
  const totalBudget = data.budget?.total_budget || 0;
  const usedBudget = data.budget?.used_budget || 0;
  const remaining = totalBudget - usedBudget;
  const percentUsed = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0;
  
  // Budget bar chart (simple rectangle visualization)
  const budgetBarWidth = pageWidth - 28;
  const barHeight = 20;
  const usedWidth = (usedBudget / totalBudget) * budgetBarWidth;
  
  doc.setFillColor(229, 231, 235); // Gray background
  doc.roundedRect(14, yPos, budgetBarWidth, barHeight, 3, 3, 'F');
  
  // Used budget bar
  const barColor = percentUsed > 90 ? [220, 38, 38] : percentUsed > 70 ? [245, 158, 11] : [34, 197, 94];
  doc.setFillColor(...barColor);
  doc.roundedRect(14, yPos, usedWidth, barHeight, 3, 3, 'F');
  
  // Percentage text on bar
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`${percentUsed.toFixed(1)}% Used`, pageWidth / 2, yPos + 13, { align: 'center' });
  
  yPos += 30;
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Budget: RWF ${totalBudget.toLocaleString()}`, 14, yPos);
  doc.text(`Used: RWF ${usedBudget.toLocaleString()}`, 14, yPos + 6);
  doc.text(`Remaining: RWF ${remaining.toLocaleString()}`, 14, yPos + 12);
  
  yPos += 25;
  
  // ==================== KEY INSIGHTS & RECOMMENDATIONS ====================
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('KEY INSIGHTS AND RECOMMENDATIONS', 14, yPos);
  yPos += 10;
  
  // Generate insights based on data
  interface Insight {
    text: string;
    type: 'alert' | 'warning' | 'good' | 'info';
  }
  
  const insights: Insight[] = [];
  
  // Budget insight (reuse totalBudget and usedBudget from above)
  const budgetUsagePercent = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0;
  
  if (budgetUsagePercent > 90) {
    insights.push({
      text: `Budget Alert: ${budgetUsagePercent.toFixed(0)}% of budget used. Consider reviewing expenses or requesting additional funds.`,
      type: 'alert'
    });
  } else if (budgetUsagePercent > 70) {
    insights.push({
      text: `Budget Status: ${budgetUsagePercent.toFixed(0)}% of budget used. Monitor spending closely for remaining period.`,
      type: 'warning'
    });
  } else {
    insights.push({
      text: `Budget Health: ${budgetUsagePercent.toFixed(0)}% of budget used. Spending is on track.`,
      type: 'good'
    });
  }
  
  // Labor cost insight
  if (laborCost > 0 && totalExpenses > 0) {
    const laborPercentOfTotal = (laborCost / totalExpenses) * 100;
    if (laborPercentOfTotal > 60) {
      insights.push({
        text: `Labor Costs: Represent ${laborPercentOfTotal.toFixed(0)}% of total expenses. Consider reviewing workforce allocation.`,
        type: 'info'
      });
    } else {
      insights.push({
        text: `Labor Costs: ${laborPercentOfTotal.toFixed(0)}% of total expenses, within normal range.`,
        type: 'good'
      });
    }
  }
  
  // Daily expense variation
  const expenseVariation = dailyExpenses.some(d => d.amount > avgDailyExpense * 1.5);
  if (expenseVariation) {
    insights.push({
      text: `Daily Variations: Significant spending variations detected. Review high-spending days for optimization.`,
      type: 'info'
    });
  }
  
  // Worker productivity
  if (activeWorkers > 0 && totalDaysWorked > 0) {
    const avgDaysPerWorker = totalDaysWorked / activeWorkers;
    if (avgDaysPerWorker < 3) {
      insights.push({
        text: `Attendance: Low attendance rate detected (avg ${avgDaysPerWorker.toFixed(1)} days per worker). Consider improvement measures.`,
        type: 'warning'
      });
    } else if (avgDaysPerWorker > 5) {
      insights.push({
        text: `Attendance: High attendance rate (avg ${avgDaysPerWorker.toFixed(1)} days per worker). Excellent worker engagement.`,
        type: 'good'
      });
    }
  }
  
  // Material costs
  if (materialCost > laborCost && totalExpenses > 0) {
    insights.push({
      text: `Material Costs: Exceed labor costs. Consider bulk purchasing or alternative suppliers for cost savings.`,
      type: 'info'
    });
  }
  
  // Draw insights as simple bullet points with color indicators
  insights.forEach((insight, idx) => {
    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }
    
    // Color-coded circles based on insight type
    let indicatorColor = [100, 116, 139]; // Default gray
    
    if (insight.type === 'alert') {
      indicatorColor = [220, 38, 38]; // Red
    } else if (insight.type === 'good') {
      indicatorColor = [34, 197, 94]; // Green
    } else if (insight.type === 'warning') {
      indicatorColor = [245, 158, 11]; // Orange
    } else if (insight.type === 'info') {
      indicatorColor = [59, 130, 246]; // Blue
    }
    
    // Draw colored circle indicator
    doc.setFillColor(indicatorColor[0], indicatorColor[1], indicatorColor[2]);
    doc.circle(17, yPos + 2, 1.5, 'F');
    
    // Draw text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Split long text into multiple lines if needed
    const maxWidth = pageWidth - 32;
    const lines = doc.splitTextToSize(insight.text, maxWidth);
    
    lines.forEach((line: string, lineIdx: number) => {
      doc.text(line, 22, yPos + 3 + (lineIdx * 4));
    });
    
    yPos += 4 + (lines.length > 1 ? (lines.length - 1) * 4 : 0) + 2;
  });
  
  yPos += 10;
  
  // ==================== SIGNATURE SECTION ====================
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setDrawColor(200, 200, 200);
  doc.line(14, yPos, pageWidth / 2 - 10, yPos);
  doc.line(pageWidth / 2 + 10, yPos, pageWidth - 14, yPos);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Manager', 14, yPos + 5);
  doc.text('Finance Manager', pageWidth / 2 + 10, yPos + 5);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Signature & Date', 14, yPos + 10);
  doc.text('Signature & Date', pageWidth / 2 + 10, yPos + 10);
  
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
  const filename = `Constry_Weekly_Report_${format(weekStartDate, 'yyyy-MM-dd')}_to_${format(weekEndDate, 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}

