---
name: generate-drawio
description: Generate and edit draw.io diagrams in XML format with proper font settings, arrow placement, and Japanese text support. Use when creating flowcharts, architecture diagrams, sequence diagrams, or any visual diagrams in .drawio format. Handles font family settings, arrow layering, text sizing, and PNG export validation.
---

# draw.io Diagram Generation

Generate high-quality draw.io diagrams by directly editing XML.

## Quick Start

When creating a draw.io diagram:

1. Set `defaultFontFamily` in `mxGraphModel`
2. Add `fontFamily=FontName;` to ALL text element styles
3. Use `fontSize=18` or larger for readability
4. Place arrows (edges) BEFORE boxes (vertices) in XML
5. Allocate 30-40px width per Japanese character
6. Set `page="0"` for transparent background
7. Verify with PNG export

## Core Rules

### Font Settings

```xml
<!-- In mxGraphModel -->
<mxGraphModel defaultFontFamily="Noto Sans JP" page="0" ...>

<!-- In EVERY text element's style -->
<mxCell style="text;fontFamily=Noto Sans JP;fontSize=18;..." />
```

### Arrow Placement (Z-Order)

Arrows must be declared FIRST to render behind other elements:

```xml
<root>
  <mxCell id="0" />
  <mxCell id="1" parent="0" />

  <!-- ARROWS FIRST (renders at back) -->
  <mxCell id="arrow1" edge="1" ... />

  <!-- BOXES AFTER (renders in front) -->
  <mxCell id="box1" vertex="1" ... />
</root>
```

### Label-Arrow Spacing

Labels must be at least 20px away from arrow lines:

```xml
<!-- Arrow at Y=220 -->
<mxCell id="arrow">
  <mxGeometry>
    <mxPoint y="220" as="sourcePoint"/>
  </mxGeometry>
</mxCell>

<!-- Label at Y=180 (40px above arrow) -->
<mxCell id="label" value="Process">
  <mxGeometry y="180" width="60" height="20" />
</mxCell>
```


## Workflow

1. Understand the diagram requirements
2. Plan the layout (positions, connections)
3. Generate XML with all rules applied
4. Suggest PNG verification command

## PNG Verification

Always recommend PNG export for visual verification:

```bash
# macOS
drawio -x -f png -s 2 -t -o output.png input.drawio
open output.png

# Linux
drawio -x -f png -s 2 -t -o output.png input.drawio
xdg-open output.png
```

## Resources

- [references/xml-structure.md](references/xml-structure.md) - Complete XML structure reference
- [references/examples.md](references/examples.md) - Production-ready diagram examples

## Scripts

- `scripts/convert-drawio-to-png.sh` - Convert .drawio files to PNG
- `scripts/validate_drawio.py` - Validate draw.io XML against best practices
