# Wraindy 摄影展览系统

> 一个现代化的图片展示和管理系统，专为摄影作品展览而设计

[![Version](https://img.shields.io/badge/version-4.0.0-gold)](https://github.com/wraindy/Wraindy.github.io)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web-green.svg)](README.md)

## 📸 项目简介

Wraindy摄影展览系统是一个功能完整的Web端图片展示平台，专门为摄影师和艺术家设计。系统能够自动读取图片的EXIF数据，生成美观的展览界面，支持高级筛选功能和沉浸式图片浏览体验。

### ✨ 核心特性

🎯 **智能数据提取**
- 自动读取EXIF数据（光圈、快门、ISO、焦距等）
- 正确解析相机制造商和型号信息
- 支持多种图片格式（JPG、PNG、WEBP、TIFF等）

🔍 **高级筛选系统**
- 按年份、月份、日期筛选
- 按相机制造商、型号筛选
- 按图片格式筛选
- 可折叠式筛选面板

🎨 **现代化界面**
- 响应式设计，适配各种屏幕
- 明暗主题切换
- 沉浸式全屏图片查看
- 优雅的动画效果

⌨️ **丰富交互**
- 键盘导航（方向键、Home、End）
- 触摸手势支持（滑动切换）
- 双击图片全屏查看
- 智能信息面板控制

## 🚀 快速开始

### 环境要求
- Windows 10/11（支持PowerShell）
- 现代浏览器（Chrome、Firefox、Edge、Safari）
- 图片文件（推荐JPG格式以获得最佳EXIF支持）

### 安装步骤

1. **下载项目**
   ```bash
   git clone https://github.com/wraindy/Wraindy.github.io.git
   cd Wraindy.github.io
   ```

2. **添加图片**
   ```
   将你的摄影作品放入 images/ 文件夹
   ```

3. **生成数据**
   ```bash
   # 双击运行批处理文件
   generate_data.bat
   
   # 或在PowerShell中运行
   .\generate_fixed.ps1
   ```

4. **启动展览**
   ```
   在浏览器中打开 index.html
   ```

## 📁 项目结构

```
Wraindy展览/
├── 📄 index.html              # 主展览页面
├── 🎨 style.css               # 响应式样式文件  
├── ⚡ script.js               # 核心功能脚本
├── 🔧 generate_data.bat       # 数据生成入口（Windows）
├── 🔧 generate_fixed.ps1      # PowerShell数据提取脚本
├── 📊 data.csv                # 图片数据（CSV格式）
├── 📊 data.js                 # 图片数据（JavaScript格式）
├── 🗂️ metadata.json          # 筛选条件元数据（JSON格式）
├── 🗂️ metadata.js            # 筛选条件元数据（JavaScript格式）
├── 📂 images/                 # 图片存储目录
│   ├── DSC_5963.jpg
│   ├── DSC_5987.png
│   └── DSC_6056.JPG
├── 📖 README.md               # 项目说明文档
└── .git/                      # Git版本控制
```

## � 数据结构

### 图片数据格式 (`data.js`)
```javascript
{
    "filename": "DSC_6056.JPG",        // 文件名
    "name": "DSC_6056",                // 显示名称
    "author": "Wraindy",               // 作者
    "shotDate": "2025-06-25 18:05",    // 拍摄时间
    "fileSize": "11.05 MB",            // 文件大小
    "cameraMaker": "NIKON CORPORATION", // 相机制造商
    "cameraModel": "NIKON Z 30",       // 相机型号
    "aperture": "f/8",                 // 光圈值
    "shutterSpeed": "1/125s",          // 快门速度
    "focalLength": "35mm",             // 焦距
    "iso": "ISO 1600",                 // ISO感光度
    "format": "JPG",                   // 文件格式
    "width": 5568,                     // 图片宽度
    "height": 3712                     // 图片高度
}
```

### 筛选条件元数据 (`metadata.js`)
```javascript
{
    "years": [2025],                          // 可筛选年份
    "months": [1, 2, 3, ..., 12],            // 月份选项
    "days": [1, 2, 3, ..., 31],              // 日期选项
    "cameraMakers": ["NIKON CORPORATION"],    // 相机制造商
    "cameraModels": ["NIKON Z 30"],          // 相机型号
    "formats": ["JPG", "PNG"],               // 文件格式
    "authors": ["Wraindy"],                  // 作者列表
    "totalImages": 9,                        // 图片总数
    "lastUpdated": "2025-06-26 08:28:28"     // 最后更新时间
}
```
## 🎨 功能特性

### 📱 响应式界面
- **桌面端**: 三栏布局，筛选面板 + 主图展示 + 信息面板
- **移动端**: 自适应布局，触摸友好的操作体验
- **底部导航**: 实时时钟 + 版权信息 + 主题切换按钮

### 🖼️ 图片浏览体验
- **主图展示**: 居中显示，最大化利用屏幕空间
- **缩略图导航**: 底部缩略图快速切换，当前图片高亮
- **双击全屏**: 新标签页打开高质量图片查看器
- **详情信息**: 支持显示/隐藏的详细EXIF信息面板

### 🔍 智能筛选系统
- **多维度筛选**: 
  - 📅 时间筛选：年份、月份、日期
  - 📷 设备筛选：相机制造商、具体型号
  - 📄 格式筛选：JPG、PNG、WEBP等
- **动态更新**: 筛选条件自动从图片数据中提取
- **状态保持**: 筛选结果实时更新图片计数

### ⌨️ 交互控制
- **键盘导航**:
  - `←/→` 切换图片
  - `Home/End` 跳转首尾
  - `Esc` 退出全屏
  - `I` 切换详情面板
- **触摸手势**: 左右滑动切换图片（移动端）
- **鼠标操作**: 点击缩略图、双击全屏

### 🌓 主题系统
- **明暗主题**: 支持亮色/暗色主题切换
- **系统跟随**: 自动检测系统主题偏好
- **持久化**: 记住用户的主题选择
- **动态切换**: 实时预览主题效果

### 🔧 全屏图片查看器
- **沉浸式体验**: 黑色背景，图片居中显示
- **详情面板**: 可滚动的分层信息展示
  - 📋 基本信息：作者、拍摄时间
  - � 相机设备：制造商、型号
  - ⚙️ 拍摄参数：光圈、快门、焦距、ISO
  - 📁 文件信息：格式、大小、分辨率
- **智能控制**: 
  - 底部按钮切换详情显示/隐藏
  - ESC键智能关闭（先关面板，再关窗口）
  - 点击图片快速隐藏详情

## ⚡ 性能优化

- **渐进加载**: 图片懒加载，提升页面响应速度
- **缓存机制**: 智能缓存已加载的图片
- **数据优化**: 多格式数据支持（CSV、JSON、JS）
- **错误处理**: 完善的错误提示和降级方案

## �🛠️ 开发与自定义

### 修改样式主题
编辑 `style.css` 中的CSS变量：
```css
:root {
    --bg-primary: #0c0c0c;        /* 主背景色 */
    --accent-primary: #c9b037;    /* 金色主题色 */
    --text-primary: #ffffff;      /* 主文字色 */
    --glass-bg: rgba(255, 255, 255, 0.1);  /* 毛玻璃背景 */
}

[data-theme="light"] {
    --bg-primary: #ffffff;
    --text-primary: #333333;
    /* 亮色主题变量 */
}
```

### 扩展功能
- **添加新的筛选条件**: 修改 `generate_fixed.ps1` 提取更多EXIF数据
- **自定义界面布局**: 编辑 `index.html` 和相关CSS
- **增强交互功能**: 在 `script.js` 中添加新的事件处理

### EXIF数据扩展
在PowerShell脚本中添加更多EXIF字段：
```powershell
# 添加GPS信息
0x8825 { $gpsInfo = Parse-GPS $prop.Value }

# 添加镜头信息  
0xA434 { $lensModel = Parse-String $prop.Value }

# 添加色彩空间
0xA001 { $colorSpace = Parse-ColorSpace $prop.Value }
```

## 🔍 故障排除

### 常见问题

❌ **图片不显示**
```
✅ 检查 images/ 文件夹中是否有图片
✅ 确认文件格式受支持（JPG、PNG、WEBP等）
✅ 运行 generate_data.bat 重新生成数据
✅ 检查浏览器控制台错误信息
```

❌ **筛选功能异常**
```
✅ 确认 data.js 和 metadata.js 文件存在
✅ 检查数据格式是否正确（避免手动编辑错误）
✅ 清除浏览器缓存后刷新页面
```

❌ **EXIF数据读取不完整**
```
✅ 确认图片包含EXIF信息（部分PNG可能无EXIF）
✅ 检查图片是否经过压缩处理去除了元数据
✅ 尝试使用原始相机文件
```

❌ **主题切换不工作**
```
✅ 检查浏览器是否支持localStorage
✅ 确认CSS变量定义完整
✅ 清除浏览器存储后重试
```

### 数据恢复
如果数据文件损坏：
```bash
# 备份当前数据
copy data.js data.js.backup

# 重新生成所有数据
.\generate_data.bat

# 验证生成结果
# 在浏览器中测试功能
```

## � 版本历史

- **v4.0.0** *(2025-06-26)*
  - ✨ 重构EXIF数据读取，支持正确的相机制造商/型号分离
  - ✨ 新增ISO感光度显示
  - ✨ 优化全屏图片查看器，分层信息显示
  - ✨ 改进筛选系统，支持相机制造商和型号独立筛选
  - 🐛 修复分页号码更新问题
  - 🐛 修复DOM元素空指针异常

- **v3.1.0** *(2025-06-24)*
  - ✨ 添加键盘导航和触摸手势支持
  - ✨ 完善错误处理机制
  - 🎨 优化界面动画效果

- **v3.0.0** *(2025-06-23)*
  - ✨ 全新的双击全屏图片查看器
  - ✨ 响应式设计重构
  - ✨ 明暗主题系统

- **v2.0.0** *(初始版本)*
  - ✨ 基础图片展示和筛选功能
  - ✨ PowerShell数据提取脚本
  - ✨ 现代化界面设计

### 开发环境
- Windows 10+ (PowerShell 5.1+)
- 现代浏览器开发者工具
- Git版本控制
- 基础的HTML/CSS/JavaScript知识

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- **作者**: Wraindy泠雨汐
- **邮箱**: Wraindy9894@outlook.com

---

<div align="center">

**Wraindy 摄影展览系统**

*让每一张照片都有它的故事*

</div>
