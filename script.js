// 照片数据管理
let currentImageIndex = 0;
let filteredImages = [];
let allImageData = [];

// 初始化函数
document.addEventListener('DOMContentLoaded', function() {
    initializeRealTimeClock();
    initializeTheme();
    loadImageDatabase();
});

// 初始化实时时钟
function initializeRealTimeClock() {
    updateClock();
    setInterval(updateClock, 60000); // 每分钟更新一次
}

// 更新时钟显示
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    const dateString = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    document.getElementById('currentTime').textContent = timeString;
    document.getElementById('currentDate').textContent = dateString;
}

// 初始化主题系统
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme');
    
    // 检测系统主题偏好
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 设置初始主题
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // 监听系统主题变化
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    // 主题切换按钮事件
    themeToggle.addEventListener('click', toggleTheme);
}

// 设置主题
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('theme', theme);
}

// 切换主题
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// 加载图片数据库
function loadImageDatabase() {
    try {
        // 从 data.js 获取图片数据
        if (typeof imageDatabase === 'undefined') {
            console.error('未找到图片数据库，请先运行批处理生成 data.js');
            showNoImagesMessage();
            return;
        }
        
        allImageData = imageDatabase;
        
        if (allImageData.length === 0) {
            showNoImagesMessage();
            return;
        }

        // 初始化筛选器（使用metadata.js）
        setupFilterOptions();
        
        // 初始化筛选面板折叠功能
        setupFilterToggle();
        
        // 初始显示所有图片
        filteredImages = [...allImageData];
        
        // 生成界面
        generateThumbnails();
        showImage(0);
        updateImageCounter();
        
        // 设置事件监听
        setupEventListeners();
        
        console.log(`成功加载 ${allImageData.length} 张图片的数据`);
        
    } catch (error) {
        console.error('加载图片数据库失败:', error);
        showNoImagesMessage();
    }
}

// 设置筛选面板折叠功能
function setupFilterToggle() {
    const filterToggle = document.getElementById('filterToggle');
    const filterPanel = document.getElementById('filterPanel');
    
    if (!filterToggle || !filterPanel) return;
    
    filterToggle.addEventListener('click', function() {
        const isExpanded = filterPanel.classList.contains('expanded');
        
        if (isExpanded) {
            filterPanel.classList.remove('expanded');
            filterToggle.classList.remove('active');
        } else {
            filterPanel.classList.add('expanded');
            filterToggle.classList.add('active');
        }
    });
}

// 设置筛选器选项
function setupFilterOptions() {
    const yearFilter = document.getElementById('yearFilter');
    const monthFilter = document.getElementById('monthFilter');
    const dayFilter = document.getElementById('dayFilter');
    const deviceFilter = document.getElementById('deviceFilter');
    const formatFilter = document.getElementById('formatFilter');
    
    // 优先使用 metadata.js 的数据
    if (typeof filterMetadata !== 'undefined') {
        console.log('使用 metadata.js 中的筛选条件');
        
        // 填充年份
        if (filterMetadata.years && Array.isArray(filterMetadata.years)) {
            filterMetadata.years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = `${year}年`;
                yearFilter.appendChild(option);
            });
        }
        
        // 填充设备
        if (filterMetadata.devices && Array.isArray(filterMetadata.devices)) {
            filterMetadata.devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device;
                option.textContent = device;
                deviceFilter.appendChild(option);
            });
        }
        
        // 填充格式
        if (filterMetadata.formats && Array.isArray(filterMetadata.formats)) {
            filterMetadata.formats.forEach(format => {
                const option = document.createElement('option');
                option.value = format;
                option.textContent = format;
                formatFilter.appendChild(option);
            });
        }
    } else {
        console.log('未找到 metadata.js，使用数据中提取的筛选条件');
        
        // 从图片数据中提取唯一值
        const years = [...new Set(allImageData.map(img => {
            const date = new Date(img.shotDate.replace(' ', 'T'));
            return date.getFullYear();
        }))].sort((a, b) => b - a);
        
        const devices = [...new Set(allImageData.map(img => img.device))].sort();
        const formats = [...new Set(allImageData.map(img => img.format))].sort();
        
        // 填充年份选项
        years.forEach(year => {
            if (!isNaN(year)) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = `${year}年`;
                yearFilter.appendChild(option);
            }
        });
        
        // 填充设备选项
        devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device;
            option.textContent = device;
            deviceFilter.appendChild(option);
        });
        
        // 填充格式选项
        formats.forEach(format => {
            const option = document.createElement('option');
            option.value = format;
            option.textContent = format;
            formatFilter.appendChild(option);
        });
    }
    
    // 填充月份选项（1-12月）
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i}月`;
        monthFilter.appendChild(option);
    }
    
    // 填充日期选项（1-31日）
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i}日`;
        dayFilter.appendChild(option);
    }
}

