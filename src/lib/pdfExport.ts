import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PlanTable {
  title: string;
  icon?: string; // SVG path
  rows: Array<{
    columns: string[];
  }>;
}

interface Plan {
  title: string;
  prompt: string;
  tables: PlanTable[];
  startDate?: string | null;
  endDate?: string | null;
}

// Extend jsPDF type to include lastAutoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

// Helper function to load and add SVG as image to PDF
const addSvgIcon = async (doc: jsPDF, svgPath: string, x: number, y: number, size: number): Promise<void> => {
  try {
    // Fetch the SVG file
    const response = await fetch(svgPath);
    const svgText = await response.text();
    
    // Create a temporary canvas to convert SVG to image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = size * 4; // Higher resolution
        canvas.height = size * 4;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        // Add to PDF
        doc.addImage(dataUrl, 'PNG', x, y, size, size);
        
        URL.revokeObjectURL(url);
        resolve();
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(); // Continue even if icon fails to load
      };
      
      img.src = url;
    });
  } catch (error) {
    console.error('Error loading SVG icon:', error);
    // Continue without icon if it fails
  }
};

export const exportPlanToPDF = async (plan: Plan) => {
  const doc = new jsPDF();
  
  // Use the plan's title (which is already AI-generated short name)
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(plan.title, 180);
  doc.text(titleLines, 14, 20);
  
  let yPosition = 20 + (titleLines.length * 8);
  
  // Add prompt/description (full user request)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(80);
  const promptLines = doc.splitTextToSize(`"${plan.prompt}"`, 180);
  doc.text(promptLines, 14, yPosition);
  
  yPosition = yPosition + (promptLines.length * 5) + 10;
  
  // Add dates if available
  if (plan.startDate && plan.endDate) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    const startDate = new Date(plan.startDate).toLocaleDateString();
    const endDate = new Date(plan.endDate).toLocaleDateString();
    doc.text(`Duration: ${startDate} - ${endDate}`, 14, yPosition);
    yPosition += 10;
  }
  
  doc.setTextColor(0); // Reset text color to black
  
  // Add each table
  for (let tableIndex = 0; tableIndex < plan.tables.length; tableIndex++) {
    const table = plan.tables[tableIndex];
    
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Add icon if available
    if (table.icon) {
      const iconSize = 8;
      await addSvgIcon(doc, table.icon, 14, yPosition - iconSize + 2, iconSize);
      
      // Add table title next to icon
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text(table.title, 14 + iconSize + 3, yPosition);
    } else {
      // Add table title without icon
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text(table.title, 14, yPosition);
    }
    
    yPosition += 8;
    
    // Prepare table data
    const tableData = table.rows.map(row => row.columns);
    
    // Determine if this is a vertical table (first column as headers)
    const isVerticalTable = tableData.length > 0 && tableData[0].length <= 2;
    
    if (isVerticalTable) {
      // Vertical table: first column is headers, second is values
      autoTable(doc, {
        startY: yPosition,
        head: [],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [240, 240, 240] },
        },
        margin: { left: 14 },
      });
    } else {
      // Horizontal table: first row as headers
      const headers = tableData.length > 0 ? [tableData[0]] : [];
      const body = tableData.slice(1);
      
      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body: body,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [54, 89, 184],
          textColor: 255,
          fontStyle: 'bold',
        },
        margin: { left: 14 },
      });
    }
    
    // Update yPosition for next table
    yPosition = doc.lastAutoTable.finalY + 15;
  }
  
  // Add footer with generation date
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generated by Synapse - ${new Date().toLocaleDateString()}`,
      14,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Save the PDF with plan title as filename
  const fileName = `${plan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  doc.save(fileName);
};
