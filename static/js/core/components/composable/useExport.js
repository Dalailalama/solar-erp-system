import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * useExport Composable
 * Handles data exports to Excel and PDF formats.
 */
export function useExport(container) {
    /**
     * Export data to Excel
     * @param {Array} data - Array of objects
     * @param {string} fileName - Output file name
     * @param {Array} columns - Column definitions [{ header: 'Name', key: 'name', width: 20 }]
     */
    const toExcel = async (data, fileName = 'export.xlsx', columns = []) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        worksheet.columns = columns;
        worksheet.addRows(data);

        // Styling the header
        worksheet.getRow(1).font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
    };

    /**
     * Export data to PDF
     * @param {Array} data - Array of objects
     * @param {string} title - Report title
     * @param {string} fileName - Output file name
     * @param {Array} columns - Column keys to include
     */
    const toPdf = (data, title = 'Report', fileName = 'report.pdf', columns = []) => {
        const doc = new jsPDF();

        doc.text(title, 14, 15);

        const head = [columns.map(col => col.label || col)];
        const body = data.map(item => columns.map(col => item[col.key || col]));

        doc.autoTable({
            head: head,
            body: body,
            startY: 20,
            theme: 'striped'
        });

        doc.save(fileName);
    };

    return {
        toExcel,
        toPdf
    };
}
