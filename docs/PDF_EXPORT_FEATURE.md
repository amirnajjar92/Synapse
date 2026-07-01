# PDF Export Feature

## Overview
The PDF export feature allows users to export their active fitness plan as a professional PDF document with all tables, dates, and plan details.

## Features
- ✅ Export complete plan with all tables
- ✅ Professional formatting with headers and footers
- ✅ Automatic table formatting (horizontal and vertical layouts)
- ✅ Plan duration dates included
- ✅ Page numbers and generation date
- ✅ Clean file naming based on plan title

## Usage

### From Plan Detail Page
1. Navigate to any plan detail page (`/plan-detail/[id]`)
2. Click the download icon (📥) button next to the plan title
3. PDF will be automatically generated and downloaded

### What's Included in the PDF
- **Plan Title** - Large, bold heading
- **Plan Prompt/Description** - Full description of the plan
- **Duration** - Start and end dates (if available)
- **All Tables** - All plan tables with proper formatting:
  - Vertical tables (2 columns): First column as headers
  - Horizontal tables: First row as headers
- **Footer** - Generation date and page numbers

## Technical Details

### Dependencies
```json
{
  "jspdf": "^2.x.x",
  "jspdf-autotable": "^3.x.x"
}
```

### Files
- `/src/lib/pdfExport.ts` - Main PDF generation logic
- `/src/types/jspdf-autotable.d.ts` - TypeScript type definitions
- `/src/app/plan-detail/[id]/page.tsx` - Export button implementation

### PDF Styling
- **Title**: 20pt, Bold, Helvetica
- **Description**: 10pt, Normal, Helvetica
- **Table Headers**: Blue background (#3659B8), White text
- **Table Body**: 9pt font, Grid theme
- **Vertical Tables**: Gray background (#F0F0F0) for first column
- **Footer**: 8pt, Gray text (#969696)

## Example Output
The PDF will be named based on your plan title, for example:
- "8 Week Weight Loss Program" → `8_week_weight_loss_program.pdf`
- "Marathon Training Plan" → `marathon_training_plan.pdf`

## Future Enhancements
- [ ] Add charts/graphs export
- [ ] Custom styling options
- [ ] Email PDF directly
- [ ] Cloud storage integration
- [ ] Progress tracking overlay on tables
