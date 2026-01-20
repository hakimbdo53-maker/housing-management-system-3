// IMPORT PATH UPDATES - Search & Replace Guide
// ============================================
// Copy these patterns into VS Code's Find & Replace (Ctrl+H)
// Use regular expressions: ON (click the .* button)

/*
IMPORTANT: When doing Find & Replace in VS Code:
1. Click the .* (regular expressions) button to enable regex
2. Use these patterns EXACTLY as shown
3. Verify each replacement before replacing all
*/

// ============================================================================
// LAYOUT COMPONENT IMPORTS
// ============================================================================

// Pattern 1: Header Component
// Find:    from ['"]@/components/Header['"]
// Replace: from '@/components/layout/Header'
// Example: import Header from '@/components/Header';
//       → import Header from '@/components/layout/Header';

// Pattern 2: Sidebar Component
// Find:    from ['"]@/components/Sidebar['"]
// Replace: from '@/components/layout/Sidebar'

// Pattern 3: Footer Component
// Find:    from ['"]@/components/Footer['"]
// Replace: from '@/components/layout/Footer'

// Pattern 4: MainLayout Component
// Find:    from ['"]@/components/MainLayout['"]
// Replace: from '@/components/layout/MainLayout'

// Pattern 5: DashboardLayout Component
// Find:    from ['"]@/components/DashboardLayout['"]
// Replace: from '@/components/layout/DashboardLayout'

// Pattern 6: AuthLayout Component
// Find:    from ['"]@/components/AuthLayout['"]
// Replace: from '@/components/layout/AuthLayout'

// ============================================================================
// FORM COMPONENT IMPORTS
// ============================================================================

// Pattern 7: FormInput Component
// Find:    from ['"]@/components/FormInput['"]
// Replace: from '@/components/forms/FormInput'

// Pattern 8: FormSelect Component
// Find:    from ['"]@/components/FormSelect['"]
// Replace: from '@/components/forms/FormSelect'

// Pattern 9: FormTextarea Component
// Find:    from ['"]@/components/FormTextarea['"]
// Replace: from '@/components/forms/FormTextarea'

// Pattern 10: ValidatedInput Component
// Find:    from ['"]@/components/ValidatedInput['"]
// Replace: from '@/components/forms/ValidatedInput'

// ============================================================================
// SHARED COMPONENT IMPORTS
// ============================================================================

// Pattern 11: AlertBox Component
// Find:    from ['"]@/components/AlertBox['"]
// Replace: from '@/components/shared/AlertBox'

// Pattern 12: LoadingSpinner Component
// Find:    from ['"]@/components/LoadingSpinner['"]
// Replace: from '@/components/shared/LoadingSpinner'

// Pattern 13: ToasterProvider Component
// Find:    from ['"]@/components/ToasterProvider['"]
// Replace: from '@/components/shared/ToasterProvider'

// Pattern 14: PaymentReceiptUpload Component
// Find:    from ['"]@/components/PaymentReceiptUpload['"]
// Replace: from '@/components/shared/PaymentReceiptUpload'

// Pattern 15: ErrorBoundary Component
// Find:    from ['"]@/components/ErrorBoundary['"]
// Replace: from '@/components/shared/ErrorBoundary'

// Pattern 16: AIChatBox Component
// Find:    from ['"]@/components/AIChatBox['"]
// Replace: from '@/components/shared/AIChatBox'

// Pattern 17: DashboardLayoutSkeleton Component
// Find:    from ['"]@/components/DashboardLayoutSkeleton['"]
// Replace: from '@/components/shared/DashboardLayoutSkeleton'

// ============================================================================
// RELATIVE IMPORTS (If any exist)
// ============================================================================

// Pattern 18: Relative path to components folder
// Find:    from ['"]\.\.\/components\/Header['"]
// Replace: from '@/components/layout/Header'

// Pattern 19: Relative path to components - Forms
// Find:    from ['"]\.\.\/components\/FormInput['"]
// Replace: from '@/components/forms/FormInput'

// ============================================================================
// DESTRUCTURED IMPORTS (If used)
// ============================================================================

// Pattern 20: Destructured FormInput
// Find:    import \{ FormInput \} from ['"]@/components['"]
// Replace: import { FormInput } from '@/components/forms'

