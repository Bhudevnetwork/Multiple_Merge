const convertBtn = document.getElementById('convertBtn');
const fileInputConvert = document.getElementById('fileInputConvert');
const mergeBtn = document.getElementById('mergeBtn');
const fileInputMerge = document.getElementById('fileInputMerge');
const convertDownloadContainer = document.getElementById('convertDownloadContainer');
const mergeDownloadContainer = document.getElementById('mergeDownloadContainer');
const convertDownloadLink = document.getElementById('convertDownloadLink');
const mergeDownloadLink = document.getElementById('mergeDownloadLink');

// Utility function to trigger file download
function downloadFile(fileName, fileBytes, downloadContainer, downloadLink) {
    const blob = new Blob([fileBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Set the URL to the download link
    downloadLink.href = url;
    downloadLink.download = fileName;

    // Show the download container
    downloadContainer.style.display = 'block';
}

// Convert Multiple Files to a Single PDF
convertBtn.addEventListener('click', async () => {
    const files = fileInputConvert.files;
    if (!files.length) {
        alert('Please select files to convert.');
        return;
    }

    const pdfDoc = await PDFLib.PDFDocument.create();

    for (const file of files) {
        const fileType = file.type;
        const arrayBuffer = await file.arrayBuffer();

        if (fileType.includes('image')) {
            // Process Image Files
            let image;
            if (fileType.includes('jpeg') || fileType.includes('jpg')) {
                image = await pdfDoc.embedJpg(arrayBuffer);
            } else if (fileType.includes('png')) {
                image = await pdfDoc.embedPng(arrayBuffer);
            } else {
                alert(`Unsupported image type: ${fileType}`);
                continue;
            }
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        } else if (fileType.includes('text')) {
            // Process Text Files
            const textContent = await file.text();
            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
            page.drawText(textContent, { x: 50, y: height - 50, size: 12, maxWidth: width - 100 });
        } else {
            alert(`Unsupported file type: ${fileType}`);
        }
    }

    const pdfBytes = await pdfDoc.save();
    downloadFile('converted-files.pdf', pdfBytes, convertDownloadContainer, convertDownloadLink);
});

// Merge Multiple PDF Files
mergeBtn.addEventListener('click', async () => {
    const files = fileInputMerge.files;
    if (files.length < 2) {
        alert('Please select at least two PDF files to merge.');
        return;
    }

    const mergedPdf = await PDFLib.PDFDocument.create();

    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    downloadFile('merged-pdfs.pdf', mergedPdfBytes, mergeDownloadContainer, mergeDownloadLink);
});
