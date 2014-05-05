/**
 * @file log.spec ~ 2014-05-04 14:55:31
 * @author easonyq(wangyisheng@outlook.com)
 * @description
 * saber-log test
 */

define(function() {
    var logger = require('saber-log');
    var ajax = require('saber-ajax');

    // 设置默认参数
    logger.setLogUrl('http://localhost:8848/v.gif?');
    var pvid = (new Date()).getTime().toString();
    logger.addDefaultLog({
        'fr' : 'saber-log-test',
        'pvid' : pvid,
        'pid' : '0',
        'page' : 'saber-log-test-page'
    });

    // 绑定文档
    logger.on();

    // 发送pv日志
    logger.sendLog({
        'act': 'pv'
    });

    // 代码触发click事件，发送click日志
    var a = document.getElementById('testLink');
    if (a.click && (typeof a.click == 'function')) {
        a.click();
    } else {
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click",true,true);   
        a.dispatchEvent(evt);
    }

    // 把log从url格式转化为obj
    function processLog(log) {
        var param = log.substring(log.indexOf('?') + 1, log.length);
        var arr = param.split('&');
        var result = {};
        for (var index in arr) {
            var tmp = arr[index].split('=');
            if (tmp[1].length != 0) {
                result[tmp[0]] = decodeURIComponent(tmp[1]);
            }
        }
        return result;
    }

    describe('pvLog', function() {
        var log;
        beforeEach(function(done) {
            ajax.get('/getLog?type=pv').then(function(data) {
                log = processLog(data);
                done();
            });
        });

        it('correctness', function() {
            expect(log).toEqual({
                'act' : 'pv',
                'fr' : 'saber-log-test',
                'page' : 'saber-log-test-page',
                'pid' : '0',
                'pvid' : pvid
            });
        });
    });

    describe('clickLog', function() {
        var log;
        beforeEach(function(done) {
            ajax.get('/getLog?type=click').then(function(data) {
                log = processLog(data);
                done();
            });
        });

        it('correctness', function() {
            // expect(true).toBe(true);
            expect(log).toEqual({
                'act' : 'b_test',
                'fr' : 'saber-log-test',
                'page' : 'saber-log-test-page',
                'pid' : '0',
                'pvid' : pvid,
                'mod' : 'test',
                'xpath' : 'ul-li4-a(btn)',
                'url' : 'http://localhost:8848/test/runner.html#',
                'txt' : 'Click Here!'
            });
        });
    });
}) 
