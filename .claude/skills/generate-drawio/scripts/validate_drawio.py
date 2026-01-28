#!/usr/bin/env python3
"""
Validate draw.io XML files against skill best practices.

Usage:
    python validate_drawio.py file.drawio [file2.drawio ...]

Validates:
- Font family settings on all text elements
- Font sizes (minimum 14px, recommended 18px)
- Arrow placement (edges before vertices for proper z-order)
- Text width for Japanese characters (30-40px per character)
- Page settings for transparency
"""

import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import List, Tuple


class DrawioValidator:
    """Validator for draw.io XML files following skill best practices."""

    MINIMUM_FONT_SIZE = 14
    RECOMMENDED_FONT_SIZE = 18
    MIN_LABEL_ARROW_DISTANCE = 20
    JAPANESE_CHAR_WIDTH = 30

    def __init__(self, xml_content: str):
        """Initialize validator with XML content."""
        self.xml_content = xml_content
        self.root = ET.fromstring(xml_content)
        self.errors: List[str] = []
        self.warnings: List[str] = []

    def validate_all(self) -> Tuple[List[str], List[str]]:
        """Run all validations and return errors and warnings."""
        self.validate_font_family()
        self.validate_font_size()
        self.validate_arrow_placement()
        self.validate_text_width()
        self.validate_page_setting()
        return self.errors, self.warnings

    def validate_font_family(self) -> None:
        """Validate that all text elements have fontFamily specified."""
        mxcells = self.root.findall(".//mxCell")

        for cell in mxcells:
            style = cell.get("style", "")
            value = cell.get("value", "")

            # Skip if no text content
            if not value:
                continue

            # Check if it's a text element
            if "text" in style or value:
                if "fontFamily=" not in style:
                    cell_id = cell.get("id", "unknown")
                    self.errors.append(
                        f"Cell '{cell_id}' has text but missing fontFamily in style"
                    )

    def validate_font_size(self) -> None:
        """Validate font sizes are adequate for readability."""
        mxcells = self.root.findall(".//mxCell")

        for cell in mxcells:
            style = cell.get("style", "")
            value = cell.get("value", "")

            if not value:
                continue

            # Extract fontSize from style
            font_size_match = re.search(r"fontSize=(\d+)", style)
            if font_size_match:
                font_size = int(font_size_match.group(1))
                cell_id = cell.get("id", "unknown")

                if font_size < self.MINIMUM_FONT_SIZE:
                    self.errors.append(
                        f"Cell '{cell_id}' has fontSize={font_size}, "
                        f"minimum is {self.MINIMUM_FONT_SIZE}"
                    )
                elif font_size < self.RECOMMENDED_FONT_SIZE:
                    self.warnings.append(
                        f"Cell '{cell_id}' has fontSize={font_size}, "
                        f"recommended is {self.RECOMMENDED_FONT_SIZE}"
                    )

    def validate_arrow_placement(self) -> None:
        """Validate that arrows (edges) come before other elements."""
        mxcells = self.root.findall(".//mxCell")

        first_vertex_idx = -1
        last_edge_idx = -1

        for idx, cell in enumerate(mxcells):
            is_edge = cell.get("edge") == "1"
            is_vertex = cell.get("vertex") == "1"

            if is_vertex and first_vertex_idx == -1:
                first_vertex_idx = idx
            if is_edge:
                last_edge_idx = idx

        if first_vertex_idx != -1 and last_edge_idx != -1:
            if last_edge_idx > first_vertex_idx:
                self.warnings.append(
                    "Edges (arrows) should be placed before vertices (boxes) "
                    "in XML to render behind other elements"
                )

    def validate_text_width(self) -> None:
        """Validate text elements have sufficient width for Japanese text."""
        mxcells = self.root.findall(".//mxCell")

        for cell in mxcells:
            value = cell.get("value", "")

            if not value:
                continue

            # Count Japanese characters (Hiragana, Katakana, Kanji)
            japanese_chars = len(
                re.findall(r"[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]", value)
            )

            if japanese_chars == 0:
                continue

            geometry = cell.find("mxGeometry")
            if geometry is not None:
                width = float(geometry.get("width", 0))
                recommended_width = japanese_chars * self.JAPANESE_CHAR_WIDTH

                if width < recommended_width:
                    cell_id = cell.get("id", "unknown")
                    self.warnings.append(
                        f"Cell '{cell_id}' has {japanese_chars} Japanese chars "
                        f"with width={width}, recommended width is {recommended_width}"
                    )

    def validate_page_setting(self) -> None:
        """Validate page setting for transparency."""
        mxgraph_model = self.root.find(".//mxGraphModel")
        if mxgraph_model is not None:
            page = mxgraph_model.get("page", "1")
            if page != "0":
                self.warnings.append(
                    'mxGraphModel should have page="0" for transparent background'
                )


def validate_file(file_path: Path) -> Tuple[int, int]:
    """Validate a single file and print results."""
    print(f"\nValidating: {file_path}")
    print("-" * 50)

    try:
        content = file_path.read_text()
        validator = DrawioValidator(content)
        errors, warnings = validator.validate_all()

        if errors:
            print("\nErrors:")
            for error in errors:
                print(f"  ✗ {error}")

        if warnings:
            print("\nWarnings:")
            for warning in warnings:
                print(f"  ⚠ {warning}")

        if not errors and not warnings:
            print("  ✓ All checks passed")

        return len(errors), len(warnings)

    except ET.ParseError as e:
        print(f"  ✗ XML parse error: {e}")
        return 1, 0
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return 1, 0


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python validate_drawio.py file.drawio [file2.drawio ...]")
        sys.exit(1)

    total_errors = 0
    total_warnings = 0

    for file_arg in sys.argv[1:]:
        file_path = Path(file_arg)
        if not file_path.exists():
            print(f"Error: File not found: {file_path}")
            total_errors += 1
            continue

        if not file_path.suffix == ".drawio":
            print(f"Warning: Skipping non-.drawio file: {file_path}")
            continue

        errors, warnings = validate_file(file_path)
        total_errors += errors
        total_warnings += warnings

    print("\n" + "=" * 50)
    print(f"Summary: {total_errors} errors, {total_warnings} warnings")

    sys.exit(1 if total_errors > 0 else 0)


if __name__ == "__main__":
    main()
