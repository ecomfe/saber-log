saber-log [![Build Status](https://travis-ci.org/ecomfe/saber-log.png)](https://travis-ci.org/ecomfe/saber-log)
===

saber框架监控日志模块

## Installation

通过 [edp](https://github.com/ecomfe/edp) 引入模块：

```sh
edp import saber-log
```

## Usage

```js
var logger = require('saber-log');

// 设置日志地址
logger.setLogUrl('xxxx');
// 发送日志
logger.sendLog({name: 'helloworld'});
```

## API

### Methods

#### setLogUrl(url)

设置日志发送域名。

* **url** `{string}` URL

#### setDefaultLog(options)

设置日志默认参数。这些参数在每次发送时都会被带上，因此常用来设置基本不变的值，例如和应用相关的信息

* **options** `{Object}` 日志参数

#### sendLog(options)

手动发送一条日志。参数`options`会与和`.setDefaultLog`的参数合并，如果相同以`.sendLog`为准。常用来发送pv日志。点击日志由属性`data-log`,`data-click`等自行识别发送，不需要手动调用发送

* **options** `{Object}` 日志参数

#### on()

为当前document.body绑定点击(`click`)事件，用以自行识别并发送日志。对于普通应用，在新页面载入时调用一次。对于单页应用(如`saber`)，全局调用一次即可

#### un()

为当前document.body解绑点击(`click`)事件。

## Test

启动测试服务器

    $ node test/server.js

默认端口为`8848`，可以通过参数修改：

    $ node test/server.js 8080

访问`http://localhost:8848/test/runner.html`
