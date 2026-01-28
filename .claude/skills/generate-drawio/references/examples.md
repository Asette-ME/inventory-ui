# draw.io Examples

## Table of Contents

1. [Simple Flowchart](#example-1-simple-flowchart)
2. [Architecture Diagram](#example-2-architecture-diagram-with-labels)
3. [Decision Flowchart](#example-3-decision-flowchart)
4. [Sequence-Style Diagram](#example-4-sequence-style-diagram)
5. [Diagram with Title](#example-5-diagram-with-title-and-description)
6. [Common Modifications](#common-modifications)

## Example 1: Simple Flowchart

A basic three-step process flow with proper font settings and arrow placement.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="Electron">
  <diagram name="Simple Flow" id="simple-flow-1">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0" defaultFontFamily="Noto Sans JP">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- ARROWS FIRST (renders at back) -->
        <mxCell id="arrow1"
          style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;fontFamily=Noto Sans JP;"
          edge="1" parent="1" source="step1" target="step2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <mxCell id="arrow2"
          style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;fontFamily=Noto Sans JP;"
          edge="1" parent="1" source="step2" target="step3">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- BOXES AFTER (renders in front) -->
        <mxCell id="step1" value="Start"
          style="rounded=1;whiteSpace=wrap;html=1;fontFamily=Noto Sans JP;fontSize=18;fillColor=#dae8fc;strokeColor=#6c8ebf;"
          vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="120" height="60" as="geometry" />
        </mxCell>

        <mxCell id="step2" value="Process"
          style="rounded=1;whiteSpace=wrap;html=1;fontFamily=Noto Sans JP;fontSize=18;fillColor=#d5e8d4;strokeColor=#82b366;"
          vertex="1" parent="1">
          <mxGeometry x="100" y="220" width="120" height="60" as="geometry" />
        </mxCell>

        <mxCell id="step3" value="End"
          style="rounded=1;whiteSpace=wrap;html=1;fontFamily=Noto Sans JP;fontSize=18;fillColor=#f8cecc;strokeColor=#b85450;"
          vertex="1" parent="1">
          <mxGeometry x="100" y="340" width="120" height="60" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## Example 2: Architecture Diagram with Labels

A system architecture diagram with labeled arrows.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="Electron">
  <diagram name="Architecture" id="arch-1">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0" defaultFontFamily="Noto Sans JP">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- ARROWS FIRST -->
        <mxCell id="conn1"
          style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;fontFamily=Noto Sans JP;fontSize=14;"
          edge="1" parent="1" source="client" target="api">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <mxCell id="conn2"
          style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;fontFamily=Noto Sans JP;fontSize=14;"
          edge="1" parent="1" source="api" target="db">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- LABELS (positioned above arrows) -->
        <mxCell id="label1" value="REST API"
          style="text;html=1;align=center;verticalAlign=middle;fontFamily=Noto Sans JP;fontSize=14;fontStyle=0;"
          vertex="1" parent="1">
          <mxGeometry x="250" y="90" width="100" height="30" as="geometry" />
        </mxCell>

        <mxCell id="label2" value="SQL Query"
          style="text;html=1;align=center;verticalAlign=middle;fontFamily=Noto Sans JP;fontSize=14;fontStyle=0;"
          vertex="1" parent="1">
          <mxGeometry x="500" y="90" width="100" height="30" as="geometry" />
        </mxCell>

        <!-- BOXES -->
        <mxCell id="client" value="Client&#xa;(Browser)"
          style="rounded=1;whiteSpace=wrap;html=1;fontFamily=Noto Sans JP;fontSize=18;fillColor=#fff2cc;strokeColor=#d6b656;"
          vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="140" height="80" as="geometry" />
        </mxCell>

        <mxCell id="api" value="API Server&#xa;(Node.js)"
          style="rounded=1;whiteSpace=wrap;html=1;fontFamily=Noto Sans JP;fontSize=18;fillColor=#dae8fc;strokeColor=#6c8ebf;"
          vertex="1" parent="1">
          <mxGeometry x="340" y="100" width="140" height="80" as="geometry" />
        </mxCell>

        <mxCell id="db" value="Database&#xa;(PostgreSQL)"
          style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;fontFamily=Noto Sans JP;fontSize=18;fillColor=#d5e8d4;strokeColor=#82b366;"
          vertex="1" parent="1">
          <mxGeometry x="580" y="90" width="140" height="100" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## Example 3: Decision Flowchart

A flowchart with conditional branching.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="Electron">
  <diagram name="Decision Flow" id="decision-1">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0" defaultFontFamily="Noto Sans JP">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- ARROWS -->
        <mxCell id="a1"
          style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;"
          edge="1" parent="1" source="start" target="check">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <mxCell id="a2"
          value="Yes"
          style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;fontFamily=Noto Sans JP;fontSize=14;exitX=1;exitY=0.5;exitDx=0;exitDy=0;"
          edge="1" parent="1" source="check" target="success">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <mxCell id="a3"
          value="No"
          style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;fontFamily=Noto Sans JP;fontSize=14;exitX=0;exitY=0.5;exitDx=0;exitDy=0;"
          edge="1" parent="1" source="check" target="retry">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <mxCell id="a4"
          style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;"
          edge="1" parent="1" source="retry" target="check">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="80" y="320" />
              <mxPoint x="80" y="200" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- SHAPES -->
        <mxCell id="start" value="Start"
          style="ellipse;whiteSpace=wrap;html=1;fontFamily=Noto Sans JP;fontSize=18;fillColor=#d5e8d4;strokeColor=#82b366;"
          vertex="1" parent="1">
          <mxGeometry x="200" y="50" width="100" height="60" as="geometry" />
        </mxCell>

        <mxCell id="check" value="Condition&#xa;Met?"
          style="rhombus;whiteSpace=wrap;html=1;fontFamily=Noto Sans JP;fontSize=16;fillColor=#fff2cc;strokeColor=#d6b656;"
          vertex="1" parent="1">
          <mxGeometry x="175" y="160" width="150" height="80" as="geometry" />
        </mxCell>

        <mxCell id="success" value="Success"
          style="ellipse;whiteSpace=wrap;html=1;fontFamily=Noto Sans JP;fontSize=18;fillColor=#dae8fc;strokeColor=#6c8ebf;"
          vertex="1" parent="1">
          <mxGeometry x="400" y="170" width="100" height="60" as="geometry" />
        </mxCell>

        <mxCell id="retry" value="Retry"
          style="rounded=1;whiteSpace=wrap;html=1;fontFamily=Noto Sans JP;fontSize=18;fillColor=#f8cecc;strokeColor=#b85450;"
          vertex="1" parent="1">
          <mxGeometry x="125" y="290" width="100" height="60" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## Example 4: Sequence-Style Diagram

Horizontal flow with multiple participants.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="Electron">
  <diagram name="Sequence Style" id="seq-1">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0" defaultFontFamily="Noto Sans JP">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- ARROWS (horizontal with labels above) -->
        <mxCell id="msg1"
          style="edgeStyle=none;html=1;strokeWidth=2;fontFamily=Noto Sans JP;fontSize=14;endArrow=classic;"
          edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="170" y="200" as="sourcePoint" />
            <mxPoint x="330" y="200" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <mxCell id="msg1_label" value="Request"
          style="text;html=1;align=center;verticalAlign=middle;fontFamily=Noto Sans JP;fontSize=14;"
          vertex="1" parent="1">
          <mxGeometry x="190" y="165" width="120" height="30" as="geometry" />
        </mxCell>

        <mxCell id="msg2"
          style="edgeStyle=none;html=1;strokeWidth=2;fontFamily=Noto Sans JP;fontSize=14;endArrow=classic;dashed=1;"
          edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="330" y="260" as="sourcePoint" />
            <mxPoint x="170" y="260" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <mxCell id="msg2_label" value="Response"
          style="text;html=1;align=center;verticalAlign=middle;fontFamily=Noto Sans JP;fontSize=14;"
          vertex="1" parent="1">
          <mxGeometry x="190" y="265" width="120" height="30" as="geometry" />
        </mxCell>

        <!-- PARTICIPANTS -->
        <mxCell id="user" value="User"
          style="rounded=0;whiteSpace=wrap;html=1;fontFamily=Noto Sans JP;fontSize=18;fillColor=#dae8fc;strokeColor=#6c8ebf;"
          vertex="1" parent="1">
          <mxGeometry x="100" y="80" width="140" height="60" as="geometry" />
        </mxCell>

        <mxCell id="server" value="Server"
          style="rounded=0;whiteSpace=wrap;html=1;fontFamily=Noto Sans JP;fontSize=18;fillColor=#d5e8d4;strokeColor=#82b366;"
          vertex="1" parent="1">
          <mxGeometry x="260" y="80" width="140" height="60" as="geometry" />
        </mxCell>

        <!-- LIFELINES -->
        <mxCell id="line1"
          style="edgeStyle=none;html=1;strokeWidth=1;dashed=1;strokeColor=#999999;"
          edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="170" y="140" as="sourcePoint" />
            <mxPoint x="170" y="320" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <mxCell id="line2"
          style="edgeStyle=none;html=1;strokeWidth=1;dashed=1;strokeColor=#999999;"
          edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="330" y="140" as="sourcePoint" />
            <mxPoint x="330" y="320" as="targetPoint" />
          </mxGeometry>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## Example 5: Diagram with Title and Description

Complete diagram with header text.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="Electron">
  <diagram name="Titled Diagram" id="titled-1">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0" defaultFontFamily="Noto Sans JP">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- TITLE -->
        <mxCell id="title" value="System Architecture"
          style="text;html=1;align=center;verticalAlign=middle;fontFamily=Noto Sans JP;fontSize=24;fontStyle=1;"
          vertex="1" parent="1">
          <mxGeometry x="100" y="30" width="280" height="40" as="geometry" />
        </mxCell>

        <!-- DESCRIPTION -->
        <mxCell id="desc" value="Production environment system configuration"
          style="text;html=1;align=left;verticalAlign=middle;fontFamily=Noto Sans JP;fontSize=14;fontColor=#666666;"
          vertex="1" parent="1">
          <mxGeometry x="100" y="70" width="400" height="30" as="geometry" />
        </mxCell>

        <!-- ARROW -->
        <mxCell id="conn"
          style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;"
          edge="1" parent="1" source="box1" target="box2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- CONTENT -->
        <mxCell id="box1" value="Web Server"
          style="rounded=1;whiteSpace=wrap;html=1;fontFamily=Noto Sans JP;fontSize=18;fillColor=#dae8fc;strokeColor=#6c8ebf;"
          vertex="1" parent="1">
          <mxGeometry x="100" y="130" width="150" height="70" as="geometry" />
        </mxCell>

        <mxCell id="box2" value="Database"
          style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;fontFamily=Noto Sans JP;fontSize=18;fillColor=#d5e8d4;strokeColor=#82b366;"
          vertex="1" parent="1">
          <mxGeometry x="320" y="120" width="120" height="90" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## Common Modifications

### Change Colors

Replace fill and stroke colors:

- Blue: `fillColor=#dae8fc;strokeColor=#6c8ebf;`
- Green: `fillColor=#d5e8d4;strokeColor=#82b366;`
- Yellow: `fillColor=#fff2cc;strokeColor=#d6b656;`
- Red: `fillColor=#f8cecc;strokeColor=#b85450;`
- Purple: `fillColor=#e1d5e7;strokeColor=#9673a6;`
- Gray: `fillColor=#f5f5f5;strokeColor=#666666;`

### Adjust Font Size

```xml
<!-- Small (not recommended) -->
fontSize=12

<!-- Normal -->
fontSize=14

<!-- Recommended -->
fontSize=18

<!-- Large (titles) -->
fontSize=24
```

### Add Rounded Corners

```xml
<!-- Square corners -->
rounded=0

<!-- Rounded corners -->
rounded=1
```
