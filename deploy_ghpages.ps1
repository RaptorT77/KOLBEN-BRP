git add .
git commit -m "fix: popover aparece solo al hacer clic en celda valida, color gris cuando todas son NA"
git push origin main

git add -f out
$tree = (git write-tree --prefix=out).Trim()
Write-Host "Tree hash: $tree"
$commit = (git commit-tree $tree -m "deploy: update GitHub Pages with popover click trigger and all-NA gray rule").Trim()
Write-Host "Commit hash: $commit"
git push origin "${commit}:refs/heads/gh-pages" --force
git reset HEAD out
Write-Host "Deployment complete!"
