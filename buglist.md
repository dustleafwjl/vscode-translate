
# 记学习如何开发vscode插件开发时遇到的问题

### 在安装vscode-textmate时

**node-gyp**

是由于node程序中需要调用一些其他语言编写的 工具 甚至是dll，需要先编译一下，否则就会有跨平台的问题，例如在windows上运行的软件copy到mac上就不能用了，但是如果源码支持，编译一下，在mac上还是可以用的。node-gyp在较新的Node版本中都是自带的（平台相关），用来编译原生C++模块。


#### 问题描述：未安装该库需要的python以及一些系统组件

报错：

gyp ERR! stack Error: Can't find Python executable "python", you can set the PYT
HON env variable.

在此解决方案中一次生成一个项目。若要启用并行生成，请添加“/m”开关。 
MSBUILD : error MSB3428: 未能加载 Visual C++ 组件“VCBuild.exe”。要解决此问题， 
安装 .NET Fram 
ework 2.0 SDK；2) 安装 Microsoft Visual Studio 2005；或 3) 如果将该组件安装到了 
其他位置，请将其位置添加到系统 
路径中。 [G:\nodejs\movi

#### 解决方法：

先在控制台输入：npm install --global --production windows-build-tools（此命令为一键安装）

解释：

- python(v2.7 ，3.x不支持);
- visual C++ Build Tools,或者 （vs2015以上（包含15))
- .net framework 4.5.1

##### 安装途中出现错误：**Please restart this script from an administrative PowerShell！**

##### 解决方法：

用管理员权限打开cmd，再安装(win+s, 搜索cmd)
然后在控制台输入：npm install -D vscode-textmate


---


### 在使用vscode进行调试的时候，不稳定，时而能进行调试，时而不能(未解决)

#### 问题描述：

由于我时使用LSP，所以需要client和server两个task，在进行client调试时不稳定，原因未找到

#### 解决方法：

重启，关掉进程

写好launch.json和tasks.json


---


### 使用vscode-textmate时出现问题

#### 问题描述:

报错**Error: Near offset 1: expected < ~~~"information_for_contributors":["This file has bee~~~**

原因：parseRawGrammar方法少传了一个参数，如果只传入一个参数，方法默认语法文件格式为.plist

```typescript
const registry =new Registry({
    loadGrammar: (scopeName: string) => {
        if(scopeName === 'source.ts') {
            return readFile(filePath).then(res => {
                // return parseRawGrammar(res.toString()) 错误示例
                return parseRawGrammar(res.toString(), filePath)
            })
        }
        console.log('unkonw scope name:', scopeName)
        return null
    }
});
```

#### 解决方案：

传入第二个参数，参数为文件路径



---

问题描述：
在使用vscode-textmate，在使用IGarmmar对象的tokenizeLine方法时出现


```
[Error - 下午12:21:20] Request textDocument/hover failed.
  Message: Request textDocument/hover failed with message: The module '\\?\e:\js_workspace\vscode-translate\server\node_modules\oniguruma\build\Release\onig_scanner.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 64. This version of Node.js requires
NODE_MODULE_VERSION 73. Please try re-compiling or re-installing
the module (for instance, using `npm rebuild` or `npm install`).
```
参考链接：

https://electronjs.org/docs/tutorial/using-native-node-modules
https://github.com/Microsoft/vscode-textmate/issues/23
https://juejin.im/post/5c46ab47e51d45522b4f55b1


解决方案：

https://github.com/intellism/vscode-comment-translate/issues/34