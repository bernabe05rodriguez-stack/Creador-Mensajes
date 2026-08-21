# Creador-Mensajes — Lecciones aprendidas

> Movidas desde `_lecciones.md` del vault de Obsidian el 2026-08-20: ese archivo se carga entero
> al inicio de cada sesión y había crecido demasiado. Lo específico de cada proyecto vive ahora
> al lado de su código. Las lecciones **generales** (deploy/EasyPanel, diseño, Claude Code)
> siguen en el vault: `Obsidian/Berna Notebook/_lecciones.md`.

---

### La columna Mensaje: cuándo va entre comillas y cuándo no (2026-08-21)

Esta celda tiene dos consumidores con necesidades opuestas, y por eso el CSV usa
**dos serializadores distintos**: `csvMessage()` para el mensaje y `csvField()`
(RFC 4180 clásico) para las columnas extra.

| Problema | Fecha | Fix |
|---|---|---|
| El cliente final recibía el mensaje **con las comillas puestas** (queja de pazp) | 2026-07-21 | `csvMessage()` dejó de escapar y pasó a *sanear*: `;`→`,`, `"`→`'` |
| El mensaje llegaba a WhatsApp como **un chorizo de una línea** | 2026-08-21 | Los saltos se conservan y el campo se entrecomilla **sólo si los tiene** |

Reglas que hay que respetar si se vuelve a tocar `csvMessage()`:

1. **Mensaje de una sola línea → sin comillas.** Las herramientas que pegan la
   celda literal (no todas parsean CSV de verdad) mostrarían las comillas al
   cliente. Este es el caso mayoritario y no puede regresar.
2. **Mensaje con saltos → entre comillas, sin alternativa.** Un `\n` sólo
   sobrevive dentro de un campo entrecomillado (RFC 4180). No hay forma de
   tener salto de línea *y* campo pelado: si alguien pide las dos cosas, el
   salto es lo que se pierde.
3. **LF, nunca CRLF.** HERMES lee con `csv.DictReader` y el `\r` viaja verbatim;
   en la ruta de tipeo (Lupita/Token) `\r` y `\n` son dos caracteres especiales
   distintos y dejan basura en el campo del chat. `csvMessage()` normaliza
   `\r\n?` → `\n` antes de nada.
4. **No colapsar los saltos al colapsar espacios.** El `.replace(/\s{2,}/g,' ')`
   original se comía las líneas en blanco. Va con `[^\S\n]{2,}` (espacios y tabs
   sí, saltos no), o los párrafos se pierden igual que antes.
5. **Las comillas dobles se sustituyen por simples, no se duplican.** Doblarlas
   (`""`) es lo correcto según la norma, pero un parser ingenuo se las muestra
   al cliente. Con `'` se lee igual y no puede romper la celda.

Del lado de HERMES esto ya está contemplado a propósito (`Hermes.py`, el
comentario de `_is_ascii_safe`: los saltos se insertan por uiautomator2 sin
mandar Enter, así que el mensaje no se parte en varios envíos).

Test de regresión: `csvMessage()` + round-trip por `csv.DictReader` de Python
(el mismo parser que usa HERMES) — ver la entrada del 2026-08-21 en el historial.

### La rotación entre mensajes son cajas, no `---` (2026-08-21)

Entre 2026-08-15 y 2026-08-21 las variantes se escribían en un solo textarea
separadas por una línea de `---`. Problemas que tenía y por los que se cambió:
sólo se anunciaba en una frase del hint (nadie la encontraba), la vista previa
mostraba únicamente la primera variante, había que reescribir el texto entero
para cada una, y una línea decorativa de guiones partía el mensaje sin aviso.

Ahora cada mensaje es su propia caja con **Agregar / Duplicar / Borrar**. El
`---` se sigue aceptando al escribir o pegar: se parte solo en cajas, así que
quien aprendió el truco viejo no pierde nada.

