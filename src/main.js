/**
 * @file main ~ 2014-05-04 11:51:33
 * @author easonyq(wangyisheng@outlook.com)
 * @description
 * saber-log主文件
 */
define(function() {

    var lang = require('saber-lang');
    // fix for 300ms delay
    require('saber-tap').mixin(document.body);

    /**
     * 是否已经初始化
     * @type {Boolean}
     */
    var isInited = false;
    /**
     * 发送日志的目的地
     * @type {String}
     */
    var LOG_URL = 'http://nsclick.baidu.com/v.gif?';

    /**
     * 每次发会附加的参数
     * @type {Object}
     * @private
     */
    var _defaultLog = { }; 

    /**
     * 记录本次发送的日志数据a
     * @type {Object}
     * @private
     */
    var _logData = { };

    /**
     * 本次事件的target
     * @type {Node|undefined}
     * @private
     */
    var _target;

    /**
     * 事件
     * @type {Event}
     * @private
     */
    var _event;

    function parseJSON(str) {
        return (new Function('return (' + str + ')'))();
    }

    /**
     * 发送日志
     * @param {Object} params 需要发送的参数
     */
    function sendLog(params) {
        var parameters = {};

        lang.extend(parameters, _defaultLog);
        lang.extend(parameters, params);

        var tmpUrl = [];
        for (var key in parameters) {
            tmpUrl.push(key + '=' + encodeURIComponent(parameters[key]));
        }
        var url = tmpUrl.join('&');
        var img = new Image();
        // 挂在window下的变量不会在切换页面时被销毁，降低发送失败率。
        var key = 'saber_log'
            + Math.floor(Math.random() * 2147483648).toString(36);
        window[key] = img;
        img.onload = img.onerror = img.onabort = function() {
            img.onload = img.onerror = img.onabort = null;
            window[key] = null;
            img = null;
        };

        img.src = LOG_URL + url;
    }

    function addLogData(data) {
        if(data) {
            lang.extend(_logData, data);
        }
    }

    function clearLogData() {
        _logData = { };
    }

    function collectLogData() {
        clearLogData();

        var target = _target;
        /**
         * 本次统计的数据
         */
        var logData = {};
        /**
         * url参数
         */
        var url;
        /**
         * Item数据，即商品的id
         */
        var item;
        /**
         * 匹配商品的id
         */
        var itemReg = /\bid=(\d+)\b/i;
        /**
         * 表示是否需要发送统计
         */
        var nolog = true;
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

        var path = [];
        var i = 0;
        while(target && target !== document.body) {
            if (target.getAttribute('data-nolog') === '1') {
                // 如果遇到标签或者父标签上有data-nolog属性，则不发送日志
                return false;
            }

            // 添加标签上的data-click数据
            logStr = target.getAttribute('data-click');
            if(logStr) {
                try {
                    logData = lang.extend({}, parseJSON(logStr), logData);
                } 
                catch(e) {}
            }

            if(target.href) {
                url = target.href;
                type = 'link';
                act = target.getAttribute('target') === '_blank' ? 'a' : act;
            }

            // 如果target上有data-log属性，并且data-log=button, link等，则需要发送统计
            var dataLogAttr = target.getAttribute('data-log')
            if(typeReg.test(dataLogAttr)) {
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

            try {
                if(target.getAttribute('data-id')) {
                    item = target.getAttribute('data-id');
                }
            }
            catch(e) { }

            target = target.parentNode;
        }

        if(!nolog) {
            return false;
        }

        path.reverse();

        var tag = _target.tagName.toLowerCase();
        if (!type && /^a|img|input|button|select|datalist|textarea$/.test(tag)) {
            type = {a: 'link'}[tag] || 'input';

            url = _target.href || _target.src || url;
        }

        if (!type) {
            return false;
        }

        var title = '';

        // 如果是表单元素
        if(type === 'input') {
            if(/input|textarea/.test(tag)) {
                title = _target.value;
                if(_target.type && _target.type.toLowerCase() === 'password') {
                    title = '';
                }
            }
            else if (/select|datalist/.test(tag)) {
                if(_target.children.length > 0) {
                    var index = _target.selectedIndex || 0;
                    title = _target.children[index > -1 ? index : 0].innerHTML;
                }
            }
            else {
                title = _target.innerText || _target.value || '';
            }
        }
        else {
            // 如果是图片，先取其title
            if (tag === 'img') {
                title = _target.title;
            }

            // title为空，遍历父节点
            if (!title) {
                var el = _target;
                while (i > 0) {
                    i--;
                    if (/^a\d*\b/i.test(path[i])) {
                        url = el.href;
                        title = el.innerText;
                        break;
                    }
                    else {
                        if(typeReg.test(el.getAttribute('data-log'))) {
                            title = el.innerText;
                            break;
                        }
                        el = el.parentNode;
                    }
                }
            }
        }
        title = title.trim();

        /**
         * xpath值
         */
        var xpath = path.join('-').toLowerCase() + '(' + type + ')';

        if(url) {
            item = itemReg.test(url) ? RegExp.$1 : '';
        }

        lang.extend(logData, {
            'txt': title,
            'xpath': xpath,
            'url': url || '',
            'act': logData['act'] || act
        });
        if(item) {
            logData['item'] = logData['item'] || item;
        }

        addLogData(logData);
        return true;

    }

    /**
     * 事件的handler
     */
    function _eventHandler(event) {
        _event = event;
        _target = event.target;

        // 如果collectLogData返回false，则不发送日志
        if(collectLogData() === false) {
            return;
        }

        sendLog(_logData);
    }

    function bind() {
        if (isInited) {
            return;
        }
        isInited = true;
        document.body.addEventListener('click', _eventHandler);
    }

    function unbind() {
        document.body.removeEventListener('click', _eventHandler);
    }

    var exports = {
        /**
         * 发送日志
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
         * @param {Object} data
         */
        addDefaultLog: function(data) {
            lang.extend(_defaultLog, data);
        }
    };

    return exports;
});