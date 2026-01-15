
/* ==================================================================
    ACTIVITIES (React + Datacore)
    - Author: @furbas16e8 (https://github.com/furbas16e8) 
		      @ichris007 (https://github.com/ichris007)
    - Heatmaps of notes by category.
    - Trend Chart (TrendChart).
    - Ref.: activities.css
 ================================================================== */

return function View() {
    // --- CONFIGURATION ---
    const CONFIG = {
        TITLE: "活动看板",
        MONTHS_BACK: 6,
        WEEK_START_MONDAY: true,
        CHART_HEIGHT: 30, // px
        DATE_FIELDS: ["date", "Data", "Início", "Date", "created date", "created_date"], // Keep original keys for compatibility
        LEVEL_THRESHOLDS: [0, 1, 2, 3, 4, 5],
        CATEGORIES: [
            { title: "成长", folder: "04Growth" },
            { title: "写作", folder: "Longform" },
            { title: "日记", folder: "00Journal" }
        ],
        CSS_VARS: {
            prefix: "--ativ-",
            keys: ["cell-size", "cell-gap", "radius", "padding-container"],
            defaults: { "cell-size": 14, "cell-gap": 3, "radius": 2 }
        },
        DEBOUNCE_MS: 500,
        GRADIENT: { bottom: "0%", top: "100%", opacityBottom: 0.8, opacityTop: 0.9 }
    };

    // --- HOOKS ---
    function useStyleConfig() {
        const [styles, setStyles] = dc.useState({ cell: 14, gap: 3, rad: 2 });
        
        dc.useEffect(() => {
            const getNum = (prop, fallback) => {
                const val = getComputedStyle(document.body).getPropertyValue(CONFIG.CSS_VARS.prefix + prop);
                const parsed = parseFloat(val);
                return Number.isFinite(parsed) ? parsed : fallback;
            };
            const update = () => {
                setStyles({
                    cell: getNum("cell-size", CONFIG.CSS_VARS.defaults["cell-size"]),
                    gap: getNum("cell-gap", CONFIG.CSS_VARS.defaults["cell-gap"]),
                    rad: getNum("radius", CONFIG.CSS_VARS.defaults["radius"])
                });
            };
            update();
            const id = setInterval(update, 2000); 
            return () => clearInterval(id);
        }, []);
        return styles;
    }

    function useHeatmapData(folder) {
        const pages = dc.useQuery(`@page and path("${folder}")`, { debounce: CONFIG.DEBOUNCE_MS });
        const today = dc.useMemo(() => dc.coerce.date(new Date().toISOString()).startOf("day"), []);
        const startDate = dc.useMemo(() => today.minus({ months: CONFIG.MONTHS_BACK }).startOf("day"), [today]);

        const { dailyMap, dailyList } = dc.useMemo(() => {
            const map = new Map();
            for (const page of pages) {
                let date = null;
                for (const field of CONFIG.DATE_FIELDS) {
                    const val = page.value(field);
                    if (val != null) {
                        // 将内容转为字符串并去掉多余空格
                        let dateStr = String(val).trim();
                        
                        // 如果长度超过10位（比如包含了 19:09:39），就只取前10位（2026-01-14）
                        if (dateStr.length > 10) {
                            dateStr = dateStr.substring(0, 10);
                        }
                        
                        // 让系统尝试解析这个日期
                        date = dc.coerce.date(dateStr);

                        // 检查解析是否成功
                        if (date && date.isValid) { 
                            date = date.startOf("day"); 
                            break; 
                        }
                    }
                }
                if (!date || !date.isValid || date < startDate || date > today) continue;

                const iso = date.toISODate();
                if (!map.has(iso)) map.set(iso, { count: 0, files: [] });
                const entry = map.get(iso);
                entry.count++;
                entry.files.push({ name: page.$name, path: page.$path });
            }
            const list = [];
            let cursor = startDate;
            while(cursor <= today) { list.push(cursor); cursor = cursor.plus({ days: 1 }); }
            return { dailyMap: map, dailyList: list };
        }, [pages, startDate, today]);

        return { dailyMap, dailyList, startDate, today };
    }

    // --- SERVICE ---
    const StatsService = {
        calculate(dailyMap, dailyList) {
            const values = [];
            const dayFreq = [0, 0, 0, 0, 0, 0, 0, 0];
            let totalNotes = 0;
            for (const day of dailyList) {
                const count = dailyMap.get(day.toISODate())?.count ?? 0;
                values.push(count);
                if (count > 0) {
                    totalNotes += count;
                    if (day.weekday >= 1 && day.weekday <= 7) dayFreq[day.weekday] += count;
                }
            }
            const N = values.length;
            if (N === 0) return { mean: "0", sigma: "0", mode: "—", kurt: "0", gap: "0" };

            const mean = totalNotes / N;
            let sumSq = 0; let sum4th = 0;
            for (const v of values) { const diff = v - mean; sumSq += Math.pow(diff, 2); sum4th += Math.pow(diff, 4); }
            const variance = sumSq / N;
            const sigma = Math.sqrt(variance);
            const kurtosis = variance > 0 ? (sum4th / N) / Math.pow(variance, 2) : 0;

            let maxFreq = 0; let maxDayIdx = 1;
            for (let i = 1; i <= 7; i++) { if (dayFreq[i] > maxFreq) { maxFreq = dayFreq[i]; maxDayIdx = i; } }
            const weekDays = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];
            const mode = maxFreq > 0 ? weekDays[maxDayIdx] : "—";

            let gapSum = 0; let gapEvents = 0; let currentGap = 0; let hasStarted = false;
            for (const v of values) {
                if (v > 0) { if (hasStarted && currentGap > 0) { gapSum += currentGap; gapEvents++; } hasStarted = true; currentGap = 0; }
                else if (hasStarted) { currentGap++; }
            }
            const avgGap = gapEvents > 0 ? (gapSum / gapEvents) : 0;
            return { mean: mean.toFixed(2), sigma: sigma.toFixed(2), mode, kurt: kurtosis.toFixed(1), gap: avgGap.toFixed(1) };
        },
        getLevel(count) {
            for (let i = CONFIG.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
                if (count >= CONFIG.LEVEL_THRESHOLDS[i]) return i;
            }
            return 0;
        }
    };

    // --- COMPONENTS ---

    function TrendChart({ dailyMap, startDate, today, onPointClick }) {
        const [viewMode, setViewMode] = dc.useState("week");
        const [chartType, setChartType] = dc.useState("area");
        const gradId = dc.useMemo(() => "grad-" + Math.random().toString(36).substr(2, 9), []);
        const gradHoverId = gradId + "-hover";

        const buckets = dc.useMemo(() => {
            const result = [];
            let cursor = startDate;
            while (cursor <= today) {
                const isWeek = viewMode === "week";
                const startOfPeriod = isWeek ? cursor.startOf("week") : cursor.startOf("month");
                const endOfPeriod = isWeek ? cursor.endOf("week") : cursor.endOf("month");
                const key = isWeek ? startOfPeriod.toISODate() : startOfPeriod.toFormat("yyyy-MM");
                let label = "";
                if (isWeek) label = `第 ${cursor.weekNumber} 周`;
                else { 
                    // 获取月份数字（1-12）并加上“月”字
                    label = cursor.toFormat("M") + "月"; 
                }
                // else { const m = cursor.setLocale("zh-CN").toFormat("MMMM"); label = m.charAt(0).toUpperCase() + m.slice(1); }

                let sum = 0; let batchFiles = [];
                let internalCursor = cursor;
                while (internalCursor <= endOfPeriod && internalCursor <= today) {
                    const entry = dailyMap.get(internalCursor.toISODate());
                    if (entry) { sum += entry.count; batchFiles.push(...entry.files); }
                    internalCursor = internalCursor.plus({ days: 1 });
                }
                result.push({ key, value: sum, label, files: batchFiles });
                cursor = internalCursor;
            }
            return result;
        }, [viewMode, dailyMap, startDate, today]);

        const HEIGHT = CONFIG.CHART_HEIGHT;
        const WIDTH = 1000;
        const maxValue = Math.max(...buckets.map(b => b.value), 1);
        const stepX = WIDTH / (buckets.length - 1 || 1);

        const generateSmoothPath = (points) => {
            if (points.length === 0) return "";
            if (points.length === 1) return `M ${points[0][0]},${points[0][1]} L ${points[0][0]},${points[0][1]}`;
            const op = (p, n) => { const lx = n[0] - p[0]; const ly = n[1] - p[1]; return { len: Math.sqrt(lx*lx + ly*ly), ang: Math.atan2(ly, lx) }; };
            const cp = (curr, prev, next, rev) => {
                const p = prev || curr; const n = next || curr; const o = op(p, n);
                const ang = o.ang + (rev ? Math.PI : 0); const len = o.len * 0.2;
                return [curr[0] + Math.cos(ang) * len, curr[1] + Math.sin(ang) * len];
            };
            let d = `M ${points[0][0].toFixed(1)},${points[0][1].toFixed(1)} `;
            for (let i = 1; i < points.length; i++) {
                const startCp = cp(points[i-1], points[i-2], points[i], false);
                const endCp = cp(points[i], points[i-1], points[i+1], true);
                d += `C ${startCp[0].toFixed(1)},${startCp[1].toFixed(1)} ${endCp[0].toFixed(1)},${endCp[1].toFixed(1)} ${points[i][0].toFixed(1)},${points[i][1].toFixed(1)} `;
            }
            return d;
        };

        const renderArea = () => {
            const points = buckets.map((b, i) => [i * stepX, HEIGHT - ((b.value / maxValue) * HEIGHT)]);
            const pathLine = generateSmoothPath(points);
            const pathFill = `${pathLine} L ${WIDTH},${HEIGHT} L 0,${HEIGHT} Z`;
            return (
                <g className="ativ-trend-group-area">
                    <path d={pathFill} className="ativ-trend-area-fill" style={{ fill: `url(#${gradId})` }} />
                    <path d={pathLine} className="ativ-trend-area-line" />
                    {buckets.map((b, i) => (
                        <rect key={`trig-${b.key}`} x={(i * stepX) - (stepX / 2)} y={0} width={stepX} height={HEIGHT} fill="transparent" className="ativ-trend-trigger" style={{ cursor: b.value > 0 ? "pointer" : "default" }} onClick={(e) => onPointClick(e, b)}>
                             <title>{`${b.label} (${b.value})`}</title>
                        </rect>
                    ))}
                </g>
            );
        };

        const renderBars = () => (
             <g className="ativ-trend-group-bars">
                {buckets.map((b, i) => {
                    const barW = Math.max(1, (WIDTH - (buckets.length * 2)) / buckets.length);
                    const barH = (b.value / maxValue) * HEIGHT;
                    return (
                        <rect key={b.key} x={i * (barW + 2)} y={HEIGHT - barH} width={barW} height={barH} className="ativ-trend-element-bar"
                            style={{ "--fill-normal": `url(#${gradId})`, "--fill-hover": `url(#${gradHoverId})`, cursor: b.value > 0 ? "pointer" : "default" }}
                            onClick={(e) => onPointClick(e, b)}>
                            <title>{`${b.label} (${b.value})`}</title>
                        </rect>
                    );
                })}
            </g>
        );

        return (
            <div className="ativ-trend-container">
                <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="ativ-trend-svg">
                    <defs>
                        <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
                            <stop offset={CONFIG.GRADIENT.bottom} stopColor="var(--grad-bottom)" stopOpacity={CONFIG.GRADIENT.opacityBottom} />
                            <stop offset={CONFIG.GRADIENT.top} stopColor="var(--grad-top)" stopOpacity={CONFIG.GRADIENT.opacityTop} />
                        </linearGradient>
                        <linearGradient id={gradHoverId} x1="0" y1="1" x2="0" y2="0">
                            <stop offset={CONFIG.GRADIENT.bottom} stopColor="var(--grad-bottom)" stopOpacity={CONFIG.GRADIENT.opacityBottom} />
                            <stop offset={CONFIG.GRADIENT.top} stopColor="var(--grad-top-hover)" stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    {chartType === "bar" ? renderBars() : renderArea()}
                </svg>
                <div className="ativ-trend-controls">
                    <div className="ativ-trend-toggle">
                        <span className={viewMode === "week" ? "is-active" : ""} onClick={() => setViewMode("week")}>周</span><span className="ativ-sep">/</span>
                        <span className={viewMode === "month" ? "is-active" : ""} onClick={() => setViewMode("month")}>月</span>
                    </div>
                    <span className="ativ-trend-sep-group">|</span>
                    <div className="ativ-trend-toggle">
                        <span className={chartType === "bar" ? "is-active" : ""} onClick={() => setChartType("bar")}>柱状图</span><span className="ativ-sep">/</span>
                        <span className={chartType === "area" ? "is-active" : ""} onClick={() => setChartType("area")}>面积图</span>
                    </div>
                </div>
            </div>
        );
    }

    function HeatmapBlock({ title, folder, styles }) {
        const { dailyMap, dailyList, startDate, today } = useHeatmapData(folder);
        const stats = dc.useMemo(() => StatsService.calculate(dailyMap, dailyList), [dailyMap, dailyList]);
        const [tooltip, setTooltip] = dc.useState({ visible: false, x: 0, y: 0, text: "" });
        const [menu, setMenu] = dc.useState(null);

        const handleInteraction = {
            cellEnter: (dateIso, count) => (e) => setTooltip({ visible: true, x: e.nativeEvent.offsetX + 12, y: e.nativeEvent.offsetY + 12, text: `${dc.coerce.date(dateIso).toFormat("dd/MM/yyyy")} — ${count} 篇笔记` }),
            cellMove: (e) => { if (tooltip.visible) setTooltip(t => ({ ...t, x: e.nativeEvent.offsetX + 12, y: e.nativeEvent.offsetY + 12 })); },
            cellLeave: () => setTooltip(t => ({ ...t, visible: false })),
            showMenu: (e, label, files) => {
                if (!files || files.length === 0) return;
                e.preventDefault(); e.stopPropagation();
                
                // 1. 获取当前热力图区块的根节点
                const root = e.target.closest(".ativ-heatmap-root");
                let align = "right"; 
                let x = 0; 
                let y = 0;
                
                if (root) {
                    const rect = root.getBoundingClientRect();
                    // 获取点击位置相对于窗口的绝对坐标
                    const clientX = e.clientX || e.nativeEvent.clientX; 
                    const clientY = e.clientY || e.nativeEvent.clientY;
                    
                    // 计算点击位置相对于热力图容器内部的坐标
                    x = clientX - rect.left; 
                    y = clientY - rect.top;
                    
                    // --- 核心修复逻辑：基于组件内部中线判断 ---
                    // 我们判断点击位置是在当前热力图区块的“左半边”还是“右半边”
                    // rect.width 是当前分屏窗口内组件的宽度
                    const relativeThreshold = rect.width / 2;

                    if (x > relativeThreshold) {
                        // 如果点击位置在当前分屏窗口的右侧，菜单向左弹出，避免撞上右侧分屏线或边缘
                        align = "left";
                    } else {
                        // 否则向右弹出
                        align = "right";
                    }
                }
                setMenu({ x, y, align, label, files });
            },
            clickCell: (dateIso) => (e) => {
                const entry = dailyMap.get(dateIso);
                if (entry) handleInteraction.showMenu(e, dc.coerce.date(dateIso).toFormat("dd/MM/yyyy"), entry.files);
            }
        };

        // --- 改进后的菜单失焦关闭逻辑 ---
        dc.useEffect(() => {
            const closer = (e) => {
                // 如果菜单存在，且点击的不是菜单本身，也不是触发菜单的单元格
                if (menu && !e.target.closest(".ativ-heatmap-menu") && !e.target.closest(".ativ-heatmap-cell")) {
                    setMenu(null);
                }
            };

            if (menu) {
                // 使用 capture 阶段确保优先捕获点击
                document.addEventListener("click", closer, true);
                // 监听滚动事件，滚动时也关闭菜单（防止错位）
                document.addEventListener("wheel", closer, true);
            }

            return () => {
                document.removeEventListener("click", closer, true);
                document.removeEventListener("wheel", closer, true);
            };
        }, [menu]);

        const startOfWeek = startDate.startOf("week");
        const weeksCount = Math.ceil(dailyList.length / 7) + 1;
        const width = weeksCount * (styles.cell + styles.gap) + 10;
        const height = (7 * (styles.cell + styles.gap)) + 30;
        let lastMonthRendered = -1;

        return (
            <div className="ativ-heatmap-root" data-id={title}>
                <div className="ativ-heatmap-title">{title}</div>
                <svg className="ativ-heatmap-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} onMouseMove={handleInteraction.cellMove}>
                    {dailyList.map(date => {
                        const iso = date.toISODate();
                        const diffDays = Math.floor(date.diff(startOfWeek, "days").days);
                        const col = Math.floor(diffDays / 7);
                        const row = CONFIG.WEEK_START_MONDAY ? ((date.weekday + 6) % 7) : (date.weekday % 7);
                        const x = Math.round(col * (styles.cell + styles.gap));
                        const y = Math.round(20 + row * (styles.cell + styles.gap));
                        const entry = dailyMap.get(iso);
                        const count = entry?.count ?? 0;
                        const rectNode = <rect key={`r-${iso}`} className="ativ-heatmap-cell" x={x} y={y} width={styles.cell} height={styles.cell} rx={styles.rad} ry={styles.rad}
                                data-level={StatsService.getLevel(count)} onMouseEnter={handleInteraction.cellEnter(iso, count)} onMouseLeave={handleInteraction.cellLeave}
                                onClick={handleInteraction.clickCell(iso)} />;
                        let labelNode = null;
                        if (date.month !== lastMonthRendered && date.day <= 7) { lastMonthRendered = date.month; labelNode = <text key={`m-${iso}`} className="ativ-heatmap-month-label" x={x} y={y - 5}>{date.setLocale("zh-CN").toFormat("LLL")}</text>; }
                        return <g key={`g-${iso}`}>{rectNode}{labelNode}</g>;
                    })}
                </svg>
                <div className="ativ-stats-grid">
                    <div className="ativ-stat-col"><span className="ativ-stat-header">平均值</span><span className="ativ-stat-val">{stats.mean}</span></div>
                    <div className="ativ-stat-col"><span className="ativ-stat-header">标准差</span><span className="ativ-stat-val">{stats.sigma}</span></div>
                    <div className="ativ-stat-col"><span className="ativ-stat-header">高产日</span><span className="ativ-stat-val">{stats.mode}</span></div>
                    <div className="ativ-stat-col"><span className="ativ-stat-header">峰度</span><span className="ativ-stat-val">{stats.kurt}</span></div>
                    <div className="ativ-stat-col"><span className="ativ-stat-header">平均间隔</span><span className="ativ-stat-val">{stats.gap}</span></div>
                </div>
                <TrendChart dailyMap={dailyMap} startDate={startDate} today={today} onPointClick={(e, data) => handleInteraction.showMenu(e, data.label, data.files)} />
                <div className="ativ-heatmap-tooltip" style={{ opacity: tooltip.visible ? 1 : 0, left: tooltip.x, top: tooltip.y }}>{tooltip.text}</div>
                {menu && (
				    <div 
				        className={`ativ-heatmap-menu align-${menu.align}`} 
				        style={{ left: menu.x, top: menu.y }}
				        /* 核心修改：只要鼠标离开这个弹出框区域，菜单立即消失 */
				        onMouseLeave={() => setMenu(null)} 
    >				
				        <div className="ativ-heatmap-menu-title">
				            {menu.label} — {menu.files.length} 篇笔记
				        </div>
				        
				        <div>{menu.files.map(f => (
				            <div className="ativ-heatmap-menu-item" key={f.path}>
				                <a 
				                    className="internal-link" 
				                    data-href={f.path}        
				                    href={f.path} 
				                    onClick={(e) => { 
				                        e.preventDefault(); 
				                        e.stopPropagation(); 
				                        app.workspace.openLinkText(f.path, "", true); 
				                        setMenu(null); 
				                    }}
				                    style={{ textDecoration: "none" }}
                >												
				                    {f.name}
				                </a>
				            </div>
				        ))}</div>
				    </div>
				)}
            </div>
        );
    }

    // --- MAIN COMPONENT (WITH TITLE AND DIVIDER) ---
    function AtividadesBoard() {
        const styles = useStyleConfig();
        return (
            /* Main Div */
            <div className="ativ-heatmaps-container">
                 {/* Title Structure + Divider (identical to Dashboard) */}
                <div className="title-tabs">
                    <span className="title-tab is-active">{CONFIG.TITLE}</span>
                </div>
                
                <div className="ativ-heatmaps-shell">
                    {CONFIG.CATEGORIES.map(cat => <HeatmapBlock key={cat.folder} title={cat.title} folder={cat.folder} styles={styles} />)}
                </div>
            </div>
        );
    }

    return <AtividadesBoard />;
};
