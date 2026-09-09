import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  async exportToExcel(
    columns: ExcelColumn[],
    data: any[],
    fileName: string = 'Export',
    sheetName: string = 'Sheet1'
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Set worksheet columns dynamically from caller parameters
    worksheet.columns = columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || 20
    }));

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };

    // Populate worksheet rows
    if (Array.isArray(data)) {
      data.forEach((row) => {
        worksheet.addRow(row);
      });
    }

    // Generate buffer and trigger browser download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fullFileName = `${fileName}_${new Date().getTime()}.xlsx`;
    saveAs(blob, fullFileName);
  }

 
}