**Ojo con el placeholder:** `getTemplates()` caía al `placeholder` del textarea
cuando estaba vacío, y el export no validaba nada — se podía descargar un CSV
con el texto de ejemplo como mensaje real a cientos de clientes. Ahora devuelve
sólo lo escrito de verdad y la descarga se bloquea con un aviso.

### El botón «Continuar» que esquiva (2026-08-21)

Pedido de Berna: "nadie me transfiere", así que a veces el botón de la donación
se corre para hacer renegar un poco. Es un chiste — pero un chiste en una
herramienta de trabajo se convierte en un ticket de "no anda" muy rápido. Los
candados que lo mantienen del lado del chiste, y que **no hay que sacar**:

1. **Cede siempre a los `DODGE_MAX` intentos** (hoy 2 esquives, al tercer clic
   pasa). Nunca puede quedar inalcanzable.
2. **Sólo esquiva con el mouse** (`e.detail > 0`). Un click disparado por
   teclado (Tab + Enter/Espacio) o por código tiene `detail === 0` y pasa
   derecho: si no, el que no usa mouse se queda sin poder descargar.
3. **«Cancelar» nunca se mueve** y `prefers-reduced-motion` desactiva el chiste
   entero.
4. **Se sortea al abrir el modal**, no en cada clic: si se sorteara por clic, el
   botón podría "curarse" en el medio de la secuencia y quedar raro.
5. **Se desliza, no se teletransporta** (transición de 0.22 s) y aparece un
   cartelito. Un botón que salta sin explicación se lee como bug; uno que se
   corre con un "Dale, poné algo 🙏" se lee como joda.

Se afina con `DODGE_CHANCE` (0.35 ≈ 1 de cada 3 descargas) y `DODGE_MAX` (2).
Para apagarlo del todo: `DODGE_CHANCE = 0`.

### El nombre del archivo lo elige el usuario (2026-08-21)

Antes el CSV bajaba directo con el nombre puesto por la página. Ahora hay un
modal al final del flujo (después de la donación) que deja editarlo.

Cosas a no romper si se toca:

- **El `.csv` no se edita.** Va como `<span>` fijo dentro del campo, y
  `cleanFileName()` igual saca un `.csv` que el usuario haya escrito, para que
  no quede `archivo.csv.csv`.
- **Se sanea, no se rechaza.** Windows no acepta `\ / : * ? " < > |` ni punto o
  espacio al final; un nombre inválido hace que la descarga falle **sin decir
  por qué**. Se reemplazan por `-` en silencio: el ejecutivo no tiene por qué
  saber esa lista.
- **`a.download` no controla el explorador de archivos.** Si Chrome tiene
  activado *"Preguntar dónde guardar cada archivo"*, el explorador se abre igual
  — pero ahora aparece con el nombre ya puesto. Eso es una preferencia del
  navegador (`chrome://settings/downloads`), no algo que la página pueda cambiar.

### Creador-Mensajes (ex MensajesMasivos) - CSV + GitHub Pages
- *CSV con campos entre comillas*: Un `split(';')` simple no alcanza cuando los campos están envueltos en `"..."`. Hay que hacer un parser custom que trackee `inQuotes` para no romper campos que contengan `;` o `""`
- *Signo + en CSV abierto con Excel*: Excel interpreta `+549...` como numero y pierde el `+`. Solucion: exportar como formula `="+549XXXXXXX,"` que Excel evalua como texto literal
- *gh CLI en WSL*: `gh` no estaba instalado ni en Windows ni en WSL. Instalar con `winget install GitHub.cli` y ejecutar via `powershell.exe -Command "& 'C:\Program Files\GitHub CLI\gh.exe' ..."`
- *GitHub Pages API body*: El endpoint `POST /repos/{owner}/{repo}/pages` necesita JSON con `build_type` y `source` como objeto. En PowerShell, pipear el JSON string al comando con `--input -`
