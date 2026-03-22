# Adding New Tools

Follow these 3 steps to add a new tool to the toolkit.

## Step 1: Add Nav Item (index.html)

Add a new entry in the sidebar inside the appropriate `nav-section`:

```html
<div class="nav-item" data-tool="mytool">
  <span class="nav-icon">M</span>
  <span>My New Tool</span>
</div>
```

The `data-tool` value must match the section ID (without the `tool-` prefix).

## Step 2: Add Tool Section (index.html)

Add a new section in the `<div class="main">` area:

```html
<div class="tool-section" id="tool-mytool">
  <div class="tool-title">My New Tool</div>
  <div class="tool-desc">Description of what this tool does.</div>

  <div class="input-group">
    <label>Input Label</label>
    <input type="text" id="mytool-input" placeholder="Enter something...">
  </div>

  <button onclick="runMyTool()">Run</button>
  <div id="mytool-result"></div>
</div>
```

## Step 3: Add Logic (js/app.js)

Add your function at the end of app.js:

```javascript
// ============================================================
// MY NEW TOOL
// ============================================================
function runMyTool() {
  var input = document.getElementById('mytool-input').value.trim();
  if (!input) return;

  // Your logic here
  var result = input.toUpperCase();

  makeResult(
    '<div class="result">' + result +
    '<button class="copy-btn btn-sm" onclick="copyText(\'' + result + '\')">Copy</button>' +
    '</div>',
    'mytool-result'
  );
}
```

## Available CSS Classes

| Class | Usage |
|-------|-------|
| `.input-group` | Wrapper for label + input |
| `.input-row` | Horizontal row of inputs |
| `.btn-row` | Row of buttons |
| `.btn-sm` | Small button |
| `.btn-fill` | Filled accent button |
| `.result` | Output box with monospace font |
| `.result-grid` | Grid of result cards |
| `.result-card` | Card with `.val` and `.lbl` |
| `.tag` | Inline tag (use with `.tag-green`, `.tag-blue`, `.tag-yellow`, `.tag-red`) |
| `.copy-btn` | Copy button positioned top-right of `.result` |

## Helper Functions

| Function | Usage |
|----------|-------|
| `makeResult(html, elementId)` | Sets innerHTML of a result container |
| `copyText(text)` | Copies text to clipboard |
