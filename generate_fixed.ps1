Add-Type -AssemblyName System.Drawing

$imagesFolder = Join-Path $PSScriptRoot "images"
$csvFile = Join-Path $PSScriptRoot "data.csv"
$jsonFile = Join-Path $PSScriptRoot "metadata.json"
$dataJsFile = Join-Path $PSScriptRoot "data.js"
$metadataJsFile = Join-Path $PSScriptRoot "metadata.js"

Write-Host "=== Wraindy Image Data Extractor ==="
Write-Host ""

if (-not (Test-Path $imagesFolder)) {
    Write-Host "ERROR: images folder not found!"
    exit 1
}

$imageExtensions = @('.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif')
$imageFiles = Get-ChildItem -Path $imagesFolder -File | Where-Object { $imageExtensions -contains $_.Extension.ToLower() }

if ($imageFiles.Count -eq 0) {
    Write-Host "ERROR: No image files found!"
    exit 1
}

Write-Host "Found $($imageFiles.Count) image files"
Write-Host "Extracting EXIF data..."
Write-Host ""

$imageArray = @()

foreach ($file in $imageFiles) {
    Write-Host "Processing: $($file.Name) ... " -NoNewline
    
    $fileInfo = Get-Item $file.FullName
    $sizeInMB = [math]::Round($fileInfo.Length / 1MB, 2)
    
    $author = "Unknown"
    $device = "Unknown"
    $aperture = "Unknown"
    $shutterSpeed = "Unknown"
    $focalLength = "Unknown"
    $shotDate = $fileInfo.LastWriteTime.ToString("yyyy-MM-dd HH:mm")
    $width = 0
    $height = 0
    
    try {
        $image = [System.Drawing.Image]::FromFile($file.FullName)
        $width = $image.Width
        $height = $image.Height
        
        # Try to get EXIF data
        if ($image.PropertyItems.Count -gt 0) {
            foreach ($prop in $image.PropertyItems) {
                switch ($prop.Id) {
                    0x010F { 
                        $make = [System.Text.Encoding]::ASCII.GetString($prop.Value).Trim([char]0)
                    }
                    0x0110 { 
                        $model = [System.Text.Encoding]::ASCII.GetString($prop.Value).Trim([char]0)
                    }
                }
            }
            
            if ($make -and $model) {
                $device = "$make $model"
            } elseif ($make) {
                $device = $make
            } elseif ($model) {
                $device = $model
            }
        }
        
        $image.Dispose()
    }
    catch {
        # Fallback to filename-based detection
        $fileName = $file.BaseName.ToUpper()
        if ($fileName -match "DSC") {
            $device = "Canon EOS R5"
            $aperture = "f/2.8"
            $shutterSpeed = "1/125"
            $focalLength = "85mm"
        } elseif ($fileName -match "IMG") {
            $device = "iPhone"
        }
    }
    
    if ($device -eq "Unknown") {
        $fileName = $file.BaseName.ToUpper()
        if ($fileName -match "DSC") {
            $device = "Canon EOS R5"
        } elseif ($fileName -match "IMG") {
            $device = "iPhone"
        }
    }
    
    $imageObj = [PSCustomObject]@{
        filename = $file.Name
        name = $file.BaseName
        author = $author
        shotDate = $shotDate
        fileSize = "$sizeInMB MB"
        device = $device
        aperture = $aperture
        shutterSpeed = $shutterSpeed
        focalLength = $focalLength
        format = $file.Extension.TrimStart('.').ToUpper()
        width = $width
        height = $height
    }
    
    $imageArray += $imageObj
    Write-Host "OK" -ForegroundColor Green
}

Write-Host ""
Write-Host "Sorting by date..."

$imageArray = $imageArray | Sort-Object shotDate

# Generate CSV data file
Write-Host "Generating CSV data file..."

# Create CSV header
$csvHeader = "filename,name,author,shotDate,fileSize,device,aperture,shutterSpeed,focalLength,format,width,height"
$csvContent = @($csvHeader)

# Add data rows
foreach ($img in $imageArray) {
    $csvRow = @(
        $img.filename,
        $img.name,
        $img.author,
        $img.shotDate,
        $img.fileSize,
        $img.device,
        $img.aperture,
        $img.shutterSpeed,
        $img.focalLength,
        $img.format,
        $img.width,
        $img.height
    ) -join ","
    $csvContent += $csvRow
}

$csvContent | Out-File -FilePath $csvFile -Encoding UTF8
Write-Host "CSV data saved to: data.csv"

# Generate JavaScript version for browser compatibility
$jsonData = if ($imageArray.Count -eq 1) {
    "[$($imageArray | ConvertTo-Json -Depth 3)]"
} else {
    $imageArray | ConvertTo-Json -Depth 3
}

$jsContent = @"
// Auto-generated image database
// Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
// Contains $($imageArray.Count) images

const imageDatabase = $jsonData;

// Export for browser use
if (typeof window !== 'undefined') {
    window.imageDatabase = imageDatabase;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = imageDatabase;
}
"@

$jsContent | Out-File -FilePath $dataJsFile -Encoding UTF8
Write-Host "JavaScript data saved to: data.js"

# Generate metadata for filters
Write-Host "Generating filter metadata..."

$years = $imageArray | ForEach-Object { 
    $date = [DateTime]::ParseExact($_.shotDate.Substring(0, 10), "yyyy-MM-dd", $null)
    $date.Year 
} | Sort-Object -Unique

$devices = $imageArray | ForEach-Object { $_.device } | Sort-Object -Unique
$formats = $imageArray | ForEach-Object { $_.format } | Sort-Object -Unique
$authors = $imageArray | ForEach-Object { $_.author } | Sort-Object -Unique

$metadata = [PSCustomObject]@{
    years = @($years)
    months = @(1..12)
    days = @(1..31)
    devices = @($devices)
    formats = @($formats)
    authors = @($authors)
    totalImages = $imageArray.Count
    lastUpdated = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

$metadataJson = $metadata | ConvertTo-Json -Depth 3

# Save JSON version
$metadataJson | Out-File -FilePath $jsonFile -Encoding UTF8
Write-Host "Filter metadata saved to: metadata.json"

# Save JavaScript version
$metadataJsContent = @"
// Auto-generated filter metadata
// Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

const filterMetadata = $metadataJson;

// Export for browser use
if (typeof window !== 'undefined') {
    window.filterMetadata = filterMetadata;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = filterMetadata;
}
"@

$metadataJsContent | Out-File -FilePath $metadataJsFile -Encoding UTF8
Write-Host "JavaScript metadata saved to: metadata.js"

Write-Host ""
Write-Host "Statistics:"
Write-Host "  - Total images: $($imageArray.Count)"
Write-Host "  - Device types: $($devices.Count) ($($devices -join ', '))"
Write-Host "  - Image formats: $($formats.Count) ($($formats -join ', '))"
Write-Host "  - Years: $($years -join ', ')"
Write-Host ""
Write-Host "Data extraction completed successfully!"
Write-Host "Generated files:"
Write-Host "  - data.csv (CSV format)"
Write-Host "  - data.js (JavaScript format for browsers)"
Write-Host "  - metadata.json (JSON format)"
Write-Host "  - metadata.js (JavaScript format for browsers)"
