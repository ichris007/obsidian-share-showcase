# VaultInsight - Obsidian Knowledge Base Smart Statistics Dashboard

[中文](./README.md) | [English](./README-EN.md) 

### 1. 📖 Script Overview

VaultInsight is a comprehensive Vault statistics dashboard script based on the Obsidian Datacore plugin. It provides a complete set of note repository monitoring and analysis tools. Through a visual panel, you can track key metrics of your knowledge base in real-time, including file counts, tag statistics, project distribution, task progress, and more.

### 2. ✨ Core Features

#### 2.1 📊 Core Metrics Overview
- **Days Used**: Automatically calculated based on the earliest creation date of your notes
- **Total Files**: Supports statistics for MD, Canvas, Excalidraw, images, and miscellaneous files
- **Tag Count**: Automatically scans and counts all tags (deduplicated by primary category)
- **Total Projects**: Intelligently identifies project fields in Frontmatter
- **Total Tasks**: Counts all pending, in-progress, completed, and cancelled tasks

#### 2.2 🎯 Project Distribution Dashboard
- Automatically identifies notes containing fields such as `project` / `projects` / `parent_project`
- Intelligently categorizes project status based on the `status` attribute field
- Automatically matches color schemes for different statuses (in-progress, completed, delayed, paused, etc.)
- Supports project-specific path isolation (include/exclude specified directories)

#### 2.3 📋 Task Dashboard
- Real-time statistics on task status distribution: pending, in-progress, completed, cancelled, etc.
- Based on Dataview task syntax parsing (fallback solution when Datacore task parsing fails)
- Automatically excludes tasks in specified directories

#### 2.4 🛠️ Interactive Configuration Center
- **Visual Configuration Panel**: Adjust all statistical parameters without modifying code
- **Dynamic Path Management**:
  - Global exclusion directories (e.g., Templates, .trash, etc.)
  - Project-specific include/exclude directories (supports precise parent-child directory isolation)
- **File Type Filtering**: Customize which file types are counted in the total
- **Panel Display Control**: Independently control the visibility of each sub-module
- **Configuration Snapshot Export**: One-click copy of complete configuration code for easy persistence

### 3. 🎨 Feature Highlights

#### 3.1 Smart Color Mapping
- Automatic semantic color matching for project statuses
- Differentiated visual identifiers for task statuses
- Automatically generates harmonious color values for unrecognized statuses

#### 3.2 Responsive Design
- Perfectly adapts to Obsidian dark/light modes
- Uses Datacore reactive API for real-time data updates
- Adaptive layout, mobile-friendly

#### 3.3 Precise Path Isolation
- Supports precise inclusion and exclusion of multi-level directories
- Project statistics can be independent of global configuration
- Smart blocking mechanism for parent-child directory relationships

### 4. 🚀 Usage Instructions

#### 4.1 Prerequisites
1. Ensure the [Datacore](https://github.com/blacksmithgu/datacore) plugin is installed and enabled
2. Install the [Dataview](https://github.com/blacksmithgu/obsidian-dataview) plugin to support full task statistics functionality

#### 4.2 Installation Steps

1. Create a new note file in Obsidian
2. Copy the complete script code to this note ([Script]())
3. Ensure the note language is set to `datacore` (add a ````datacorejsx` code block marker at the beginning of the code)
4. Switch to Reading View or exit code editing mode to see the statistics panel

#### 4.3 Quick Configuration Guide

##### 4.3.1 Basic Configuration (via UI Interface)
1. Click the **⚙️ Statistics Settings** button in the upper right corner of the statistics panel
2. Adjust various parameters in the expanded configuration panel:
   - **Main Card Title**: Customize the dashboard name
   - **Global Exclusion Directories**: Add/remove folders to ignore
   - **Project Statistics Paths**: Set project-specific include/exclude directories
   - **File Type Filtering**: Check file types to include in the total count
   - **Sub-panel Control**: Show/hide individual functional modules
3. Configuration takes effect immediately without page refresh

##### 4.3.2 Persisting Configuration (Writing Configuration to Code)
1. Click the **📋 Copy Persisted Configuration Code** button at the bottom of the configuration panel
2. Open the script source file
3. Replace the `CONFIG` object at the top with the copied content
4. Save the file for permanent effect

#### 4.4 Configuration Parameters Explained

```javascript
const CONFIG = {
  // Display Control
  showTitle: true,              // Whether to show the title
  titleText: "Vault Running Data Overview", // Custom title
  
  // Global Exclusion Directories
  excludedFolders: ["Templates", ".trash", ".obsidian", ".datacore"],
  
  // File Type Inclusion Control
  includeFilesForTotal: {
    canvas: false,       // Canvas whiteboard files
    excalidraw: false,   // Excalidraw drawings
    images: false,       // Image files
    other: false         // Other file types
  },
  
  // Project Statistics Path Isolation
  projectIncludedFolders: [],   // Project include directories (empty = entire vault)
  projectExcludedFolders: [],   // Project exclude directories
  
  // Sub-panel Visibility Control
  showDetailsPanel: true,       // File details panel
  showProjectPanel: true,       // Project distribution panel
  showTaskPanel: true,          // Task distribution panel
  showFooterPanel: true         // Footer history timestamp
};
```

### 5. 📝 Usage Examples

#### 5.1 Scenario 1: Excluding All Temporary Files
Add `.trash`, `Templates`, `Daily Notes` to the global exclusion directories. Statistics will automatically filter content from these folders.

#### 5.2 Scenario 2: Focused Project Folder Statistics
In project-specific configuration:
- **Include Directories**: `["Projects/Active", "Projects/Archived"]`
- **Exclude Directories**: `["Projects/Archived/2023"]`

This will only count projects in Active and Archived folders, but exclude archived projects from 2023.

#### 5.3 Scenario 3: Custom Dashboard Display
- Disable file details panel (`showDetailsPanel: false`)
- Keep only core metrics, project distribution, and task dashboard
- Create a data dashboard dedicated to project management

### 6. 🔧 Compatibility & Dependencies

- **Core Dependency**: Datacore plugin (required)
- **Optional Dependency**: Dataview plugin (required for enhanced task statistics)
- **Compatible Versions**: Obsidian v1.12.7 (other versions not tested)
- **Theme Compatibility**: Automatically adapts to all Obsidian themes

### 7. 📌 Important Notes

1. **Performance Optimization**: For large Vaults (5000+ files), it's recommended to set exclusion directories appropriately to reduce computational load
2. **Project Identification**: Ensure note Frontmatter contains the `project` or `status` field
3. **Task Statistics**: Complete task statistics functionality is only available when Dataview plugin is enabled
4. **Path Format**: Use relative paths for folders, e.g., `"Projects/Active"`, without leading slashes

### 8. 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Statistics panel not displaying | Verify the file language is set to `datacore` and Datacore plugin is enabled |
| Project count is 0 | Check if note Frontmatter contains the `project` field |
| Task statistics are inaccurate | Install and enable Dataview plugin, refresh the panel |
| Cannot exclude a specific folder | Verify that the path name matches exactly (case-sensitive) |
| Configuration not taking effect after saving | Copy the configuration code and replace the CONFIG object at the top of the script |

### 9. 📦 Version History

- **v1.0.0** (2027-07-98): Initial release, includes core statistics functionality and interactive configuration center

### 10. 📄 License

MIT License

---

**💡 Tip**: For more help or feature customization, feel free to submit an Issue!
