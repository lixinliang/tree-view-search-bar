# tree-view-search-bar
> I can reavel which files you are looking for by your keywords in tree view.

# 使用方法
> Usage

* `apm install tree-view-search-bar` or [https://atom.io/packages/tree-view-search-bar](https://atom.io/packages/tree-view-search-bar)
* command: `search-bar:toggle`
* enjoy it ☺️
* [NOTICE](#notice)

### 字符 : String

* 匹配包含该字符串的文件夹与文件
* 大小写不敏感

![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/string-1.png)

![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/string-2.png)

![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/string-3.png)

### 文件 : File

* 使用`.`来识别文件类型
* 允许使用正则
* 使用`*`来代表任何长度的文件名
* 使用`*`来代表任何长度的文件类型

![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/file-1.png)

![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/file-2.png)

![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/file-3.png)

### 路径 : Path

* 使用`/`或者`\`来识别路径类型
* 每一段路径使用字符的匹配规则匹配
* 当以`/`或者`\`结尾时, 默认显示该文件夹下全部文件与文件夹

![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/path-1.png)

![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/path-2.png)

![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/path-3.png)

### 组合 : Combo

* 使用`空格`分割每一条表达式
* 只要符合其中一条表达式的匹配规则则会显示

![](https://raw.githubusercontent.com/lixinliang/tree-view-search-bar/master/images/combo-1.png)

# 注意(notice)

* 收拢的文件夹内的文件不会被匹配到(Do not match any files or directories which in the collapse directory)

# TODO

* 大小写敏感(Case Sensitivity)
* 匹配正则表达式(Regular Expression)
* 关键字补全(Autocomplete)
* 模糊搜索(Fuzzy)
* 匹配高亮(Highlight)
* 深度匹配(Match file in fold directory)
