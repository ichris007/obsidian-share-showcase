// ========================================================================
// Datacore 视图：Obsidian Vault 统计（含专项路径隔离 + 状态美化 + 自定义标题版）
// ========================================================================

// ========================================
// 1. 初始化及手动静态配置区域
// ========================================
const CONFIG = {
  // 基础显示与控制配置
  showTitle: true,              // 是否默认显示标题
  titleText: "LifeinOS 系统数据概览", // 自定义卡片主标题名称
  excludedFolders: ["Templates",".trash",".obsidian",".datacore"], // 全局默认排除目录

  // 文件总数统计包含的范围
  includeFilesForTotal: {
    canvas: false,       // 是否包含 .canvas 文件
    excalidraw: false,   // 是否包含 .excalidraw 文件
    images: false,       // 是否包含图片文件
    other: false         // 是否包含其他类型文件
  },

  // 项目统计专项路径配置（支持父子目录精确隔离）
  projectIncludedFolders: ["01Projects"],   // 项目统计包含目录（为空代表全库扫描）
  projectExcludedFolders: [],   // 项目统计排除目录（可精准排除已包含目录的子目录）

  // 独立子面板显示控制
  showDetailsPanel: false,       // 是否显示文件类型明细细分面板
  showProjectPanel: false,       // 是否显示项目分布看板面板
  showTaskPanel: false,          // 是否显示任务分布看板面板
  showFooterPanel: false         // 是否显示底部脚注历史时间
};

