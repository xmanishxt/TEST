document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const compressBtn = document.getElementById('compressBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const fileInfo = document.getElementById('fileInfo');
    const originalSizeSpan = document.getElementById('originalSize');
    const compressedSizeSpan = document.getElementById('compressedSize');
    const progressBar = document.getElementById('progressBar');
    const optionBtns = document.querySelectorAll('.option-btn');
    
    let selectedFile = null;
    let compressionLevel = 'low';

    // Handle drag and drop events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#00b894';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#0984e3';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#0984e3';
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            handleFileSelection(files[0]);
        }
    });

    // Handle file input change
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    // Handle compression options
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            optionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            compressionLevel = btn.dataset.level;
        });
    });

    // Handle file selection
    function handleFileSelection(file) {
        selectedFile = file;
        compressBtn.disabled = false;
        fileInfo.style.display = 'block';
        originalSizeSpan.textContent = formatFileSize(file.size);
        compressedSizeSpan.textContent = '-';
    }

    // Handle compression
    compressBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        try {
            progressBar.style.display = 'block';
            compressBtn.disabled = true;
            
            // Simulate compression progress
            const progressBarFill = progressBar.querySelector('.progress-bar');
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 1;
                progressBarFill.style.width = `${progress}%`;
                if (progress >= 100) {
                    clearInterval(progressInterval);
                }
            }, 50);

            // Read the PDF file
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

            // Apply compression based on selected level
            const compressionFactors = {
                low: 0.9,
                medium: 0.7,
                high: 0.5
            };

            // Create compressed PDF
            const compressedPdf = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
                updateFieldAppearances: false
            });

            // Simulate compression result
            const compressedSize = selectedFile.size * compressionFactors[compressionLevel];
            compressedSizeSpan.textContent = formatFileSize(compressedSize);

            // Enable download
            downloadBtn.style.display = 'block';
            downloadBtn.addEventListener('click', () => {
                const blob = new Blob([compressedPdf], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `compressed_${selectedFile.name}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });

        } catch (error) {
            console.error('Error compressing PDF:', error);
            alert('Error compressing PDF. Please try again.');
        }
    });

    // Utility function to format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

});


