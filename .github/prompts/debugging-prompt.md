# Debugging Prompt

## Purpose

Use this systematic debugging approach when investigating issues, errors, or unexpected behavior in the Maily application.

---

## Debugging Framework

### Step 1: Define the Problem

```
**Problem Description:**
[Describe what's happening vs. what should happen]

**Expected Behavior:**
[What should the application do?]

**Actual Behavior:**
[What is the application actually doing?]

**Severity:**
- [ ] Critical (app crashes/unusable)
- [ ] High (major feature broken)
- [ ] Medium (feature partially working)
- [ ] Low (minor issue/cosmetic)

**Reproducibility:**
- [ ] Always reproducible
- [ ] Intermittent
- [ ] Unable to reproduce

**Environment:**
- Browser: [Chrome/Firefox/Safari/Edge version]
- OS: [Windows/Mac/Linux]
- Node version: [version]
- Other relevant info: [...]
```

### Step 2: Gather Context

```
**When did this start occurring?**
[After specific change? Always been there?]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Error occurs]

**Error Messages:**
```
[Paste exact error messages, stack traces, console logs]
```

**Affected Components/Files:**
- [Component/file 1]
- [Component/file 2]

**Recent Changes:**
- [List recent code changes related to this area]

**Related Features:**
- [List related features that might be affected]
```

### Step 3: Form Hypotheses

```
**Possible Causes (ranked by likelihood):**

1. [Most likely cause]
   - Why: [Reasoning]
   - How to verify: [Test to confirm/reject]

2. [Second likely cause]
   - Why: [Reasoning]
   - How to verify: [Test to confirm/reject]

3. [Third likely cause]
   - Why: [Reasoning]
   - How to verify: [Test to confirm/reject]
```

### Step 4: Investigation

```
**Tests Performed:**

Test 1: [Description]
- Method: [How you tested]
- Result: [What happened]
- Conclusion: [What this tells us]

Test 2: [Description]
- Method: [How you tested]
- Result: [What happened]
- Conclusion: [What this tells us]

**Code Inspection:**
- [File/function examined]
- [Findings]

**Data Inspection:**
- [What data was examined]
- [Findings]

**Network Inspection:**
- [API calls examined]
- [Findings]
```

### Step 5: Solution

```
**Root Cause:**
[What ultimately caused the problem]

**Solution:**
[How to fix it]

**Implementation:**
```javascript
// Code changes to fix the issue
```

**Verification:**
- [ ] Fix applied
- [ ] Issue no longer reproduces
- [ ] Related features still work
- [ ] No new issues introduced

**Prevention:**
[How to prevent similar issues in the future]
```

---

## Example Usage

### Example 1: Component Not Rendering

```
**Problem Description:**
TemplateCard component is not rendering in the gallery view. The page loads but no cards are displayed, even though templates exist in the database.

**Expected Behavior:**
Gallery page should display a grid of TemplateCard components, one for each user template.

**Actual Behavior:**
Gallery page shows empty state message "No templates found" even when user has templates.

**Severity:**
- [x] High (major feature broken)

**Reproducibility:**
- [x] Always reproducible

**Environment:**
- Browser: Chrome 120.0
- OS: Windows 11
- Node version: 18.17.0

---

**When did this start occurring?**
After implementing the new API pagination for the /api/templates/my-templates endpoint

**Steps to Reproduce:**
1. Log in with account that has saved templates
2. Navigate to /gallery page
3. Page loads but no templates display
4. Console shows "Cannot read property 'map' of undefined"

**Error Messages:**
```
TypeError: Cannot read property 'map' of undefined
    at TemplateGallery.js:45:23
    at Array.map (<anonymous>)
```

**Affected Components/Files:**
- client/src/pages/TemplateGallery.js
- client/src/services/templateService.js
- server/controllers/templateController.js (getMyTemplates)

**Recent Changes:**
- Changed API response structure to include pagination data
- Modified getUserTemplates function in templateService.js

---

**Possible Causes (ranked by likelihood):**

1. API response structure changed but frontend code not updated
   - Why: Recent change to pagination modified response format
   - How to verify: Check API response in Network tab

2. templateService not properly extracting data from response
   - Why: Service might be returning entire response instead of data array
   - How to verify: Add console.log in service function

3. State initialization issue in TemplateGallery component
   - Why: useState might not have correct initial value
   - How to verify: Check initial state and loading logic

---

**Tests Performed:**

Test 1: Check API response structure
- Method: Open Network tab, call /api/templates/my-templates
- Result: Response structure is:
  ```json
  {
    "success": true,
    "data": {
      "templates": [...],
      "pagination": {...}
    }
  }
  ```
- Conclusion: API returns nested structure, but code expects flat array

Test 2: Check templateService return value
- Method: Add console.log in getUserTemplates function
- Result: Function returns entire response.data object, not response.data.templates
- Conclusion: Service is returning { templates: [...], pagination: {...} } instead of just the array

Test 3: Check component state
- Method: Add console.log in TemplateGallery after fetch
- Result: templates state is set to object with templates and pagination keys
- Conclusion: Component tries to call .map() on object instead of array

---

**Root Cause:**
The templateService.getUserTemplates() function returns response.data instead of response.data.templates. When pagination was added, the response structure changed from { success: true, data: [...] } to { success: true, data: { templates: [...], pagination: {...} } }, but the service function wasn't updated.

**Solution:**
Update getUserTemplates to extract the templates array from the nested data structure.

**Implementation:**
```javascript
// services/templateService.js

