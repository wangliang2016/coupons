var expect = require('chai').expect;
var should = require('should');
var request= require('superagent');
var crypto =require('crypto');
var fs = require('fs');
var cert = fs.readFileSync('../security/keys/coupons_server.crt');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('couponType',function(){
    var couponType = request.agent({rejectUnauthorized: false});
    var baseUrl="https://localhost:5001/couponType/"
    describe('addCouponType',function(){
        var content={
            RULECODE:"09080700",
            RULECONTENT:"adidas",
            DATEEFFECTIVE:'2016-10-3',
            DATEEXPIRES:'2016-10-8',
            SALIENCE:1,
            DEPTCODE:'10201 10202',
            BRANDCODE:'001362 110457 008962',
            TYPECODE:'0',
            RULEBASE:100,
            RULEVALUE:20,
            RULEJSON:'{"RULEVALUE":20,"RULEBASE":100}',
            RULESCRIPT:
            'rule ecouponreduce1976348637903'+
            'date-effective "2016-09-01 00:00:00"'+
            'date-expires "2016-09-15 23:59:59"'+
            'salience 9'+
            'no-loop true'+
            'when'+
            '$itemlist: ItemList(flag == 1, ecouponString matches ".*1976348637903.*")'+
            'then'+
            '$itemlist.ecouponreduce("1976348637903", 100, 20, "000008");'+
            'end',
            RULEOBJ:'000001',
            TOTALNUMBER:10000000,
            HAVEDISTRIBUTED:0,
            STYLETEMPLATE:'1',
            WHETHERHISTORY:'1',
            RULEDESCRIPT:".该劵可用于汇金百货的徐汇店" +
            ".该劵不与其他活动共享" +
            ".该优惠券的最终解释权归汇金百货所有" +
            ".使用时间为2016年8月3日的0时0点0分到2016年8月15日的0时0点0分",
            WHETHERONLINE:1
        };
        var biz_content=content;
        var key=fs.readFileSync('../test/testclient/client.key').toString('ascii');
        var signn=crypto.createSign('RSA-SHA1');
        signn.update(JSON.stringify(biz_content));
        var sig=signn.sign(key,'hex');
        var token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyZXN1bHQiOnRydWUsInVzZXIiOnsidXNlcmlkIjoxLCJyb2xlIjowfSwiZXhwIjoxNDc2Mjg2MDg5NDY3fQ.mvIKLqkYAzEUd3kTb8aoSKXkBD_wWnvp7sKcGXpogk4";
        var data={};
        data.sign=sig;
        data.biz_content=biz_content;
        data.userid=1;
        data.sign_type='RSA-SHA1';
        data.token=token;
        it('should successfully return add item information',function(done){
            couponType
                .post(baseUrl+'addCouponType')
                .ca(cert)
                .send(data)
                .end(function(err,res){
                    if(err) throw err;
                    res.status.should.equal(200);
                    res.text.should.containEql('success');
                    done();
                })
        })
    })
})