const Exporter = {
    exportData: function(wells) {
        let rows = [];
        let row = [];
        
        // Add headers
        Object.keys(wells[0]).forEach(function(d) {
            row.push(d);
        });
        rows.push(row);

        // Add data rows
        wells.forEach(function(all) {
            row = [];
            Object.values(all).forEach(function(d) {
                row.push(d);
            });
            rows.push(row);
        });

        this.exportToCsv('export.csv', rows);
    },

    exportToCsv: function(filename, rows) {
        const processRow = function(row) {
            let finalVal = '';
            for (let j = 0; j < row.length; j++) {
                let innerValue = row[j] === null ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                }
                let result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0) {
                    result = '"' + result + '"';
                }
                if (j > 0) {
                    finalVal += ',';
                }
                finalVal += result;
            }
            return finalVal + '\n';
        };

        let csvFile = '';
        for (let i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

        const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            const link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
};



