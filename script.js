const fileInputMerge = document.getElementById('fileInputMerge');
const mergeBtn = document.getElementById('mergeBtn');
const downloadLinkMerge = document.getElementById('downloadLinkMerge');
const fileInputConvert = document.getElementById('fileInputConvert');
const convertBtn = document.getElementById('convertBtn');
const downloadLinkConvert = document.getElementById('downloadLinkConvert');

// Merge PDFs
mergeBtn.addEventListener('click', async () => {
    const files = fileInputMerge.files;
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

    downloadLinkMerge.href = url;
    downloadLinkMerge.download = 'merged.pdf';
    downloadLinkMerge.style.display = 'block';
    downloadLinkMerge.textContent = 'Download Merged PDF';
});

// Convert File to PDF (Image, DOCX, TXT)
convertBtn.addEventListener('click', async () => {
    const file = fileInputConvert.files[0];
    if (!file) {
        alert('Please select a file to convert.');
        return;
    }

    const pdfLib = PDFLib;
    const pdfDoc = await pdfLib.PDFDocument.create();
    console.log('Starting conversion for:', file);

    try {
        const fileType = file.type;

        // Image file processing (JPEG, PNG, JPG, WEBP)
        if (fileType.includes('image')) {
            console.log('File is an image type:', fileType);
            const arrayBuffer = await file.arrayBuffer();
            let image;

            if (fileType.includes('jpeg') || fileType.includes('jpg')) {
                image = await pdfDoc.embedJpg(arrayBuffer); // Embed JPEG
                console.log('JPEG image embedded');
            } else if (fileType.includes('png')) {
                image = await pdfDoc.embedPng(arrayBuffer); // Embed PNG
                console.log('PNG image embedded');
            } else if (fileType.includes('webp')) {
                image = await pdfDoc.embedPng(arrayBuffer); // Treat WEBP as PNG for embedding
                console.log('WEBP image treated as PNG and embedded');
            }

            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            page.drawImage(image, {
                x: 0,
                y: height - image.height,
                width: image.width,
                height: image.height,
            });

        // Text file processing (TXT)
        } else if (fileType.includes('text')) {
            console.log('File is a text type:', fileType);
            const textContent = await file.text();
            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
            const fontSize = 12;
            page.drawText(textContent, {
                x: 50,
                y: height - 50,
                font,
                size: fontSize,
                maxWidth: width - 100,
            });

        // DOCX file processing
        } else if (file.name.endsWith('.docx')) {
            console.log('File is a DOCX type');
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            const textContent = result.value;
            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
            const fontSize = 12;
            page.drawText(textContent, {
                x: 50,
                y: height - 50,
                font,
                size: fontSize,
                maxWidth: width - 100,
            });

        } else {
            alert('Unsupported file type.');
            console.log('Unsupported file type:', fileType);
            return;
        }

        // Save the PDF
        const pdfBytes = await pdfDoc.save();
        console.log('PDF created successfully');
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Display the download link
        downloadLinkConvert.href = url;
        downloadLinkConvert.download = 'converted.pdf';
        downloadLinkConvert.style.display = 'block';
        downloadLinkConvert.textContent = 'Download Converted PDF';

    } catch (error) {
        console.error('Error converting file to PDF:', error);
        alert('Error converting the file. Please try again.');
    }
});
