/* ==================================================================
    MEMORIES (React + Datacore)
    - Author: @furbas16e8 (https://github.com/furbas16e8) 
			@ichris007 (https://github.com/ichris007)
    - "Memories" list (past notes)
    - Ref.: memories.css
 ================================================================== */

return function View() {
    const CONFIG = {
        TITLE: "回忆",
        SOURCE_FOLDERS: [
		    "00Journal/01DailyNotes",
		    "02Business",
		    "03Life",
		    "04Growth"
		],
        FIELDS: {
            DATE: ["date", "Date", "created", "created_at", "created_date", "created date"],
            TIME: ["hour", "Hour", "time", "timestamp"]
        },
        LABELS: {
            MONTHS: [, "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            DAYS: [, "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
            PERIODS: ["凌晨", "上午", "下午", "晚上"]
        }
    };

    // --- SERVICE ---
    const TimeParserService = {
        clampTime({ h = 0, m = 0 } = {}) { return { h: Math.max(0, Math.min(23, h | 0)), m: Math.max(0, Math.min(59, m | 0)) }; },
        toISO({ y, m, d }) { return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`; },
        toJSDate({ y, m, d }) { return new Date(y, m - 1, d); },
        extractDate(raw) {
            if (!raw) return null;
            if (raw.year != null && raw.month != null && raw.day != null) return { y: raw.year | 0, m: raw.month | 0, d: raw.day | 0 };
            if (raw instanceof Date && !isNaN(raw)) return { y: raw.getFullYear(), m: raw.getMonth() + 1, d: raw.getDate() };
            if (typeof raw === "string") {
                let match = raw.match(/(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
                if (match) return { y: +match[1], m: +match[2], d: +match[3] };
                match = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
                if (match) return { y: +match[3] < 100 ? 2000 + +match[3] : +match[3], m: +match[2], d: +match[1] };
                const digits = raw.replace(/\D/g, "");
                if (digits.length >= 8) return { y: +digits.slice(0, 4), m: +digits.slice(4, 6), d: +digits.slice(6, 8) };
            }
            return null;
        },
        extractTime(raw) {
            if (!raw) return null;
            if (raw.hour != null && raw.minute != null) return this.clampTime({ h: raw.hour, m: raw.minute });
            if (raw instanceof Date && !isNaN(raw)) return this.clampTime({ h: raw.getHours(), m: raw.getMinutes() });
            if (typeof raw === "number") {
                const s = String(raw);
                if (s.length <= 2) return this.clampTime({ h: +s, m: 0 });
                if (s.length === 3) return this.clampTime({ h: +s[0], m: +s.slice(1) });
                return this.clampTime({ h: +s.slice(0, 2), m: +s.slice(2, 4) });
            }
            if (typeof raw === "string") {
                const s = raw.trim();
                const match = s.match(/(\d{1,2})\s*[:hH\.]\s*(\d{2})/);
                if (match) return this.clampTime({ h: +match[1], m: +match[2] });
                const digits = s.replace(/\D/g, ""); 
                if (!digits) return null;
                if (digits.length <= 2) return this.clampTime({ h: +digits, m: 0 });
                if (digits.length === 3) return this.clampTime({ h: +digits[0], m: +digits.slice(1) });
                return this.clampTime({ h: +digits.slice(0, 2), m: +digits.slice(2, 4) });
            }
            return null;
        },
        getPeriodAlias(dateObj, hour) {
            const jsDate = this.toJSDate(dateObj);
            const dayIdx = jsDate.getDay() === 0 ? 7 : jsDate.getDay();
            const weekDay = CONFIG.LABELS.DAYS[dayIdx];
            let period = CONFIG.LABELS.PERIODS[3]; // 默认“晚上”
            if (hour <= 4) period = CONFIG.LABELS.PERIODS[0];
            else if (hour <= 11) period = CONFIG.LABELS.PERIODS[1];
            else if (hour <= 17) period = CONFIG.LABELS.PERIODS[2];
            
            // 返回格式：周一 · 上午
            return `${weekDay} · ${period}`; 
        },
        formatDateFull({ y, m, d }) { 
            return `${y}年${m}月${d}日`; 
        }
    };

    const MarkdownService = {
        clean(md) { return md.replace(/^---[\s\S]*?---\s*/m, "").replace(/```[\s\S]*?```/g, " ").replace(/\r/g, "\n"); },
        mdToHtml(text) {
            let s = text.replace(/`([^`]+)`/g, "<code>$1</code>");
            s = s.replace(/(\*\*|__)(.+?)\1/g, "<strong>$2</strong>");
            s = s.replace(/(\*|_)([^*_][\s\S]*?)\1/g, "<em>$2</em>");
            s = s.replace(/~~(.+?)~~/g, "<del>$1</del>");
            s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, u) => `<a href="${u.replace(/"/g, "&quot;")}" target="_blank">${t}</a>`);
            s = s.replace(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g, (m, target, anchor, alias) => `<a class="internal-link" href="${anchor ? target + '#' + anchor : target}">${alias || target}</a>`);
            return s;
        },
        getFirstParagraph(md) {
            const paragraphs = this.clean(md).split(/\n\s*\n+/).map(x => x.trim()).filter(Boolean);
            if (!paragraphs.length) return "";
            let p = paragraphs[0].replace(/^#{1,6}\s+/gm, "").replace(/^\s{0,3}>\s?/gm, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "");
            return this.mdToHtml(p).replace(/\s+/g, " ").trim();
        }
    };

    // --- HOOKS ---
    function useMemoryPreview(path) {
        const [preview, setPreview] = dc.useState("...");
        const revision = dc.useIndexUpdates({ debounce: 3000 });
        dc.useEffect(() => {
            let active = true;
            (async () => {
                try {
                    const af = app.vault.getAbstractFileByPath(path);
                    if (!af) { if (active) setPreview("N/A"); return; }
                    const content = await app.vault.read(af);
                    if (active) setPreview(MarkdownService.getFirstParagraph(content) || "...");
                } catch { if (active) setPreview("Error"); }
            })();
            return () => { active = false; };
        }, [path, revision]);
        return preview;
    }

    function useMemoryData() {
        //const pages = dc.useQuery(`@page and path("${CONFIG.SOURCE_FOLDER}")`);
        // 将数组转换为 path("A") or path("B") or path("C") 的格式
	    const pathConditions = CONFIG.SOURCE_FOLDERS
	        .map(folder => `path("${folder}")`)
	        .join(" or ");
    
    // 使用拼接好的路径条件进行查询
	    const pages = dc.useQuery(`@page and (${pathConditions})`);
        const currentFile = dc.useCurrentFile();
        const anchorDate = dc.useMemo(() => {
            const m = (currentFile?.$name || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
            const now = new Date();
            if (m) return { y: +m[1], m: +m[2], d: +m[3] };
            return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
        }, [currentFile]);

        const memoryItems = dc.useMemo(() => {
            return pages.map(page => {
                let rawDate = null;
                for (const f of CONFIG.FIELDS.DATE) { const v = page.value(f); if (v != null) { rawDate = v; break; } }
                const dateObj = TimeParserService.extractDate(rawDate);
                let timeObj = null;
                for (const f of CONFIG.FIELDS.TIME) { const v = page.value(f); if (v != null) { const p = TimeParserService.extractTime(v); if (p) { timeObj = p; break; } } }
                if (!timeObj && rawDate) timeObj = TimeParserService.extractTime(rawDate);
                if (!timeObj) {
                    const t = TimeParserService.extractTime(page.$name);
                    if (t) timeObj = t;
                    else { const tm = (page.$name || "").replace(/\D/g, "").slice(-4); if (/^\d{4}$/.test(tm)) timeObj = { h: +tm.slice(0, 2), m: +tm.slice(2, 4) }; }
                }
                if (!timeObj) timeObj = TimeParserService.extractTime(page.$ctime);
                return { page, date: dateObj, time: timeObj || { h: 12, m: 0 } };
            }).filter(i => i.date != null);
        }, [pages]);
        return { memoryItems, anchorDate };
    }

    function useMemoryTabs(memoryItems, anchorDate) {
        const [activeTab, setActiveTab] = dc.useState(null);
        const tabs = dc.useMemo(() => {
            const sub = (d, t, a) => {
                const js = TimeParserService.toJSDate(d);
                if (t === "days") js.setDate(js.getDate() - a);
                if (t === "months") js.setMonth(js.getMonth() - a);
                if (t === "years") js.setFullYear(js.getFullYear() - a);
                return { y: js.getFullYear(), m: js.getMonth() + 1, d: js.getDate() };
            };
            const existing = new Set(memoryItems.map(i => TimeParserService.toISO(i.date)));
            const fixed = [
                { label: "1周前", date: sub(anchorDate, "days", 7) },
                { label: "1个月前", date: sub(anchorDate, "months", 1) },
                { label: "3个月前", date: sub(anchorDate, "months", 3) },
                { label: "6个月前", date: sub(anchorDate, "months", 6) }
            ].filter(c => existing.has(TimeParserService.toISO(c.date)));
            const years = new Set(memoryItems.filter(i => i.date.m === anchorDate.m && i.date.d === anchorDate.d && i.date.y < anchorDate.y).map(i => anchorDate.y - i.date.y));
            const yCandidates = Array.from(years).sort((a, b) => a - b).map(d => ({ label: d === 1 ? "1年前" : `${d}年前`, date: sub(anchorDate, "years", d) }));
            return [...fixed, ...yCandidates];
        }, [memoryItems, anchorDate]);
        dc.useEffect(() => { if (!activeTab && tabs.length > 0) setActiveTab(tabs[0]); }, [tabs]);
        return { tabs, activeTab, setActiveTab };
    }

    // --- COMPONENTS ---
    function MemoryCard({ item }) {
        // 1. 重新启用内容预览逻辑（获取文件第一行）
        const preview = useMemoryPreview(item.page.$path);
        
        // 跳转逻辑
        const open = () => app.workspace.openLinkText(item.page.$path, "/", true);
        
        // 时间和别名
        const alias = TimeParserService.getPeriodAlias(item.date, item.time.h);
        const time = `${String(item.time.h).padStart(2, '0')}:${String(item.time.m).padStart(2, '0')}`;
        
        return (
            <div 
                className="mem-card" 
                role="button" 
                tabIndex={0} 
                /* onClick={open} */ // 如果你想恢复全卡片点击，去掉前后的注释符号
            >
                <div className="mem-head">
                    <span className="mem-title-link">{alias}</span>
                    <span className="mem-time">({time})</span>
                </div>
                
                {/* 2. 第一行：显示文件名（带预览功能） */}
                <div style={{ marginBottom: "4px" }}>
                    <a 
                        className="mem-body internal-link" 
                        href={item.page.$path}
                        onClick={(e) => {
                            e.stopPropagation(); 
                            e.preventDefault(); 
                            open();
                        }}
                        style={{ 
                            fontWeight: "bold", 
                            color: "var(--text-accent)",
                            textDecoration: "none",
                            fontSize: "1em" // 让文件名稍微大一点
                        }}
                    >
                        {item.page.$name}
                    </a>
                </div>

                {/* 3. 第二行：显示文件第一行内容 */}
                <div 
                    className="mem-body markdown-rendered" 
                    style={{ 
                        fontSize: "0.9em", 
                        opacity: 0.8,
                        lineHeight: "1.4",
                        color: "var(--text-normal)"
                    }}
                    dangerouslySetInnerHTML={{ __html: preview }} 
                />
            </div>
        );
    }

    function MemoryGrid({ activeTab, memoryItems }) {
        if (!activeTab) return null;
        const target = TimeParserService.toISO(activeTab.date);
        const items = memoryItems.filter(i => TimeParserService.toISO(i.date) === target).sort((a, b) => (a.time.h * 60 + a.time.m) - (b.time.h * 60 + b.time.m) || a.page.$name.localeCompare(b.page.$name));
        return (
            <>
                <h3 className="mem-subtitle">{TimeParserService.formatDateFull(activeTab.date)}</h3>
                {items.length === 0 ? <p className="mem-empty">暂无日记</p> : <div className="mem-grid">{items.map((it, i) => <MemoryCard key={it.page.$path + i} item={it} />)}</div>}
            </>
        );
    }

    function MemoriasBoard() {
        const [isOpen, setIsOpen] = dc.useState(false);
        const { memoryItems, anchorDate } = useMemoryData();
        const { tabs, activeTab, setActiveTab } = useMemoryTabs(memoryItems, anchorDate);
        const toggle = () => setIsOpen(p => !p);

        return (
             /* Root Container with Highlight Line Structure */
            <div className="memorias-root">
                <div className="title-tabs">
                    <span className={`title-tab ${isOpen ? "is-active" : ""}`} onClick={toggle} style={{cursor:"pointer"}}>{CONFIG.TITLE}</span>
                </div>

                {isOpen && (
                    <div className="mem-text">
                        <nav className="mem-tabs">
                            {tabs.map(tab => (
                                <button key={tab.label} className={`mem-tab ${activeTab && TimeParserService.toISO(activeTab.date) === TimeParserService.toISO(tab.date) ? "mem-tab--active" : ""}`} onClick={() => setActiveTab(tab)}>{tab.label}</button>
                            ))}
                        </nav>
                        <MemoryGrid activeTab={activeTab} memoryItems={memoryItems} />
                    </div>
                )}
            </div>
        );
    }

    return <MemoriasBoard />;
};
