# tree-view-search-bar
> I can reveal which files you are looking for by your keywords in tree view.

# <a name="Menu"></a>Menu
> 目录

* [Install (安装)](#Install)
* [Changelog (更新日志)](#Changelog)
* [Usage (使用方法)](#Usage)
    * [String : 字符](#String)
    * [File : 文件](#File)
    * [Path : 路径](#Path)
    * [Combo : 组合](#Combo)
* [Notice (注意事项)](#Notice)

## <a name="Install"></a>Install [[↑]](#Menu)
> 安装

* `apm install tree-view-search-bar` or [https://atom.io/packages/tree-view-search-bar](https://atom.io/packages/tree-view-search-bar)
* command: `search-bar:toggle`
* or shortcut:
    * `ctrl-cmd-shift-f` in `darwin`.
    * `ctrl-alt-shift-f` in `win32` and `linux`.
    * You should focus in `tree-view` or `editor` first.
* enjoy it ☺️

## <a name="Changelog"></a>Changelog [[↑]](#Menu)
> 更新日志

* 0.0.2 (2016-08-22) :
    * Add keyboard shortcut to toggle plugin.
    * `ctrl-cmd-shift-f` in `darwin`.
    * `ctrl-alt-shift-f` in `win32` and `linux`.
* 0.0.3 (2016-09-22) :
    * Focus after show.

## <a name="Usage"></a>Usage [[↑]](#Menu)
> 使用方法

Match Rule
> 匹配规则

* Rule1 : When the input of `tree-view-search-bar` is not empty, all files or directories in `tree-view` will be hidden.
> 规则1 : 当输入框不为空时，所有的文件都会隐藏。

* Rule2 : If the file or directory matches one of the expressiones, it will be visible.
> 规则2 : 只要符合输入的所有表达式的其中一条该文件或者文件夹就会显示。

* Rule3 : There is a directory including at least one file or directory which is matched Rule2 that will be visible.
> 规则3 : 当文件夹包含某个符合规则2的子文件或者子文件夹时该文件夹会显示。

* Rule4 : If this directory is collapsed, Rule3 is not suitable to this directory, Rule2 is not suitable to its subfile or subdirectory.
> 规则4 : 该文件夹处于收拢状态时，它的子文件或者子文件夹不会应用规则2，该文件夹不会应用规则3。

### <a name="String"></a>String : 字符 [[↑]](#Menu)

* Match all files or directories which are include the string you type.
> 匹配包含该字符串的文件与文件夹。

* Case Insensitivity.
> 大小写不敏感。

1. `tree-view-search-bar` includes `tree`.
> `tree-view-search-bar` 包含字符串 `tree`。

    ![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/string-1.png)

2. `atom-reveal-file-in-finder`, `main.js`, `intro.png` includes `in`, `lib` is visible because [`Rule3`](#Usage).
> `atom-reveal-file-in-finder`，`main.js`，`intro.png` 包含字符串 `in`，`lib`因为[`规则3`](#Usage)而显示。

    ![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/string-2.png)

3. Case Insensitivity.
> 大小写不敏感。

    ![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/string-3.png)

### <a name="File"></a>File : 文件 [[↑]](#Menu)

* If the string you type include character `.` that will search file only.
> 使用`.`来识别文件类型.

* Support Regular Expression.
> 允许使用正则.

* Character `*` can match all filename.
> 使用`*`来代表任何长度的文件名.

* Character `*` can match all file extension.
> 使用`*`来代表任何长度的文件类型.

1. Match all files if their extension are `md`.
> 匹配所有后缀为`md`的文件。

    ![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/file-1.png)

2. Match all files if their extension are `md` and the last character of filename are `e`.
> 匹配所有后缀为`md`且最后的字母为`e`的文件。

    ![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/file-2.png)

3. All files will be match.
> 全部文件都会被匹配。

    ![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/file-3.png)

### <a name="Path"></a>Path : 路径 [[↑]](#Menu)

* If the string you type include character `/` or `\` that will match the file path.
> 使用`/`或者`\`来识别路径类型。

* Each part of path will apply as same as [`String Rule`](#String) to filter the directories.
> 每一段路径使用[`字符`](#String)的匹配去过滤文件夹。

* If `/` or `\` is the last character, all subfile or subdirectory of the match directory will display.
> 当以`/`或者`\`结尾时, 默认显示该文件夹下全部文件与文件夹。

1. `tree-view-search-bar` includes `tree`, `view.less` includes `less`, `styles` is visible because [`Rule3`](#Usage).
> `tree-view-search-bar` 包含字符串 `tree`，`view.less` 包含字符串 `less`，`styles`因为[`规则3`](#Usage)而显示。

    ![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/path-1.png)

2. `tree-view-search-bar` includes `tree`, and its subfiles or subdirectories are visible because the last character is `/`.
> `tree-view-search-bar` 包含字符串 `tree`，以`/`结尾时, 显示该文件夹下全部文件与文件夹。

    ![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/path-2.png)

3. `tree-view-search-bar` includes `tree`, `lib` includes `lib`, and subfiles or subdirectories of `lib` are visible because the last character is `/`.
> `tree-view-search-bar` 包含字符串 `tree`，`lib` 包含字符串 `lib`，以`/`结尾时, 显示`lib`下全部文件与文件夹。

    ![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/path-3.png)

### <a name="Combo"></a>Combo : 组合 [[↑]](#Menu)

* Use `space` to split each expression.
> 使用`空格`分割每一条表达式。

* Match one of the expressiones will be displayed.
> 只要符合其中一条表达式的匹配规则则会显示。

1. like this:
> 例子：

    ![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/combo-1.png)

## <a name="Notice"></a>Notice [[↑]](#Menu)
> 注意事项

* Do not match any files or directories which in the collapse directory.
> 收拢的文件夹内的文件不会被匹配到。

* If you collapse a directory which include matched file or directory and this directory do not match any expression, then this directory will not display in the result list.
> 一个文件夹本身没有被匹配只因为其包含了被匹配的文件或者文件夹而显示时，收拢该文件夹将会导致该文件夹在匹配结果列表上消失。

## TODO [[↑]](#Menu)

* 大小写敏感(Case Sensitivity)
* 匹配正则表达式(Regular Expression)
* 关键字补全(Autocomplete)
* 模糊搜索(Fuzzy)
* 匹配高亮(Highlight)
* 深度匹配(Match file in fold directory)

## License [[↑]](#Menu)

MIT
