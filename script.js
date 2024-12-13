const fileInput = document.getElementById('fileInput');
const mergeBtn = document.getElementById('mergeBtn');
const downloadLink = document.getElementById('downloadLink');

mergeBtn.addEventListener('click', async () => {
    const files = fileInput.files;
    if (files.length < 2) {
        alert('Please select at least two PDFs to merge.');
        return;
    }

    const pdfLib = PDFLib;
    const mergedPdf = await pdfLib.PDFDocument.create();
    console.log('Merging PDFs:', files);

    for (const file of files) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            console.log(`Processing file: ${file.name}`);
            const pdf = await pdfLib.PDFDocument.load(arrayBuffer);
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(page => mergedPdf.addPage(page));
        } catch (error) {
            console.error(`Error processing file: ${file.name}`, error);
            alert(`Error processing file: ${file.name}.`);
        }
    }

    const mergedPdfBytes = await mergedPdf.save();
    console.log('Merged PDF successfully created.');

    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    downloadLink.href = url;
    downloadLink.download = 'merged.pdf';
    downloadLink.style.display = 'block';
    downloadLink.textContent = 'Download Merged PDF';
});
