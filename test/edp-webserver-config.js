/**
 * @file edp-webserver-config ~ 2014-05-05 11:06:19
 * @author easonyq(wangyisheng@outlook.com)
 * @description
 * description
 */
var fs = require('fs');
var LOG_FILE = '.saber.log';

exports.port = 8848;
exports.documentRoot = __dirname;
exports.getLocations = function() {
    return [{
        location: /v\.gif/,
        handler: function(context) {
            if (fs.existsSync(LOG_FILE)) {
                fs.unlinkSync(LOG_FILE);
            }
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
                var arr = fs.readFileSync(LOG_FILE).trim().split('\n');
                for (var i in arr) {
                    if (arr[i].indexOf(type) != -1) {
                        context.status = 200;
                        context.content = arr[i];
                        break;
                    }
                }
            }
        }
    }]
}

exports.injectResource = function ( res ) {
    for ( var key in res ) {
        global[ key ] = res[ key ];
    }
};