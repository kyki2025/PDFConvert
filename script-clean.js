class FileConverter {
    constructor() {
        this.selectedFiles = [];
        this.selectedPdfFile = null;
        this.selectedFormat = null;
        this.init();
    }

    init() {
        // 延迟初始化，确保DOM完全加载
        setTimeout(() => {
            this.setupEventListeners();
            this.setupModeSwitch();
            console.log('文件转换器初始化完成');
        }, 200);
    }

    setupEventListeners() {
        console.log('开始设置事件监听器...');
        
        // 文件转PDF相关元素
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const convertBtn = document.getElementById('convertBtn');
        const clearBtn = document.getElementById('clearBtn');

        // PDF转文件相关元素
        const pdfUploadArea = document.getElementById('pdfUploadArea');
        const pdfFileInput = document.getElementById('pdfFileInput');
        const convertFromPdfBtn = document.getElementById('convertFromPdfBtn');
        const clearPdfBtn = document.getElementById('clearPdfBtn');

        console.log('元素检查结果:');
        console.log('- uploadArea:', !!uploadArea);
        console.log('- fileInput:', !!fileInput);
        console.log('- pdfUploadArea:', !!pdfUploadArea);
        console.log('- pdfFileInput:', !!pdfFileInput);

        // 绑定文件转PDF事件
        if (uploadArea && fileInput) {
            console.log('绑定文件转PDF事件');
            
            // 点击事件
            uploadArea.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('点击上传区域，触发文件选择');
                fileInput.click();
            });
            
            // 拖拽事件
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                uploadArea.classList.remove('dragover');
                console.log('拖拽文件到上传区域:', e.dataTransfer.files.length, '个文件');
                this.handleFiles(e.dataTransfer.files);
            });
            
            // 文件选择事件
            fileInput.addEventListener('change', (e) => {
                console.log('文件输入变化:', e.target.files.length, '个文件');
                this.handleFiles(e.target.files);
            });
        }

        // 绑定PDF转文件事件
        if (pdfUploadArea && pdfFileInput) {
            console.log('绑定PDF转文件事件');
            
            // 点击事件
            pdfUploadArea.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('点击PDF上传区域，触发文件选择');
                pdfFileInput.click();
            });
            
            // 拖拽事件
            pdfUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                pdfUploadArea.classList.add('dragover');
            });
            
            pdfUploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                pdfUploadArea.classList.remove('dragover');
            });
            
            pdfUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                pdfUploadArea.classList.remove('dragover');
                console.log('拖拽PDF文件到上传区域');
                if (e.dataTransfer.files.length > 0) {
                    this.handlePdfFile(e.dataTransfer.files[0]);
                }
            });
            
            // PDF文件选择事件
            pdfFileInput.addEventListener('change', (e) => {
                console.log('PDF文件输入变化');
                if (e.target.files.length > 0) {
                    this.handlePdfFile(e.target.files[0]);
                }
            });
        }

        // 绑定按钮事件
        if (convertBtn) {
            convertBtn.addEventListener('click', () => this.convertToPdf());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFiles());
        }

        if (convertFromPdfBtn) {
            convertFromPdfBtn.addEventListener('click', () => this.convertPdfToFile());
        }

        if (clearPdfBtn) {
            clearPdfBtn.addEventListener('click', () => this.clearPdfFile());
        }

        // 绑定格式选择按钮事件
        const formatBtns = document.querySelectorAll('.format-btn');
        console.log('找到格式按钮数量:', formatBtns.length);
        
        formatBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 清除其他按钮的选中状态
                formatBtns.forEach(b => b.classList.remove('selected'));
                // 设置当前按钮为选中状态
                btn.classList.add('selected');
                this.selectedFormat = btn.getAttribute('data-format');
                this.updatePdfConvertButton();
                console.log('选择转换格式:', this.selectedFormat);
            });
        });

        console.log('事件监听器设置完成');
    }

    setupModeSwitch() {
        const toPdfTab = document.getElementById('toPdfTab');
        const fromPdfTab = document.getElementById('fromPdfTab');
        const toPdfMode = document.getElementById('toPdfMode');
        const fromPdfMode = document.getElementById('fromPdfMode');

        if (toPdfTab && fromPdfTab && toPdfMode && fromPdfMode) {
            console.log('设置模式切换事件');
            
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
        console.log('处理选择的文件:', files.length, '个');
        this.selectedFiles = Array.from(files);
        this.displaySelectedFiles();
        this.updateConvertButton();
    }

    handlePdfFile(file) {
        console.log('处理PDF文件:', file ? file.name : '无文件');
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
                <div class="file-info">
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${this.formatFileSize(file.size)}</p>
                    </div>
                </div>
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
            
            // 检查PDF.js是否加载
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js库未加载');
            }
            
            // 配置PDF.js
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            
            const lastModified = new Date(file.lastModified).toLocaleString('zh-CN');
            
            container.innerHTML = `
                <div class="pdf-info-item">
                    <span class="pdf-info-label">文件名:</span>
                    <span class="pdf-info-value">${file.name}</span>
                </div>
                <div class="pdf-info-item">
                    <span class="pdf-info-label">文件大小:</span>
                    <span class="pdf-info-value">${this.formatFileSize(file.size)}</span>
                </div>
                <div class="pdf-info-item">
                    <span class="pdf-info-label">页数:</span>
                    <span class="pdf-info-value">${pdf.numPages} 页</span>
                </div>
                <div class="pdf-info-item">
                    <span class="pdf-info-label">修改时间:</span>
                    <span class="pdf-info-value">${lastModified}</span>
                </div>
                <div class="pdf-info-item">
                    <span class="pdf-info-label">状态:</span>
                    <span class="pdf-info-value">PDF文件读取成功</span>
                </div>
            `;
        } catch (error) {
            console.error('PDF信息读取失败:', error);
            container.innerHTML = `
                <div class="pdf-info-item">
                    <span class="pdf-info-label">文件名:</span>
                    <span class="pdf-info-value">${file.name}</span>
                </div>
                <div class="pdf-info-item">
                    <span class="pdf-info-label">文件大小:</span>
                    <span class="pdf-info-value">${this.formatFileSize(file.size)}</span>
                </div>
                <div class="pdf-info-item">
                    <span class="pdf-info-label">状态:</span>
                    <span class="pdf-info-value">PDF文件读取失败: ${error.message}</span>
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
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
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
        const pdfFileInput = document.getElementById('pdfFileInput');
        if (pdfFileInput) pdfFileInput.value = '';
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
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js库未加载');
            }
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += `第${i}页:\n${pageText}\n\n`;
            }
            
            const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
            const fileName = this.selectedPdfFile.name.replace('.pdf', '.txt');
            this.downloadFile(blob, fileName);
            
        } catch (error) {
            throw new Error(`PDF转文本失败: ${error.message}`);
        }
    }

    async convertPdfToDocx(arrayBuffer) {
        try {
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js库未加载');
            }
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            
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
                
                allText.push('');
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
            
        } catch (error) {
            throw new Error(`PDF转DOCX失败: ${error.message}`);
        }
    }

    async convertPdfToExcel(arrayBuffer) {
        try {
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js库未加载');
            }
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            
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
                
                worksheet['!cols'] = [
                    { wch: 15 },
                    { wch: 80 }
                ];
                
                worksheet['!rows'] = [
                    { hpt: 20 },
                    { hpt: 200 }
                ];
                
                XLSX.utils.book_append_sheet(workbook, worksheet, `第${i}页`);
            }
            
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const fileName = this.selectedPdfFile.name.replace('.pdf', '.xlsx');
            this.downloadFile(blob, fileName);
            
        } catch (error) {
            throw new Error(`PDF转Excel失败: ${error.message}`);
        }
    }

    async convertPdfToImages(arrayBuffer, format) {
        try {
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
            
            const totalPages = pdf.numPages;
            let scale = 1.0;
            
            const pageSpacing = 30;
            let maxWidth = 0;
            let totalHeight = 0;
            const pageCanvases = [];
            
            // 处理每一页
            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
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
                
                if (pageNum < totalPages) {
                    totalHeight += pageSpacing;
                }
                
                page.cleanup();
            }
            
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
                const x = (maxWidth - canvas.width) / 2;
                
                mergedContext.drawImage(canvas, x, currentY, canvas.width, canvas.height);
                
                // 添加页码标识
                mergedContext.fillStyle = '#666666';
                mergedContext.font = '16px Arial';
                mergedContext.textAlign = 'center';
                mergedContext.fillText(`第 ${i + 1} 页`, maxWidth / 2, currentY + canvas.height + 20);
                
                currentY += canvas.height + pageSpacing;
            }
            
            // 生成图片
            const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
            const quality = format === 'jpeg' ? 0.7 : undefined;
            
            const blob = await new Promise((resolve, reject) => {
                mergedCanvas.toBlob((blob) => {
                    if (blob && blob.size > 0) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas转换为Blob失败'));
                    }
                }, mimeType, quality);
            });
            
            const fileName = this.selectedPdfFile.name.replace('.pdf', `.${format === 'jpeg' ? 'jpg' : format}`);
            this.downloadFile(blob, fileName);
            
        } catch (error) {
            throw new Error(`PDF转图片失败: ${error.message}`);
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

// 全局变量
let fileConverter;

// 安全的初始化函数
function initializeConverter() {
    try {
        console.log('开始初始化文件转换器...');
        fileConverter = new FileConverter();
        console.log('文件转换器初始化成功');
        
        // 验证关键元素
        const elements = {
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            pdfUploadArea: document.getElementById('pdfUploadArea'),
            pdfFileInput: document.getElementById('pdfFileInput')
        };
        
        console.log('关键元素检查:', elements);
        
    } catch (error) {
        console.error('文件转换器初始化失败:', error);
        // 延迟重试
        setTimeout(() => {
            console.log('尝试重新初始化...');
            try {
                fileConverter = new FileConverter();
                console.log('重新初始化成功');
            } catch (retryError) {
                console.error('重新初始化也失败:', retryError);
            }
        }, 1000);
    }
}

// 多种初始化方式
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeConverter);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    // DOM已经加载完成
    setTimeout(initializeConverter, 100);
}

// 备用初始化
window.addEventListener('load', () => {
    if (!fileConverter) {
        console.log('备用初始化触发');
        setTimeout(initializeConverter, 200);
    }
});
