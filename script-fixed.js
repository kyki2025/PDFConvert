// 修复PDF转图片页数丢失问题的脚本
// 主要修复：确保所有页面都被正确处理

class FileConverter {
    constructor() {
        this.selectedFiles = [];
        this.selectedPdfFile = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabSwitching();
    }

    setupEventListeners() {
        // 文件转PDF相关
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const convertBtn = document.getElementById('convertBtn');
        const clearBtn = document.getElementById('clearBtn');

        // PDF转文件相关
        const pdfUploadArea = document.getElementById('pdfUploadArea');
        const pdfFileInput = document.getElementById('pdfFileInput');
        const pdfConvertBtn = document.getElementById('pdfConvertBtn');
        const pdfClearBtn = document.getElementById('pdfClearBtn');

        // 文件转PDF事件
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                this.handleFiles(e.dataTransfer.files);
            });
            fileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
            });
        }

        if (convertBtn) {
            convertBtn.addEventListener('click', () => this.convertToPdf());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFiles());
        }

        // PDF转文件事件
        if (pdfUploadArea && pdfFileInput) {
            pdfUploadArea.addEventListener('click', () => pdfFileInput.click());
            pdfUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                pdfUploadArea.classList.add('dragover');
            });
            pdfUploadArea.addEventListener('dragleave', () => {
                pdfUploadArea.classList.remove('dragover');
            });
            pdfUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                pdfUploadArea.classList.remove('dragover');
                this.handlePdfFile(e.dataTransfer.files[0]);
            });
            pdfFileInput.addEventListener('change', (e) => {
                this.handlePdfFile(e.target.files[0]);
            });
        }

        if (pdfConvertBtn) {
            pdfConvertBtn.addEventListener('click', () => this.convertPdfToFile());
        }

        if (pdfClearBtn) {
            pdfClearBtn.addEventListener('click', () => this.clearPdfFile());
        }
    }

    setupTabSwitching() {
        const tabs = document.querySelectorAll('.tab');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.getAttribute('data-tab');
                
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(targetId).classList.add('active');
            });
        });
    }

    handleFiles(files) {
        this.selectedFiles = Array.from(files);
        this.displaySelectedFiles();
        this.updateConvertButton();
    }

    handlePdfFile(file) {
        if (file && file.type === 'application/pdf') {
            this.selectedPdfFile = file;
            this.displayPdfInfo(file);
            this.updatePdfConvertButton();
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
        const container = document.getElementById('pdfInfo');
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
        document.getElementById('pdfInfo').innerHTML = '';
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
        const convertBtn = document.getElementById('pdfConvertBtn');
        if (convertBtn) {
            convertBtn.disabled = !this.selectedPdfFile;
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
        if (!this.selectedPdfFile) return;

        const selectedFormat = document.querySelector('input[name="outputFormat"]:checked')?.value;
        if (!selectedFormat) {
            alert('请选择输出格式');
            return;
        }

        const convertBtn = document.getElementById('pdfConvertBtn');
        const originalText = convertBtn.textContent;
        
        try {
            convertBtn.textContent = '转换中...';
            convertBtn.disabled = true;

            const arrayBuffer = await this.selectedPdfFile.arrayBuffer();
            
            switch (selectedFormat) {
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
                    await this.convertPdfToImages(arrayBuffer, selectedFormat);
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
            const maxPages = totalPages; // 处理所有页面
            let scale = 1.0;
            
            console.log(`确认处理页数: 总页数=${totalPages}, 最大处理页数=${maxPages}`);
            
            const pageSpacing = 30;
            const batchSize = 3; // 减少批次大小以便更好调试
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
                    console.log(`Canvas尺寸: ${canvas.width}x${canvas.height}`);
                    console.log(`当前最大宽度: ${maxWidth}, 总高度: ${totalHeight}`);
                    
                    // 每处理一页后稍作延迟
                    await new Promise(resolve => setTimeout(resolve, 10));
                    
                } catch (pageError) {
                    console.error(`处理第${pageNum}页时出错:`, pageError);
                    // 创建错误页面
                    const errorCanvas = document.createElement('canvas');
                    errorCanvas.width = 800;
                    errorCanvas.height = 600;
                    const errorContext = errorCanvas.getContext('2d');
                    errorContext.fillStyle = '#ffffff';
                    errorContext.fillRect(0, 0, 800, 600);
                    errorContext.fillStyle = '#ff0000';
                    errorContext.font = '24px Arial';
                    errorContext.textAlign = 'center';
                    errorContext.fillText(`第${pageNum}页处理失败`, 400, 300);
                    errorContext.fillText(pageError.message, 400, 350);
                    
                    pageCanvases.push(errorCanvas);
                    maxWidth = Math.max(maxWidth, 800);
                    totalHeight += 600 + pageSpacing;
                    
                    processedPageCount++;
                    console.log(`第${pageNum}页处理失败，但已添加错误页面! 已处理页数: ${processedPageCount}/${totalPages}`);
                }
                
                // 每3页后稍作延迟和垃圾回收
                if (pageNum % 3 === 0 && pageNum < totalPages) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (window.gc) window.gc();
                }
            }
            
            console.log(`=== 页面处理完成 ===`);
            console.log(`总页数: ${totalPages}`);
            console.log(`实际处理页数: ${processedPageCount}`);
            console.log(`Canvas数组长度: ${pageCanvases.length}`);
            console.log(`最终尺寸: ${maxWidth}x${totalHeight}`);
            
            // 验证是否所有页面都被处理
            if (processedPageCount !== totalPages) {
                console.error(`警告: 处理页数不匹配! 期望${totalPages}页，实际处理${processedPageCount}页`);
            }
            
            if (pageCanvases.length !== totalPages) {
                console.error(`警告: Canvas数量不匹配! 期望${totalPages}个，实际${pageCanvases.length}个`);
            }
            
            // 继续合并处理...
            console.log('开始合并所有页面...');
            
            // 检查合并后的尺寸是否过大
            const maxPixels = 50000000;
            if (maxWidth * totalHeight > maxPixels) {
                console.warn('图片尺寸过大，将进一步降低质量');
                const scaleFactor = Math.sqrt(maxPixels / (maxWidth * totalHeight));
                maxWidth = Math.floor(maxWidth * scaleFactor);
                totalHeight = Math.floor(totalHeight * scaleFactor);
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
                console.log(`绘制第${i + 1}页到合并Canvas，Y位置: ${currentY}`);
                
                // 计算缩放比例（如果需要）
                const scaleX = maxWidth / canvas.width;
                const scaleY = scaleX; // 保持宽高比
                const scaledWidth = canvas.width * scaleX;
                const scaledHeight = canvas.height * scaleY;
                
                // 居中绘制每页
                const x = (maxWidth - scaledWidth) / 2;
                
                // 绘制页面
                mergedContext.drawImage(canvas, x, currentY, scaledWidth, scaledHeight);
                
                // 添加页码标识
                mergedContext.fillStyle = '#666666';
                mergedContext.font = '16px Arial';
                mergedContext.textAlign = 'center';
                mergedContext.fillText(`第 ${i + 1} 页`, maxWidth / 2, currentY + scaledHeight + 20);
                
                currentY += scaledHeight;
                
                // 添加页面间距（除了最后一页）
                if (i < pageCanvases.length - 1) {
                    currentY += pageSpacing;
                }
                
                // 清理canvas引用
                pageCanvases[i] = null;
            }
            
            console.log(`页面合并完成，最终Canvas尺寸: ${mergedCanvas.width}x${mergedCanvas.height}`);
            
            // 生成合并后的图片
            const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
            const quality = format === 'jpeg' ? 0.7 : undefined;
            
            // 尝试生成图片
            let blob = null;
            
            try {
                blob = await new Promise((resolve, reject) => {
                    mergedCanvas.toBlob((blob) => {
                        if (blob && blob.size > 0) {
                            console.log(`图片生成成功，大小: ${blob.size} 字节`);
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas转换为Blob失败'));
                        }
                    }, mimeType, quality);
                });
            } catch (error) {
                console.warn('toBlob失败，尝试toDataURL:', error.message);
                const dataUrl = mergedCanvas.toDataURL(mimeType, quality);
                if (dataUrl && dataUrl.length > 100) {
                    const response = await fetch(dataUrl);
                    blob = await response.blob();
                    console.log('图片生成成功: toDataURL');
                }
            }
            
            if (!blob || blob.size === 0) {
                throw new Error('生成的图片文件为空');
            }
            
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
document.addEventListener('DOMContentLoaded', () => {
    fileConverter = new FileConverter();
});

// 添加JSZip库支持
if (typeof JSZip === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    document.head.appendChild(script);
}