// 设置事件监听器
function setupEventListeners() {
    const filterBtn = document.getElementById('filterBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    filterBtn.addEventListener('click', applyFilters);
    resetBtn.addEventListener('click', resetFilters);
    
    // 键盘导航
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // 触摸手势支持
    setupTouchGestures();
}

// 应用筛选
function applyFilters() {
    const yearFilter = document.getElementById('yearFilter').value;
    const monthFilter = document.getElementById('monthFilter').value;
    const dayFilter = document.getElementById('dayFilter').value;
    const deviceFilter = document.getElementById('deviceFilter').value;
    const formatFilter = document.getElementById('formatFilter').value;
    
    filteredImages = allImageData.filter(img => {
        const imgDate = new Date(img.shotDate.replace(' ', 'T'));
        
        const matchYear = !yearFilter || imgDate.getFullYear() == yearFilter;
        const matchMonth = !monthFilter || (imgDate.getMonth() + 1) == monthFilter;
        const matchDay = !dayFilter || imgDate.getDate() == dayFilter;
        const matchDevice = !deviceFilter || img.device === deviceFilter;
        const matchFormat = !formatFilter || img.format === formatFilter;
        
        return matchYear && matchMonth && matchDay && matchDevice && matchFormat;
    });
    
    if (filteredImages.length === 0) {
        showNoImagesMessage();
        return;
    }
    
    // 重新生成界面
    generateThumbnails();
    currentImageIndex = 0;
    showImage(0);
    updateImageCounter();
    showImageControls();
    
    // 自动折叠筛选面板
    const filterPanel = document.getElementById('filterPanel');
    const filterToggle = document.getElementById('filterToggle');
    if (filterPanel && filterToggle) {
        filterPanel.classList.remove('expanded');
        filterToggle.classList.remove('active');
    }
}

// 重置筛选器
function resetFilters() {
    document.getElementById('yearFilter').value = '';
    document.getElementById('monthFilter').value = '';
    document.getElementById('dayFilter').value = '';
    document.getElementById('deviceFilter').value = '';
    document.getElementById('formatFilter').value = '';
    
    filteredImages = [...allImageData];
    
    generateThumbnails();
    currentImageIndex = 0;
    showImage(0);
    updateImageCounter();
    showImageControls();
    
    // 重置后也自动折叠筛选面板
    const filterPanel = document.getElementById('filterPanel');
    const filterToggle = document.getElementById('filterToggle');
    if (filterPanel && filterToggle) {
        filterPanel.classList.remove('expanded');
        filterToggle.classList.remove('active');
    }
}

// 显示图片
function showImage(index) {
    if (index < 0 || index >= filteredImages.length) return;
    
    currentImageIndex = index;
    const imageInfo = filteredImages[index];
    const mainImage = document.getElementById('mainImage');
    const loading = document.getElementById('loading');
    
    // 显示加载状态
    loading.style.display = 'block';
    mainImage.style.opacity = '0';
      // 加载图片
    const img = new Image();
    img.onload = function() {
        mainImage.src = this.src;
        mainImage.style.opacity = '1';
        loading.style.display = 'none';
        updateImageInfo(imageInfo);
        updateThumbnailSelection();
        updateNavigationButtons();
        
        // 添加双击事件监听器
        setupImageDoubleClick(imageInfo);
    };
    
    img.onerror = function() {
        loading.style.display = 'none';
        console.error(`无法加载图片: ${imageInfo.filename}`);
        showImageError(imageInfo.filename);
    };
    
    img.src = `images/${imageInfo.filename}`;
}

// 更新图片信息
function updateImageInfo(imageInfo) {
    document.getElementById('imageName').textContent = imageInfo.name;
    document.getElementById('imageAuthor').textContent = imageInfo.author || '未知';
    document.getElementById('imageDate').textContent = imageInfo.shotDate;
    document.getElementById('imageDevice').textContent = imageInfo.device || '未知';
    document.getElementById('imageAperture').textContent = imageInfo.aperture || '未知';
    document.getElementById('imageShutter').textContent = imageInfo.shutterSpeed || '未知';
    document.getElementById('imageFocal').textContent = imageInfo.focalLength || '未知';
    document.getElementById('imageFormat').textContent = imageInfo.format;
    document.getElementById('imageSize').textContent = imageInfo.fileSize;
}

// 生成缩略图
function generateThumbnails() {
    const thumbnailsContainer = document.getElementById('thumbnails');
    thumbnailsContainer.innerHTML = '';
    
    if (filteredImages.length === 0) {
        return;
    }
    
    filteredImages.forEach((imageInfo, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail';
        thumbnail.onclick = () => showImage(index);
        
        const img = document.createElement('img');
        img.src = `images/${imageInfo.filename}`;
        img.alt = imageInfo.name;
        img.onerror = function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA2MCA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQ1IiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjMwIiB5PSIyNSIgZmlsbD0iIzk5OSIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+4oCiPC90ZXh0Pgo8L3N2Zz4=';
        };
        
        thumbnail.appendChild(img);
        thumbnailsContainer.appendChild(thumbnail);
    });
}

