/**
 * @file edp-webserver-config ~ 2014-05-05 11:06:19
 * @author easonyq(wangyisheng@outlook.com)
 * @description
 * description
 */
var fs = require('fs');
var LOG_FILE = __dirname + '\\.saber.log';
if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE);
}

exports.port = 8848;
exports.documentRoot = __dirname + '\\..\\';
exports.getLocations = function() {
    return [{
        location: /v\.gif/,
        handler: function(context) {
            // /v.gif?a=1&b=2
            fs.appendFileSync(LOG_FILE, context.request.url + '\n');
        }
    }, {
        location: /getLog\?type=/,
        handler: function(context) {
            if (!fs.existsSync(LOG_FILE)) {
                context.status = 500;
            } else {
                var type = context.request.url.match(/getLog\?type=(.+)/)[1];
                var arr = fs.readFileSync(LOG_FILE).toString('utf-8').trim().split('\n');
                var pvLog, clickLog;
                // 读最后两条
                if (arr[arr.length - 1].indexOf('act=pv') != -1) {
                    pvLog = arr[arr.length - 1];
                    clickLog = arr[arr.length - 2];
                } else {
                    pvLog = arr[arr.length - 2];
                    clickLog = arr[arr.length - 1];
                }
                context.status = 200;
                context.content = (type == 'pv' ? pvLog : clickLog);
            }
        }
    }, { 
        location: /^.*$/, 
        handler: [
            file(),
            proxyNoneExists()
        ]
    }]
}

exports.injectResource = function ( res ) {
    for ( var key in res ) {
        global[ key ] = res[ key ];
    }
};