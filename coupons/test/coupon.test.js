var expect = require('chai').expect;
var should = require('should');
var request= require('superagent');
var crypto =require('crypto');
var fs = require('fs');
var cert = fs.readFileSync('../security/keys/coupons_server.crt');
var couponsAuth          = require('../security/couponsAuth');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('coupon',function(){
    var coupon = request.agent({rejectUnauthorized: false});
    var baseUrl="https://localhost:7001/couponinstance/"
    describe('distributecoupon',function(){
        var data={
            "usercode":'000000',
            "templatecode": "09080720",//该劵对应的类型  优惠券的id
            "templatemerchantcode":"20020",
            "merchantcode": '20020',
            "usermerchantcode":"20020",
            "num":1
        };
        var sign_type="RSA-SHA1";
        var key=fs.readFileSync('../test/testclient/client.key').toString('ascii');
        var sig=couponsAuth.getSign(key,sign_type,data);
        console.log(sig);
        data.sign=sig;
        data.sign_type='RSA-SHA1';
        it('should successfully return add item information',function(done){
            coupon
                .post(baseUrl+'distributecoupon')
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