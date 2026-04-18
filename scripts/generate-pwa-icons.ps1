$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'public\pwa-icons'
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

function New-Color([int]$a, [int]$r, [int]$g, [int]$b) {
  return [System.Drawing.Color]::FromArgb($a, $r, $g, $b)
}

function RectF([double]$x, [double]$y, [double]$w, [double]$h) {
  return [System.Drawing.RectangleF]::new([float]$x, [float]$y, [float]$w, [float]$h)
}

function Draw-GlowEllipse($g, $x, $y, $w, $h, $color) {
  $brush = New-Object System.Drawing.SolidBrush($color)
  $g.FillEllipse($brush, $x, $y, $w, $h)
  $brush.Dispose()
}

function New-IconBitmap([int]$size) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml('#020205'))

  $center = $size / 2

  Draw-GlowEllipse $g ($size * 0.16) ($size * 0.12) ($size * 0.68) ($size * 0.68) (New-Color 28 139 92 246)
  Draw-GlowEllipse $g ($size * 0.24) ($size * 0.19) ($size * 0.52) ($size * 0.52) (New-Color 34 96 165 250)
  Draw-GlowEllipse $g ($size * 0.28) ($size * 0.16) ($size * 0.44) ($size * 0.28) (New-Color 30 147 51 234)

  $shellBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (RectF ($size * 0.22) ($size * 0.18) ($size * 0.56) ($size * 0.60)),
    [System.Drawing.ColorTranslator]::FromHtml('#b6c2db'),
    [System.Drawing.ColorTranslator]::FromHtml('#4b5b84'),
    90
  )
  $headPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $headRect = RectF ($size * 0.22) ($size * 0.18) ($size * 0.56) ($size * 0.60)
  $radius = $size * 0.10
  $headPath.AddArc($headRect.X, $headRect.Y, $radius, $radius, 180, 90)
  $headPath.AddArc($headRect.Right - $radius, $headRect.Y, $radius, $radius, 270, 90)
  $headPath.AddArc($headRect.Right - $radius, $headRect.Bottom - $radius, $radius, $radius, 0, 90)
  $headPath.AddArc($headRect.X, $headRect.Bottom - $radius, $radius, $radius, 90, 90)
  $headPath.CloseFigure()
  $g.FillPath($shellBrush, $headPath)

  $rimPen = New-Object System.Drawing.Pen((New-Color 120 168 85 247), [float]($size * 0.012))
  $g.DrawPath($rimPen, $headPath)

  $faceBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (RectF ($size * 0.29) ($size * 0.27) ($size * 0.42) ($size * 0.30)),
    [System.Drawing.ColorTranslator]::FromHtml('#0b1731'),
    [System.Drawing.ColorTranslator]::FromHtml('#172648'),
    90
  )
  $facePath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $faceRect = RectF ($size * 0.29) ($size * 0.27) ($size * 0.42) ($size * 0.30)
  $faceRadius = $size * 0.08
  $facePath.AddArc($faceRect.X, $faceRect.Y, $faceRadius, $faceRadius, 180, 90)
  $facePath.AddArc($faceRect.Right - $faceRadius, $faceRect.Y, $faceRadius, $faceRadius, 270, 90)
  $facePath.AddArc($faceRect.Right - $faceRadius, $faceRect.Bottom - $faceRadius, $faceRadius, $faceRadius, 0, 90)
  $facePath.AddArc($faceRect.X, $faceRect.Bottom - $faceRadius, $faceRadius, $faceRadius, 90, 90)
  $facePath.CloseFigure()
  $g.FillPath($faceBrush, $facePath)

  $eyeGlow = New-Object System.Drawing.SolidBrush((New-Color 70 56 189 248))
  $eyeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#74d8ff'))
  $highlight = New-Object System.Drawing.SolidBrush((New-Color 170 255 255 255))
  $leftEye = RectF ($size * 0.36) ($size * 0.36) ($size * 0.10) ($size * 0.07)
  $rightEye = RectF ($size * 0.54) ($size * 0.36) ($size * 0.10) ($size * 0.07)
  $g.FillEllipse($eyeGlow, $leftEye.X - $size * 0.02, $leftEye.Y - $size * 0.02, $leftEye.Width + $size * 0.04, $leftEye.Height + $size * 0.04)
  $g.FillEllipse($eyeGlow, $rightEye.X - $size * 0.02, $rightEye.Y - $size * 0.02, $rightEye.Width + $size * 0.04, $rightEye.Height + $size * 0.04)
  $g.FillEllipse($eyeBrush, $leftEye)
  $g.FillEllipse($eyeBrush, $rightEye)
  $g.FillEllipse($highlight, $leftEye.X + $size * 0.018, $leftEye.Y + $size * 0.012, $size * 0.018, $size * 0.018)
  $g.FillEllipse($highlight, $rightEye.X + $size * 0.018, $rightEye.Y + $size * 0.012, $size * 0.018, $size * 0.018)

  $mouthPen = New-Object System.Drawing.Pen((New-Color 210 85 214 255), [float]($size * 0.012))
  $g.DrawLine($mouthPen, $size * 0.42, $size * 0.50, $size * 0.58, $size * 0.50)
  $g.DrawArc($mouthPen, $size * 0.42, $size * 0.48, $size * 0.16, $size * 0.08, 15, 150)

  $earBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (RectF ($size * 0.17) ($size * 0.33) ($size * 0.12) ($size * 0.22)),
    [System.Drawing.ColorTranslator]::FromHtml('#8aa0cd'),
    [System.Drawing.ColorTranslator]::FromHtml('#39486f'),
    90
  )
  $g.FillEllipse($earBrush, $size * 0.17, $size * 0.33, $size * 0.12, $size * 0.22)
  $g.FillEllipse($earBrush, $size * 0.71, $size * 0.33, $size * 0.12, $size * 0.22)

  $neckBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (RectF ($size * 0.39) ($size * 0.63) ($size * 0.22) ($size * 0.12)),
    [System.Drawing.ColorTranslator]::FromHtml('#7084b3'),
    [System.Drawing.ColorTranslator]::FromHtml('#2f3f63'),
    90
  )
  $g.FillRectangle($neckBrush, $size * 0.39, $size * 0.63, $size * 0.22, $size * 0.12)
  $g.FillEllipse((New-Object System.Drawing.SolidBrush((New-Color 90 133 92 248))), $size * 0.435, $size * 0.655, $size * 0.04, $size * 0.04)
  $g.FillEllipse((New-Object System.Drawing.SolidBrush((New-Color 90 133 92 248))), $size * 0.525, $size * 0.655, $size * 0.04, $size * 0.04)

  $g.Dispose()
  return $bmp
}

function Save-Png($bitmap, $path) {
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Save-Ico($bitmap, $path) {
  $icon = [System.Drawing.Icon]::FromHandle($bitmap.GetHicon())
  $stream = [System.IO.File]::Open($path, [System.IO.FileMode]::Create)
  $icon.Save($stream)
  $stream.Close()
}

$master = New-IconBitmap 1024
Save-Png $master (Join-Path $outDir 'new_pwa_icon.png')

$sizes = @(512, 192, 180, 167, 152, 144, 96, 72, 48, 32, 16)
foreach ($size in $sizes) {
  $bmp = New-IconBitmap $size
  Save-Png $bmp (Join-Path $outDir ("icon-$size.png"))
  if ($size -eq 512) {
    Save-Png $bmp (Join-Path $outDir 'maskable-512.png')
  }
  if ($size -eq 32) {
    Save-Ico $bmp (Join-Path $outDir 'favicon.ico')
  }
  $bmp.Dispose()
}

$master.Dispose()
Write-Host "Generated PWA icons in $outDir"
