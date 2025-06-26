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

# Helper function to parse EXIF rational values
function Parse-Rational {
    param($bytes)
    if ($bytes.Length -ge 8) {
        $numerator = [BitConverter]::ToUInt32($bytes, 0)
        $denominator = [BitConverter]::ToUInt32($bytes, 4)
        if ($denominator -ne 0) {
            return $numerator / $denominator
        }
    }
    return $null
}

# Helper function to format aperture
function Format-Aperture {
    param($value)
    if ($value -ne $null) {
        return "f/$([math]::Round($value, 1))"
    }
    return "Unknown"
}

# Helper function to format exposure time
function Format-ExposureTime {
    param($value)
    if ($value -ne $null) {
        if ($value -ge 1) {
            return "$([math]::Round($value, 1))s"
        } else {
            $reciprocal = [math]::Round(1 / $value)
            return "1/${reciprocal}s"
        }
    }
    return "Unknown"
}

# Helper function to format focal length
function Format-FocalLength {
    param($value)
    if ($value -ne $null) {
        return "$([math]::Round($value, 0))mm"
    }
    return "Unknown"
}

$imageArray = @()

foreach ($file in $imageFiles) {
    Write-Host "Processing: $($file.Name) ... " -NoNewline
    
    $fileInfo = Get-Item $file.FullName
    $sizeInMB = [math]::Round($fileInfo.Length / 1MB, 2)
    
    # Initialize with default values
    $author = "Unknown"
    $cameraMaker = "Unknown"
    $cameraModel = "Unknown"
    $aperture = "Unknown"
    $shutterSpeed = "Unknown"
    $focalLength = "Unknown"
    $iso = "Unknown"
    $shotDate = $fileInfo.LastWriteTime.ToString("yyyy-MM-dd HH:mm")
    $width = 0
    $height = 0    
    try {
        $image = [System.Drawing.Image]::FromFile($file.FullName)
        $width = $image.Width
        $height = $image.Height
        
        # Extract EXIF data with correct property IDs
        if ($image.PropertyItems.Count -gt 0) {
            foreach ($prop in $image.PropertyItems) {
                switch ($prop.Id) {
                    # Author/Artist (0x013B)
                    0x013B { 
                        $author = [System.Text.Encoding]::UTF8.GetString($prop.Value).Trim([char]0).Trim()
                        if ([string]::IsNullOrWhiteSpace($author)) { $author = "Unknown" }
                    }
                    # Camera Maker (0x010F)
                    0x010F { 
                        $cameraMaker = [System.Text.Encoding]::ASCII.GetString($prop.Value).Trim([char]0).Trim()
                    }
                    # Camera Model (0x0110)
                    0x0110 { 
                        $cameraModel = [System.Text.Encoding]::ASCII.GetString($prop.Value).Trim([char]0).Trim()
                    }
                    # F-stop/Aperture (0x829D)
                    0x829D { 
                        $apertureValue = Parse-Rational $prop.Value
                        $aperture = Format-Aperture $apertureValue
                    }
                    # Exposure Time/Shutter Speed (0x829A)
                    0x829A { 
                        $exposureValue = Parse-Rational $prop.Value
                        $shutterSpeed = Format-ExposureTime $exposureValue
                    }
                    # Focal Length (0x920A)
                    0x920A { 
                        $focalValue = Parse-Rational $prop.Value
                        $focalLength = Format-FocalLength $focalValue
                    }
                    # ISO Speed (0x8827)
                    0x8827 { 
                        if ($prop.Value.Length -ge 2) {
                            $isoValue = [BitConverter]::ToUInt16($prop.Value, 0)
                            $iso = "ISO $isoValue"
                        }
                    }
                    # Date Time Original (0x9003)
                    0x9003 { 
                        $dateStr = [System.Text.Encoding]::ASCII.GetString($prop.Value).Trim([char]0)
                        if ($dateStr -match "(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})") {
                            $shotDate = "$($Matches[1])-$($Matches[2])-$($Matches[3]) $($Matches[4]):$($Matches[5])"
                        }
                    }
                }
            }
        }
        
        $image.Dispose()
    }
    catch {
        Write-Warning "Failed to extract EXIF from $($file.Name): $($_.Exception.Message)"
    }
    
    # Fallback for missing camera info
    if ($cameraMaker -eq "Unknown" -and $cameraModel -eq "Unknown") {
        $fileName = $file.BaseName.ToUpper()
        if ($fileName -match "DSC") {
            $cameraMaker = "NIKON CORPORATION"
            $cameraModel = "NIKON Z 30"
        } elseif ($fileName -match "IMG") {
            $cameraMaker = "Apple"
            $cameraModel = "iPhone"
        }
    }
    
    $imageObj = [PSCustomObject]@{
        filename = $file.Name
        name = $file.BaseName
        author = $author
        shotDate = $shotDate
        fileSize = "$sizeInMB MB"
        cameraMaker = $cameraMaker
        cameraModel = $cameraModel
        aperture = $aperture
        shutterSpeed = $shutterSpeed
        focalLength = $focalLength
        iso = $iso
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
$csvHeader = "filename,name,author,shotDate,fileSize,cameraMaker,cameraModel,aperture,shutterSpeed,focalLength,iso,format,width,height"
$csvContent = @($csvHeader)

# Add data rows
foreach ($img in $imageArray) {
    $csvRow = @(
        $img.filename,
        $img.name,
        $img.author,
        $img.shotDate,
        $img.fileSize,
        $img.cameraMaker,
        $img.cameraModel,
        $img.aperture,
        $img.shutterSpeed,
        $img.focalLength,
        $img.iso,
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

$cameraMakers = $imageArray | ForEach-Object { $_.cameraMaker } | Sort-Object -Unique
$cameraModels = $imageArray | ForEach-Object { $_.cameraModel } | Sort-Object -Unique
$formats = $imageArray | ForEach-Object { $_.format } | Sort-Object -Unique
$authors = $imageArray | ForEach-Object { $_.author } | Sort-Object -Unique

$metadata = [PSCustomObject]@{
    years = @($years)
    months = @(1..12)
    days = @(1..31)
    cameraMakers = @($cameraMakers)
    cameraModels = @($cameraModels)
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
