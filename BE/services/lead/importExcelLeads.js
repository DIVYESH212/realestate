import dbService from "../../utilities/dbService";
import ExcelJS from "exceljs";
import { getOwnerId } from "./utils";

export const importExcelLeads = async ({ user, file }) => {
  if (!file) throw new Error('No file uploaded');

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file.path);
  const ws = workbook.getWorksheet(1);

  const headers = [];
  const leads = [];

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = (cell.text || cell.value || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      });
    } else {
      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const key = headers[colNumber - 1];
        if (key) rowData[key] = (cell.text || cell.value || '').toString().trim();
      });

      leads.push({
        user_id: getOwnerId(user),
        name: rowData.name || rowData.ownername || 'Unnamed Lead',
        email: rowData.email || rowData.emailaddress || undefined,
        mobilenumber: rowData.mobilenumber || rowData.mobile || rowData.phone || undefined,
        propertyAddress: rowData.propertyaddress || rowData.address || '',
        leadstatus: rowData.leadstatus || undefined,
        city: rowData.city || undefined,
        state: rowData.state || undefined,
        market_segment: rowData.market_segment || undefined,
        estimatedvalue: rowData.estimatedvalue || undefined,
      });
    }
  });

  let insertedCount = 0;
  
  try {
    const result = await dbService.createManyRecords("leadModel", leads);
    insertedCount = result.length;
  } catch (err) {
    if (err.insertedDocs) {
      insertedCount = err.insertedDocs.length;
    } else if (err.result && err.result.nInserted) {
      insertedCount = err.result.nInserted;
    }
  }

  const totalAttempted = leads.length;
  const skipped = totalAttempted - insertedCount;

  return {
    message: insertedCount > 0 ? 'File processed successfully!' : 'File processed, all records skipped or exist.',
    inserted: insertedCount,
    skipped: skipped,
    totalAttempted: totalAttempted,
  };
};
