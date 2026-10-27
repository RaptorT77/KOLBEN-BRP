New-Item -Path out\.nojekyll -ItemType File -Force
Copy-Item public\* out\ -Recurse -Force

git add .
git commit -m "feat: activar columna 220 Banda Transportadora para fila PMQ757 3M Kanzaky OP10"
git push origin main

git add -f out
$tree = (git write-tree --prefix=out).Trim()
Write-Host "Tree hash: $tree"
$commit = (git commit-tree $tree -m "deploy: update GitHub Pages build with active col 220 on PMQ757").Trim()
Write-Host "Commit hash: $commit"
git push origin "${commit}:refs/heads/gh-pages" --force
git reset HEAD out
Remove-Item .\deploy_ghpages.ps1 -Force -ErrorAction SilentlyContinue
Write-Host "Deployment complete!"