// Pattern 21: Destructured AlertBox
// Find:    import \{ AlertBox \} from ['"]@/components['"]
// Replace: import { AlertBox } from '@/components/shared'

// ============================================================================
// HOW TO USE THESE PATTERNS IN VS CODE
// ============================================================================

/*
1. Open Find & Replace: Ctrl+H

2. For each pattern:
   a) Copy the "Find:" pattern
   b) Paste in the "Find" field
   c) Copy the "Replace:" pattern
   d) Paste in the "Replace" field
   e) Click .* button to enable regex (if pattern contains regex)
   f) Preview matches (should highlight all occurrences)
   g) Click "Replace All" (or review one-by-one first)

3. Common regex patterns used:
   - ['"]: Matches either single or double quote
   - \: Escapes special regex characters
   - ^: Start of line
   - $: End of line

4. Verification:
   - After replacement, no imports should reference old paths
   - Build should complete without errors
   - All components should load correctly
*/

// ============================================================================
// ALTERNATIVE: MANUAL SEARCH PATTERNS
// ============================================================================

/*
If regex patterns don't work, use these simpler patterns in Find field:

@/components/Header      → Replace with: @/components/layout/Header
@/components/Sidebar     → Replace with: @/components/layout/Sidebar
@/components/Footer      → Replace with: @/components/layout/Footer
@/components/MainLayout  → Replace with: @/components/layout/MainLayout
@/components/DashboardLayout → Replace with: @/components/layout/DashboardLayout
@/components/AuthLayout  → Replace with: @/components/layout/AuthLayout

@/components/FormInput   → Replace with: @/components/forms/FormInput
@/components/FormSelect  → Replace with: @/components/forms/FormSelect
@/components/FormTextarea → Replace with: @/components/forms/FormTextarea
@/components/ValidatedInput → Replace with: @/components/forms/ValidatedInput

@/components/AlertBox    → Replace with: @/components/shared/AlertBox
@/components/LoadingSpinner → Replace with: @/components/shared/LoadingSpinner
@/components/ToasterProvider → Replace with: @/components/shared/ToasterProvider
@/components/PaymentReceiptUpload → Replace with: @/components/shared/PaymentReceiptUpload
@/components/ErrorBoundary → Replace with: @/components/shared/ErrorBoundary
@/components/AIChatBox   → Replace with: @/components/shared/AIChatBox
@/components/DashboardLayoutSkeleton → Replace with: @/components/shared/DashboardLayoutSkeleton
*/

// ============================================================================
// VERIFICATION CHECKLIST
// ============================================================================

/*
After completing all replacements, verify:

□ No remaining imports from @/components/Header (should all be @/components/layout/Header)
□ No remaining imports from @/components/FormInput (should all be @/components/forms/FormInput)
□ No remaining imports from @/components/AlertBox (should all be @/components/shared/AlertBox)
□ Build succeeds: npm run build
□ No TypeScript errors
□ No runtime errors when running the app
□ All pages load correctly
□ All components render properly
□ No missing imports or references

If any errors occur:
1. Check the error message
2. Find the problematic file
3. Verify the import path
4. Correct the path manually if needed
5. Re-run build
*/

// ============================================================================
// EXAMPLE BEFORE & AFTER
// ============================================================================

/*
BEFORE (Old Structure):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// App.tsx
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FormInput from '@/components/FormInput';
import AlertBox from '@/components/AlertBox';

// Dashboard.tsx
import MainLayout from '@/components/MainLayout';
import { FormSelect } from '@/components/FormSelect';
import { AlertBox } from '@/components/AlertBox';

AFTER (New Structure):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// App.tsx
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import FormInput from '@/components/forms/FormInput';
import AlertBox from '@/components/shared/AlertBox';

// Dashboard.tsx
import MainLayout from '@/components/layout/MainLayout';
import { FormSelect } from '@/components/forms/FormSelect';
import { AlertBox } from '@/components/shared/AlertBox';
*/

// ============================================================================
// FINAL STEPS
// ============================================================================

/*
1. ✓ Move all files to new locations (drag & drop in VS Code)
2. ✓ Run Find & Replace for all import paths (use patterns above)
3. ✓ Build and verify: npm run build
4. ✓ Run and test: npm run dev
5. ✓ Commit changes: git add -A && git commit -m "refactor: Reorganize project structure"
6. ✓ Push to GitHub: git push origin main
*/
