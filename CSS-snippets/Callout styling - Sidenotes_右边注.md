* author: Huajin
* source: https://github.com/xhuajin/obsidian-sidenote-callout

---
说明：
* 使用 obsidian 自带的 callout 语法，不污染笔记，实现右侧边注。
* 在编辑和阅读视图中效果一致。
* 边注可随显示窗口大小的调整自动适应。
* 可在指定笔记页面应用，也可以整个库应用。

效果展示：

![Callout_Sidenote](https://github.com/user-attachments/assets/0efb1853-2f04-49d5-a665-574d14ed1a51)


代码：（使用方法见最底部）

```
/*
author: Huajin
reference: 
  https://discord.com/channels/686053708261228577/702656734631821413/1155147566615367680
  https://discord.com/channels/686053708261228577/702656734631821413/1073456247849881610
*/

/* @settings

name: SideNote Callout
id: sidenote-callout
settings:
  -
    id: top-sidenote-callout-title
    title: Sidenote Callout Title to Top
    title.zh: 边注标题置于顶部
    type: class-toggle
    default: false
  -
    id: top-left-sidenote-callout-title-position
    title: Top Left Sidenote Callout Title Position
    title.zh: 标注在顶部时，左边注的标题位置
    type: class-select
    default: l-center-callout-title
    options:
      -
        label: left
        value: l-left-callout-title
      -
        label: center
        value: l-center-callout-title
      -
        label: right
        value: l-right-callout-title
  -
    id: top-right-sidenote-callout-title-position
    title: Top Right Sidenote Callout Title Position
    title.zh: 标注在顶部时，右边注的标题位置
    type: class-select
    default: r-center-callout-title
    options:
      -
        label: left
        value: r-left-callout-title
      -
        label: center
        value: r-center-callout-title
      -
        label: right
        value: r-right-callout-title
  -
    id: sidenote-backgound
    title: Callout Background
    title.zh: Callout背景
    description: enable background color
    description.zh: 开启背景色
    type: class-toggle
    default: false
  -
    id: aside-width
    title: sidenote width
    title.zh: 边注宽度
    description: The width of the sidenote
    description.zh: 边注的宽度
    type: variable-number-slider
    default: 200
    min: 150
    max: 300
    step: 10
    format: px
  -
    id: aside-offset
    title: sidenote offset
    title.zh: 边注与正文的间距
    description: The offset between the sidenote and the text(default is 16px)
    description.zh: 边注与正文的间距(默认为16px)
    type: variable-number-slider
    default: 16
    min: 0
    max: 50
    step: 1
    format: px
  -
    id: hide-sidenote-callout-fold-icon
    title: Hide Fold Icon
    title.zh: 隐藏折叠图标
    type: class-toggle
    default: false
*/

body {
  --aside-width: 200px;
  --aside-offset: var(--size-4-4);
  --line-width: var(--file-line-width, --line-width);
}

/* 只在笔记properties中添加CSSClasses，值为 "sidenote" 时生效，如想整个库应用，删除这段代码 */
.sidenote {
  --file-margins: 1% 30% var(--size-4-8) 5%; /* 四个数值，依次表示“上 - 右 - 下 - 左”边距，可以自己调整布局 */
}

.markdown-source-view.mod-cm6 .cm-content > .cm-callout:has(.callout[data-callout-metadata*="aside"])[contenteditable=false]  {
  contain: none !important;
  overflow: visible;
}

.markdown-source-view.mod-cm6 .cm-content > .cm-callout:has(.callout[data-callout-metadata*="aside"])[contenteditable=false]>.markdown-rendered {
  overflow: visible;
}

.cm-callout:has(.callout[data-callout-metadata*="aside"])[contenteditable=false]>.edit-block-button {
  display: none;
}

:is(.markdown-source-view .cm-callout, div:not([class])):has(> .callout[data-callout-metadata*="aside"]) {
  position: relative;
  overflow: visible;
}

.callout[data-callout-metadata*="aside"] {
  position: absolute;
  width: 45%; /* 边注的右侧边用这个参数控制，否则右边就跑到屏幕之外了。45%这个数是调出来的*/
}

/* .callout[data-callout-metadata*="aside-l"] {
  left: calc(-1 * (var(--aside-width) + var(--aside-offset)));
  right: calc(100% + var(--aside-offset));
} */

.callout[data-callout-metadata*="aside-r"] {
  left: calc(100% + var(--aside-offset)); /* 边注的左侧边位置用这个参数控制，可以自己调*/
  right: calc(100% + var(--aside-width));
}

.markdown-reading-view .callout[data-callout-metadata*="aside"] {
  position: absolute;
  width: 28%; /* 边注的右侧边用这个参数控制，否则右边就跑到屏幕之外了。28%这个数是调出来的*/
}

/* .markdown-reading-view .callout[data-callout-metadata*="aside-l"] {
  left: calc(50vw - var(--file-line-width)/2 - var(--aside-width) - 2 * var(--aside-offset));
  right: calc(50vw + var(--file-line-width)/2);
}  */

.markdown-reading-view .callout[data-callout-metadata*="aside-r"] {
  /*left: calc(var(--file-line-width) + 2 * var(--aside-width));
  /*right: calc(50vw - var(--file-line-width)/2 - var(--aside-width) - 2 *var(--aside-offset)); */
  left: calc(61% + var(--aside-width)); /* 边注的左侧边用这个参数控制，61%这个数是调出来的*/
  right: calc(-1 * var(--aside-width));
}   

@media (hover: hover) {
  .markdown-source-view.mod-cm6 .cm-embed-block:has(> div > [data-callout-metadata*="aside"]):hover {
    overflow: visible;
  }
  .markdown-source-view.mod-cm6 .cm-embed-block:not(.cm-table-widget):hover {
    box-shadow: unset;
  }
}

/* ------------ */

.callout[data-callout-metadata*="aside"] {
  --block-spacing: 0.75rem;
  --speaker-block-width: 20%;
  margin: 0px;
  padding: 0px;
  display: grid;
  background-color: var(--background-primary) !important;
  border: none;
  font-size: 14px;/* 修改为所需的字体大小 */
}

.sidenote-backgound .callout[data-callout-metadata*="aside"] {
  background-color: rgba(var(--callout-color), 0.1) !important;
  padding-bottom: 10px;
}
.callout[data-callout-metadata*="aside"] {
  grid-template-columns: var(--speaker-block-width) calc(100% - var(--speaker-block-width));
}

.top-sidenote-callout-title .callout[data-callout-metadata*="aside"] {
  grid-template-columns: unset;
}

.callout[data-callout-metadata*="aside"] .callout-title {
  height: calc(100% - var(--block-spacing));
  text-align: right;
  word-wrap: break-word;
  border-right: 3px solid;
  border-bottom: unset;
  flex: 1 0 auto;
  color: rgb(var(--callout-color)) !important;
  background-color: unset !important;
  /* padding-right: var(--block-spacing); */
  padding: 0;
}
.callout[data-callout-metadata*="aside"] .callout-title {
  display: inline-block;
}

body:not(.top-sidenote-callout-title) .setting-item[data-id="top-left-sidenote-callout-title-position"],
body:not(.top-sidenote-callout-title) .setting-item[data-id="top-right-sidenote-callout-title-position"] {
  display: none;
}

.top-sidenote-callout-title .callout[data-callout-metadata*="aside"] .callout-title {
  display: flex;
  flex-direction: row-reverse;
}

.callout[data-callout-metadata*="aside"] .callout-title-inner {
  font-weight: var(--bold-weight) !important;
  color: rgb(var(--callout-color)) !important;
  width: 1ch;
  margin: 0 auto;
  text-align: left;
}

.top-sidenote-callout-title .callout[data-callout-metadata*="aside"] .callout-title-inner {
  margin: 0 auto;
  width: unset;
}

.callout[data-callout-metadata*="aside"] .callout-title-inner {
  margin: 0 auto;
}

.l-left-callout-title .callout[data-callout-metadata*="aside-l"] .callout-title-inner {
  margin-left: var(--block-spacing);
}

.l-right-callout-title .callout[data-callout-metadata*="aside-l"] .callout-title-inner {
  margin: 0 var(--block-spacing);
}

.r-left-callout-title .callout[data-callout-metadata*="aside-r"] .callout-title-inner {
  margin-left: var(--block-spacing);
}

.r-right-callout-title .callout[data-callout-metadata*="aside-r"] .callout-title-inner {
  margin: 0 var(--block-spacing);
}

.callout[data-callout-metadata*="aside"]>* {
  margin-top: var(--block-spacing);
}

.callout[data-callout-metadata*="aside"]>.callout-title>.callout-icon {
  display: none;
}

.hide-sidenote-callout-fold-icon .callout[data-callout-metadata*="aside"] .callout-fold {
  display: none;
}

.callout[data-callout-metadata*="aside"]>.callout-title>.callout-fold,
.callout[data-callout-metadata*="aside"]>.callout-title>.callout-fold.is-collapsed {
  padding: 0;
  justify-content: center;
}

.callout[data-callout-metadata*="aside"]>.callout-content {
  padding: 0px var(--block-spacing);
  border-top: unset;
  max-height: 200px;
  overflow-y: auto;
}

.callout[data-callout-metadata*="aside"]>.callout-content>p:first-child {
  margin-top: 0px;
}

.callout[data-callout-metadata*="aside"]>.callout-content>p:last-child {
  margin-bottom: 0px;
}

.callout[data-callout-metadata*="aside"]>.callout-content::-webkit-scrollbar-thumb {
  width: 11px;
  height: 11px;
  background-color: transparent !important;
}

.callout[data-callout-metadata*="aside"]>.callout-content:hover::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb-bg) !important;
}

/* ------- */

@media print {
  .callout[data-callout-metadata*="aside-l"] {
    left: 0;
    right: calc(100% - var(--aside-width));
  }
  .callout[data-callout-metadata*="aside-r"] {
    left: calc(100% - var(--aside-width));
    right: 0;
  }
  div:not(.callout-content)>p {
    width: calc(100% - 2 * var(--aside-width));
    margin: 0 auto;
  }
}

```

---
使用方法：
在 `properties`中添加`cssclasses`赋值`sidenote`，然后在正文中直接用边注的 callout 即可。
如：
```
> [!NOTE|aside-r] 右侧注释
> 注释内容
如果想要边注可折叠，可以用 callout 的折叠语法
```

注：
* 代码中只改了 `aside-r`的位置控制效果，忽略了`aside-l`的显示（本人不需要左侧边栏批注）。
* 如果想要左侧边栏批注，可通过`.sidenote`中的`--file-margins:`设置页面左侧的`margins`值留出空间。
* 本人使用Theme minimal
* 如果边栏批注框的位置和大小与你的主题不匹配，可以自行调整参数（见代码注解）

更详细使用见原作者[GitHub - xhuajin/obsidian-sidenote-callout: By leveraging only CSS and callout, elegantly implement marginal notes](https://github.com/xhuajin/obsidian-sidenote-callout)
