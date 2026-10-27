New-Item -Path out\.nojekyll -ItemType File -Force
Copy-Item public\* out\ -Recurse -Force

git add .
git commit -m "feat: activar columnas 250 Transportador y 260 Extractor de neblina para fila PMQ761 Robodrill OP50-1"
git push origin main

git add -f out
$tree = (git write-tree --prefix=out).Trim()
Write-Host "Tree hash: $tree"
$commit = (git commit-tree $tree -m "deploy: update GitHub Pages build with active cols 250 and 260 on PMQ761").Trim()
Write-Host "Commit hash: $commit"
git push origin "${commit}:refs/heads/gh-pages" --force
git reset HEAD out
Remove-Item .\deploy_ghpages.ps1 -Force -ErrorAction SilentlyContinue
Write-Host "Deployment complete!"
