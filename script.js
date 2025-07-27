class FileConverter {
    constructor() {
        this.selectedFiles = [];
        this.selectedPdfFile = null;
        this.selectedFormat = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupModeSwitch();
    }

    setupEventListeners() {
        // 等待DOM完全加载后再绑定事件
        setTimeout(() => {
            // 文件转PDF相关
            const uploadArea = document.getElementById('uploadArea');
            const fileInput = document.getElementById('fileInput');
            const convertBtn = document.getElementById('convertBtn');
            const clearBtn = document.getElementById('clearBtn');

            // PDF转文件相关
            const pdfUploadArea = document.getElementById('pdfUploadArea');
            const pdfFileInput = document.getElementById('pdfFileInput');
            const convertFromPdfBtn = document.getElementById('convertFromPdfBtn');
            const clearPdfBtn = document.getElementById('clearPdfBtn');

            console.log('设置事件监听器...');
            console.log('uploadArea:', uploadArea);
            console.log('fileInput:', fileInput);

            // 文件转PDF事件
            if (uploadArea && fileInput) {
                console.log('绑定文件转PDF事件');
                uploadArea.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('点击上传区域');
                    fileInput.click();
                });
                
                uploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadArea.classList.add('dragover');
                });
                
                uploadArea.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    uploadArea.classList.remove('dragover');
                });
                
                uploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadArea.classList.remove('dragover');
                    console.log('拖拽文件:', e.dataTransfer.files);
                    this.handleFiles(e.dataTransfer.files);
                });
                
                fileInput.addEventListener('change', (e) => {
                    console.log('文件选择变化:', e.target.files);
                    this.handleFiles(e.target.files);
                });
            } else {
                console.error('找不到上传区域或文件输入元素');
            }

            if (convertBtn) {
                convertBtn.addEventListener('click', () => this.convertToPdf());
            }

            if (clearBtn) {
                clearBtn.addEventListener('click', () => this.clearFiles());
            }

            // PDF转文件事件
            if (pdfUploadArea && pdfFileInput) {
                console.log('绑定PDF转文件事件');
                pdfUploadArea.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('点击PDF上传区域');
                    pdfFileInput.click();
                });
                
                pdfUploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    pdfUploadArea.classList.add('dragover');
                });
                
                pdfUploadArea.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    pdfUploadArea.classList.remove('dragover');
                });
                
                pdfUploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    pdfUploadArea.classList.remove('dragover');
                    console.log('拖拽PDF文件:', e.dataTransfer.files);
                    if (e.dataTransfer.files.length > 0) {
                        this.handlePdfFile(e.dataTransfer.files[0]);
                    }
                });
                
                pdfFileInput.addEventListener('change', (e) => {
                    console.log('PDF文件选择变化:', e.target.files);
                    if (e.target.files.length > 0) {
                        this.handlePdfFile(e.target.files[0]);
                    }
                });
            } else {
                console.error('找不到PDF上传区域或文件输入元素');
            }

            if (convertFromPdfBtn) {
                convertFromPdfBtn.addEventListener('click', () => this.convertPdfToFile());
            }

            if (clearPdfBtn) {
                clearPdfBtn.addEventListener('click', () => this.clearPdfFile());
            }

            // 格式选择按钮事件
            const formatBtns = document.querySelectorAll('.format-btn');
            console.log('格式按钮数量:', formatBtns.length);
            formatBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    formatBtns.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    this.selectedFormat = btn.getAttribute('data-format');
                    this.updatePdfConvertButton();
                    console.log('选择格式:', this.selectedFormat);
                });
            });
        }, 100);
    }

    setupModeSwitch() {
        const toPdfTab = document.getElementById('toPdfTab');
        const fromPdfTab = document.getElementById('fromPdfTab');
        const toPdfMode = document.getElementById('toPdfMode');
        const fromPdfMode = document.getElementById('fromPdfMode');

        if (toPdfTab && fromPdfTab && toPdfMode && fromPdfMode) {
            toPdfTab.addEventListener('click', () => {
                toPdfTab.classList.add('active');
                fromPdfTab.classList.remove('active');
                toPdfMode.style.display = 'block';
                fromPdfMode.style.display = 'none';
                console.log('切换到文件转PDF模式');
            });

            fromPdfTab.addEventListener('click', () => {
                fromPdfTab.classList.add('active');
                toPdfTab.classList.remove('active');
                fromPdfMode.style.display = 'block';
                toPdfMode.style.display = 'none';
                console.log('切换到PDF转文件模式');
            });
        }
    }

    handleFiles(files) {
        this.selectedFiles = Array.from(files);
        this.displaySelectedFiles();
        this.updateConvertButton();
    }

    handlePdfFile(file) {
        console.log('处理PDF文件:', file);
        if (file && file.type === 'application/pdf') {
            this.selectedPdfFile = file;
            this.displayPdfInfo(file);
            this.showPdfOptions();
        } else {
            alert('请选择PDF格式的文件');
        }
    }

    displaySelectedFiles() {
        const container = document.getElementById('selectedFiles');
        if (!container) return;

        if (this.selectedFiles.length === 0) {
            container.innerHTML = '<p>暂无选择文件</p>';
            return;
        }

        const html = this.selectedFiles.map((file, index) => `
            <div class="file-item">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
                <button class="remove-btn" onclick="fileConverter.removeFile(${index})">×</button>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    async displayPdfInfo(file) {
        const container = document.getElementById('pdfDetails');
        if (!container) return;

        try {
            const arrayBuffer = await file.arrayBuffer();
            
            // 确保PDF.js正确配置
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js库未加载');
            }
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            
            const lastModified = new Date(file.lastModified).toLocaleString('zh-CN');
            
            container.innerHTML = `
                <div class="pdf-info-item">
                    <span class="info-label">文件名:</span>
                    <span class="info-value">${file.name}</span>
                </div>
                <div class="pdf-info-item">
                    <span class="info-label">文件大小:</span>
                    <span class="info-value">${this.formatFileSize(file.size)}</span>
                </div>
                <div class="pdf-info-item">
                    <span class="info-label">页数:</span>
                    <span class="info-value">${pdf.numPages} 页</span>
                </div>
                <div class="pdf-info-item">
                    <span class="info-label">修改时间:</span>
                    <span class="info-value">${lastModified}</span>
                </div>
                <div class="pdf-info-item">
                    <span class="info-label">状态:</span>
                    <span class="info-value status-success">PDF文件读取成功</span>
                </div>
            `;
        } catch (error) {
            console.error('PDF信息读取失败:', error);
            container.innerHTML = `
                <div class="pdf-info-item">
                    <span class="info-label">文件名:</span>
                    <span class="info-value">${file.name}</span>
                </div>
                <div class="pdf-info-item">
                    <span class="info-label">文件大小:</span>
                    <span class="info-value">${this.formatFileSize(file.size)}</span>
                </div>
                <div class="pdf-info-item">
                    <span class="info-label">状态:</span>
                    <span class="info-value status-error">PDF文件读取失败: ${error.message}</span>
                </div>
            `;
        }
    }

    showPdfOptions() {
        const pdfFileInfo = document.getElementById('pdfFileInfo');
        const conversionOptions = document.getElementById('conversionOptions');
        const pdfControls = document.getElementById('pdfControls');

        if (pdfFileInfo) pdfFileInfo.style.display = 'block';
        if (conversionOptions) conversionOptions.style.display = 'block';
        if (pdfControls) pdfControls.style.display = 'block';
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.displaySelectedFiles();
        this.updateConvertButton();
    }

    clearFiles() {
        this.selectedFiles = [];
        this.displaySelectedFiles();
        this.updateConvertButton();
        document.getElementById('fileInput').value = '';
    }

    clearPdfFile() {
        this.selectedPdfFile = null;
        this.selectedFormat = null;
        
        const pdfDetails = document.getElementById('pdfDetails');
        const pdfFileInfo = document.getElementById('pdfFileInfo');
        const conversionOptions = document.getElementById('conversionOptions');
        const pdfControls = document.getElementById('pdfControls');
        
        if (pdfDetails) pdfDetails.innerHTML = '';
        if (pdfFileInfo) pdfFileInfo.style.display = 'none';
        if (conversionOptions) conversionOptions.style.display = 'none';
        if (pdfControls) pdfControls.style.display = 'none';
        
        // 清除格式选择
        const formatBtns = document.querySelectorAll('.format-btn');
        formatBtns.forEach(btn => btn.classList.remove('selected'));
        
        this.updatePdfConvertButton();
        document.getElementById('pdfFileInput').value = '';
    }

    updateConvertButton() {
        const convertBtn = document.getElementById('convertBtn');
        if (convertBtn) {
            convertBtn.disabled = this.selectedFiles.length === 0;
        }
    }

    updatePdfConvertButton() {
        const convertBtn = document.getElementById('convertFromPdfBtn');
        if (convertBtn) {
            convertBtn.disabled = !this.selectedPdfFile || !this.selectedFormat;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    async convertToPdf() {
        if (this.selectedFiles.length === 0) return;

        const convertBtn = document.getElementById('convertBtn');
        const originalText = convertBtn.textContent;
        
        try {
            convertBtn.textContent = '转换中...';
            convertBtn.disabled = true;

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            let isFirstPage = true;

            for (const file of this.selectedFiles) {
                if (!isFirstPage) {
                    pdf.addPage();
                }

                await this.addFileToPdf(pdf, file);
                isFirstPage = false;
            }

            pdf.save('converted-files.pdf');
            
        } catch (error) {
            console.error('转换失败:', error);
            alert(`转换失败: ${error.message}`);
        } finally {
            convertBtn.textContent = originalText;
            convertBtn.disabled = false;
        }
    }

    async addFileToPdf(pdf, file) {
        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        if (fileType.startsWith('image/')) {
            await this.addImageToPdf(pdf, file);
        } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
            await this.addTextToPdf(pdf, file);
        } else if (fileName.endsWith('.docx')) {
            await this.addDocxToPdf(pdf, file);
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            await this.addExcelToPdf(pdf, file);
        } else {
            throw new Error(`不支持的文件格式: ${file.name}`);
        }
    }

    async addImageToPdf(pdf, file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const img = new Image();
                    img.onload = () => {
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const pageHeight = pdf.internal.pageSize.getHeight();
                        const margin = 20;
                        
                        const maxWidth = pageWidth - 2 * margin;
                        const maxHeight = pageHeight - 2 * margin;
                        
                        let { width, height } = this.calculateImageSize(img.width, img.height, maxWidth, maxHeight);
                        
                        const x = (pageWidth - width) / 2;
                        const y = (pageHeight - height) / 2;
                        
                        pdf.addImage(e.target.result, 'JPEG', x, y, width, height);
                        resolve();
                    };
                    img.onerror = () => reject(new Error('图片加载失败'));
                    img.src = e.target.result;
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsDataURL(file);
        });
    }

    async addTextToPdf(pdf, file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const lines = text.split('\n');
                    
                    pdf.setFontSize(12);
                    const pageHeight = pdf.internal.pageSize.getHeight();
                    const margin = 20;
                    const lineHeight = 7;
                    const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);
                    
                    let currentLine = 0;
                    let y = margin;
                    
                    for (const line of lines) {
                        if (currentLine >= maxLinesPerPage) {
                            pdf.addPage();
                            y = margin;
                            currentLine = 0;
                        }
                        
                        pdf.text(line, margin, y);
                        y += lineHeight;
                        currentLine++;
                    }
                    
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    async addDocxToPdf(pdf, file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target.result;
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    const text = result.value;
                    
                    const lines = text.split('\n').filter(line => line.trim() !== '');
                    
                    pdf.setFontSize(12);
                    const pageHeight = pdf.internal.pageSize.getHeight();
                    const margin = 20;
                    const lineHeight = 7;
                    const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);
                    
                    let currentLine = 0;
                    let y = margin;
                    
                    for (const line of lines) {
                        if (currentLine >= maxLinesPerPage) {
                            pdf.addPage();
                            y = margin;
                            currentLine = 0;
                        }
                        
                        pdf.text(line, margin, y);
                        y += lineHeight;
                        currentLine++;
                    }
                    
                    resolve();
                } catch (error) {
                    reject(new Error(`DOCX处理失败: ${error.message}`));
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsArrayBuffer(file);
        });
    }

    async addExcelToPdf(pdf, file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    pdf.setFontSize(10);
                    const margin = 20;
                    let y = margin;
                    const lineHeight = 6;
                    const pageHeight = pdf.internal.pageSize.getHeight();
                    
                    workbook.SheetNames.forEach((sheetName, sheetIndex) => {
                        if (sheetIndex > 0) {
                            pdf.addPage();
                            y = margin;
                        }
                        
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        
                        pdf.setFontSize(14);
                        pdf.text(`工作表: ${sheetName}`, margin, y);
                        y += lineHeight * 2;
                        pdf.setFontSize(10);
                        
                        jsonData.forEach(row => {
                            if (y > pageHeight - margin) {
                                pdf.addPage();
                                y = margin;
                            }
                            
                            const rowText = row.join(' | ');
                            pdf.text(rowText, margin, y);
                            y += lineHeight;
                        });
                        
                        y += lineHeight;
                    });
                    
                    resolve();
                } catch (error) {
                    reject(new Error(`Excel处理失败: ${error.message}`));
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsArrayBuffer(file);
        });
    }

    calculateImageSize(originalWidth, originalHeight, maxWidth, maxHeight) {
        let width = originalWidth;
        let height = originalHeight;
        
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }
        
        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
        
        return { width, height };
    }

    async convertPdfToFile() {
        if (!this.selectedPdfFile || !this.selectedFormat) {
            alert('请选择PDF文件和输出格式');
            return;
        }

        const convertBtn = document.getElementById('convertFromPdfBtn');
        const originalText = convertBtn.textContent;
        
        try {
            convertBtn.textContent = '转换中...';
            convertBtn.disabled = true;

            const arrayBuffer = await this.selectedPdfFile.arrayBuffer();
            
            switch (this.selectedFormat) {
                case 'txt':
                    await this.convertPdfToText(arrayBuffer);
                    break;
                case 'docx':
                    await this.convertPdfToDocx(arrayBuffer);
                    break;
                case 'xlsx':
                    await this.convertPdfToExcel(arrayBuffer);
                    break;
                case 'png':
                case 'jpg':
                    await this.convertPdfToImages(arrayBuffer, this.selectedFormat);
                    break;
                default:
                    throw new Error('不支持的输出格式');
            }
            
        } catch (error) {
            console.error('转换失败:', error);
            alert(`转换失败: ${error.message}`);
        } finally {
            convertBtn.textContent = originalText;
            convertBtn.disabled = false;
        }
    }

    async convertPdfToText(arrayBuffer) {
        try {
            console.log('开始PDF转文本转换');
            
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js库未加载');
            }
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            console.log(`PDF加载成功，共${pdf.numPages}页`);
            
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += `第${i}页:\n${pageText}\n\n`;
                console.log(`第${i}页文本提取完成`);
            }
            
            const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
            const fileName = this.selectedPdfFile.name.replace('.pdf', '.txt');
            this.downloadFile(blob, fileName);
            
            console.log('PDF转文本转换完成');
            
        } catch (error) {
            console.error('PDF转文本错误:', error);
            throw new Error(`PDF转文本失败: ${error.message}`);
        }
    }

    async convertPdfToDocx(arrayBuffer) {
        try {
            console.log('开始PDF转DOCX转换');
            
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js库未加载');
            }
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            console.log(`PDF加载成功，共${pdf.numPages}页`);
            
            let allText = [];
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                
                allText.push(`=== 第${i}页 ===`);
                
                textContent.items.forEach(item => {
                    if (item.str.trim()) {
                        allText.push(item.str.trim());
                    }
                });
                
                allText.push(''); // 页面间空行
                console.log(`第${i}页文本提取完成`);
            }
            
            // 创建DOCX文档
            const docContent = allText.map(text => 
                text ? `<w:p><w:r><w:t>${this.escapeXml(text)}</w:t></w:r></w:p>` : '<w:p></w:p>'
            ).join('');
            
            const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        ${docContent}
    </w:body>
</w:document>`;
            
            // 创建ZIP文件结构
            const zip = new JSZip();
            
            // 添加必要的文件
            zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
            
            zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
            
            zip.folder('word').file('document.xml', docXml);
            
            zip.folder('word/_rels').file('document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);
            
            const blob = await zip.generateAsync({ type: 'blob' });
            const fileName = this.selectedPdfFile.name.replace('.pdf', '.docx');
            this.downloadFile(blob, fileName);
            
            console.log('PDF转DOCX转换完成');
            
        } catch (error) {
            console.error('PDF转DOCX错误:', error);
            throw new Error(`PDF转DOCX失败: ${error.message}`);
        }
    }

    async convertPdfToExcel(arrayBuffer) {
        try {
            console.log('开始PDF转Excel转换');
            
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js库未加载');
            }
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            console.log(`PDF加载成功，共${pdf.numPages}页`);
            
            const workbook = XLSX.utils.book_new();
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                
                const pageText = textContent.items
                    .map(item => item.str)
                    .filter(str => str.trim())
                    .join('\n');
                
                const worksheetData = [
                    [`第${i}页内容`],
                    [pageText]
                ];
                
                const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
                
                // 设置单元格样式，启用文本换行
                worksheet['B1'] = {
                    v: pageText,
                    t: 's',
                    s: {
                        alignment: {
                            wrapText: true,
                            vertical: 'top'
                        }
                    }
                };
                
                // 设置列宽
                worksheet['!cols'] = [
                    { wch: 15 }, // A列宽度
                    { wch: 80 }  // B列宽度
                ];
                
                // 设置行高
                worksheet['!rows'] = [
                    { hpt: 20 }, // 第1行高度
                    { hpt: 200 } // 第2行高度，足够显示多行文本
                ];
                
                XLSX.utils.book_append_sheet(workbook, worksheet, `第${i}页`);
                console.log(`第${i}页Excel处理完成`);
            }
            
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const fileName = this.selectedPdfFile.name.replace('.pdf', '.xlsx');
            this.downloadFile(blob, fileName);
            
            console.log('PDF转Excel转换完成');
            
        } catch (error) {
            console.error('PDF转Excel错误:', error);
            throw new Error(`PDF转Excel失败: ${error.message}`);
        }
    }

    // 修复后的PDF转图片方法 - 确保处理所有页面
    async convertPdfToImages(arrayBuffer, format) {
        try {
            console.log('=== 开始PDF转图片调试 ===');
            console.log('格式:', format);
            
            // 确保PDF.js正确配置
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js库未加载');
            }
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const loadingTask = pdfjsLib.getDocument({ 
                data: arrayBuffer,
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                cMapPacked: true,
                maxImageSize: 1024 * 1024,
                disableFontFace: true
            });
            const pdf = await loadingTask.promise;
            
            console.log(`PDF加载成功，总页数: ${pdf.numPages}`);
            
            // 确保处理所有页面
            const totalPages = pdf.numPages;
            let scale = 1.0;
            
            console.log(`确认处理页数: 总页数=${totalPages}, 最大处理页数=${totalPages}`);
            
            const pageSpacing = 30;
            let maxWidth = 0;
            let totalHeight = 0;
            const pageCanvases = [];
            
            // 详细记录每页处理过程
            let processedPageCount = 0;
            
            // 修复：确保循环能处理到最后一页
            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                console.log(`开始处理第${pageNum}页 (${pageNum}/${totalPages})`);
                
                try {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: scale });
                    
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    // 设置白色背景
                    context.fillStyle = '#ffffff';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // 渲染页面
                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;
                    
                    pageCanvases.push(canvas);
                    maxWidth = Math.max(maxWidth, canvas.width);
                    totalHeight += canvas.height;
                    
                    // 为页面间距预留空间（除了最后一页）
                    if (pageNum < totalPages) {
                        totalHeight += pageSpacing;
                    }
                    
                    // 清理页面对象
                    page.cleanup();
                    
                    processedPageCount++;
                    console.log(`第${pageNum}页处理完成! 已处理页数: ${processedPageCount}/${totalPages}`);
                    
                    // 每处理一页后稍作延迟
                    await new Promise(resolve => setTimeout(resolve, 10));
                    
                } catch (pageError) {
                    console.error(`处理第${pageNum}页时出错:`, pageError);
                    processedPageCount++;
                }
            }
            
            console.log(`=== 页面处理完成 ===`);
            console.log(`总页数: ${totalPages}`);
            console.log(`实际处理页数: ${processedPageCount}`);
            console.log(`Canvas数组长度: ${pageCanvases.length}`);
            
            // 创建合并的canvas
            const mergedCanvas = document.createElement('canvas');
            const mergedContext = mergedCanvas.getContext('2d');
            mergedCanvas.width = maxWidth;
            mergedCanvas.height = totalHeight;
            
            // 设置白色背景
            mergedContext.fillStyle = '#ffffff';
            mergedContext.fillRect(0, 0, maxWidth, totalHeight);
            
            // 将所有页面绘制到合并的canvas上
            let currentY = 0;
            for (let i = 0; i < pageCanvases.length; i++) {
                const canvas = pageCanvases[i];
                console.log(`绘制第${i + 1}页到合并Canvas，Y位置: ${currentY}`);
                
                // 居中绘制每页
                const x = (maxWidth - canvas.width) / 2;
                
                // 绘制页面
                mergedContext.drawImage(canvas, x, currentY, canvas.width, canvas.height);
                
                // 添加页码标识
                mergedContext.fillStyle = '#666666';
                mergedContext.font = '16px Arial';
                mergedContext.textAlign = 'center';
                mergedContext.fillText(`第 ${i + 1} 页`, maxWidth / 2, currentY + canvas.height + 20);
                
                currentY += canvas.height + pageSpacing;
            }
            
            console.log(`页面合并完成，最终Canvas尺寸: ${mergedCanvas.width}x${mergedCanvas.height}`);
            
            // 生成合并后的图片
            const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
            const quality = format === 'jpeg' ? 0.7 : undefined;
            
            // 尝试生成图片
            const blob = await new Promise((resolve, reject) => {
                mergedCanvas.toBlob((blob) => {
                    if (blob && blob.size > 0) {
                        console.log(`图片生成成功，大小: ${blob.size} 字节`);
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas转换为Blob失败'));
                    }
                }, mimeType, quality);
            });
            
            console.log(`=== PDF转图片调试完成 ===`);
            console.log(`最终结果: ${processedPageCount}页处理完成，图片大小: ${blob.size} 字节`);
            
            const fileName = this.selectedPdfFile.name.replace('.pdf', `.${format === 'jpeg' ? 'jpg' : format}`);
            this.downloadFile(blob, fileName);
            
            console.log('PDF转图片转换完成');
            
        } catch (error) {
            console.error('PDF转图片调试错误:', error);
            throw error;
        }
    }

    escapeXml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    downloadFile(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// 初始化应用
let fileConverter;

// 确保DOM完全加载后初始化
function initializeApp() {
    try {
        console.log('开始初始化文件转换器...');
        fileConverter = new FileConverter();
        console.log('文件转换器初始化完成');
        
        // 验证关键元素是否存在
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const pdfUploadArea = document.getElementById('pdfUploadArea');
        const pdfFileInput = document.getElementById('pdfFileInput');
        
        console.log('关键元素检查:');
        console.log('- uploadArea:', !!uploadArea);
        console.log('- fileInput:', !!fileInput);
        console.log('- pdfUploadArea:', !!pdfUploadArea);
        console.log('- pdfFileInput:', !!pdfFileInput);
        
    } catch (error) {
        console.error('文件转换器初始化失败:', error);
        // 尝试重新初始化
        setTimeout(() => {
            try {
                console.log('尝试重新初始化...');
                fileConverter = new FileConverter();
                console.log('文件转换器重新初始化完成');
            } catch (retryError) {
                console.error('文件转换器重新初始化也失败:', retryError);
            }
        }, 1000);
    }
}

// 多种方式确保初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM已经加载完成
    initializeApp();
}

// 备用初始化
window.addEventListener('load', () => {
    if (!fileConverter) {
        console.log('备用初始化触发');
        initializeApp();
    }
});

// 防止getUserMedia相关错误
if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
    // 只在支持的浏览器中使用
    console.log('浏览器支持媒体设备API');
} else {
    console.log('浏览器不支持媒体设备API，跳过相关功能');
}