// ========================================
// 2. 主入口逻辑
// ========================================
return function View() {
  // ----- 核心状态驱动 -----
  const [showTitle, setShowTitle] = dc.useState(CONFIG.showTitle);
  const [titleText, setTitleText] = dc.useState(CONFIG.titleText || "Vault 运行数据概览");
  const [showSettings, setShowSettings] = dc.useState(false); // 控制面板展开/收起
  const [excludedFolders, setExcludedFolders] = dc.useState(CONFIG.excludedFolders);

  // 文件包含范围
  const [includeCanvas, setIncludeCanvas] = dc.useState(CONFIG.includeFilesForTotal.canvas);
  const [includeExcali, setIncludeExcali] = dc.useState(CONFIG.includeFilesForTotal.excalidraw);
  const [includeImages, setIncludeImages] = dc.useState(CONFIG.includeFilesForTotal.images);
  const [includeOther, setIncludeOther] = dc.useState(CONFIG.includeFilesForTotal.other);

  // 项目统计专属路径状态
  const [projInclFolders, setProjInclFolders] = dc.useState(CONFIG.projectIncludedFolders);
  const [projExclFolders, setProjExclFolders] = dc.useState(CONFIG.projectExcludedFolders);

  // 子面板显隐控制状态
  const [showDetailsPanel, setShowDetailsPanel] = dc.useState(CONFIG.showDetailsPanel);
  const [showProjectPanel, setShowProjectPanel] = dc.useState(CONFIG.showProjectPanel);
  const [showTaskPanel, setShowTaskPanel] = dc.useState(CONFIG.showTaskPanel);
  const [showFooterPanel, setShowFooterPanel] = dc.useState(CONFIG.showFooterPanel);

  // 搜索过滤文件夹的关键字状态
  const [folderSearchKey, setFolderSearchKey] = dc.useState("");
  const [projInclSearchKey, setProjInclSearchKey] = dc.useState("");
  const [projExclSearchKey, setProjExclSearchKey] = dc.useState("");
  const [copied, setCopied] = dc.useState(false);

  // ----- 基于 Datacore 响应式核心拉取数据 -----
  const allPages = dc.useQuery("@page");
  const allRawFiles = app.vault.getAllLoadedFiles();

  // ----- 动态智能扫描：提取当前库内所有真实的文件夹路径 -----
  const allVaultFolders = dc.useMemo(() => {
    const folders = new Set();
    allRawFiles.forEach(f => {
      if (f.children && f.path !== "/") {
        folders.add(f.path);
      }
    });
    return Array.from(folders).sort();
  }, [allRawFiles]);

  // ----- 辅助路径匹配算法：判定某路径是否属于目标目录或其子目录 -----
  const isPathInFolderList = (targetPath, folderList) => {
    return folderList.some(folder => {
      return targetPath === folder || targetPath.startsWith(folder + "/");
    });
  };

  // ----- 项目看板专属：智能状态色彩美化映射函数 -----
  const getProjectStatusColor = (status) => {
    const s = String(status).trim().toLowerCase();
    if (["进行中", "正在进行", "in progress", "active", "doing"].includes(s)) {
      return { bg: "rgba(0, 122, 255, 0.15)", text: "var(--text-accent)" }; 
    }
    if (["已完成", "完成", "completed", "done", "finished"].includes(s)) {
      return { bg: "rgba(46, 204, 113, 0.15)", text: "var(--text-success)" }; 
    }
    if (["未分类", "未知", "unknown", "none"].includes(s)) {
      return { bg: "rgba(142, 142, 147, 0.12)", text: "var(--text-muted)" }; 
    }
    if (["延期", "滞后", "delayed", "overdue"].includes(s)) {
      return { bg: "rgba(231, 76, 60, 0.15)", text: "var(--text-error)" }; 
    }
    if (["暂停", "挂起", "on hold", "paused", "blocked"].includes(s)) {
      return { bg: "rgba(241, 196, 15, 0.15)", text: "var(--text-warning)" }; 
    }
    if (["准备", "计划", "idea", "planning", "todo", "待办"].includes(s)) {
      return { bg: "rgba(155, 93, 229, 0.12)", text: "var(--text-purple || #9b5de5)" }; 
    }

    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return {
      bg: `hsla(${h}, 65%, 45%, 0.12)`,
      text: `hsla(${h}, 70%, 40%, 1)`
    };
  };

  // ----- 动态计算文件数量 -----
  const fileStats = dc.useMemo(() => {
    const stats = { total: 0, md: 0, canvas: 0, excalidraw: 0, images: 0, other: 0 };
    allRawFiles.forEach(file => {
      if (file.children) return; 
      if (isPathInFolderList(file.path, excludedFolders)) return;

      const ext = file.extension?.toLowerCase() || "";
      if (ext === "md") stats.md++;
      else if (ext === "canvas") stats.canvas++;
      else if (ext === "excalidraw") stats.excalidraw++;
      else if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) stats.images++;
      else stats.other++;
    });

    let totalCounter = stats.md;
    if (includeCanvas) totalCounter += stats.canvas;
    if (includeExcali) totalCounter += stats.excalidraw;
    if (includeImages) totalCounter += stats.images;
    if (includeOther) totalCounter += stats.other;

    stats.total = totalCounter;
    return stats;
  }, [allRawFiles, excludedFolders, includeCanvas, includeExcali, includeImages, includeOther]);

  // ----- 动态计算标签 -----
  const totalTagsCount = dc.useMemo(() => {
    const tagSet = new Set();
    allPages.forEach(page => {
      if (isPathInFolderList(page.$path, excludedFolders)) return;
      if (page.$tags && Array.isArray(page.$tags)) {
        page.$tags.forEach(tag => {
          if (tag && typeof tag === 'string') {
            const cleanTag = tag.replace(/^#/, "").split("/")[0].trim();
            if (cleanTag.length > 0) tagSet.add(cleanTag);
          }
        });
      }
    });
    return tagSet.size;
  }, [allPages, excludedFolders]);

  // ----- 动态智能扫描并统计项目 -----
  const projectStats = dc.useMemo(() => {
    const validProjectKeys = ["project", "projects", "parent_project", "parent_projects"];
    let totalProjects = 0;
    const statusMap = {};

    allPages.forEach(page => {
      const pagePath = page.$path;
      if (isPathInFolderList(pagePath, excludedFolders)) return;
      if (projInclFolders.length > 0 && !isPathInFolderList(pagePath, projInclFolders)) return;
      if (projExclFolders.length > 0 && isPathInFolderList(pagePath, projExclFolders)) return;

      const file = app.vault.getAbstractFileByPath(pagePath);
      if (!file) return;
      const cache = app.metadataCache.getFileCache(file);
      const frontmatter = cache?.frontmatter || {};

      let hasProjectField = false;
      for (const fKey of Object.keys(frontmatter)) {
        if (validProjectKeys.includes(fKey.toLowerCase())) {
          const val = frontmatter[fKey];
          if (val !== undefined && val !== null && String(val).trim() !== "") {
            hasProjectField = true;
            break;
          }
        }
      }

      if (hasProjectField) {
        totalProjects++;
        let projectStatus = "未分类";
        
        for (const fKey of Object.keys(frontmatter)) {
          if (fKey.toLowerCase() === "status") {
            const sVal = frontmatter[fKey];
            if (sVal !== undefined && sVal !== null && String(sVal).trim() !== "") {
              projectStatus = String(sVal).trim();
            }
            break;
          }
        }
        statusMap[projectStatus] = (statusMap[projectStatus] || 0) + 1;
      }
    });

    return { total: totalProjects, statusMap };
  }, [allPages, excludedFolders, projInclFolders, projExclFolders]);

  // ----- 动态计算任务 -----
  const taskStats = dc.useMemo(() => {
    const dvApi = app.plugins.plugins.dataview?.api;
    if (!dvApi) return { total: 0, completed: 0, inProgress: 0, cancelled: 0, todo: 0 };
    
    const allRawTasks = dvApi.pages("")
      .filter(p => !isPathInFolderList(p.file.path, excludedFolders))
      .file.tasks.array();

    const total = allRawTasks.length;
    const completed = allRawTasks.filter(t => t.completed).length;
    const inProgress = allRawTasks.filter(t => t.status === "/").length;
    const cancelled = allRawTasks.filter(t => ["-", "c", "C"].includes(t.status)).length;
    const todo = allRawTasks.filter(t => !t.completed && t.status !== "/" && !["-", "c", "C"].includes(t.status)).length;

    return { total, completed, inProgress, cancelled, todo };
  }, [allPages, excludedFolders]);

  // ----- 动态计算库龄 -----
  const earliestDate = dc.useMemo(() => {
    const mdFiles = allRawFiles.filter(file => {
      if (file.children || file.extension?.toLowerCase() !== "md") return false;
      return !isPathInFolderList(file.path, excludedFolders);
    });

    const dates = mdFiles.map(file => {
      const cache = app.metadataCache.getFileCache(file);
      const frontmatter = cache?.frontmatter || {};
      const dateFields = ["date", "created", "created-date", "created_date", "created date"];
      for (const field of dateFields) {
        const value = frontmatter[field];
        if (value) {
          const dt = dc.luxon.DateTime.fromISO(String(value));
          if (dt.isValid) return dt;
        }
      }
      if (file.stat?.ctime) return dc.luxon.DateTime.fromJSDate(new Date(file.stat.ctime));
      return null;
    }).filter(dt => dt !== null && dt.isValid);

    if (dates.length === 0) return null;
    let min = dates[0];
    for (const dt of dates) { if (dt < min) min = dt; }
    return min;
  }, [allRawFiles, excludedFolders]);

  const daysUsed = dc.useMemo(() => {
    if (!earliestDate || !earliestDate.isValid) return 0;
    const diff = dc.luxon.DateTime.now().diff(earliestDate, ["days"]);
    return Math.max(0, Math.floor(diff.days));
  }, [earliestDate]);

  // ----- 交互过滤下拉数据源过滤 -----
  const filteredFolderOptions = (searchKey, currentList) => {
    return allVaultFolders.filter(f =>
      !currentList.includes(f) &&
      f.toLowerCase().includes(searchKey.toLowerCase())
    ).slice(0, 15);
  };

  // ----- 复制完整带中文注释的配置字符串 -----
  const handleCopyConfig = () => {
    const currentConfigStr = `const CONFIG = {
// 基础显示与控制配置
showTitle: ${showTitle},              // 是否默认显示标题
titleText: "${titleText}", // 自定义卡片主标题名称
excludedFolders: ${JSON.stringify(excludedFolders)}, // 全局默认排除目录

// 文件总数统计包含的范围
includeFilesForTotal: {
canvas: ${includeCanvas},       // 是否包含 .canvas 文件
excalidraw: ${includeExcali},   // 是否包含 .excalidraw 文件
images: ${includeImages},   // 是否包含图片文件
other: ${includeOther}         // 是否包含其他类型文件
},

// 项目统计专项路径配置（支持父子目录精确隔离）
projectIncludedFolders: ${JSON.stringify(projInclFolders)},   // 项目统计包含目录（为空代表全库扫描）
projectExcludedFolders: ${JSON.stringify(projExclFolders)},   // 项目统计排除目录（可精准排除已包含目录的子目录）

// 独立子面板显示控制
showDetailsPanel: ${showDetailsPanel},       // 是否显示文件类型明细细分面板
showProjectPanel: ${showProjectPanel},       // 是否显示项目分布看板面板
showTaskPanel: ${showTaskPanel},          // 是否显示任务分布看板面板
showFooterPanel: ${showFooterPanel}         // 是否显示底部脚注历史时间
};`;

    navigator.clipboard.writeText(currentConfigStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shouldRenderDetails = showDetailsPanel && (includeCanvas || includeExcali || includeImages || includeOther);

  // ----- 视图构建 -----
  return (
    <div style={{ maxWidth: "100%", padding: "8px 0" }}>
      <div
        style={{
          backgroundColor: "var(--background-secondary)",
          border: "1px solid var(--border-color)",
          color: "var(--text-normal)",
          padding: "24px",
          borderRadius: "var(--radius-l)",
          boxShadow: "var(--shadow-s)"
        }}
      >
        {/* 顶部控制栏 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showTitle ? "20px" : "12px" }}>
          {showTitle ? (
            <h3 style={{ margin: 0, fontSize: "1.2em", fontWeight: "600", color: "var(--text-accent)" }}>
              📊 {titleText}
            </h3>
          ) : <div />}      
          <div style={{ display: "flex", gap: "6px" }}>
            <IconButton onClick={() => setShowSettings(!showSettings)} active={showSettings} title="打开统计配置中心">
              ⚙️ {showSettings ? "关闭设置" : "统计设置"}
            </IconButton>
          </div>
        </div>

        {/* ==================== 🛠️ 交互设置面板 ==================== */}
        {showSettings && (
          <div
            style={{
              backgroundColor: "var(--background-primary)",
              border: "1px solid var(--interactive-accent)",
              borderRadius: "var(--radius-m)",
              padding: "16px",
              marginBottom: "20px",
              fontSize: "0.85em",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              textAlign: "left",
              animation: "fadeIn 0.2s ease"
            }}
          >
            <div style={{ fontWeight: "600", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "6px", display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
              <span>🛠️ Vault 动态统计配置中心</span>
              <span style={{ fontSize: "0.95em", fontWeight: "normal" }}>
                  | 出品：
                <a 
                  href="https://Lifein.vip" 
                  target="_blank" 
                  rel="noopener" 
                  style={{ textDecoration: "underline", cursor: "pointer", transition: "opacity 0.2s" }}
                  onMouseOver={(e) => e.target.style.opacity = "0.8"}
                  onMouseOut={(e) => e.target.style.opacity = "1"}
                >			
                  Lifein.vip
                </a>
              </span>
            </div>
            
            {/* 1. 基础卡片标题控制与自定义名称 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontWeight: "500", color: "var(--text-muted)" }}>👁️ 主卡片标题:</span>
                <div style={{ display: "flex", gap: "4px", background: "var(--background-secondary)", borderRadius: "var(--radius-s)", padding: "2px" }}>
                  <button
                    onClick={() => setShowTitle(true)}
                    style={{
                      padding: "3px 8px", border: "none", borderRadius: "calc(var(--radius-s) - 1px)",
                      background: showTitle ? "var(--interactive-accent)" : "transparent",
                      color: showTitle ? "var(--text-on-accent)" : "var(--text-muted)",
                      fontSize: "0.9em", cursor: "pointer"
                    }}
                  >
                    显示
                  </button>
                  <button
                    onClick={() => setShowTitle(false)}
                    style={{
                      padding: "3px 8px", border: "none", borderRadius: "calc(var(--radius-s) - 1px)",
                      background: !showTitle ? "var(--interactive-accent)" : "transparent",
                      color: !showTitle ? "var(--text-on-accent)" : "var(--text-muted)",
                      fontSize: "0.9em", cursor: "pointer"
                    }}
                  >
                    隐藏
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: "500", color: "var(--text-muted)" }}>✏️ 标题自定义名称:</span>
                <input 
                  type="text" 
                  value={titleText} 
                  onChange={(e) => setTitleText(e.target.value)}
                  placeholder="请输入要展示的看板标题..."
                  style={{ flex: 1, padding: "4px 8px", background: "var(--background-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-s)", color: "var(--text-normal)", outline: "none" }}
                />
              </div>
            </div>

            {/* 2. 全局基础排除目录 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontWeight: "500", color: "var(--text-muted)" }}>📁 全局基础排除目录：</label>
              <div style={{ 
                display: "flex", flexWrap: "wrap", gap: "6px", padding: "8px", 
                background: "var(--background-secondary)", border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-s)", minHeight: "36px", alignItems: "center"
              }}>
                {excludedFolders.length === 0 ? (
                  <span style={{ color: "var(--text-faint)", fontSize: "0.9em" }}>未排除任何目录（当前统计全库）</span>
                ) : (
                  excludedFolders.map((folder) => (
                    <span key={folder} style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      background: "var(--background-primary)", border: "1px solid var(--border-color)",
                      padding: "2px 8px", borderRadius: "12px", fontSize: "0.9em", color: "var(--text-normal)"
                    }}>
                      <span>{folder}</span>
                      <span onClick={() => setExcludedFolders(excludedFolders.filter(f => f !== folder))} style={{ cursor: "pointer", color: "var(--text-error)", fontWeight: "bold", marginLeft: "2px" }}>×</span>
                    </span>
                  ))
                )}
              </div>
              <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                <input 
                  type="text" placeholder="🔍 输入关键字过滤本地目录..." value={folderSearchKey}
                  onChange={(e) => setFolderSearchKey(e.target.value)}
                  style={{ flex: 1, padding: "5px 8px", background: "var(--background-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-s)", color: "var(--text-normal)", outline: "none" }}
                />
                <select value="" onChange={(e) => { if(e.target.value && !excludedFolders.includes(e.target.value)) { setExcludedFolders([...excludedFolders, e.target.value]); setFolderSearchKey(""); } }} style={{ padding: "5px 8px", background: "var(--background-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-s)", color: "var(--text-muted)", cursor: "pointer", maxWidth: "140px" }}>
                  <option value="" disabled>选择添加...</option>
                  {filteredFolderOptions(folderSearchKey, excludedFolders).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            {/* 3. 项目统计专项包含目录 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "10px", background: "rgba(var(--mono-rgb-100), 0.02)", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-s)" }}>
              <label style={{ fontWeight: "600", color: "var(--text-accent)" }}>🎯 项目专项包含目录（留空代表不限）：</label>
              <div style={{ 
                display: "flex", flexWrap: "wrap", gap: "6px", padding: "6px", 
                background: "var(--background-secondary)", border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-s)", minHeight: "32px", alignItems: "center"
              }}>
                {projInclFolders.length === 0 ? (
                  <span style={{ color: "var(--text-faint)", fontSize: "0.9em" }}>未指定特定目录（全库中扫描 project 属性）</span>
                ) : (
                  projInclFolders.map((folder) => (
                    <span key={folder} style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      background: "var(--background-primary)", border: "1px solid var(--border-color)",
                      padding: "2px 8px", borderRadius: "12px", fontSize: "0.9em", color: "var(--text-normal)"
                    }}>
                      <span>{folder}</span>
                      <span onClick={() => setProjInclFolders(projInclFolders.filter(f => f !== folder))} style={{ cursor: "pointer", color: "var(--text-error)", fontWeight: "bold", marginLeft: "2px" }}>×</span>
                    </span>
                  ))
                )}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <input 
                  type="text" placeholder="🔍 过滤包含目录..." value={projInclSearchKey}
                  onChange={(e) => setProjInclSearchKey(e.target.value)}
                  style={{ flex: 1, padding: "4px 8px", background: "var(--background-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-s)", color: "var(--text-normal)", outline: "none" }}
                />
                <select value="" onChange={(e) => { if(e.target.value && !projInclFolders.includes(e.target.value)) { setProjInclFolders([...projInclFolders, e.target.value]); setProjInclSearchKey(""); } }} style={{ padding: "4px 8px", background: "var(--background-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-s)", color: "var(--text-muted)", cursor: "pointer", maxWidth: "140px" }}>
                  <option value="" disabled>选择添加...</option>
                  {filteredFolderOptions(projInclSearchKey, projInclFolders).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              {/* 4. 项目统计专项排除目录 */}
              <label style={{ fontWeight: "600", color: "var(--text-error)", marginTop: "4px" }}>🛑 项目专项排除目录（支持精准阻断子目录）：</label>
              <div style={{ 
                display: "flex", flexWrap: "wrap", gap: "6px", padding: "6px", 
                background: "var(--background-secondary)", border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-s)", minHeight: "32px", alignItems: "center"
              }}>
                {projExclFolders.length === 0 ? (
                  <span style={{ color: "var(--text-faint)", fontSize: "0.9em" }}>未指定精准排除（即使是已包含目录的子目录也会照常统计）</span>
                ) : (
                  projExclFolders.map((folder) => (
                    <span key={folder} style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      background: "var(--background-primary)", border: "1px solid var(--border-color)",
                      padding: "2px 8px", borderRadius: "12px", fontSize: "0.9em", color: "var(--text-normal)"
                    }}>
                      <span>{folder}</span>
                      <span onClick={() => setProjExclFolders(projExclFolders.filter(f => f !== folder))} style={{ cursor: "pointer", color: "var(--text-error)", fontWeight: "bold", marginLeft: "2px" }}>×</span>
                    </span>
                  ))
                )}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <input 
                  type="text" placeholder="🔍 过滤排除子目录..." value={projExclSearchKey}
                  onChange={(e) => setProjExclSearchKey(e.target.value)}
                  style={{ flex: 1, padding: "4px 8px", background: "var(--background-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-s)", color: "var(--text-normal)", outline: "none" }}
                />
                <select value="" onChange={(e) => { if(e.target.value && !projExclFolders.includes(e.target.value)) { setProjExclFolders([...projExclFolders, e.target.value]); setProjExclSearchKey(""); } }} style={{ padding: "4px 8px", background: "var(--background-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-s)", color: "var(--text-muted)", cursor: "pointer", maxWidth: "140px" }}>
                  <option value="" disabled>选择添加...</option>
                  {filteredFolderOptions(projExclSearchKey, projExclFolders).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            {/* 5. 文件总数包含范围 */}
            <div>
              <span style={{ fontWeight: "500", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>🧮 计入「文件总数」的特殊类型：</span>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Checkbox label="Canvas 白板" checked={includeCanvas} onChange={setIncludeCanvas} />
                <Checkbox label="Excalidraw" checked={includeExcali} onChange={setIncludeExcali} />
                <Checkbox label="🖼️ 图片媒体" checked={includeImages} onChange={setIncludeImages} />
                <Checkbox label="📎 其它杂项" checked={includeOther} onChange={setIncludeOther} />
              </div>
            </div>

            {/* 6. 独立面板/模块的显隐控制 */}
            <div>
              <span style={{ fontWeight: "500", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>🧩 独立子面板显示控制：</span>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Checkbox label="📄 显示文件细分明细面板" checked={showDetailsPanel} onChange={setShowDetailsPanel} />
                <Checkbox label="📊 显示项目分布看板面板" checked={showProjectPanel} onChange={setShowProjectPanel} />
                <Checkbox label="📋 显示任务分布看板面板" checked={showTaskPanel} onChange={setShowTaskPanel} />
                <Checkbox label="🕒 显示底部脚注历史时间" checked={showFooterPanel} onChange={setShowFooterPanel} />
              </div>
            </div>

            {/* 7. 动态配置快照导出 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border-color)" }}>
              <span style={{ color: "var(--text-faint)", fontSize: "0.9em" }}>配置仅当前页生效，固化需点击复制并更新顶端静态 CONFIG</span>
              <button
                onClick={handleCopyConfig}
                style={{
                  background: copied ? "var(--text-success)" : "var(--interactive-accent)",
                  color: "var(--text-on-accent)", border: "none", padding: "5px 12px",
                  borderRadius: "var(--radius-s)", cursor: "pointer", fontWeight: "500"
                }}
              >
                {copied ? "✓ 已复制含注释代码" : "📋 复制固化配置代码"}
              </button>
            </div>
          </div>
        )}

        {/* 核心指标网格 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "20px" }}>
          <StatBox value={daysUsed} label="使用天数" unit="天" color="var(--text-success)" />
          <StatBox value={fileStats.total} label="文件总数" unit="个" color="var(--text-accent)" />
          <StatBox value={totalTagsCount} label="标签数量" unit="个" color="var(--text-warning)" />
          <StatBox value={projectStats.total} label="项目总数" unit="个" color="var(--text-purple || #9b5de5)" />
          <StatBox value={taskStats.total} label="任务总数" unit="个" color="var(--text-error)" />
        </div>

        {/* 文件类型明细细分面板 */}
        {shouldRenderDetails && (
          <div style={{ backgroundColor: "var(--background-primary)", border: "1px solid var(--border-color)", padding: "10px", borderRadius: "var(--radius-m)", marginBottom: "16px", fontSize: "0.85em", color: "var(--text-muted)" }}>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
              <span>📝 MD: <b>{fileStats.md}</b></span>
              <span>🗺️ Canvas: <b>{fileStats.canvas}</b></span>
              <span>🎨 Excalidraw: <b>{fileStats.excalidraw}</b></span>
              <span>🖼️ 图片: <b>{fileStats.images}</b></span>
              <span>📎 其他: <b>{fileStats.other}</b></span>
            </div>
          </div>
        )}

        {/* 项目分布看板面板 */}
        {showProjectPanel && projectStats.total > 0 && (
          <div style={{ backgroundColor: "var(--background-primary)", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "var(--radius-m)", marginBottom: "16px" }}>
            <div style={{ fontSize: "0.85em", fontWeight: "600", color: "var(--text-muted)", marginBottom: "10px", textAlign: "center" }}>📊 项目状态分布看板</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              {Object.keys(projectStats.statusMap).map(statusKey => {
                const colorTheme = getProjectStatusColor(statusKey);
                return (
                  <span 
                    key={statusKey} 
                    style={{ 
                      backgroundColor: colorTheme.bg, 
                      color: colorTheme.text, 
                      border: "1px solid transparent", 
                      padding: "6px 14px", 
                      borderRadius: "var(--radius-s)", // 🔄 已修改：此处改为微圆角，与顶层卡片完美呼应
                      fontSize: "0.85em", 
                      fontWeight: "500", 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "4px" 
                    }}
                  >
                    📁 {statusKey}: <b>{projectStats.statusMap[statusKey]}</b>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* 任务分布看板面板 */}
        {showTaskPanel && (
          <div style={{ backgroundColor: "var(--background-primary)", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "var(--radius-m)" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              <TaskBadge icon="📋" label="待办" value={taskStats.todo} bgColor="var(--background-modifier-accent)" textColor="var(--text-on-accent)" />
              <TaskBadge icon="🔄" label="进行中" value={taskStats.inProgress} bgColor="rgba(var(--mono-rgb-100), 0.08)" textColor="var(--text-accent)" isBorder={true} />
              <TaskBadge icon="✅" label="已完成" value={taskStats.completed} bgColor="rgba(var(--color-green-rgb), 0.15)" textColor="var(--text-success)" />
              <TaskBadge icon="❌" label="已取消" value={taskStats.cancelled} bgColor="rgba(var(--mono-rgb-100), 0.05)" textColor="var(--text-muted)" />
            </div>
          </div>
        )}

        {/* 底部脚注历史时间 */}
        {showFooterPanel && (
          <div style={{ textAlign: "center", fontSize: "0.8em", color: "var(--text-muted)", marginTop: "16px" }}>
            最早创建文档：{earliestDate && earliestDate.isValid ? earliestDate.toFormat("yyyy年MM月dd日") : "无数据"}
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================
// 局部细粒度 UI 原子组件
// ========================================
function IconButton({ children, onClick, active, title }) {
  return (
    <button
      onClick={onClick} title={title}
      style={{
        background: active ? "var(--background-primary)" : "transparent",
        border: active ? "1px solid var(--interactive-accent)" : "1px solid var(--border-color)",
        borderRadius: "var(--radius-s)", color: active ? "var(--text-accent)" : "var(--text-muted)",
        padding: "4px 10px", fontSize: "0.75em", cursor: "pointer", display: "inline-flex",
        alignItems: "center", gap: "4px", transition: "all 0.15s ease", outline: "none"
      }}
      onMouseEnter={(e) => {
        if(!active) {
          e.currentTarget.style.borderColor = "var(--interactive-accent)";
          e.currentTarget.style.color = "var(--text-accent)";
        }
      }}
      onMouseLeave={(e) => {
        if(!active) {
          e.currentTarget.style.borderColor = "var(--border-color)";
          e.currentTarget.style.color = "var(--text-muted)";
        }
      }}
    >
      {children}
    </button>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", userSelect: "none", textAlign: "left" }}>
      <input
        type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: "var(--interactive-accent)", cursor: "pointer" }}
      />
      <span style={{ color: checked ? "var(--text-normal)" : "var(--text-faint)", textAlign: "left" }}>{label}</span>
    </label>
  );
}

function StatBox({ value, label, unit, color }) {
  return (
    <div style={{ backgroundColor: "var(--background-primary)", border: "1px solid var(--border-color)", padding: "14px 4px", borderRadius: "var(--radius-m)", textAlign: "center" }}>
      <div style={{ fontSize: "0.76em", color: "var(--text-muted)", marginBottom: "6px", whiteSpace: "nowrap" }}>{label}</div>
      <div style={{ fontSize: "1.45em", fontWeight: "700", color: color || "var(--text-normal)", lineHeight: "1.2" }}>
        {value}
        <span style={{ fontSize: "0.5em", marginLeft: "1px", fontWeight: "400", color: "var(--text-muted)" }}> {unit}</span>
      </div>
    </div>
  );
}

function TaskBadge({ icon, label, value, bgColor, textColor, isBorder }) {
  return (
    <span style={{ backgroundColor: bgColor, color: textColor, border: isBorder ? "1px solid var(--border-color)" : "1px solid transparent", padding: "6px 14px", borderRadius: "var(--radius-s)", fontSize: "0.85em", fontWeight: "500", display: "inline-flex", alignItems: "center", gap: "4px" }}>
      {/* 🔄 已修改：此处 borderRadius 由 var(--radius-rounded) 改为了 var(--radius-s) */}
      {icon} {label}: {value}
    </span>
  );
}
