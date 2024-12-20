// References to HTML elements
const fileInputMerge = document.getElementById('fileInputMerge');
const fileListContainer = document.getElementById('fileList');
const mergeBtn = document.getElementById('mergeBtn');
const mergeDownloadContainer = document.getElementById('mergeDownloadContainer');
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


// Populate the file list and enable drag-and-drop sorting
fileInputMerge.addEventListener('change', () => {
    const files = Array.from(fileInputMerge.files);

    if (files.length < 2) {
        alert('Please select at least two PDF files to merge.');
        mergeBtn.disabled = true;
        return;
    }

    fileListContainer.classList.remove('empty');
    fileListContainer.innerHTML = ''; // Clear previous list

    files.forEach((file) => {
        const fileItem = document.createElement('li');
        fileItem.className = 'file-item';
        fileItem.textContent = file.name;
        fileItem.setAttribute('draggable', true);
        fileItem.dataset.fileName = file.name;

        // Drag-and-drop event listeners for reordering
        fileItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', fileItem.dataset.fileName);
            fileItem.classList.add('dragging');
        });

        fileItem.addEventListener('dragend', () => {
            fileItem.classList.remove('dragging');
        });

        fileItem.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        fileItem.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedFileName = e.dataTransfer.getData('text/plain');
            const draggedItem = document.querySelector(`[data-file-name="${draggedFileName}"]`);
            fileListContainer.insertBefore(draggedItem, fileItem.nextSibling);
        });

        fileListContainer.appendChild(fileItem);
    });

    // Enable the Merge Button
    mergeBtn.disabled = false;
});

// Merge the PDFs in the reordered sequence
mergeBtn.addEventListener('click', async () => {
    const files = Array.from(fileInputMerge.files);
    const fileOrder = Array.from(document.querySelectorAll('.file-item')).map(item => item.dataset.fileName);
    const orderedFiles = fileOrder.map(fileName => files.find(file => file.name === fileName));

    const mergedPdf = await PDFLib.PDFDocument.create();

    for (const file of orderedFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    downloadFile('merged-pdfs.pdf', mergedPdfBytes, mergeDownloadContainer, mergeDownloadLink);
});

// Helper function to download the merged PDF
function downloadFile(filename, data, container, link) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = filename;
    link.style.display = 'inline-block'; // Show the download link
    link.textContent = 'Download Merged PDF';

    container.style.display = 'block';
}

// Ensure the DOM is fully loaded before adding the event listener
document.addEventListener("DOMContentLoaded", function() {
    // Add click event to the refresh button
    document.getElementById("refreshBtn").addEventListener("click", function() {
        location.reload(); // Reload the page
    });
});
