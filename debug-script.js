// 临时调试脚本 - 专门用于修复PDF转图片页数问题

// 在convertPdfToImages方法中添加详细日志
async function debugConvertPdfToImages(arrayBuffer, format) {
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
        
        // 分批处理页面
        for (let batchStart = 1; batchStart <= maxPages; batchStart += batchSize) {
            const batchEnd = Math.min(batchStart + batchSize - 1, maxPages);
            console.log(`=== 批次处理: 第${batchStart}-${batchEnd}页 (总共${maxPages}页) ===`);
            
            for (let i = batchStart; i <= batchEnd; i++) {
                console.log(`开始处理第${i}页 (${i}/${maxPages})`);
                
                try {
                    const page = await pdf.getPage(i);
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
                    if (i < maxPages) {
                        totalHeight += pageSpacing;
                    }
                    
                    // 清理页面对象
                    page.cleanup();
                    
                    processedPageCount++;
                    console.log(`第${i}页处理完成! 已处理页数: ${processedPageCount}/${maxPages}`);
                    console.log(`Canvas尺寸: ${canvas.width}x${canvas.height}`);
                    console.log(`当前最大宽度: ${maxWidth}, 总高度: ${totalHeight}`);
                    
                    // 每处理一页后稍作延迟
                    await new Promise(resolve => setTimeout(resolve, 10));
                    
                } catch (pageError) {
                    console.error(`处理第${i}页时出错:`, pageError);
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
                    errorContext.fillText(`第${i}页处理失败`, 400, 300);
                    errorContext.fillText(pageError.message, 400, 350);
                    
                    pageCanvases.push(errorCanvas);
                    maxWidth = Math.max(maxWidth, 800);
                    totalHeight += 600 + pageSpacing;
                    
                    processedPageCount++;
                    console.log(`第${i}页处理失败，但已添加错误页面! 已处理页数: ${processedPageCount}/${maxPages}`);
                }
            }
            
            console.log(`批次 ${batchStart}-${batchEnd} 处理完成`);
            
            // 批次间延迟和垃圾回收
            if (batchEnd < maxPages) {
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
        
        return blob;
        
    } catch (error) {
        console.error('PDF转图片调试错误:', error);
        throw error;
    }
}

// 导出调试函数
window.debugConvertPdfToImages = debugConvertPdfToImages;