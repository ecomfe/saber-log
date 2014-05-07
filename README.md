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

### .setLogUrl( url )

设置日志发送域名。默认为`http://nsclick.baidu.com/v.gif?`

### .addDefaultLog( options )

设置日志默认参数。这些参数在每次发送时都会被带上，因此常用来设置基本不变的值，例如和应用相关的信息。

options可选值请参考
[大搜中间页点击日志规范](http://wiki.babel.baidu.com/twiki/pub/Ps/Rank/UbsTopic/Middle_page/%E5%A4%A7%E6%90%9C%E7%B4%A2%E4%B8%AD%E9%97%B4%E9%A1%B5%E7%82%B9%E5%87%BB%E6%97%A5%E5%BF%97%E8%A7%84%E8%8C%83v0.4.pdf)  

常用值有：

* `options.fr` `string` 来源，如`ps-zhixin`等
* `options.pid` `string|number` 区分日志id，各产品线参考
[nsclick目前的pid列表](http://wiki.babel.baidu.com/twiki/bin/view/Ps/OP/NSCLICK%E4%B8%8A%E7%BA%BF%E6%B5%81%E7%A8%8B#%E7%9B%AE%E5%89%8D%E7%9A%84pid%E5%88%97%E8%A1%A8%EF%BC%8C%E6%B2%A1%E6%9C%89%E8%A2%AB%E8%AE%B0%E5%BD%95%E4%B8%8D%E8%B4%9F%E8%B4%A3%E7%BB%B4%E6%8A%A4)
* `options.pvid` `string` 记录一次pv的唯一id，一个页面上所有pvid相同，通常取页面载入时的时间戳或由后端提供
* `options.qid` `string` 大搜一次检索唯一标示，用来merge大搜和中间页的点击日志
* `options.page` `string` 当前页面url
* `options.refer` `string` 当前页面访问的referer

### .sendLog( options )

手动发送一条日志。参数`options`会与和`.addDefaultLog`的参数合并，如果相同以`.sendLog`为准。  
常用来发送pv日志。点击日志由属性`data-log`,`data-click`等自行识别发送，不需要手动调用发送。

### .on()

为当前document.body绑定点击(`click`)事件，用以自行识别并发送日志。  
对于普通应用，在新页面载入时调用一次。  
对于单页应用(如`saber`)，全局调用一次即可。  

### .un()

为当前document.body解绑点击(`click`)事件。

## Test

启动测试服务器

    $ node test/server.js

默认端口为`8848`，可以通过参数修改：

    $ node test/server.js 8080

访问`http://localhost:8848/test/runner.html`


===

[![Saber](https://f.cloud.github.com/assets/157338/1485433/aeb5c72a-4714-11e3-87ae-7ef8ae66e605.png)](http://ecomfe.github.io/saber/)
