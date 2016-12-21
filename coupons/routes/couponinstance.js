var express             = require('express');
var async   =require('async');
var crypto =require('crypto');
var fs=require('fs');
var router              = express.Router();
var generalService        =require('../service/generalService');
var couponInstanceService   = require("../service/couponInstanceService");
var couponTemplateService   = require("../service/couponTemplateService");
var couponsAuth          = require('../security/couponsAuth');
var userDAO        =require('../dao/userDAO');

router.post('/distributecoupon',couponsAuth.authority,function(req,res){
    var postParams=req.body;
    var whetherExceed=false;
    var sign_type=postParams.sign_type;
    var templateCode=postParams.templatecode;
    var templateMerchantCode=postParams.templatemerchantcode;
    var merchantCode=postParams.merchantcode;
    var userCode=postParams.usercode;
    var userMerchantCode=postParams.merchantcode;
    var status=postParams.status;
    var num=postParams.num;
    if(num<=0){
        var data={};
        data.status=false;
        data.msg="优惠券的数量不能低于1";
        res.send(data);
        return;
    }
    async.waterfall([
        function(icb){
            userDAO.queryOne({
                attributes: ['USERID'],
                where: {'MERCHANTCODE': merchantCode}
            }, function (err, msg) {
                if (!err && msg) {
                    userid = msg.USERID;
                    icb(null, userid);
                }else{
                    icb(err,null);
                }
            });
        },
        function (userid,icb) {
            //检测该调用者是否具有发劵权限，1有发放的个数，2merchantcode必须属于usescope中的
            couponTemplateService.getCouponTemplate(templateCode, templateMerchantCode,function (err, msg) {
                if (!err && msg) {
                    var notDistr=parseInt(msg.TOTALNUMBER)-parseInt(msg.HAVEDISTRIBUTED);
                    if (notDistr >=num) {
                        if(msg.USESCOPE!=null){
                            var merchantCodes=[];
                            for(var i=0;i<msg.USESCOPE.length;i++){
                                merchantCodes.push(msg.USESCOPE[i].MERCHANTCODE);
                            }
                            if(merchantCodes.indexOf(merchantCode)!=-1){
                                icb(null,msg,userid);
                            }else{
                                icb("您无权发放该劵，即您不在该劵的使用范围",null);
                            }
                        }else{
                            icb("该劵没有设置使用范围，所以您无权发放该劵",null);
                        }
                    } else {
                        whetherExceed=true;
                        icb("Sorry，剩余劵数目少于需要发放的劵数目", null);
                    }
                } else {
                    icb("Sorry,您输入的templatecode存在错误", null);
                }
            })
        },
        function(coupon,userid,icb){
            couponInstanceService.addCouponInstance(coupon,userCode,userMerchantCode,userid,num,status,function(err,msg) {
                icb(err,msg)
            });
        }
    ],function(err,msg){
        if(!err){
            var data={};
            data.status=true;
            data.msg="coupon.couponinstance.distributecoupon:success";
            data.whetherexceed=whetherExceed;
            data.couponinfo=msg;
            var key=fs.readFileSync('../security/keys/server_private.key').toString('ascii');
            var sig=couponsAuth.getSign(key,sign_type,data);
            data.sign=sig;
            data.sign_type=sign_type;
            res.send(data);
        }else{
            var data={};
            data.status=false;
            data.whetherexceed=whetherExceed;
            data.msg=err;
            res.send(data);
        }
    })

});
router.get('/distributecoupon',function(req,res){
   var data ={
        "usercode":'000000',
        "templatecode": "09080720",//该劵对应的类型  优惠券的id
        "templatemerchantcode":"20020",
        "merchantcode": '20020',
        "usermerchantcode":"20020",
        "num":1,
        "activationtime":3600,
        "status":2,
        "sign_type":'RSA-SHA1'
    }
    var postParams=data;
    var whetherExceed=false;
    var sign_type=postParams.sign_type;
    var templateCode=postParams.templatecode;
    var templateMerchantCode=postParams.templatemerchantcode;
    var merchantCode=postParams.merchantcode;
    var userCode=postParams.usercode;
    var userMerchantCode=postParams.usermerchantcode;
    var activationTime=null;
    var status=postParams.status;
    if(postParams.activationtime!=null){
        if(generalService.isNumber(postParams.activationtime)){
            activationTime=postParams.activationtime;
        }else{
            activationTime=null;
        }
    }
    var num=postParams.num;
    if(num<=0){
        var data={};
        data.status=false;
        data.msg="优惠券的数量不能低于1";
        res.send(data);
        return;
    }
    async.waterfall([
        function(icb){
            userDAO.queryOne({
                attributes: ['USERID'],
                where: {'MERCHANTCODE': merchantCode}
            }, function (err, msg) {
                if (!err && msg) {
                    userid = msg.USERID;
                    icb(null, userid);
                }else{
                    icb(err,null);
                }
            });
        },
        function (userid,icb) {
            //检测该调用者是否具有发劵权限，1有发放的个数，2merchantcode必须属于usescope中的
            couponTemplateService.getCouponTemplate(templateCode, templateMerchantCode,function (err, msg) {
                if (!err && msg) {
                    var notDistr=parseInt(msg.TOTALNUMBER)-parseInt(msg.HAVEDISTRIBUTED);
                    if (notDistr >=num) {
                        if(msg.USESCOPE!=null){
                            var merchantCodes=[];
                            for(var i=0;i<msg.USESCOPE.length;i++){
                                merchantCodes.push(msg.USESCOPE[i].MERCHANTCODE);
                            }
                            if(merchantCodes.indexOf(merchantCode)!=-1){
                                icb(null,msg,userid);
                            }else{
                                icb("您无权发放该劵，即您不在该劵的使用范围",null);
                            }
                        }else{
                            icb("该劵没有设置使用范围，所以您无权发放该劵",null);
                        }
                    } else {
                        whetherExceed=true;
                        icb("Sorry，剩余劵数目少于需要发放的劵数目", null);
                    }
                } else {
                    icb("Sorry,您输入的templatecode存在错误", null);
                }
            })
        },
        function(coupon,userid,icb){
            couponInstanceService.addCouponInstance(coupon,templateMerchantCode,userCode,userMerchantCode,userid,num,activationTime,status,function(err,msg) {
                icb(err,msg)
            });
        }
    ],function(err,msg){
        if(!err){
            var data={};
            data.status=true;
            data.msg="coupon.couponinstance.distributecoupon:success";
            data.whetherexceed=whetherExceed;
            data.couponinfo=msg;
            var key=fs.readFileSync('../security/keys/server_private.key').toString('ascii');
            var sig=couponsAuth.getSign(key,sign_type,data);
            data.sign=sig;
            data.sign_type=sign_type;
            res.send(data);
        }else{
            var data={};
            data.status=false;
            data.whetherexceed=whetherExceed;
            data.msg=err;
            res.send(data);
        }
    })
});

