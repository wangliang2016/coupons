var express             = require('express');
var crypto =require('crypto');
var fs=require('fs');
var router              = express.Router();
var couponTemplateService   = require("../service/couponTemplateService");
var couponsAuth          = require('../security/couponsAuth');

router.post('/addcoupontemplate',couponsAuth.authority,function(req,res){
    var postParams=req.body;
    couponTemplateService.addCouponTemplate(postParams,function(err,msg){
        if(!err){
            var data={};
            data.status=true;
            data.msg="coupons.coupontemplate.addcoupontemplate:success";
            res.send(data);
        }
        else{
            var data={};
            data.status=false;
            data.msg=err;
            res.send(data);
        }
    });
});
router.get('/addcoupontemplate',function(req,res){
    var data={
        templatecode:"09080724",//唯一
        templatecontent:"adidas",
        dateeffective:'2016-10-3',
        dateexpires:'2016-10-8',
        salience:1,//优惠券优先级
        agenttype:1,
        merchantcode:'20020',//发劵信息
        deptcode:null,
        brandcode:null,
        usescope:
        [
            {
                merchantcode:'20020',
                deptcode:'02001',
                brandcode:'001362'
            },
            {
                merchantcode:'20020',
                deptcode:'02001',
                brandcode:'001364'
            },
            {
                merchantcode:'20020',
                deptcode:'02002',
                brandcode:'001364'
            }
        ],
        typecode:0,
        couponvalue:20,
        totalnumber:10000000,
        havedistributed:0,
        templatedescription:".该劵可用于汇金百货的徐汇店" +
            ".该劵不与其他活动共享" +
            ".该优惠券的最终解释权归汇金百货所有" +
            ".使用时间为2016年8月3日的0时0点0分到2016年8月15日的0时0点0分",
        signtype:'rsa-sha1',
        sign:"a1e811d68ed2e02f3a64717108c4639a79f6967ee837ceafccd37fb24034bcc4fd05e28e7d7a666cf53dc4788ab5a1b3ad7fa4f4fccc8e559cc0f683f6c268a757c7232e36031920633aaa5f36df27c1ae0da4004896a8370659a2c5672cdd5d596e2213628986ec40b73a334ead5da0027e652f26d41b2bd52dcc1bc87e277f"
    };

    var postParams=data;
    var sign_type='rsa-sha1';
    couponTemplateService.addCouponTemplate(postParams,function(err,msg){
        if(!err&&msg){
            var data={};
            data.status=true;
            data.msg="coupons.coupontemplate.addcoupontemplate:success:success";
            res.send(data);
        }
        else{
            var data={};
            data.status=false;
            data.msg=err;
            res.send(data);
        }
    });
});
router.post('/modifycoupontemplate',couponsAuth.authority,function(req,res){
    var postParams=req.body;
    couponTemplateService.modifyCouponTemplate(postParams,function(err,msg){
        if(!err){
            var data={};
            data.status=true;
            data.msg="coupons.coupontemplate.modifycoupontemplate:success";
            res.send(data);
        }
        else{
            var data={};
            data.status=false;
            data.msg=err;
            res.send(data);
        }
    });
});
router.get('/modifycoupontemplate',function(req,res){
    var data={
        templatecode:"09080720",//唯一
        templatecontent:"adidas",
        dateeffective:'2016-10-3',
        dateexpires:'2016-10-29',
        salience:1,//优惠券优先级
        agenttype:1,
        merchantcode:'20020',
        deptcode:'02001',
        brandcode:null,
        usescope:
            [
                {
                    merchantcode:'20020',
                    deptcode:'02001',
                    brandcode:'001362'
                },
                {
                    merchantcode:'20020',
                    deptcode:'02001',
                    brandcode:'001364'
                },
                {
                    merchantcode:'20021',
                    deptcode:'02001',
                    brandcode:'001362'
                },
                {
                    merchantcode:'20021',
                    deptcode:'02001',
                    brandcode:'001364'
                },
                {
                    merchantcode:'20021',
                    deptcode:'02002',
                    brandcode:'001364'
                }
            ],
        typecode:0,
        couponvalue:20,
        totalnumber:10000000,
        havedistributed:0,
        templatedescription:".该劵可用于汇金百货的徐汇店" +
        ".该劵不与其他活动共享" +
        ".该优惠券的最终解释权归汇金百货所有" +
        ".使用时间为2016年8月3日的0时0点0分到2016年8月15日的0时0点0分",
        signtype:'rsa-sha1',
        sign:"a1e811d68ed2e02f3a64717108c4639a79f6967ee837ceafccd37fb24034bcc4fd05e28e7d7a666cf53dc4788ab5a1b3ad7fa4f4fccc8e559cc0f683f6c268a757c7232e36031920633aaa5f36df27c1ae0da4004896a8370659a2c5672cdd5d596e2213628986ec40b73a334ead5da0027e652f26d41b2bd52dcc1bc87e277f"
    };
    var postParams=data;
    couponTemplateService.modifyCouponTemplate(postParams,function(err,msg){
        if(!err){
            var data={};
            data.status=true;
            data.msg="coupons.coupontemplate.modifycoupontemplate:success";
            res.send(data);
        }
        else{
            var data={};
            data.status=false;
            data.msg=err;
            res.send(data);
        }
    });
});
router.post('/getcoupontemplate',couponsAuth.authority,function(req,res){
    var postParams=req.body;
    var templateCode=postParams.templatecode;
    var merchantCode=postParams.merchantcode;
    var sign_type=postParams.sign_type;
    couponTemplateService.getCouponTemplate(templateCode,merchantCode,function(err,msg){
        if(!err){
            var data=msg;
            data['status']=true;
            data['msg']="coupon.coupontemplate.getcoupontemplate:success";
            var key=fs.readFileSync('../security/keys/server_private.key').toString();
            var sig=couponsAuth.getSign(key,sign_type,data);
            data.sign=sig;
            data.sign_type=sign_type;
            res.send(data);
        }else{
            var data={};
            data.status=false;
            data.msg=err;
            res.send(data);
        }
    })
});
router.get('/getcoupontemplate',function(req,res){
    var data=
    {
        templatecode: "09080720",
        merchantcode:"20020",
        sign_type:'RSA-SHA1'
    };
    var postParams=data;
    var templateCode=postParams.templatecode;
    var merchantCode=postParams.merchantcode;
    var sign_type=postParams.sign_type;
    couponTemplateService.getCouponTemplate(templateCode,merchantCode,function(err,msg){
        if(!err){
            var data=msg;
            data['status']=true;
            data['msg']="coupon.coupontemplate.getcoupontemplate:success";
            var key=fs.readFileSync('../security/keys/server_private.key').toString('ascii');
            var sig=couponsAuth.getSign(key,sign_type,data);
            data.sign=sig;
            data.sign_type=sign_type;
            res.send(data);
        }else{
            var data={};
            data.status=false;
            data.msg=err;
            res.send(data);
        }
    })
});
router.post('/delcoupontemplate',couponsAuth.authority,function(req,res){
    //检测该优惠券是否已经发放，若已经发放则不能删除
    var postParams=req.body;
    var templateCode=postParams.templatecode;
    var merchantCode=postParams.merchantcode;
    couponTemplateService.delCouponTemplate(templateCode,merchantCode,function(err,msg){
        if(!err){
            var data={};
            data.status=true;
            data.msg="coupons.coupontemplate.delcoupontemplate:success:success";
            res.send(data);
        }else{
            var data={};
            data.status=false;
            data.msg=err;
            res.send(data);
        }
    })
})
router.get('/delcoupontemplate',function(req,res){
    //检测该优惠券是否已经发放，若已经发放则不能删除
    var data=
    {
        templatecode: "09080724",
        merchantcode: "20020"
    };
    var postParams=data;
    var templateCode=postParams.templatecode;
    var merchantCode=postParams.merchantcode;
    couponTemplateService.delCouponTemplate(templateCode,merchantCode,function(err,msg){
        if(!err){
            var data={};
            data.status=true;
            data.msg="coupons.coupontemplate.delcoupontemplate:success:success";
            res.send(data);
        }else{
            var data={};
            data.status=false;
            data.msg=err;
            res.send(data);
        }
    })
});
router.post('/querycoupontemplate',couponsAuth.authority,function(req,res){
    var postParams=req.body;
    var queryAttributes=postParams.attributes;
    var queryCondition=postParams.condition;
    var merchantCode=postParams.merchantcode;
    var sign_type=postParams.sign_type;
    if(queryAttributes==null||queryAttributes.length==0){
        var data={};
        data.status=false;
        data.msg="没有告诉要查询的属性值";
        res.send(data);
        return;
    }
    couponTemplateService.queryEffectiveTemplate(queryAttributes,queryCondition,merchantCode,function(err,msg){
        if(!err){
            var data={};
            data['templateinfos']=msg;
            data['status']=true;
            data['msg']="coupon.coupontemplate.querycoupontemplate:success";
            var key=fs.readFileSync('../security/keys/server_private.key').toString('ascii');
            var sig=couponsAuth.getSign(key,sign_type,data);
            data.sign=sig;
            data.sign_type=sign_type;
            res.send(data);
        }else{
            var data={};
            data.status=false;
            data.msg=err;
            res.send(data);
        }
    })

});
router.get('/querycoupontemplate',function(req,res){
    var date=new Date();
    var data= {
        attributes: [
            'templateid',
            'templatecode',
            'merchantcode',
        ],
        condition: {
            //dateexpires:{
            //    comp:3,
            //    date:date
            //},
            usescope: true
        },
        merchantcode:'20020',
        sign_type:"RSA-SHA1"
    };
    var postParams=data;
    var queryAttributes=postParams.attributes;
    var queryCondition=postParams.condition;
    var merchantCode=postParams.merchantcode;
    var sign_type=postParams.sign_type;
    if(queryAttributes==null||queryAttributes.length==0){
        var data={};
        data.status=false;
        data.msg="没有告诉要查询的属性值";
        res.send(data);
        return;
    }
    couponTemplateService.queryEffectiveTemplate(queryAttributes,queryCondition,merchantCode,function(err,msg){
        if(!err){
            var data={};
            data['templateinfos']=msg;
            data['status']=true;
            data['msg']="coupon.coupontemplate.queryEffectiveTemplate:success";
            var key=fs.readFileSync('../security/keys/server_private.key').toString('ascii');
            var sig=couponsAuth.getSign(key,sign_type,data);
            data.sign=sig;
            data.sign_type=sign_type;
            res.send(data);
        }else{
            var data={};
            data.status=false;
            data.msg=err;
            res.send(data);
        }
    })

});
module.exports = router;