// 更新缩略图选中状态
function updateThumbnailSelection() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, index) => {
        if (index === currentImageIndex) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

// 更新导航按钮状态
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentImageIndex === 0;
    nextBtn.disabled = currentImageIndex === filteredImages.length - 1;
}

// 更新图片计数器
function updateImageCounter() {
    document.getElementById('currentIndex').textContent = currentImageIndex + 1;
    document.getElementById('totalImages').textContent = filteredImages.length;
}

// 上一张图片
function previousImage() {
    if (currentImageIndex > 0) {
        showImage(currentImageIndex - 1);
    }
}

// 下一张图片
function nextImage() {
    if (currentImageIndex < filteredImages.length - 1) {
        showImage(currentImageIndex + 1);
    }
}

// 显示无图片提示
function showNoImagesMessage() {
    const imageContainer = document.querySelector('.image-container');
    imageContainer.innerHTML = `
        <div class="no-images">
            <h3>暂无符合条件的图片</h3>
            <p>请调整筛选条件或运行批处理生成图片数据</p>
            <p style="font-size: 0.8rem; margin-top: 10px; opacity: 0.7;">
                运行 generate_data.bat 来扫描 images 文件夹
            </p>
        </div>
    `;
    
    hideImageControls();
}

// 显示图片加载错误
function showImageError(filename) {
    const imageContainer = document.querySelector('.image-container');
    imageContainer.innerHTML = `
        <div class="no-images">
            <h3>图片载入失败</h3>
            <p>无法载入图片: ${filename}</p>
            <p style="font-size: 0.8rem; margin-top: 10px; opacity: 0.7;">
                请检查文件是否存在于 images 文件夹中
            </p>
        </div>
    `;
}

