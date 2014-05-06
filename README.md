saber-log [![Build Status](https://travis-ci.org/ecomfe/saber-log.png)](https://travis-ci.org/ecomfe/saber-log)
===

为使用saber框架的知心各行业手机端提供nsclick统计支持。

## Usage

0. 通过`edp`引入模块：

    edp import saber-log

1. 在`src/app.js`开头处添加
    ```javascript
    var log = require('saber-log');
    log.addDefaultLog({
        'fr' : 'wise-zhixin',
        'pvid' : (new Date()).getTime(),
        'pid' : 341
    });
    log.on();
    ```

2. 在`src/app.js`的`loadAction`方法内添加
    ```javascript
    log.addDefaultLog({
        'page' : url,
        'refer' : document.referrer
    });
    log.sendLog({
        'act': 'pv'
    });
    ```
3. 在需要发送log处添加自定义属性，如
    ```html
    <a href="xxx" data-click='{"act":"a_some_act","mod":"content"}' data-log="btn">xxx</a>
    ```

4. 详细nsclick参数标准请参考  
    [NSCLICK上线流程](http://wiki.babel.baidu.com/twiki/bin/view/Ps/OP/NSCLICK%E4%B8%8A%E7%BA%BF%E6%B5%81%E7%A8%8B)  
    [大搜中间页点击日志规范](http://wiki.babel.baidu.com/twiki/pub/Ps/Rank/UbsTopic/Middle_page/%E5%A4%A7%E6%90%9C%E7%B4%A2%E4%B8%AD%E9%97%B4%E9%A1%B5%E7%82%B9%E5%87%BB%E6%97%A5%E5%BF%97%E8%A7%84%E8%8C%83v0.4.pdf)

## API

### Base

`Base` 部分是最基础的语言增强函数，在 `require('saber-lang')` 时加载。

#### .extend( target, ...source )

对象属性拷贝。

#### .inherits( subClass, superClass )

为类型构造器建立继承关系。

#### .curry( fn, ...args )

为函数提前绑定前置参数（[柯里化](http://en.wikipedia.org/wiki/Currying)）。

#### .bind( fn, thisArg, ...args )

为函数绑定this与前置参数。

### Function

`Function` 类的语言增强函数都需要指定完整路径引入，如 `require('saber-lang/function/throttle')`。

#### .throttle( fn, wait [, options] )

函数节流 (忽略指定间隔内的函数调用)

+ `fn` `{Function}` 执行函数
+ `wait` `{number}` 下次执行前需等待的`毫秒`数(即`节流阀值`)
+ `options` `{Object=}` 配置对象
    + `options.leading` `{boolean=}` 是否首次立即执行一次`fn`, 默认`true`
    + `options.trailing` `{boolean=}` 是否停止后延迟执行一次`fn`, 默认`true`
    + `options.context` `{*=}` `fn`执行时的上下文环境, 默认`this`

#### .debounce( fn, wait [, immediate] )

函数去抖 (指定间隔内的调用被延迟到下个间隔执行)

+ `fn` `{Function}` 执行函数
+ `wait` `{number}` 需要延迟等待的间隔(`毫秒`)
+ `immediate` `{boolean=}` 是否延迟启动前先立即调用执行`fn`

#### aspect.mixin( obj )

为指定对象混入`AOP`功能

+ `before`

	```javascript
	obj.before( method, fn[, context] )
	```

	在 `obj` 的 `method` 方法调用前，先调用 `fn` 函数
	
	* `fn` 执行时的 `形参` 与 `obj[ method ]` 的一致
	* `context` 指定时，`fn` 的 `this` 指向 `context`
	* `fn` 返回 `false` 时，`中断`后续的所有调用

+ `after`

	```javascript
	obj.after( method, fn[, context] )
	```

	在 `obj` 的 `method` 方法调用后，调用 `fn` 函数
	
	* `fn` 执行时的 `形参` 与 `obj[ method ]` 的一致
	* `context` 指定时，`fn` 的 `this` 指向 `context`



===

[![Saber](https://f.cloud.github.com/assets/157338/1485433/aeb5c72a-4714-11e3-87ae-7ef8ae66e605.png)](http://ecomfe.github.io/saber/)
