# Grading System Fix Instructions

## Issue:

The grading system was updated to WAEC/NECO standard (A1-F9), but existing results in the database still have old grades (A-F).

## Solution:

### 1. **Restart Backend Server** (REQUIRED):

Stop the current backend with `Ctrl+C`, then run:

```bash
cd backend
pnpm run dev
```

### 2. **Recalculate Existing Results**:

After updating result scores in the editor, click "Calculate Positions" button. This will:

- Recalculate grades using the new system
- Update all results in the database

### 3. **For New Results**:

All new results entered will automatically use the new grading system.

## Grading Scale (Now Active):

- **85-100** → Grade: **A1** → Remark: **EXCELLENT**
- **75-84** → Grade: **B2** → Remark: **VERY GOOD**
- **70-74** → Grade: **B3** → Remark: **GOOD**
- **65-69** → Grade: **C4** → Remark: **CREDIT**
- **60-64** → Grade: **C5** → Remark: **CREDIT**
- **50-59** → Grade: **C6** → Remark: **CREDIT**
- **45-49** → Grade: **D7** → Remark: **PASS**
- **40-44** → Grade: **E8** → Remark: **FAIR**
- **0-39** → Grade: **F9** → Remark: **FAIL**

## Files Modified:

- `backend/src/features/results/result.utils.js` - Updated grading logic