router.post('/usecoupon',couponsAuth.authority,function(req,res){
    var postParams=req.body;
    var couponCodes=postParams.couponcodes;
    var useMerchantCode=postParams.merchantcode;
    var useDeptCode=postParams.deptcode;
    var useBrandCode=postParams.brandcode;
    //检couponids是否为数组
    if((couponCodes instanceof Array)==false){
        var data={};
        data.status=false;
        data.msg="传入的参数couponids一定要是数组";
        res.send(data);
    }
    //检测couponids不能为空
    if(couponCodes==null||(couponCodes.length==0)){
        var data={};
        data.status=false;
        data.msg="使用的优惠券不能为空";
        res.send(data);
    }

    var usercode=postParams.usercode;
    var merchantcode=postParams.merchantcode;
    var deptcode=postParams.deptcode;
    var brandcode=postParams.brandcode;
    //检测使用地点和时间是否在使用范围内
    //检测req中的usercode和查询得到的usercode是否一致

    //事务级别的将整组优惠券修改
    couponInstanceService.getCouponInstanceTotalInfo(couponCodes,function(err,msg){
        if(!err&&msg) {
            var couponsInfo=msg;
            var status=true;
            for (var i = 0; i < msg.length; i++) {
                if(status==true){
                    couponInstanceService.checkUseAuthority(merchantcode, deptcode, brandcode, usercode, couponsInfo[i], function (err, msg) {
                        if (err) {
                            var data = {};
                            data.status = false;
                            data.msg = err;
                            res.send(data);
                            status=false;
                        }
                    })
                }else{
                    break;
                }
            }
            if(status==true){
                couponInstanceService.modifyCouponUseStatus(couponCodes,useMerchantCode,useDeptCode,useBrandCode,function(err,msg){
                    if(!err){
                        var data={};
                        data.status=true;
                        data.msg="coupon.couponinstance.usecoupon:success";
                        res.send(data);
                    }else{
                        var data = {};
                        data.status = false;
                        data.msg = err;
                        res.send(data);
                    }
                })
            }
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
});
router.get('/usecoupon',function(req,res){
    var postParams= {
            usercode:'0530' ,
            couponcodes: [{
                couponcode:"09080720160921161155APAELP6",
                frommerchantcode:'20020'
            }],//该劵对应的优惠券couponid
            merchantcode: '20020',
            deptcode: '02001',
            brandcode: ['001364']
        };

    var couponCodes=postParams.couponcodes;
    var useMerchantCode=postParams.merchantcode;
    var useDeptCode=postParams.deptcode;
    var useBrandCode=postParams.brandcode;
    //检couponids是否为数组
    if((couponCodes instanceof Array)==false){
        var data={};
        data.status=false;
        data.msg="传入的参数couponcodes一定要是数组";
        res.send(data);
    }
    //检测couponids不能为空
    if(couponCodes==null||(couponCodes.length==0)){
        var data={};
        data.status=false;
        data.msg="使用的优惠券不能为空";
        res.send(data);
    }

    var usercode=postParams.usercode;
    var merchantcode=postParams.merchantcode;
    var deptcode=postParams.deptcode;
    var brandcode=postParams.brandcode;
    //检测使用地点和时间是否在使用范围内
    //检测req中的usercode和查询得到的usercode是否一致

    //事务级别的将整组优惠券修改
    couponInstanceService.getCouponInstanceTotalInfo(couponCodes,function(err,msg){
        if(!err&&msg) {
            var couponsInfo=msg;
            var status=true;
            for (var i = 0; i < msg.length; i++) {
                if(status==true){
                    couponInstanceService.checkUseAuthority(merchantcode, deptcode, brandcode, usercode, couponsInfo[i], function (err, msg) {
                        if (err) {
                            var data = {};
                            data.status = false;
                            data.msg = err;
                            res.send(data);
                            status=false;
                        }
                    })
                }else{
                    break;
                }
            }
            if(status==true){
                couponInstanceService.modifyCouponUseStatus(couponCodes,useMerchantCode,useDeptCode,useBrandCode,function(err,msg){
                    if(!err){
                        var data={};
                        data.status=true;
                        data.msg="coupon.couponinstance.usecoupon:success";
                        res.send(data);
                    }else{
                        var data = {};
                        data.status = false;
                        data.msg = err;
                        res.send(data);
                    }
                })
            }
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
});

router.post('/activecoupon',couponsAuth.authority,function(req,res){
    var postParams=req.body;
    var couponCodes=postParams.couponcodes;
    //检couponids是否为数组
    if((couponCodes instanceof Array)==false){
        var data={};
        data.status=false;
        data.msg="传入的参数couponids一定要是数组";
        res.send(data);
    }
    //检测couponids不能为空
    if(couponCodes==null||(couponCodes.length==0)){
        var data={};
        data.status=false;
        data.msg="使用的优惠券不能为空";
        res.send(data);
    }

    var usercode=postParams.usercode;
    var originusercode=postParams.originusercode;
    var merchantcode=postParams.merchantcode;
    //检测使用地点和时间是否在使用范围内
    //检测req中的usercode和查询得到的usercode是否一致

    //事务级别的将整组优惠券修改

    couponInstanceService.getCouponInstanceTotalInfo(couponCodes,function(err,msg){
        if(!err&&msg) {
            var couponsInfo=msg;
            var status=true;
            for (var i = 0; i < msg.length; i++) {
                if(status==true){
                    couponInstanceService.checkActiveAuthority(originusercode, couponsInfo[i], function (err, msg) {
                        if (err) {
                            var data = {};
                            data.status = false;
                            data.msg = err;
                            res.send(data);
                            status=false;
                        }
                    })
                }else{
                    break;
                }
            }
            if(status==true){
                couponInstanceService.activeCouponInstance(couponCodes,function(err,msg){
                    if(!err){
                        var data={};
                        data.status=true;
                        data.msg="coupon.couponinstance.activecoupon:success";
                        res.send(data);
                    }else{
                        var data = {};
                        data.status = false;
                        data.msg = err;
                        res.send(data);
                    }
                })
            }
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
});
router.get('/activecoupon',function(req,res){
    var data={
        "usercode":"15317785464",
        "originusercode":"oe94fuOYjOApffY9v7ZJ4rRtCLLo",
        "couponcodes":["2002009080724161105000038T9UAAA6"],
        "merchantcode":"20020",
        "sign_type":"RSA-SHA1"
    }
    var postParams=data;
    var couponCodes=postParams.couponcodes;
    //检couponids是否为数组
    if((couponCodes instanceof Array)==false){
        var data={};
        data.status=false;
        data.msg="传入的参数couponids一定要是数组";
        res.send(data);
    }
    //检测couponids不能为空
    if(couponCodes==null||(couponCodes.length==0)){
        var data={};
        data.status=false;
        data.msg="使用的优惠券不能为空";
        res.send(data);
    }

    var usercode=postParams.usercode;
    var originusercode=postParams.originusercode;
    var merchantcode=postParams.merchantcode;
    //检测使用地点和时间是否在使用范围内
    //检测req中的usercode和查询得到的usercode是否一致

    //事务级别的将整组优惠券修改

    couponInstanceService.getCouponInstanceTotalInfo(couponCodes,function(err,msg){
        if(!err&&msg) {
            var couponsInfo=msg;
            var status=true;
            for (var i = 0; i < msg.length; i++) {
                if(status==true){
                    couponInstanceService.checkActiveAuthority(originusercode, couponsInfo[i], function (err, msg) {
                        if (err) {
                            var data = {};
                            data.status = false;
                            data.msg = err;
                            res.send(data);
                            status=false;
                        }
                    })
                }else{
                    break;
                }
            }
            if(status==true){
                couponInstanceService.activeCouponInstance(couponCodes,function(err,msg){
                    if(!err){
                        var data={};
                        data.status=true;
                        data.msg="coupon.couponinstance.activecoupon:success";
                        res.send(data);
                    }else{
                        var data = {};
                        data.status = false;
                        data.msg = err;
                        res.send(data);
                    }
                })
            }
        }else{
            if(!err&&!msg){
                var data = {};
                data.status = false;
                data.msg = "所给的couponcode存在问题";
                res.send(data);
            }else{
                var data = {};
                data.status = false;
                data.msg = err;
                res.send(data);
            }
        }
    })
});

router.post('/invalidcoupon',couponsAuth.authority,function(req,res){
    var postParams=req.body;
    var couponCodes=postParams.couponcodes;
    var merchantCode=postParams.merchantcode;
    //检couponids是否为数组
    if((couponCodes instanceof Array)==false){
        var data={};
        data.status=false;
        data.msg="传入的参数couponids一定要是数组";
        res.send(data);
    }
    //检测couponids不能为空
    if(couponCodes==null||(couponCodes.length==0)){
        var data={};
        data.status=false;
        data.msg="设置优惠券无效的couponcode不能为空";
        res.send(data);
    }

    couponInstanceService.getCouponInstanceTotalInfo(couponCodes,function(err,msg){
        if(!err&&msg) {
            var couponsInfo=msg;
            var status=true;
            for (var i = 0; i < msg.length; i++) {
                if(status==true){
                    if(couponsInfo[i].MERCHANTCODE!=merchantCode){
                        status=false;
                    }
                }else{
                    break;
                }
            }
            if(status==true){
                couponInstanceService.invalidCouponInstance(couponCodes,function(err,msg){
                    if(!err){
                        var data={};
                        data.status=true;
                        data.msg="coupon.couponinstance.activecoupon:success";
                        res.send(data);
                    }else{
                        var data = {};
                        data.status = false;
                        data.msg = err;
                        res.send(data);
                    }
                })
            }
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
});
router.get('/invalidcoupon',function(req,res){
    var data={
        couponcodes:['09080720161019125137OXFYQT6','09080720161019133047YQBBFN7'],
        merchantcode:"20020"
    }
    var postParams=data;
    var couponCodes=postParams.couponcodes;
    var merchantCode=postParams.merchantcode;
    //检couponids是否为数组
    if((couponCodes instanceof Array)==false){
        var data={};
        data.status=false;
        data.msg="传入的参数couponCodes一定要是数组";
        res.send(data);
    }
    //检测couponids不能为空
    if(couponCodes==null||(couponCodes.length==0)){
        var data={};
        data.status=false;
        data.msg="设置优惠券无效的couponcode不能为空";
        res.send(data);
    }

    couponInstanceService.getCouponInstanceTotalInfo(couponCodes,function(err,msg){
        if(!err&&msg) {
            var couponsInfo=msg;
            var status=true;
            for (var i = 0; i < msg.length; i++) {
                if(status==true){
                    if(couponsInfo[i].MERCHANTCODE!=merchantCode){
                        status=false;
                    }
                }else{
                    break;
                }
            }
            if(status==true){
                couponInstanceService.invalidCouponInstance(couponCodes,function(err,msg){
                    if(!err){
                        var data={};
                        data.status=true;
                        data.msg="coupon.couponinstance.activecoupon:success";
                        res.send(data);
                    }else{
                        var data = {};
                        data.status = false;
                        data.msg = err;
                        res.send(data);
                    }
                })
            }
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
});

router.post('/unusecoupon',couponsAuth.authority,function(req,res){
    //检测该劵是否已经过期，该用户是否已经使用。
    var postParams=req.body;
    var usercode=postParams.usercode;
    var couponcode=postParams.couponcode;
    var merchantcode=postParams.merchantcode;
    couponInstanceService.unmodifyCouponUseStatus(usercode,couponcode,merchantcode,function(err,msg){
        if(!err){
            var data = {};
            data.status = true;
            data.msg = "coupon.couponinstance.unusecoupon:success";
            res.send(data);
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
});
router.get('/unusecoupon',function(req,res){
    //检测该劵是否已经过期，该用户是否已经使用。
    var data={
        usercode:"0530",
        couponcode:"09080720160921161155APAELP6",
        merchantcode:"20020"
    };
    var postParams=data;
    var usercode=postParams.usercode;
    var couponcode=postParams.couponcode;
    var merchantcode=postParams.merchantcode;
    couponInstanceService.unmodifyCouponUseStatus(usercode,couponcode,merchantcode,function(err,msg){
        if(!err){
            var data = {};
            data.status = true;
            data.msg = "coupon.couponinstance.unusecoupon:success";
            res.send(data);
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
});

router.post('/querycouponbyusercode',couponsAuth.authority,function(req,res){
    //无法检查usercode属于哪个商户
    var postParams=req.body;
    var usercode=postParams.usercode;
    var usermerchantcode=postParams.merchantcode;
    var sign_type=postParams.sign_type;
    couponInstanceService.getCouponCodesByUsercode(usercode,usermerchantcode,function(err,msg){
        if(!err){
            var data = {};
            data.status = true;
            data.msg = "coupon.couponinstance.querycouponbyusercode:success";
            data.couponcodes=msg;
            var key=fs.readFileSync('../security/keys/server_private.key').toString('ascii');
            var sig=couponsAuth.getSign(key,sign_type,data);
            data.sign=sig;
            data.sign_type=sign_type;
            res.send(data);
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
});
router.get('/querycouponbyusercode',function(req,res){
    //无法检查usercode属于哪个商户
    var data={
        usercode:'15317785262',
        merchantcode:'20020',
        sign_type:'RSA-SHA1'
    };
    var postParams=data;
    var usercode=postParams.usercode;
    var usermerchantcode=postParams.merchantcode;
    var sign_type=postParams.sign_type;
    couponInstanceService.getCouponCodesByUsercode(usercode,usermerchantcode,function(err,msg){
        if(!err){
            var data = {};
            data.status = true;
            data.msg = "coupon.couponinstance.querycouponbyusercode:success";
            data.couponcodes=msg;
            var key=fs.readFileSync('../security/keys/server_private.key').toString('ascii');
            var sig=couponsAuth.getSign(key,sign_type,data);
            data.sign=sig;
            data.sign_type=sign_type;
            res.send(data);
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
});

router.post('/getonecoupon',couponsAuth.authority,function(req,res){
    var postParams=req.body;
    var couponCode=postParams.couponcode;
    var userCode=postParams.usercode;
    var userMerchantCode=postParams.usermerchantcode;
    var templateMerchantCode=postParams.templatemerchantcode;
    var sign_type=postParams.sign_type;
    var couponCodes=[];
    var info={};
    info.couponcode=couponCode;
    info.frommerchantcode=templateMerchantCode;
    couponCode.push(info);
    couponInstanceService.getCouponInstanceTotalInfo(couponCodes,function(err,msg){
        if(!err){
            if(msg.USERCODE==userCode&&msg.USERMERCHANTCODE==userMerchantCode){
                var data=msg;
                data['status']=true;
                data['msg']="coupon.couponinstance.getonecoupon:success";
                var key=fs.readFileSync('../security/keys/server_private.key').toString('ascii');
                var sig=couponsAuth.getSign(key,sign_type,data);
                data.sign=sig;
                data.sign_type=sign_type;
                res.send(data);
            }else{
                var data = {};
                data.status = false;
                data.msg = "usercode参数存在问题";
                res.send(data);
            }
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
});
router.get('/getonecoupon',function(req,res){
    var data=
    {
        couponcode:"09080720160920170329183MHX6",
        usercode:"0530",
        merchantcode:"20020",
        sign_type:'RSA-SHA1'
    };
    var postParams=data;
    var couponCode=postParams.couponcode;
    var userCode=postParams.usercode;
    var merchantCode=postParams.merchantcode;
    var sign_type=postParams.sign_type;
    var couponCodes=[];
    var info={};
    info.couponcode=couponCode;
    info.frommerchantcode=merchantCode;
    couponCodes.push(info);
    couponInstanceService.getCouponInstanceTotalInfo(couponCodes,function(err,msg){
        if(!err){
            var couponInfo=msg[0];
            if(couponInfo.USERCODE==userCode){
                var data=couponInfo;
                data['status']=true;
                data['msg']="coupon.couponinstance.getonecoupon:success";
                var key=fs.readFileSync('../security/keys/server_private.key').toString('ascii');
                var sig=couponsAuth.getSign(key,sign_type,data);
                data.sign=sig;
                data.sign_type=sign_type;
                res.send(data);
            }else{
                var data = {};
                data.status = false;
                data.msg = "usercode参数存在问题";
                res.send(data);
            }
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
});

router.post('/delcoupon',couponsAuth.authority,function(req,res){
    var postParams=req.body;
    var couponcode=postParams.couponcode;
    var usercode=postParams.usercode;
    var merchantcode=postParams.merchantcode;
    couponInstanceService.delCouponInstance(couponcode,merchantcode,usercode,function(err,msg){
        if(!err){
            var data = {};
            data.status = true;
            data.msg ="coupon.couponinstance.delcoupon:success";
            res.send(data);
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
});
router.get('/delcoupon',function(req,res){
    var data={
        couponcode:"09080720160920170329183MHX6",
        usercode:'0530',
        merchantcode:'20020',
        sign_type:'RSA-SHA1'

    };
    var postParams=data;
    var couponcode=postParams.couponcode;
    var usercode=postParams.usercode;
    var merchantcode=postParams.merchantcode;
    couponInstanceService.delCouponInstance(couponcode,merchantcode,usercode,function(err,msg){
        if(!err){
            var data = {};
            data.status = true;
            data.msg ="coupon.couponinstance.delcoupon:success";
            res.send(data);
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
});

router.post('/modifyCoupon',couponsAuth.authority,function(req,res){
    var postParams=req.body;
    var couponcode=postParams.couponcode;
    var modifyParams=postParams;
    var merchantCode=postParams.merchantcode;
    couponInstanceService.checkMerchantAuthority(couponcode,merchantCode,function(err,msg){
        if(!err&&(msg==true)){
            couponInstanceService.modifyCouponInstance(couponcode,modifyParams,function(err,msg){
                if(!err){
                    var data = {};
                    data.status = true;
                    data.msg ="coupon.couponinstance.modifycoupon:success";
                    res.send(data);
                }else{
                    var data = {};
                    data.status = false;
                    data.msg = err;
                    res.send(data);
                }
            })
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
})

router.post('/queryactivecouponbyusercode',couponsAuth.authority,function(req,res){
    //无法检查usercode属于哪个商户
    var postParams=req.body;
    var usercode=postParams.usercode;
    var usermerchantcode=postParams.merchantcode;
    var sign_type=postParams.sign_type;
    couponInstanceService.getActiveCouponCodesByUsercode(usercode,usermerchantcode,function(err,msg){
        if(!err){
            var data = {};
            data.status = true;
            data.msg = "coupon.couponinstance.queryactivecouponbyusercode:success";
            data.couponcodes=msg;
            var key=fs.readFileSync('../security/keys/server_private.key').toString('ascii');
            var sig=couponsAuth.getSign(key,sign_type,data);
            data.sign=sig;
            data.sign_type=sign_type;
            res.send(data);
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
});

router.post('/querytoactivecouponbyusercode',couponsAuth.authority,function(req,res){
    //无法检查usercode属于哪个商户
    var postParams=req.body;
    var usercode=postParams.usercode;
    var usermerchantcode=postParams.merchantcode;
    var sign_type=postParams.sign_type;
    couponInstanceService.getToActiveCouponCodesByUsercode(usercode,usermerchantcode,function(err,msg){
        if(!err){
            var data = {};
            data.status = true;
            data.msg = "coupon.couponinstance.querytoactivecouponbyusercode:success";
            data.couponcodes=msg;
            var key=fs.readFileSync('../security/keys/server_private.key').toString('ascii');
            var sig=couponsAuth.getSign(key,sign_type,data);
            data.sign=sig;
            data.sign_type=sign_type;
            res.send(data);
        }else{
            var data = {};
            data.status = false;
            data.msg = err;
            res.send(data);
        }
    })
});

router.post('/querycouponinstance',couponsAuth.authority,function(req,res){
    var postParams=req.body;
    var queryCondition=postParams.condition;
    var merchantCode=postParams.merchantcode;
    var sign_type=postParams.sign_type;
    couponInstanceService.queryEffectiveInstance(queryCondition,merchantCode,function(err,msg){
        if(!err){
            var data={};
            data.couponcodes=msg;
            data.status=true;
            data.msg="coupon.couponinstance.querycouponinstance:success";
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
})
router.get('/querycouponinstance',function(req,res){
    var date=new Date();
    var data={
        condition:{
            usercode: "15317785262",
            templatecode: "09080720",
            templatemerchantcode:"20020",
            createtime:{
                comp:2,
                date: "2016-11-29 12:33:33"
            }
        },
        merchantcode:"20020",
        sign_type:'RSA-SHA1'
    }
    var postParams=data;
    var queryCondition=postParams.condition;
    var merchantCode=postParams.merchantcode;
    var sign_type=postParams.sign_type;
    couponInstanceService.queryEffectiveInstance(queryCondition,merchantCode,function(err,msg){
        if(!err){
            var data={};
            data.couponcodes=msg;
            data.status=true;
            data.msg="coupon.couponinstance.querycouponinstance:success";
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
})

router.post('/querycouponinstanceinfo',couponsAuth.authority,function(req,res){
    var postParams=req.body;
    var queryCondition=postParams.condition;
    var merchantCode=postParams.merchantcode;
    var sign_type=postParams.sign_type;
    couponInstanceService.queryEffectiveInstanceInfo(queryCondition,merchantCode,function(err,msg){
        if(!err){
            var data={};
            data.couponinfos=msg;
            data.status=true;
            data.msg="coupon.couponinstance.querycouponinstanceinfo:success";
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
router.get('/querycouponinstanceinfo',function(req,res){
    var date=new Date();
    var data={
        condition:{
            usercode: "oe94fuOYjOApffY9v7ZJ4rRtCLLo",
            endat:{
                comp:1,
                date: "2016-11-26 12:33:33"
            }
        },
        merchantcode:"20020",
        sign_type:'RSA-SHA1'
    }
    var postParams=data;
    var queryCondition=postParams.condition;
    var merchantCode=postParams.merchantcode;
    var sign_type=postParams.sign_type;
    couponInstanceService.queryEffectiveInstanceInfo(queryCondition,merchantCode,function(err,msg){
        if(!err){
            var data={};
            data.couponinfos=msg;
            data.status=true;
            data.msg="coupon.couponinstance.querycouponinstanceinfo:success";
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
})
module.exports = router;
