# Research-to-web mapping

## Research sources supplied by the author

1. **Peng Lu_MSc Thesis(1).pdf**, 168 PDF pages, academic year 2021/2022. Author: Peng Lu; supervisor: Daniela Sangiorgi.
2. **Peng Lu - Pathway Redesign Tool Example.xlsx**, especially “Ranking Version - example”, rows 1–18, plus its flowchart and legends.
3. **Pathway Redesign Data Visualization Tool Prototype.xlsx**, especially “The Flow chart Mode”, “Ranking Version”, and the earlier “The Timeline Mode”.

These files were read for adaptation; they are not redistributed in this source package.

| Source | Source location | Web implementation |
| --- | --- | --- |
| Thesis, shared pathway and sub-sections | §9.3.1, printed p.204, PDF p.111 | Editable graph, sub-section grouping and node selection. |
| Thesis, patient flows | §9.3.2, printed p.208, PDF p.113 | Separate records under each sub-section; individual patient volumes. |
| Thesis, experience attributes | §9.3.2; source workbook columns F–L | Organizing/arrangement, communication/information, main encounter/roles, location/department, plus overall observations. |
| Thesis, managerial attributes | §9.3.2; workbook columns T–X | Lead time, target time, waiting time, economic cost, effectiveness. Raw values, human-assigned grades and reasons are separate. |
| Thesis, benchmark | §9.3.3, printed pp.210–214, PDF pp.114–116 | Weighted side grades, original sum /20, optional normalized side weighting /10, lower complete grades first. |
| Thesis, negotiated dimensions | §10.1.2, printed p.234, PDF p.126 | Editable dimension names, weights, evidence types, units and grading criteria; rationale field. |
| Thesis, proposed process | §10.1.4, printed pp.236–238, PDF pp.127–128 | Facilitation guide: purpose, measures, evidence and discussion. This proposal is not presented as a validated workflow. |
| Workbook legends | Legends sheet; thesis §9.3.1, printed p.206 | Roles and encounters can be described in evidence fields. The 58 original numbered icons are extracted unchanged, organized by category and assigned to flow dimensions. Graph shapes use original SVG code. See LEGEND_CREDITS.md for retained source credits. |

## Example transcription

| Web record | Workbook rows | Volume | Experience grades | Managerial grades | Raw evidence supplied |
| --- | --- | --- | --- | --- | --- |
| S-1 / Flow 1 | 5–9 | 100 | 4, 5, 6, 4 | Lead 4; waiting 1; cost 2; effectiveness 1 | Lead 17.8 min; target 15 min; waiting 25.7 min; location, encounters, quotes and notes. |
| S-2 / Flow 1 | 10–13 | 19 | 6, 4, 7, 4 | Lead 4; waiting 4; cost 9; effectiveness 7 | Lead 13.5 min; target 15 min; waiting 5 min; previous lead 12.9 min, waiting 6.7 min. |
| S-2 / Flow 2 | 14–17 | 81 | 6, 4, 7, 4 | Lead 4; waiting 4; cost 9; effectiveness 7 | As supplied for the second flow; values are repeated in the workbook. |

Quotes are lightly normalized for punctuation and spelling. Insights are concise summaries of the supplied notes, not new research findings. Costs and effectiveness raw measures were absent and remain blank even where the workbook supplied grades. All other flow evidence and grades remain empty.

## Formula corrections

The source workbook contains incorrect or missing cell references, including `#REF!`, `#DIV/0!` and `#VALUE!`. These are not imported into the web app.

- Experience weights: 3 + 4 + 5 + 2 = **14**. In the first workbook record, the weight total references a blank K4 instead of J4, and some formulas also reference the wrong location cell. Subsequent records divide by 12 despite including the location contribution.
- First experience score: (4×3 + 5×4 + 6×5 + 4×2) / 14 = **5.00**.
- Second and third experience scores: (6×3 + 4×4 + 7×5 + 4×2) / 14 = **5.50**.
- Example managerial weights: 5 + 0 + 4 + 3 + 5 = **17**, following the supplied example workbook. Target time is retained as context with weight 0.
- First managerial score: (4×5 + 1×4 + 2×3 + 1×5) / 17 = **2.0588235294**.
- First original sum: **7.0588235294 / 20**, displayed as **7.06**.
- Other two complete managerial scores: **5.7647058824**, combined **11.2647058824 / 20**, displayed as **11.26**.
- Thesis Figure 50 also shows a managerial variant that assigns target time weight 3 (total 20). It can be configured in the web tool, but target-time grades must then be supplied.

The app does not infer grades from minutes, cost or patient volume. Teams define grading criteria and record their reasoning.

## Deliberate implementation choices

- The later flowchart version is the primary structure. The earlier timeline is not a second editing mode.
- Browser-local state and portable JSON replace spreadsheet file editing; concurrent multi-user state is not implemented.
- Discussion records, evidence provenance fields, undo/redo, CSV/SVG and a print report are new web interactions.
- Missing positively weighted grades block complete scores and ranking. A zero weight preserves a contextual dimension without treating missing data as zero performance.
- Any custom numerical measure is still graded by humans. Units are editable; no medical thresholds or clinical recommendations are encoded.
- The map simplifies the historical example from thesis Figure 46, attributed there to Schertler et al. (2007), *Dual-source computed tomography in patients with acute chest pain: Feasibility and image quality*, DOI 10.1007/s00330-007-0724-9. No image from that paper is copied.
- No source photos or participants’ details are included. The selected workbook’s 58 legend icons are included unchanged with the source Notes credits preserved.

## Project format

`schema: "pathway-redesign/1"` identifies the portable JSON format. `src/core.js` owns the calculations, CSV encoding and import validation. `src/examples.js` contains the reconstruction, and `src/app.js` owns browser interaction and rendering. The standalone HTML is generated from those sources by `build.mjs`.

## Version 0.2 visual correction

The first web iteration did not faithfully carry the original visual language or legends forward. Version 0.2 reads the workbook theme and cell fills directly: Shared #FBBC04 / #FFF2CC, Experience #EA4335 / #FBF0F0 / #F4CCCC, Managerial #4285F4 / #EAEFF4 / #CFE2F3. It retains the original icon artwork, printed identifiers and expressions. Source example assignments use the same encountered images, including cardiologist 10, case manager 15, Talking 01, Medical intervention/check 01, Interior space 01 and the corresponding emotional grades.