// BEFORE
export const getUserTemplates = async () => {
  const response = await api.get('/templates/my-templates');
  return response.data; // Returns { templates: [...], pagination: {...} }
};

// AFTER
export const getUserTemplates = async () => {
  const response = await api.get('/templates/my-templates');
  return response.data.data; // Returns { templates: [...], pagination: {...} }
};

// OR (if you want to return both templates and pagination)
export const getUserTemplates = async () => {
  const response = await api.get('/templates/my-templates');
  return {
    templates: response.data.data.templates,
    pagination: response.data.data.pagination,
  };
};
```

**Verification:**
- [x] Fix applied
- [x] Issue no longer reproduces - templates now display correctly
- [x] Related features still work - template CRUD operations work
- [x] No new issues introduced - pagination displays correctly

**Prevention:**
1. Add TypeScript or JSDoc type definitions for API response shapes
2. Create test cases for API response structure changes
3. Document API response formats in API documentation
4. Add PropTypes validation for service function return values
```

### Example 2: Drag-and-Drop Not Working

```
**Problem Description:**
Components dragged from palette to canvas are not being dropped. No visual feedback during drag, and nothing happens on drop.

**Expected Behavior:**
Dragging a component from the palette to the canvas should add it to the canvas at the drop position.

**Actual Behavior:**
Drag starts but no visual feedback. Drop does nothing. Component not added to canvas.

**Severity:**
- [x] Critical (app crashes/unusable)

**Reproducibility:**
- [x] Always reproducible

**Environment:**
- Browser: Chrome 120.0
- OS: Windows 11

---

**When did this start occurring?**
After refactoring DndContext to separate PreviewContext

**Steps to Reproduce:**
1. Open email editor
2. Drag a text component from palette
3. Move over canvas area
4. Release mouse button
5. Nothing happens

**Error Messages:**
```
Warning: Expected onDragEnd to be called, but it wasn't
```

**Affected Components/Files:**
- client/src/components/ComponentPalette.js
- client/src/components/EditorCanvas.js
- client/src/contexts/EditorContext.js

**Recent Changes:**
- Split DndContext across multiple components
- Moved canvas logic to separate component

---

**Possible Causes:**

1. DndContext not wrapping both palette and canvas
   - Why: DnD requires common context for all draggable/droppable
   - How to verify: Check component tree and DndContext placement

2. Missing onDragEnd handler
   - Why: Warning message suggests handler not being called
   - How to verify: Check if DndContext has onDragEnd prop

3. Droppable not properly configured
   - Why: Canvas might not be set up as drop zone
   - How to verify: Check useDroppable hook usage in canvas

---

**Root Cause:**
After refactoring, EditorCanvas and ComponentPalette are rendered as siblings, but each has its own DndContext. The @dnd-kit library requires all draggable and droppable components to share a single DndContext parent.

**Solution:**
Move DndContext to wrap both ComponentPalette and EditorCanvas in the parent EditorPage component.

**Implementation:**
```javascript
// pages/EditorPage.js

// BEFORE
<Grid container>
  <Grid item xs={3}>
    <ComponentPalette />  {/* Has own DndContext */}
  </Grid>
  <Grid item xs={9}>
    <EditorCanvas />      {/* Has own DndContext */}
  </Grid>
</Grid>

// AFTER
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <Grid container>
    <Grid item xs={3}>
      <ComponentPalette />
    </Grid>
    <Grid item xs={9}>
      <EditorCanvas />
    </Grid>
  </Grid>
</DndContext>
```

**Verification:**
- [x] Fix applied
- [x] Drag-and-drop now works correctly
- [x] Visual feedback shows during drag
- [x] Components added to canvas on drop

**Prevention:**
1. Document DndContext requirements in component documentation
2. Add lint rule or comment reminder about shared context requirement
3. Create reusable DnD wrapper component to enforce structure
```

---

## Common Issue Patterns

### Frontend Issues

**React Component Not Rendering:**
1. Check props are being passed correctly
2. Verify conditional rendering logic
3. Check for errors in console
4. Verify component is imported and used
5. Check parent component rendering

**State Not Updating:**
1. Verify setState/dispatch is called
2. Check for state mutation (should use immutable updates)
3. Verify useEffect dependencies
4. Check if component is re-rendering
5. Use React DevTools to inspect state

**API Call Failing:**
1. Check Network tab for request/response
2. Verify API endpoint URL
3. Check request headers (auth token, content-type)
4. Verify request body format
5. Check CORS settings
6. Verify error handling in catch block

### Backend Issues

**Route Not Found (404):**
1. Verify route is registered in app.js
2. Check route path matches request URL
3. Verify middleware order (auth before routes)
4. Check for typos in route definition
5. Verify HTTP method matches (GET/POST/etc)

**Database Query Not Working:**
1. Check Mongoose model schema
2. Verify query syntax
3. Check field names match schema
4. Verify database connection
5. Check query filters/conditions
6. Use .lean() for better performance

**Authentication Failing:**
1. Verify JWT token is being sent
2. Check token format (Bearer prefix)
3. Verify token is valid and not expired
4. Check JWT_SECRET matches between sign/verify
5. Verify protect middleware is working

---

**Use this systematic approach to debug issues efficiently in Maily.**