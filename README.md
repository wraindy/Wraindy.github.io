# Wraindy展览系统 - 使用说明

## 🎯 功能概述

Wraindy展览系统是一个完整的图片展示和管理系统，具备以下核心功能：

### ✨ 主要特性

1. **自动数据提取**
   - 批处理命令自动读取 `images/` 文件夹下的所有图片
   - 提取EXIF信息（设备、拍摄参数、时间等）
   - 生成结构化数据文件

2. **智能筛选系统**
   - 从数据中自动提取并去重筛选条件
   - 支持按年份、月份、日期、设备、格式筛选
   - 可折叠筛选面板，不遮挡图片显示

3. **优化的界面设计**
   - 图片居中放大显示，最大化展示效果
   - 紧凑的详情信息显示，字体适中
   - 双击图片新标签页显示大图
   - 单页面设计，无需滚动

4. **主题切换**
   - 支持明暗主题切换
   - 自动适应系统主题偏好

## 🚀 快速开始

### 1. 添加图片
将你的图片文件放入 `images/` 文件夹中。

### 2. 生成数据
运行批处理命令：
```bash
# Windows
.\generate_data.bat

# 或直接运行PowerShell脚本
powershell -ExecutionPolicy Bypass -File generate_fixed.ps1
```

### 3. 打开网页
在浏览器中打开 `index.html`

## 📁 文件结构

```
wraindy-exhibition/
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 主要逻辑
├── generate_data.bat   # 批处理入口
├── generate_fixed.ps1  # PowerShell数据提取脚本
├── data.js             # 自动生成的图片数据
├── metadata.js         # 自动生成的筛选条件
├── test.html           # 系统测试页面
├── images/             # 图片存储文件夹
│   └── *.{jpg,png,gif,webp}
└── README.md           # 本说明文件
```

## 🔧 数据格式

### data.js 结构
```javascript
const imageDatabase = [{
    filename: "DSC_5987.png",
    name: "DSC_5987",
    author: "Unknown",
    shotDate: "2025-06-23 19:44",
    fileSize: "9.27 MB",
    device: "Canon EOS R5",
    aperture: "f/2.8",
    shutterSpeed: "1/125",
    focalLength: "85mm",
    format: "PNG",
    width: 4590,
    height: 2759
}];
```

### metadata.js 结构
```javascript
const filterMetadata = {
    years: [2025],
    devices: ["Canon EOS R5", "iPhone"],
    formats: ["PNG", "JPG"],
    authors: ["Unknown"],
    totalImages: 1,
    lastUpdated: "2025-06-24 19:21:54"
};
```

## 🎨 界面功能

### 筛选功能
- **筛选按钮**: 点击"筛选条件"展开/收起筛选面板
- **多条件筛选**: 支持年份、月份、日期、设备、格式组合筛选
- **自动折叠**: 筛选后自动收起面板，不遮挡图片
- **重置功能**: 一键重置所有筛选条件

### 图片浏览
- **主图显示**: 居中放大显示，最大化利用屏幕空间
- **详情信息**: 悬停显示紧凑的图片详情
- **缩略图**: 底部小缩略图快速切换
- **键盘导航**: 左右箭头键切换图片
- **双击放大**: 双击图片在新标签页中显示大图

### 主题切换
- **明暗切换**: 右上角主题按钮
- **自动适应**: 默认跟随系统主题
- **记忆功能**: 记住用户的主题选择

## 🛠️ 自定义配置

### 修改样式
编辑 `style.css` 中的CSS变量：
```css
:root {
    --bg-primary: #0c0c0c;        /* 主背景色 */
    --accent-primary: #c9b037;    /* 主色调 */
    --text-primary: #ffffff;      /* 主文字色 */
    /* ... 更多变量 */
}
```

### 扩展功能
- 修改 `script.js` 添加新功能
- 编辑 `generate_fixed.ps1` 调整数据提取逻辑
- 在 `index.html` 中添加新的界面元素

## 🔍 故障排除

### 常见问题

1. **图片不显示**
   - 检查图片是否在 `images/` 文件夹中
   - 确认文件名和路径正确
   - 检查浏览器控制台是否有错误信息

2. **筛选不工作**
   - 确认 `data.js` 和 `metadata.js` 格式正确
   - 检查是否为数组格式而非单个对象
   - 运行 `test.html` 进行诊断

3. **样式异常**
   - 确认 `style.css` 文件完整
   - 检查浏览器兼容性
   - 清除浏览器缓存

### 测试工具
打开 `test.html` 进行系统诊断，检查：
- 数据文件格式是否正确
- 筛选条件是否完整
- JavaScript是否正常加载

## 🔄 更新数据

当添加新图片时：
1. 将图片放入 `images/` 文件夹
2. 运行 `generate_data.bat` 重新生成数据
3. 刷新浏览器页面

## 📝 版本历史

- **v1.0.0**: 基础图片展示功能
- **v2.0.0**: 添加筛选系统和主题切换
- **v3.0.0**: 优化界面，添加双击放大功能
- **v3.1.0**: 完善批处理脚本，优化数据结构

## 🤝 贡献

如需添加新功能或修复问题，请：
1. 备份当前文件
2. 测试修改内容
3. 更新相关文档

---

**Wraindy展览系统** - 让每一张照片都有它的故事
