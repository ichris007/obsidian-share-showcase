
// ==========================================================================
// Datacore 视图：Obsidian Vault 统计（晶核流光 - 9套全自适应深浅色磨砂版）
// ==========================================================================

// ==========================================
// 1. 初始化及手动静态配置区域
// ==========================================
const CONFIG = {
  // 基础显示与控制配置
  showTitle: true,              // 是否默认显示标题
  titleText: "Vault 系统数据概览", // 自定义卡片主标题名称
  currentTheme: "coreflow",     // 默认主题ID
  excludedFolders: ["Templates",".trash",".obsidian",".datacore"], // 全局默认排除目录

  // 文件总数统计包含的范围
  includeFilesForTotal: {
    canvas: false,       // 是否包含 .canvas 文件
    excalidraw: false,   // 是否包含 .excalidraw 文件
    images: false,   // 是否包含图片文件
    other: false         // 是否包含其他类型文件
  },

  // 项目统计专项路径配置（支持父子目录精确隔离）
  projectIncludedFolders: ["01Projects"],   // 项目统计包含目录（为空代表全库扫描）
  projectExcludedFolders: [],   // 项目统计排除目录（可精准排除已包含目录的子目录）

  // 独立子面板显示控制
  showDetailsPanel: true,       // 是否显示文件类型明细细分面板
  showProjectPanel: true,       // 是否显示项目分布看板面板
  showTaskPanel: true,          // 是否显示任务分布看板面板
  showFooterPanel: true         // 是否显示底部脚注历史时间
};

// ==========================================
// 2. 核心 9 套双向自适应主题库 (Theme Registry)
// ==========================================
const THEMES = {
  cosmic: {
    name: "🪐 星海秘境",
    gradient: "linear-gradient(135deg, rgba(8, 12, 34, 0.98) 0%, rgba(41, 36, 88, 0.95) 50%, rgba(182, 122, 255, 0.9) 100%)",
    shadowRGB: "182, 122, 255",
    boxBg: "rgba(196, 173, 255, 0.15)"
  },
  coreflow: {
    name: "🌟 晶核流光",
    gradient: "linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)",
    shadowRGB: "118, 75, 162",
    boxBg: "rgba(255, 255, 255, 0.15)"
  },
  aurora: {
    name: "🌲 翡翠极光",
    gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(6, 95, 70, 0.95) 100%)",
    shadowRGB: "6, 95, 70",
    boxBg: "rgba(255, 255, 255, 0.12)"
  },
  sunset: {
    name: "🌆 暮色重燃",
    gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(147, 51, 234, 0.95) 100%)",
    shadowRGB: "147, 51, 234",
    boxBg: "rgba(255, 255, 255, 0.14)"
  },
  cyberneon: {
    name: "🦄 幻境霓虹",
    gradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.95) 0%, rgba(99, 102, 241, 0.95) 100%)",
    shadowRGB: "99, 102, 241",
    boxBg: "rgba(255, 255, 255, 0.15)"
  },
  ocean: {
    name: "🌊 晴空破浪",
    gradient: "linear-gradient(135deg, rgba(45, 212, 191, 0.95) 0%, rgba(29, 78, 216, 0.95) 100%)",
    shadowRGB: "29, 78, 216",
    boxBg: "rgba(255, 255, 255, 0.16)"
  },
  earthy: {
    name: "🪵 枯木逢春",
    gradient: "linear-gradient(135deg, rgba(212, 163, 115, 0.95) 0%, rgba(82, 91, 65, 0.95) 100%)",
    shadowRGB: "82, 91, 65",
    boxBg: "rgba(255, 255, 255, 0.13)"
  },
  ink: {
    name: "🎨 极简水墨",
    gradient: "linear-gradient(135deg, rgba(107, 114, 128, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)",
    shadowRGB: "55, 65, 81",
    boxBg: "rgba(255, 255, 255, 0.1)"
  },
  minimalist: {
    name: "🔲 极致纯黑",
    gradient: "linear-gradient(135deg, rgba(55, 65, 81, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%)",
    shadowRGB: "0, 0, 0",
    boxBg: "rgba(255, 255, 255, 0.08)"
  }
};

