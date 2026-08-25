import type ExcelJS from "exceljs";

export function aplicarEstiloEncabezado(fila: ExcelJS.Row) {
  fila.eachCell((celda) => {
    celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
    celda.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF111827" },
    };
    celda.alignment = { vertical: "middle", horizontal: "left" };
  });
  fila.height = 22;
}

export function autoajustarColumnas(worksheet: ExcelJS.Worksheet) {
  worksheet.columns.forEach((columna) => {
    let maxLength = 10;
    columna.eachCell?.({ includeEmpty: true }, (celda) => {
      const valor = celda.value ? String(celda.value) : "";
      maxLength = Math.max(maxLength, valor.length + 2);
    });
    columna.width = Math.min(maxLength, 45);
  });
}