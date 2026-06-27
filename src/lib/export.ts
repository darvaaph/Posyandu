// Frontend-only export helpers. "Excel" → CSV download (opens in Excel),
// "PDF" → browser print dialog (Save as PDF).

export function exportCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(title: string, headers: string[], rows: string[][]) {
  const win = window.open("", "_blank", "width=900,height=650");
  if (!win) return;
  const style = `
    <style>
      body { font-family: system-ui, sans-serif; padding: 24px; color: #1e293b; }
      h1 { font-size: 18px; margin-bottom: 4px; }
      p.meta { color: #64748b; font-size: 12px; margin-top: 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
      th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; }
      th { background: #f1f5f9; }
    </style>`;
  const thead = `<tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>`;
  const tbody = rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("");
  win.document.write(`
    <html><head><title>${title}</title>${style}</head>
    <body>
      <h1>${title}</h1>
      <p class="meta">Dicetak: ${new Date().toLocaleString("id-ID")}</p>
      <table><thead>${thead}</thead><tbody>${tbody}</tbody></table>
      <script>window.onload = () => { window.print(); }</script>
    </body></html>`);
  win.document.close();
}