// ==========================================
// 3. 主入口逻辑
// ==========================================
return function View() {
  // ----- 检测当前 Obsidian 到底是深色还是浅色模式 -----
  const isObsidianDark = document.body.classList.contains("theme-dark");

  // ----- 核心状态驱动 -----
  const [activeThemeKey, setActiveThemeKey] = dc.useState(CONFIG.currentTheme || "cosmic");
  const [showTitle, setShowTitle] = dc.useState(CONFIG.showTitle);
  const [titleText, setTitleText] = dc.useState(CONFIG.titleText || "Vault 运行数据概览");
  const [showSettings, setShowSettings] = dc.useState(false); 
  const [excludedFolders, setExcludedFolders] = dc.useState(CONFIG.excludedFolders);
  
  // 文件包含范围
  const [includeCanvas, setIncludeCanvas] = dc.useState(CONFIG.includeFilesForTotal.canvas);
  const [includeExcali, setIncludeExcali] = dc.useState(CONFIG.includeFilesForTotal.excalidraw);
  const [includeImages, setIncludeImages] = dc.useState(CONFIG.includeFilesForTotal.images);
  const [includeOther, setIncludeOther] = dc.useState(CONFIG.includeFilesForTotal.other);

  // 项目统计专项路径状态
  const [projInclFolders, setProjInclFolders] = dc.useState(CONFIG.projectIncludedFolders);
  const [projExclFolders, setProjExclFolders] = dc.useState(CONFIG.projectExcludedFolders);

  // 子面板显隐控制状态
  const [showDetailsPanel, setShowDetailsPanel] = dc.useState(CONFIG.showDetailsPanel);
  const [showProjectPanel, setShowProjectPanel] = dc.useState(CONFIG.showProjectPanel);
  const [showTaskPanel, setShowTaskPanel] = dc.useState(CONFIG.showTaskPanel);
  const [showFooterPanel, setShowFooterPanel] = dc.useState(CONFIG.showFooterPanel);

  // 搜索过滤关键字状态
  const [folderSearchKey, setFolderSearchKey] = dc.useState("");
  const [projInclSearchKey, setProjInclSearchKey] = dc.useState("");
  const [projExclSearchKey, setProjExclSearchKey] = dc.useState("");
  const [copied, setCopied] = dc.useState(false);

  // 获取当前激活的主题参数
  const currentTheme = THEMES[activeThemeKey] || THEMES.cosmic;

  // ----- 基于深浅色模式动态修正文本色彩和遮罩，防止浅色模式吃色 -----
  const textColor = "white"; // 保持渐变底色的高对比白字输出
  const labelOpacity = isObsidianDark ? "0.85" : "0.9";
  const subPanelBg = isObsidianDark ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.15)";

  // ----- 基于 Datacore 响应式核心拉取数据 -----
  const allPages = dc.useQuery("@page");
  const allRawFiles = app.vault.getAllLoadedFiles();

  // ----- 提取当前库内所有真实的文件夹路径 -----
  const allVaultFolders = dc.useMemo(() => {
    const folders = new Set();
    allRawFiles.forEach(f => {
      if (f.children && f.path !== "/") {
        folders.add(f.path);
      }
    });
    return Array.from(folders).sort();
  }, [allRawFiles]);

  // ----- 辅助路径匹配算法 -----
  const isPathInFolderList = (targetPath, folderList) => {
    return folderList.some(folder => {
      return targetPath === folder || targetPath.startsWith(folder + "/");
    });
  };

  // ----- 项目状态颜色映射 -----
  const getProjectStatusColor = (status) => {
    const s = String(status).trim().toLowerCase();
    
    if (["进行中", "正在进行", "in progress", "active", "doing"].includes(s)) {
      return { bg: "#2563eb", text: "white" }; 
    }
    if (["已完成", "完成", "completed", "done", "finished"].includes(s)) {
      return { bg: "#16a34a", text: "white" }; 
    }
    if (["未分类", "未知", "unknown", "none"].includes(s)) {
      return { bg: "rgba(255, 255, 255, 0.25)", text: "white" }; 
    }
    if (["延期", "滞后", "delayed", "overdue"].includes(s)) {
      return { bg: "#dc2626", text: "white" }; 
    }
    if (["暂停", "挂起", "on hold", "paused", "blocked"].includes(s)) {
      return { bg: "#d97706", text: "white" }; 
    }
    if (["准备", "计划", "idea", "planning", "todo", "待办"].includes(s)) {
      return { bg: "#9333ea", text: "white" }; 
    }

    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return {
      bg: `hsla(${h}, 70%, 40%, 1)`,
      text: "white"
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

  // ----- 过滤下拉数据源 -----
  const filteredFolderOptions = (searchKey, currentList) => {
    return allVaultFolders.filter(f => 
      !currentList.includes(f) && 
      f.toLowerCase().includes(searchKey.toLowerCase())
    ).slice(0, 15);
  };

  // ----- 复制完整配置字符串 -----
  const handleCopyConfig = () => {
    const currentConfigStr = `const CONFIG = {
  // 基础显示与控制配置
  showTitle: ${showTitle},              // 是否默认显示标题
  titleText: "${titleText}", // 自定义卡片主标题名称
  currentTheme: "${activeThemeKey}",     // 默认主题ID
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
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "8px 0", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* 动态主题包裹卡片主体 */}
      <div
        style={{
          background: currentTheme.gradient,
          color: textColor,
          padding: "28px",
          borderRadius: "16px",
          boxShadow: `0 12px 32px rgba(${currentTheme.shadowRGB}, ${isObsidianDark ? '0.35' : '0.2'}), 0 0 0 1px rgba(255,255,255,0.15) inset`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        {/* 顶部控制栏 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showTitle ? "24px" : "16px" }}>
          {showTitle ? (
            <h4 style={{ margin: 0, fontSize: "1.2em", fontWeight: "600", letterSpacing: "-0.5px", color: textColor }}>
              📊 {titleText}
            </h4>
          ) : <div />}
          
          <div>
            <IconButton onClick={() => setShowSettings(!showSettings)} active={showSettings}>
              ⚙️ {showSettings ? "关闭设置" : "统计设置"}
            </IconButton>
          </div>
        </div>

        {/* ==================== 🛠️ 交互设置面板 ==================== */}
        {showSettings && (
          <div
            style={{
              backgroundColor: isObsidianDark ? "rgba(0, 0, 0, 0.35)" : "rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(12px)",
              borderRadius: "12px",
              padding: "18px",
              marginBottom: "24px",
              fontSize: "0.85em",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              textAlign: "left"
            }}
          >
            <div style={{ fontWeight: "600", color: "white", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "6px", display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
              <span>🛠️ Vault 动态统计配置中心</span>
			  <span style={{ fontSize: "0.95em", fontWeight: "normal" }}>
			      | 出品：
			    <a 
			      href="https://Lifein.vip" 
			      target="_blank" 
			      rel="noopener" 
				style={{ color: "#ffd5ff", textDecoration: "underline", cursor: "pointer", transition: "opacity 0.2s" }}
			      onMouseOver={(e) => e.target.style.opacity = "0.8"}
			      onMouseOut={(e) => e.target.style.opacity = "1"}
                >			
			      Lifein.vip
			    </a>
			  </span>
            </div>

            {/* 核心功能：9套全主题自适应切换 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontWeight: "500", color: "rgba(255,255,255,0.85)" }}>🎨 看板视觉风格主题：</span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {Object.keys(THEMES).map(tKey => {
                  const isSelected = activeThemeKey === tKey;
                  return (
                    <button
                      key={tKey}
                      onClick={() => setActiveThemeKey(tKey)}
                      style={{
                        padding: "5px 12px",
                        background: isSelected ? "white" : "rgba(255,255,255,0.12)",
                        color: isSelected ? "#1f2937" : "white",
                        border: isSelected ? "1px solid white" : "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontWeight: isSelected ? "700" : "400",
                        fontSize: "0.95em",
                        transition: "all 0.2s"
                      }}
                    >
                      {THEMES[tKey].name}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* 1. 基础卡片标题控制与自定义名称 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>👁️ 主卡片标题:</span>
                <div style={{ display: "flex", gap: "4px", background: "rgba(0,0,0,0.2)", borderRadius: "6px", padding: "2px" }}>
                  <button onClick={() => setShowTitle(true)} style={{ padding: "3px 10px", border: "none", borderRadius: "4px", background: showTitle ? "rgba(255,255,255,0.25)" : "transparent", color: "white", fontSize: "0.9em", cursor: "pointer" }}>显示</button>
                  <button onClick={() => setShowTitle(false)} style={{ padding: "3px 10px", border: "none", borderRadius: "4px", background: !showTitle ? "rgba(255,255,255,0.25)" : "transparent", color: "white", fontSize: "0.9em", cursor: "pointer" }}>隐藏</button>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>✏️ 标题自定义名称:</span>
                <input 
                  type="text" value={titleText} onChange={(e) => setTitleText(e.target.value)} placeholder="请输入要展示的看板标题..."
                  style={{ flex: 1, padding: "5px 8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "white", outline: "none" }}
                />
              </div>
            </div>

            {/* 2. 全局基础排除目录 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>📁 全局基础排除目录：</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "8px", background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", minHeight: "36px", alignItems: "center" }}>
                {excludedFolders.length === 0 ? (
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9em" }}>未排除任何目录</span>
                ) : (
                  excludedFolders.map((folder) => (
                    <span key={folder} style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "12px", fontSize: "0.9em", color: "white" }}>
                      <span>{folder}</span>
                      <span onClick={() => setExcludedFolders(excludedFolders.filter(f => f !== folder))} style={{ cursor: "pointer", color: "#ff6b6b", fontWeight: "bold", marginLeft: "2px" }}>×</span>
                    </span>
                  ))
                )}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <input type="text" placeholder="🔍 输入关键字过滤本地目录..." value={folderSearchKey} onChange={(e) => setFolderSearchKey(e.target.value)} style={{ flex: 1, padding: "5px 8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "white", outline: "none" }} />
                <select value="" onChange={(e) => { if(e.target.value && !excludedFolders.includes(e.target.value)) { setExcludedFolders([...excludedFolders, e.target.value]); setFolderSearchKey(""); } }} style={{ padding: "5px 8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "white", cursor: "pointer", maxWidth: "140px", outline: "none" }}>
                  <option value="" style={{color: "black"}} disabled>选择添加...</option>
                  {filteredFolderOptions(folderSearchKey, excludedFolders).map(opt => <option key={opt} style={{color: "black"}} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            {/* 3. 项目统计专项包含与排除目录 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "10px", background: "rgba(0,0,0,0.1)", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "6px" }}>
              <label style={{ fontWeight: "600", color: "white" }}>🎯 项目专项包含目录（留空代表不限）：</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "6px", background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", minHeight: "32px", alignItems: "center" }}>
                {projInclFolders.length === 0 ? <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9em" }}>未指定特定目录</span> : projInclFolders.map(folder => (
                  <span key={folder} style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "12px", fontSize: "0.9em", color: "white" }}>{folder}<span onClick={() => setProjInclFolders(projInclFolders.filter(f => f !== folder))} style={{ cursor: "pointer", color: "#ff6b6b", fontWeight: "bold" }}>×</span></span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <input type="text" placeholder="🔍 过滤包含目录..." value={projInclSearchKey} onChange={(e) => setProjInclSearchKey(e.target.value)} style={{ flex: 1, padding: "4px 8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "white", outline: "none" }} />
                <select value="" onChange={(e) => { if(e.target.value && !projInclFolders.includes(e.target.value)) { setProjInclFolders([...projInclFolders, e.target.value]); setProjInclSearchKey(""); } }} style={{ padding: "4px 8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "white", cursor: "pointer", maxWidth: "140px", outline: "none" }}>
                  <option value="" style={{color: "black"}} disabled>选择添加...</option>
                  {filteredFolderOptions(projInclSearchKey, projInclFolders).map(opt => <option key={opt} style={{color: "black"}} value={opt}>{opt}</option>)}
                </select>
              </div>

              <label style={{ fontWeight: "600", color: "#ff8787", marginTop: "4px" }}>🛑 项目专项排除目录（精准隔离子目录）：</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "6px", background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", minHeight: "32px", alignItems: "center" }}>
                {projExclFolders.length === 0 ? <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9em" }}>未指定精准排除</span> : projExclFolders.map(folder => (
                  <span key={folder} style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "12px", fontSize: "0.9em", color: "white" }}>{folder}<span onClick={() => setProjExclFolders(projExclFolders.filter(f => f !== folder))} style={{ cursor: "pointer", color: "#ff6b6b", fontWeight: "bold" }}>×</span></span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <input type="text" placeholder="🔍 过滤排除子目录..." value={projExclSearchKey} onChange={(e) => setProjExclSearchKey(e.target.value)} style={{ flex: 1, padding: "4px 8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "white", outline: "none" }} />
                <select value="" onChange={(e) => { if(e.target.value && !projExclFolders.includes(e.target.value)) { setProjExclFolders([...projExclFolders, e.target.value]); setProjExclSearchKey(""); } }} style={{ padding: "4px 8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "white", cursor: "pointer", maxWidth: "140px", outline: "none" }}>
                  <option value="" style={{color: "black"}} disabled>选择添加...</option>
                  {filteredFolderOptions(projExclSearchKey, projExclFolders).map(opt => <option key={opt} style={{color: "black"}} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            {/* 4. 文件总数包含范围 */}
            <div>
              <span style={{ fontWeight: "500", color: "rgba(255,255,255,0.85)", display: "block", marginBottom: "6px" }}>🧮 计入「文件总数」的特殊类型：</span>
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <Checkbox label="Canvas 白板" checked={includeCanvas} onChange={setIncludeCanvas} />
                <Checkbox label="Excalidraw" checked={includeExcali} onChange={setIncludeExcali} />
                <Checkbox label="🖼️ 图片媒体" checked={includeImages} onChange={setIncludeImages} />
                <Checkbox label="📎 其它杂项" checked={includeOther} onChange={setIncludeOther} />
              </div>
            </div>

            {/* 5. 独立面板/模块的显隐控制 */}
            <div>
              <span style={{ fontWeight: "500", color: "rgba(255,255,255,0.85)", display: "block", marginBottom: "6px" }}>🧩 独立子面板显示控制：</span>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Checkbox label="📄 显示文件类型明细" checked={showDetailsPanel} onChange={setShowDetailsPanel} />
                <Checkbox label="📊 显示项目分布看板" checked={showProjectPanel} onChange={setShowProjectPanel} />
                <Checkbox label="📋 显示任务分布看板" checked={showTaskPanel} onChange={setShowTaskPanel} />
                <Checkbox label="🕒 显示底部历史时间" checked={showFooterPanel} onChange={setShowFooterPanel} />
              </div>
            </div>

            {/* 6. 动态配置快照导出 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9em" }}>配置随心选，固化需点击右侧按钮复制并替换代码顶端静态 CONFIG</span>
              <button
                onClick={handleCopyConfig}
                style={{
                  background: copied ? "#22c55e" : "rgba(255, 255, 255, 0.2)",
                  color: "white", border: "1px solid rgba(255,255,255,0.3)", padding: "5px 12px",
                  borderRadius: "6px", cursor: "pointer", fontWeight: "500"
                }}
              >
                {copied ? "✓ 已复制含主题代码" : "📋 复制固化配置代码"}
              </button>
            </div>
          </div>
        )}

        {/* 核心指标网格结构 (融合毛玻璃配置与深浅自动层) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <StatBox value={daysUsed} label="使用天数" unit="天" boxBg={currentTheme.boxBg} isDark={isObsidianDark} opacity={labelOpacity} />
          <StatBox value={fileStats.total} label="文件总数" unit="个" boxBg={currentTheme.boxBg} isDark={isObsidianDark} opacity={labelOpacity} />
          <StatBox value={totalTagsCount} label="标签数量" unit="个" boxBg={currentTheme.boxBg} isDark={isObsidianDark} opacity={labelOpacity} />
          <StatBox value={projectStats.total} label="项目总数" unit="个" boxBg={currentTheme.boxBg} isDark={isObsidianDark} opacity={labelOpacity} />
          <StatBox value={taskStats.total} label="任务总数" unit="个" boxBg={currentTheme.boxBg} isDark={isObsidianDark} opacity={labelOpacity} />
        </div>

        {/* 文件类型明细细分面板 */}
        {shouldRenderDetails && (
          <div style={{ background: subPanelBg, padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.85em", backdropFilter: "blur(4px)" }}>
            <div style={{ textAlign: "center", marginBottom: "8px", opacity: labelOpacity }}>文件类型明细</div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
              <span>📝 MD: <b>{fileStats.md}</b></span>
              <span>🗺️ Canvas: <b>{fileStats.canvas}</b></span>
              <span>🎨 Excalidraw: <b>{fileStats.excalidraw}</b></span>
              <span>🖼️ 图片: <b>{fileStats.images}</b></span>
              <span>📎 其他: <b>{fileStats.other}</b></span>
            </div>
          </div>
        )}

        {/* 项目分类看板面板 */}
        {showProjectPanel && projectStats.total > 0 && (
          <div style={{ background: subPanelBg, padding: "18px", borderRadius: "12px", marginBottom: "16px", backdropFilter: "blur(4px)" }}>
            <div style={{ fontSize: "0.9em", opacity: labelOpacity, marginBottom: "12px", textAlign: "center" }}>📊 项目状态分布</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              {Object.keys(projectStats.statusMap).map(statusKey => {
                const colorTheme = getProjectStatusColor(statusKey);
                return (
                  <span 
                    key={statusKey} 
                    style={{ 
                      backgroundColor: colorTheme.bg, color: colorTheme.text, padding: "5px 14px", 
                      borderRadius: "20px", fontSize: "0.85em", fontWeight: "600", 
                      boxShadow: "0 3px 8px rgba(0,0,0,0.15)", display: "inline-flex", alignItems: "center", gap: "4px" 
                    }}
                  >
                    📁 {statusKey}: {projectStats.statusMap[statusKey]}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* 任务分布看板面板 */}
        {showTaskPanel && (
          <div style={{ background: subPanelBg, padding: "18px", borderRadius: "12px", backdropFilter: "blur(4px)" }}>
            <div style={{ fontSize: "0.9em", opacity: labelOpacity, marginBottom: "12px", textAlign: "center" }}>任务分布</div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              <TaskBadge icon="📋" label="待办" value={taskStats.todo} color="#f59e0b" />
              <TaskBadge icon="🔄" label="进行中" value={taskStats.inProgress} color="#2563eb" />
              <TaskBadge icon="✅" label="已完成" value={taskStats.completed} color="#16a34a" />
              <TaskBadge icon="❌" label="已取消" value={taskStats.cancelled} color="#71717a" />
            </div>
          </div>
        )}

        {/* 底部脚注历史时间 */}
        {showFooterPanel && (
          <div style={{ textAlign: "center", fontSize: "0.85em", opacity: labelOpacity, marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
            最早创建文档：{earliestDate && earliestDate.isValid ? earliestDate.toFormat("yyyy年MM月dd日") : "无数据"}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 局部细粒度 UI 原子组件
// ==========================================

function IconButton({ children, onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.15)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "6px", color: "white",
        padding: "4px 12px", fontSize: "0.8em", cursor: "pointer", display: "inline-flex",
        alignItems: "center", gap: "4px", transition: "all 0.15s ease", outline: "none"
      }}
    >
      {children}
    </button>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", userSelect: "none" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ cursor: "pointer" }} />
      <span style={{ color: checked ? "white" : "rgba(255,255,255,0.55)" }}>{label}</span>
    </label>
  );
}

// 基础原子小组件：数据格 (利用浅色增益防暗沉)
function StatBox({ value, label, unit, boxBg, isDark, opacity }) {
  const finalBoxBg = isDark ? boxBg : `calc(${boxBg} + rgba(255, 255, 255, 0.05))`;
  return (
    <div
      style={{
        background: finalBoxBg,
        padding: "18px 4px",
        borderRadius: "10px",
        textAlign: "center",
        backdropFilter: "blur(6px)",
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "all 0.3s ease"
      }}
    >
      <div style={{ fontSize: "0.8em", opacity: opacity, marginBottom: "8px", fontWeight: "500", whiteSpace: "nowrap" }}>
        {label}
      </div>
      <div style={{ fontSize: "1.8em", fontWeight: "bold", color: "white", lineHeight: "1.2" }}>
        {value}
        <span style={{ fontSize: "0.45em", marginLeft: "2px", fontWeight: "normal", color: "rgba(255,255,255,0.75)" }}>
          {" "}{unit}
        </span>
      </div>
    </div>
  );
}

function TaskBadge({ icon, label, value, color }) {
  return (
    <span
      style={{
        background: color,
        color: "white",
        padding: "6px 14px",
        borderRadius: "20px",
        fontSize: "0.85em",
        fontWeight: "600",
        boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px"
      }}
    >
      {icon} {label}: {value}
    </span>
  );
}

