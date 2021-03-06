/**
 * @file main ~ 2014-05-04 11:51:33
 * @author easonyq(wangyisheng@outlook.com)
 * @description
 * saber-log主文件
 */
define(function (require) {

    var lang = require('saber-lang');

    /**
     * 是否已经初始化
     * @type {boolean}
     */
    var isInited = false;
    /**
     * 发送日志的目的地
     * @type {string}
     */
    var LOG_URL = null;

    /**
     * 每次发会附加的参数
     * @type {Object}
     * @private
     */
    var innerDefaultLog =  {};

    /**
     * 记录本次发送的日志数据
     * @type {Object}
     * @private
     */
    var innerLogData = {};

    /**
     * 本次事件的target
     * @type {Node|undefined}
     * @private
     */
    var innerTarget;

    /**
     * 事件
     * @type {Event}
     * @private
     */
    var innerEvent;

    /**
     * 发送日志
     * @param {Object} params 需要发送的参数
     */
    function sendLog(params) {
        var parameters = {};

        lang.extend(parameters, innerDefaultLog);
        lang.extend(parameters, params);

        var tmpUrl = [];
        Object.keys(parameters).forEach(function (key) {
            tmpUrl.push(key + '=' + encodeURIComponent(parameters[key]));
        });
        var url = tmpUrl.join('&');
        var img = new Image();
        img.onload = img.onerror = img.onabort = function () {
            img.onload = img.onerror = img.onabort = null;
            img = null;
        };

        img.src = LOG_URL + url;
    }

    function addLogData(data) {
        if (data) {
            lang.extend(innerLogData, data);
        }
    }

    function clearLogData() {
        innerLogData = {};
    }

    function collectLogData() {
        clearLogData();

        var target = innerTarget;
        /**
         * 本次统计的数据
         */
        var logData = {};
        /**
         * url参数
         */
        var url;
        /**
         * 点击或操作对象
         */
        var item;
        /**
         * 表示此次点击target的类型
         */
        var type;
        /**
         * 匹配data-log值的
         */
        var typeReg = /\b(title|link|img|btn|input|others)\b/i;
        /**
         * 到新页面a[\w+]还是在本页面b[\w+]
         */
        var act = 'b';
        /**
         * 记录xpath
         */
        var path = [];
        var i = 0;
        while (target && target !== document.body) {
            if (target.getAttribute('data-nolog') === '1') {
                // 如果遇到标签或者父标签上有data-nolog属性，则不发送日志
                return false;
            }
            // 添加标签上的data-click数据
            var logStr = target.getAttribute('data-click');
            if (logStr) {
                try {
                    logData = lang.extend({}, JSON.parse(logStr), logData);
                }
                catch (e) {}
            }
            if (target.href) {
                url = target.href;
                type = 'link';
                act = target.getAttribute('target') === '_blank' ? 'a' : act;
            }
            // 如果target上有data-log属性，并且data-log=button, link等，则需要发送统计
            var dataLogAttr = target.getAttribute('data-log');
            if (typeReg.test(dataLogAttr)) {
                type = RegExp.$1.toLowerCase();
            }
            // 如果是个链接，则添加链接 /^a|img|input|button|select|datalist|textarea$/
            var count = 1;
            if (target.previousSibling) {
                var sibling = target.previousSibling;
                do {
                    if (sibling.nodeType === 1
                        && sibling.tagName === target.tagName
                    ) {
                        count++;
                    }
                    sibling = sibling.previousSibling;
                }
                while (sibling);
            }
            path[i++] = target.tagName + (count > 1 ? count : '');
            if (target.getAttribute('data-id')) {
                item = target.getAttribute('data-id');
            }
            target = target.parentNode;
        }
        path.reverse();

        var tag = innerTarget.tagName.toLowerCase();
        if (!type && /^(a|img|input|button|select|datalist|textarea)$/.test(tag)) {
            type = {a: 'link'}[tag] || 'input';
            url = innerTarget.href || innerTarget.src || url;
        }
        if (!type) {
            return false;
        }
        var title;
        if (tag === 'a') {
            title = innerTarget.innerHTML;
        }
        else if (type === 'input') {
            // 如果是表单元素
            if (/input|textarea/.test(tag)) {
                title = innerTarget.value;
                if (innerTarget.type && innerTarget.type.toLowerCase() === 'password') {
                    title = '';
                }
            }
            else if (/select|datalist/.test(tag)) {
                if (innerTarget.children.length > 0) {
                    var index = innerTarget.selectedIndex || 0;
                    title = innerTarget.children[index > -1 ? index : 0].innerHTML;
                }
            }
            else {
                title = innerTarget.innerText || innerTarget.value || '';
            }
        }
        else {
            // 如果是图片，先取其title
            if (tag === 'img') {
                title = innerTarget.title;
            }

            // title为空，遍历父节点
            if (!title) {
                var el = innerTarget;
                while (i > 0) {
                    i--;
                    if (/^a\d*\b/i.test(path[i])) {
                        url = el.href;
                        title = el.innerText;
                        break;
                    }
                    else {
                        if (typeReg.test(el.getAttribute('data-log'))) {
                            title = el.innerText;
                            break;
                        }
                        el = el.parentNode;
                    }
                }
            }
        }
        title && (title = title.trim());
        /**
         * xpath值
         */
        var xpath = path.join('-').toLowerCase() + '(' + type + ')';
        lang.extend(logData, {
            'txt': title || '',
            'xpath': xpath,
            'url': url || '',
            'act': logData['act'] || act
        });
        if (item) {
            logData['item'] = logData['item'] || item;
        }
        addLogData(logData);
        return true;
    }

    /**
     * 事件的handler
     */
    function eventHandler(event) {
        innerEvent = event;
        innerTarget = event.target;

        // 如果collectLogData返回false，则不发送日志
        if (collectLogData() === false) {
            return;
        }
        sendLog(innerLogData);
    }

    function bind() {
        if (isInited) {
            return;
        }
        isInited = true;
        if (LOG_URL == null) {
            LOG_URL = 'http://nsclick.baidu.com/v.gif?';
        }
        document.body.addEventListener('click', eventHandler);
    }

    function unbind() {
        document.body.removeEventListener('click', eventHandler);
    }

    var exports = {
        /**
         * 发送日志
         * @param {Object} param 需要发送的日志内容，会与setDefaultLog的参数合并
         */
        sendLog: sendLog,
        /**
         * 绑定事件
         */
        on: bind,
        /**
         * 解绑事件
         */
        un: unbind,
        /**
         * 添加默认参数
         * @param {Object} data 每次发送都会附带的参数
         */
        setDefaultLog: function (data) {
            lang.extend(innerDefaultLog, data);
        },
        /**
         * 设置发送日志域名
         * @param {string} url 接收日志的域名
         */
        setLogUrl: function (url) {
            LOG_URL = url;
        }
    };

    return exports;
});