// 隐藏图片控制按钮
function hideImageControls() {
    document.getElementById('imageControls').style.display = 'none';
    document.getElementById('thumbnails').style.display = 'none';
}

// 显示图片控制按钮
function showImageControls() {
    document.getElementById('imageControls').style.display = 'flex';
    document.getElementById('thumbnails').style.display = 'flex';
}

// 设置图片双击事件
function setupImageDoubleClick(imageInfo) {
    const mainImage = document.getElementById('mainImage');
    
    // 移除之前的事件监听器，避免重复绑定
    mainImage.removeEventListener('dblclick', handleImageDoubleClick);
    
    // 添加新的双击事件监听器
    function handleImageDoubleClick() {
        openImageInNewTab(imageInfo);
    }
    
    mainImage.addEventListener('dblclick', handleImageDoubleClick);
}

// 在新标签页中打开图片
function openImageInNewTab(imageInfo) {
    const imageUrl = `images/${imageInfo.filename}`;
    
    // 创建新窗口/标签页显示图片
    const newWindow = window.open('', '_blank');
    
    if (newWindow) {
        newWindow.document.write(`
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${imageInfo.name} - Wraindy摄影展</title>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        background: #000;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        font-family: 'Noto Serif SC', serif;
                        color: #fff;
                    }
                    .image-container {
                        max-width: 95vw;
                        max-height: 85vh;
                        text-align: center;
                    }
                    .full-image {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                        box-shadow: 0 10px 30px rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                    }
                    .image-details {
                        margin-top: 20px;
                        background: rgba(255, 255, 255, 0.1);
                        padding: 15px;
                        border-radius: 8px;
                        max-width: 600px;
                        backdrop-filter: blur(10px);
                    }
                    .detail-title {
                        font-size: 1.5rem;
                        color: #c9b037;
                        margin-bottom: 10px;
                        text-align: center;
                    }
                    .detail-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 8px;
                        font-size: 0.9rem;
                    }
                    .detail-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 5px 0;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    .detail-label {
                        color: #b8b8b8;
                        font-weight: 500;
                    }
                    .detail-value {
                        color: #fff;
                        font-weight: 400;
                    }
                    .close-hint {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        color: #888;
                        font-size: 0.8rem;
                    }
                </style>
            </head>
            <body>
                <div class="close-hint">ESC 或点击关闭</div>
                <div class="image-container">
                    <img src="${imageUrl}" alt="${imageInfo.name}" class="full-image" />
                </div>
                <div class="image-details">
                    <div class="detail-title">${imageInfo.name}</div>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">作者:</span>
                            <span class="detail-value">${imageInfo.author || '未知'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">拍摄时间:</span>
                            <span class="detail-value">${imageInfo.shotDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">设备:</span>
                            <span class="detail-value">${imageInfo.device || '未知'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">光圈:</span>
                            <span class="detail-value">${imageInfo.aperture || '未知'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">快门速度:</span>
                            <span class="detail-value">${imageInfo.shutterSpeed || '未知'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">焦距:</span>
                            <span class="detail-value">${imageInfo.focalLength || '未知'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">格式:</span>
                            <span class="detail-value">${imageInfo.format}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">文件大小:</span>
                            <span class="detail-value">${imageInfo.fileSize}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">分辨率:</span>
                            <span class="detail-value">${imageInfo.width} × ${imageInfo.height}</span>
                        </div>
                    </div>
                </div>
                <script>
                    // ESC键关闭窗口
                    document.addEventListener('keydown', function(e) {
                        if (e.key === 'Escape') {
                            window.close();
                        }
                    });
                    
                    // 点击图片外区域关闭窗口
                    document.body.addEventListener('click', function(e) {
                        if (e.target === document.body) {
                            window.close();
                        }
                    });
                </script>
            </body>
            </html>
        `);
        newWindow.document.close();
    } else {
        // 如果弹窗被阻止，使用传统方式
        window.open(imageUrl, '_blank');
    }
}
