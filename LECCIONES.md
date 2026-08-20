# Creador-Mensajes — Lecciones aprendidas

> Movidas desde `_lecciones.md` del vault de Obsidian el 2026-08-20: ese archivo se carga entero
> al inicio de cada sesión y había crecido demasiado. Lo específico de cada proyecto vive ahora
> al lado de su código. Las lecciones **generales** (deploy/EasyPanel, diseño, Claude Code)
> siguen en el vault: `Obsidian/Berna Notebook/_lecciones.md`.

---

### Creador-Mensajes (ex MensajesMasivos) - CSV + GitHub Pages
- *CSV con campos entre comillas*: Un `split(';')` simple no alcanza cuando los campos están envueltos en `"..."`. Hay que hacer un parser custom que trackee `inQuotes` para no romper campos que contengan `;` o `""`
- *Signo + en CSV abierto con Excel*: Excel interpreta `+549...` como numero y pierde el `+`. Solucion: exportar como formula `="+549XXXXXXX,"` que Excel evalua como texto literal
- *gh CLI en WSL*: `gh` no estaba instalado ni en Windows ni en WSL. Instalar con `winget install GitHub.cli` y ejecutar via `powershell.exe -Command "& 'C:\Program Files\GitHub CLI\gh.exe' ..."`
- *GitHub Pages API body*: El endpoint `POST /repos/{owner}/{repo}/pages` necesita JSON con `build_type` y `source` como objeto. En PowerShell, pipear el JSON string al comando con `--input -`
