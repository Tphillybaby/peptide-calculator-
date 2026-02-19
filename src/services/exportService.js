import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Export service for downloading injection data as CSV or PDF
 */
export const exportService = {
    /**
     * Export injections to CSV format
     */
    toCSV: (injections, filename = 'injection_history') => {
        if (!injections || injections.length === 0) {
            throw new Error('No data to export');
        }

        // CSV headers
        const headers = [
            'Date',
            'Time',
            'Peptide',
            'Dosage',
            'Unit',
            'Injection Site',
            'Notes'
        ];

        // Format data rows
        const rows = injections.map(inj => {
            const date = new Date(inj.injection_date || inj.date);
            return [
                format(date, 'yyyy-MM-dd'),
                format(date, 'HH:mm'),
                inj.peptide_name || inj.peptide || '',
                inj.dosage_value || inj.dosage_mcg || inj.dosage || '',
                inj.dosage_unit || inj.unit || 'mcg',
                inj.injection_site || inj.site || '',
                (inj.notes || '').replace(/"/g, '""') // Escape quotes
            ];
        });

        // Build CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    },

    /**
     * Export injections to PDF format
     */
    toPDF: (injections, options = {}) => {
        if (!injections || injections.length === 0) {
            throw new Error('No data to export');
        }

        const { filename = 'injection_history', title = 'Injection History Report' } = options;

        // Create PDF document
        const doc = new jsPDF();

        // Add header
        doc.setFontSize(20);
        doc.setTextColor(59, 130, 246); // Primary blue
        doc.text('PeptideLog', 14, 20);

        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text(title, 14, 30);

        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(`Generated on ${format(new Date(), 'MMMM d, yyyy')}`, 14, 38);
        doc.text(`Total Records: ${injections.length}`, 14, 44);

        // Prepare table data
        const tableData = injections.map(inj => {
            const date = new Date(inj.injection_date || inj.date);
            return [
                format(date, 'MMM d, yyyy'),
                format(date, 'h:mm a'),
                inj.peptide_name || inj.peptide || '',
                `${inj.dosage_value || inj.dosage_mcg || inj.dosage || ''} ${inj.dosage_unit || inj.unit || 'mcg'}`,
                inj.injection_site || inj.site || '',
                (inj.notes || '').substring(0, 30) + ((inj.notes?.length > 30) ? '...' : '')
            ];
        });

        // Add table
        doc.autoTable({
            startY: 52,
            head: [['Date', 'Time', 'Peptide', 'Dosage', 'Site', 'Notes']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [59, 130, 246],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251]
            },
            styles: {
                fontSize: 9,
                cellPadding: 4
            },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 20 },
                2: { cellWidth: 35 },
                3: { cellWidth: 25 },
                4: { cellWidth: 25 },
                5: { cellWidth: 'auto' }
            }
        });

        // Add summary section
        const finalY = doc.lastAutoTable.finalY + 15;

        // Calculate summary stats
        const peptideCounts = {};
        injections.forEach(inj => {
            const name = inj.peptide_name || inj.peptide;
            peptideCounts[name] = (peptideCounts[name] || 0) + 1;
        });

        const sortedPeptides = Object.entries(peptideCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (finalY < 250) {
            doc.setFontSize(12);
            doc.setTextColor(31, 41, 55);
            doc.text('Summary by Peptide', 14, finalY);

            doc.autoTable({
                startY: finalY + 5,
                head: [['Peptide', 'Count', 'Percentage']],
                body: sortedPeptides.map(([name, count]) => [
                    name,
                    count,
                    `${((count / injections.length) * 100).toFixed(1)}%`
                ]),
                theme: 'plain',
                headStyles: {
                    fillColor: [243, 244, 246],
                    textColor: [55, 65, 81],
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 9
                }
            });
        }

        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(156, 163, 175);
            doc.text(
                `Page ${i} of ${pageCount} | PeptideLog`,
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }

        // Save PDF
        doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);

        return true;
    },

    /**
     * Export schedules to CSV
     */
    schedulesToCSV: (schedules, filename = 'schedule_export') => {
        if (!schedules || schedules.length === 0) {
            throw new Error('No schedules to export');
        }

        const headers = ['Date', 'Time', 'Peptide', 'Dosage', 'Unit', 'Completed', 'Notes'];

        const rows = schedules.map(sch => [
            sch.scheduled_date || format(new Date(sch.date), 'yyyy-MM-dd'),
            sch.scheduled_time || sch.time || '',
            sch.peptide_name || sch.peptide || '',
            sch.dosage || '',
            sch.unit || 'mg',
            sch.completed ? 'Yes' : 'No',
            (sch.notes || '').replace(/"/g, '""')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    }
};

export default exportService;
