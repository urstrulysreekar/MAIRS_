$src = 'C:\SIH-2 REMASTRED\maris'
$dst = 'C:\SIH-2 REMASTRED\MARIS-SIH26057.zip'
$tmp = 'C:\SIH-2 REMASTRED\temp_maris_zip'

Write-Host "Creating clean staging directory..."
if (Test-Path $dst) { Remove-Item $dst -Force }
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }

Write-Host "Copying source files (excluding node_modules, .next, .venv, .git)..."
robocopy $src $tmp /E /XD node_modules .next .venv __pycache__ .git

Write-Host "Compressing archive to $dst..."
Compress-Archive -Path "$tmp\*" -DestinationPath $dst -CompressionLevel Optimal

Write-Host "Cleaning up staging directory..."
Remove-Item $tmp -Recurse -Force

Get-Item $dst | Select-Object Name, Length, LastWriteTime
Write-Host "ZIP created successfully!"
