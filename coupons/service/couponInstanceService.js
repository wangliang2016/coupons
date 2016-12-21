var express        = require('express');
var couponDAO        =require('../dao/coupon_instanceDAO');
var async               =require('async');
var sequelize   = require('../dao/_sequelize');
var generalService        =require('./generalService');
var couponTemplateService        =require('./couponTemplateService');
var coupon_templateDAO        =require('../dao/coupon_templateDAO');
var coupon_instanceDAO        =require('../dao/coupon_instanceDAO');
var template_usescopeDAO    =require('../dao/template_usescopeDAO');
var generalDAO    =require('../dao/generalDAO');
var userDAO    =require('../dao/userDAO');
exports.addCouponInstance=function(coupon,userCode,userMerchantCode,userid,num,status,cb) {
    //templatecode和merchantcode确定唯一的值，而templateid也是唯一的
    var couponCodes=[];
    return sequelize.transaction({autocommit: false}).then(function (t) {
        //var tr = {transaction: t};
        //var lock = {lock: t.LOCK};
        async.waterfall([
            function (acb) {
                var count=1;
                async.until(
                    function(){
                        return count>num;
                    },
                    function (icb) {
                        var id = "";
                        id += coupon.MERCHANTCODE;
                        id += coupon.TEMPLATECODE;
                        id += generalService.getNowTimeString();
                        var alls = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0'];
                        for (var i = 0; i < 6; i++) {
                            var ran = Math.ceil(Math.random() * 36);
                            id += alls[ran];
                        }
                        var havDistr=coupon.HAVEDISTRIBUTED;
                        id += (havDistr + i).toString();
                        var data = {
                            COUPONCODE: id,
                            TEMPLATEID: coupon.TEMPLATEID,
                            USERCODE: userCode,
                            USERMERCHANTCODE:userMerchantCode,
                            STATUS: status,
                            USERID: userid
                        };
                        console.log(data);
                        coupon_instanceDAO.add(data, t, function (err, msg) {
                            if(!err&&msg){
                                var couponData=msg.COUPONCODE;
                                couponCodes.push(couponData);
                                count++;
                                icb(null,count);
                            }else{
                                icb(err, null);
                            }
                        });
                    },
                    function(err,msg){
                        if(!err){
                           acb(null,coupon);
                        }else{
                            acb(err,null);
                        }
                    });
            },
            function (coupon,icb) {
                var distrNum = coupon.HAVEDISTRIBUTED + num;
                coupon_templateDAO.update({HAVEDISTRIBUTED: distrNum}, {where: {TEMPLATEID: coupon.TEMPLATEID}}, t, t.LOCK, function (err, msg) {
                    icb(err, msg);
                })
            }
        ], function (err, msg) {
            if (!err && msg) {
                t.commit();
                cb(null, couponCodes);
                return;
            } else {
                t.rollback();
                cb(err, null);
                return;
            }
        });
    });
}

function getCouponInstanceTotalInfo(couponCodes,cb){
    var couponInfos=[];
    var len=couponCodes.length;
    var count=0;
    async.until(
        function(){
            return count>=len;
        },
        function(acb){
            var totalInfo={};
            async.waterfall([
                function(icb){
                    coupon_instanceDAO.queryOne({where:{'COUPONCODE':couponCodes[count]}},function(err,msg) {
                        if(!err&&msg){
                            var info=msg.dataValues;
                            icb(null,info);
                        }else{
                            if(!err&&!msg){
                                icb("输入的couponcode存在错误",null);
                            }else{
                                icb(err,null);
                            }
                        }
                    })
                },
                function(coupon,icb){
                    coupon_templateDAO.queryOne({where:{'TEMPLATEID':coupon.TEMPLATEID}},function(err,msg){
                        if(!err&&msg){
                            //totalInfo=extend({},[coupon,msg]);
                            //totalInfo.couponTemplateInfo=msg;
                            var info=msg.dataValues;
                            delete info.USERID;
                            delete info.createdAt;
                            delete info.updatedAt;
                            icb(null,coupon,info)
                        }else{
                            icb(err,null);
                        }
                    })
                },
                function(couponInfo,templateInfo,icb){
                    template_usescopeDAO.queryAll({where:{'TEMPLATEID': templateInfo.TEMPLATEID}},function(err,msg){
                        if(!err&&msg){
                            var scope=[];
                            var num=msg.length;
                            for(var i=0;i<num;i++){
                                scope.push(msg[i]);
                            }
                            //templateInfo.USESCOPE=msg;
                            //totalInfo.couponTemplateInfo=msg;
                            //totalInfo.couponInstanceInfo=coupon;
                            //totalInfo= $.extend({},couponInfo,templateInfo);
                            for(var attr in couponInfo){
                                totalInfo[attr]=couponInfo[attr];
                            }
                            for(var attr in templateInfo){
                                totalInfo[attr]=templateInfo[attr];
                            }
                            totalInfo['USESCOPE']=msg;
                            icb(null,totalInfo);
                        }else{
                            if(!err&&!msg){
                                icb("该类型优惠券没有定义优惠范围，请先在修改中定义范围");
                            }
                        }
                    })
                }
            ],function(err,msg){
                if(!err){
                    couponInfos.push(msg);
                    count++;
                    acb(null,count);
                }else{
                    acb(err,null);
                }
            });
        },
        function(err,msg){
           if(!err){
               cb(null,couponInfos);
           }else{
               cb(err,null);
           }
        }
    )
}
exports.getCouponInstanceTotalInfo=getCouponInstanceTotalInfo;
//检测使用地点和时间是否在使用范围内
//检测req中的usercode和查询得到的usercode是否一致
//该劵是否已经使用
//brandcode是数组
exports.checkUseAuthority=function(merchantcode,deptcode,brandcode,usercode,couponInfo,cb){
    //检测使用地点和时间是否在使用范围内
    //检测req中的usercode和查询得到的usercode是否一致
    //该劵是否已经使用
    //brandcode是数组
    if(couponInfo.STATUS==0){
        if(couponInfo.USERCODE==usercode){
            if(brandcode==null||brandcode.length==0){
                cb("请给出使用该劵的柜台编码，特殊情况输入true",null);
                return;
            }
            var usescope=couponInfo.USESCOPE;
            var usebrands=[];
            for(var i=0;i<usescope.length;i++){
                if((usescope[i].MERCHANTCODE==merchantcode)&&(usescope[i].DEPTCODE==deptcode)){
                    usebrands.push(usescope[i].BRANDCODE);
                }
            }
            if(usebrands==null||usebrands.length==0){
                cb("使用处并不在该劵的使用范围内，请详细看规则！",null);
                return;
            }else{
                if((brandcode.length==1)&&(brandcode[0]=='true')){
                    var dateexpires=couponInfo.DATEEXPIRES;
                    var dateeffective=couponInfo.DATEEFFECTIVE;
                    var date=new Date();
                    //var date=generalService.getFormatTime(new Date()).toString();
                    //console.log(dateexpires);
                    //console.log(date);
                    var c1=generalService.checkTime1(dateeffective,date);
                    if(c1==0){
                        cb("该劵还没有到使用时间",null);
                        return;
                    }
                    var c2=generalService.checkTime1(dateexpires,date);
                    if(c2==1){
                        cb("该劵已经超过使用时间",null);
                        return;
                    }
                    if(c2==3||c1==3){
                        cb("该劵的使用时间模版存在问题",null);
                        return;
                    }
                    cb(null,{status:true});
                    return;
                }else{
                    for(var j=0;j<brandcode.length;j++){
                        if(usebrands.indexOf(brandcode[j])==-1){
                            cb("使用处并不在该劵的使用范围内，请详细看规则",null);
                            return;
                        }
                    }

                    var dateexpires=couponInfo.DATEEXPIRES;
                    var dateeffective=couponInfo.DATEEFFECTIVE;
                    var date=new Date();
                    //var date=generalService.getFormatTime(new Date());
                    var c1=generalService.checkTime1(dateeffective,date);
                    if(c1==0){
                        cb("该劵还没有到使用时间",null);
                        return;
                    }
                    var c2=generalService.checkTime1(dateexpires,date);
                    if(c2==1){
                        cb("该劵已经超过使用时间",null);
                        return;
                    }
                    if(c2==3||c1==3){
                        cb("该劵的使用时间模版存在问题",null);
                        return;
                    }
                    cb(null,{status:true});
                    return;
                }
            }
        }else{
            cb("您并没有权限使用该劵",null);
            return;
        }
    }else{
        cb("Sorry，该劵的状态无法使用",null);
        return;
    }
}

//检测用户是否具有激活权限
exports.checkActiveAuthority=function(usercode,couponInfo,cb){
    //检测req中的originusercode和查询得到的usercode是否一致
    //当前时间小于优惠券创建时间加上activationTime
    //该劵的状态一定是2，并将其改为0
    if(couponInfo.STATUS==0){
        cb("该劵已经激活过了",null);
        return;
    }
    else if(couponInfo.STATUS==1){
        cb("该劵该用户已经使用,无法再次使用",null);
        return;
    }else{
        if(couponInfo.USERCODE==usercode){
            if(couponInfo.ACTIVATIONTIME==null){
                cb(null,{status:true});
                return;
            }else{
                var date=new Date();
                var activationTime=couponInfo.ACTIVATIONTIME;
                var createTime=couponInfo.createdAt;
                var effectiveDate=new Date(createTime.getTime()+activationTime*1000);
                var a=date.getTime()-effectiveDate.getTime();
                if(a>0){
                    //表示已经超过激活时间
                    cb("已经超过激活时间",null);
                }else{
                    cb(null,{status:true});
                    return;
                }
            }
        }else{
            cb("您并没有权限使用该劵",null);
            return;
        }
    }
}
//检测修改的merchantcode和原一样
exports.checkMerchantAuthority=function(couponcode,merchantcode,cb){
    async.parallel([
        function(icb){
            coupon_instanceDAO.queryOne({where:{COUPONCODE:couponcode}},function(err,msg){
                if(!err&&msg){
                    icb(null,msg.USERID);
                }else{
                    if(!err&&msg){
                        icb("并不存在参数中的couponcode和merchantcode",null);
                    }else{
                        icb(err,null);
                    }
                }
            })
        },
        function(icb){
            userDAO.queryOne({where:{MERCHANTCODE:merchantcode}},function(err,msg){
                if(!err&&msg){
                    icb(null,msg.USERID);
                }else{
                    if(!err&&msg){
                        icb("merchantcode存在错误",null);
                    }else{
                        icb(err,null);
                    }
                }
            })
        }
    ],function(err,msg){
        if(!err){
            if(msg[0]==msg[1]){
                cb(null,true);
            }else{
                cb("修改的merchantcode要和原分配的merchantcode一致",null);
            }
        }else{
            cb(err,null);
        }
    })

}

exports.modifyCouponUseStatus=function(couponIds,useMerchantCode,useDeptCode,useBrandCode,cb) {
    if ((couponIds instanceof Array) == false) {
        cb("传入的参数couponcodes一定要是数组", nulll);
        return;
    } else {
        var count = 0;
        var len = couponIds.length;
        return sequelize.transaction({autocommit: false}).then(function (t) {
            //var tr = {transaction: t};
            async.until(
                function () {
                    return count >= len;
                },
                function (acb) {
                    coupon_instanceDAO.update({STATUS: 1,USEMERCHANTCODE:useMerchantCode,USEDEPTCODE:useDeptCode,USEBRANDCODE:useBrandCode}, {where: {COUPONCODE: couponIds[count].couponcode,MERCHANTCODE:couponIds[count].frommerchantcode}}, t, function (err, msg) {
                        if (!err && msg) {
                            count++;
                            acb(null, count);
                        }
                    })
                },
                function (err, msg) {
                    if (!err) {
                        t.commit();
                        cb(null, {status: true});
                    } else {
                        t.rollback();
                        cb(err, null);
                    }
                }
            )
        });
    }
}

exports.unmodifyCouponUseStatus=function(usercode,couponcode,merchantcode,cb){
    //检测该劵是否已经过期，该用户是否已经使用。
    //由于撤销修改只能一张一张修改
    var couponInfo=[];
    couponInfo.push(usercode);
    getCouponInstanceTotalInfo(couponInfo,function(err,msg){
        if(!err&&msg){
            var couponDetails=msg[0];
            var useStatus=couponDetails.STATUS;
            if(useStatus==0){
                cb("该劵还没有使用，无法撤销使用",null);
                return;
            }else{
                var dateexpires=couponDetails.DATEEXPIRES;
                var date=new Date();
                var c=generalService.checkTime1(dateexpires,date);
                if(c==1){
                    cb("该劵已经超过使用期限，无法撤销使用",null);
                    return;
                }
                if(c==3){
                    cb("该劵的使用时间模版存在问题",null);
                    return;
                }
                if(couponDetails.USERCODE==usercode){
                    coupon_instanceDAO.update({STATUS: 0,USEMERCHANTCODE:null,USEDEPTCODE:null,USEBRANDCODE:null}, {where: {COUPONCODE: couponcode,MERCHANTCODE:merchantcode}},function(err,msg){
                        if(!err){
                            cb(null,{status:true});
                        }else{
                            cb(err,null);
                        }
                    });
                }
            }
        }
    })
}

exports.getCouponCodesByUsercode=function(usercode,merchantcode,cb){
    coupon_instanceDAO.queryAll({attributes:['COUPONCODE'],where:{USERCODE:usercode,USERMERCHANTCODE:merchantcode}},function(err,msg){
        if(!err){
            var couponcodes=[];
            var len=msg.length;
            for(var i=0;i<len;i++){
                var coupon=msg[i].COUPONCODE;
                couponcodes.push(coupon);
            }
            cb(null,couponcodes);
        }else{
            cb(err,null);
        }
    })
}

exports.getActiveCouponCodesByUsercode=function(usercode,merchantcode,cb){
    //由已知status为0；
    var date=new Date();
    coupon_instanceDAO.queryAll({attributes:['COUPONCODE'],where:{USERCODE:usercode,USERMERCHANTCODE:merchantcode,STATUS:0}},function(err,msg){
        if(!err){
            var couponcodes=[];
            var len=msg.length;
            for(var i=0;i<len;i++){
                var coupon=msg[i].COUPONCODE;
                couponcodes.push(coupon);
            }
            cb(null,couponcodes);
        }else{
            cb(err,null);
        }
    })
}

//exports.getToActiveCouponCodesByUsercode=function(usercode,merchantcode,cb){
//    //由已知status为0；
//    coupon_instanceDAO.queryAll({attributes:['COUPONCODE','MERCHANTCODE'],where:{USERCODE:usercode,USERMERCHANTCODE:merchantcode,STATUS:2,createdAt:{$gte:}}},function(err,msg){
//        if(!err){
//            var couponcodes=[];
//            var len=msg.length;
//            for(var i=0;i<len;i++){
//                var coupon={};
//                coupon.couponcode=msg[i].COUPONCODE;
//                coupon.merchantcode=msg[i].MERCHANTCODE;
//                couponcodes.push(coupon);
//            }
//            cb(null,couponcodes);
//        }else{
//            cb(err,null);
//        }
//    })
//}

exports.delCouponInstance=function(couponcode,merchantcode,usercode,cb){
    coupon_instanceDAO.queryOne({where:{COUPONCODE:couponcode}},function(err,msg){
        if(!err&&msg){
            var couponInstance=msg;
            return sequelize.transaction({autocommit: false}).then(function (t) {
                //var tr = {transaction: t};
                //var lock = {lock: t.LOCK};
                async.waterfall([
                    function(icb){
                        coupon_instanceDAO.del({where:{COUPONCODE:couponcode}},t,function(err,msg){
                            if(!err){
                                icb(null,couponInstance.TEMPLATEID);
                            }else{
                                icb(err,null);
                            }
                        })
                    },
                    function(templateId,icb){
                        coupon_templateDAO.queryOne({attributes:['HAVEDISTRIBUTED'],where:{TEMPLATEID:templateId}},t, t.LOCK,function(err,msg){
                            if(!err){
                                var haveDistr=msg.HAVEDISTRIBUTED;
                                icb(null,templateId,haveDistr);
                            }else{
                                icb(err,null);
                            }
                        })
                    },
                    function(templateId,haveDistr,icb){
                        var newHaveDistr=haveDistr-1;
                        coupon_templateDAO.update({HAVEDISTRIBUTED:newHaveDistr},{where:{TEMPLATEID:templateId}}, t, t.LOCK,function (err,msg){
                            if(!err){
                                icb(null,{status:1});
                            }else{
                                icb(err,null);
                            }
                        })
                    }
                ],function(err,msg){
                    if(!err){
                        cb(null,msg);
                    }else{
                        cb(err,null);
                    }
                })
            })
        }else{
            if(!err&&!msg){
                cb("参数couponcode存在错误",null);
            }else{
                cb(err,null);
            }
        }
    })
}

exports.modifyCouponInstance=function(couponcode,modifyParams,cb){
    coupon_instanceDAO.queryOne({COUPONCODE:couponcode},function(err,msg){
        if(!err&&msg){
            var qry={};
            if(modifyParams.usercode!=null){
                qry.USERCODE=modifyParams.usercode;
            }
            if(modifyParams.usermerchantcode!=null){
                qry.USERMERCHANTCODE=modifyParams.usermerchantcode;
            }
            if(modifyParams.usemerchantcode!=null){
                qry.USEMERCHANTCODE=modifyParams.usemerchantcode;
            }
            if(modifyParams.usedeptcode!=null){
                qry.USEDEPTCODE=modifyParams.usedeptcode;
            }
            if(modifyParams.usebrandcode!=null){
                qry.USEBRANDCODE=modifyParams.usebrandcode;
            }
            coupon_instanceDAO.update(qry,function(err,msg){
                cb(err,msg);
            })
        }else{
            if(!err&&!msg){
                cb("所给的couponcode获得merchantcode存在问题",null);
            }
        }
    })
}

exports.activeCouponInstance=function(couponCodes,cb){
    if ((couponCodes instanceof Array) == false) {
        cb("传入的参数couponcodes一定要是数组", nulll);
        return;
    } else {
        var count = 0;
        var len = couponCodes.length;
        return sequelize.transaction({autocommit: false}).then(function (t) {
            //var tr = {transaction: t};
            async.until(
                function () {
                    return count >= len;
                },
                function (acb) {
                    coupon_instanceDAO.update({STATUS: 0}, {where: {COUPONCODE: couponCodes[count]}}, t, function (err, msg) {
                        if (!err && msg) {
                            count++;
                            acb(null, count);
                        }
                    })
                },
                function (err, msg) {
                    if (!err) {
                        t.commit();
                        cb(null, {status: true});
                    } else {
                        t.rollback();
                        cb(err, null);
                    }
                }
            )
        });
    }
}

exports.invalidCouponInstance=function(couponCodes,cb){
    if ((couponCodes instanceof Array) == false) {
        cb("传入的参数couponcodes一定要是数组", nulll);
        return;
    } else {
        var count = 0;
        var len = couponCodes.length;
        return sequelize.transaction({autocommit: false}).then(function (t) {
            //var tr = {transaction: t};
            async.until(
                function () {
                    return count >= len;
                },
                function (acb) {
                    coupon_instanceDAO.update({STATUS: 3}, {where: {COUPONCODE: couponCodes[count]}}, t, function (err, msg) {
                        if (!err && msg) {
                            count++;
                            acb(null, count);
                        }
                    })
                },
                function (err, msg) {
                    if (!err) {
                        t.commit();
                        cb(null, {status: true});
                    } else {
                        t.rollback();
                        cb(err, null);
                    }
                }
            )
        });
    }
}

exports.queryEffectiveInstance=function(queryCondition,merchantCode,cb){
    var sql="";
    sql="select instance.COUPONCODE from coupon_instance as instance,coupon_template as template where instance.TEMPLATEID = template.TEMPLATEID"

    if(queryCondition.usercode!=null){
        sql+=' and instance.USERCODE = ';
        sql+="'"+queryCondition.usercode+"'";
    }
    if(queryCondition.templatecode!=null&&queryCondition.templatemerchantcode!=null){
        sql+=' and template.TEMPLATECODE = ';
        sql+="'"+queryCondition.templatecode+"'";
        sql+=' and template.MERCHANTCODE = ';
        sql+="'"+queryCondition.templatemerchantcode+"'";
    }else{
        sql+=' and template.MERCHANTCODE = ';
        sql+="'"+merchantCode+"'";
    }
    if(queryCondition.status!=null){
        sql+=' and instance.STATUS = ';
        sql+=queryCondition.status;
    }
    if(queryCondition.usemerchantcode!=null){
        sql+=' and instance.USEMERCHANTCODE = ';
        sql+="'"+queryCondition.usemerchantcode+"'";
    }
    if(queryCondition.usedeptcode!=null){
        sql+=' and instance.USEDEPTCODE = ';
        sql+="'"+queryCondition.usedeptcode+"'";
    }
    if(queryCondition.usebrandcode!=null){
        sql+=' and instance.USEBRANDCODE = ';
        sql+="'"+queryCondition.usebrandcode+"'";
    }
    if(queryCondition.createtime!=null){
        if(queryCondition.createtime.comp==-1){
            sql+=' and instance.createdAt <';
            sql+="'"+queryCondition.createtime.date+"'";
        }
        if(queryCondition.createtime.comp==0){
            sql+=' and instance.createdAt ='
            sql+="'"+queryCondition.createtime.date+"'";
        }
        if(queryCondition.createtime.comp==1){
            sql+=' and instance.createdAt >';
            sql+="'"+queryCondition.createtime.date+"'";
        }
        if(queryCondition.createtime.comp==2){
            sql+=' and instance.createdAt <= ';
            sql+="'"+queryCondition.createtime.date+"'";
        }
        if(queryCondition.createtime.comp==3){
            sql+=' and instance.createdAt >= ';
            sql+=""+queryCondition.createtime.date+"'";
        }
    }
    if(queryCondition.beginat!=null){
        if(queryCondition.beginat.comp==-1){
            sql+=' and template.DATEEFFECTIVE <';
            sql+="'"+queryCondition.beginat.date+"'";
        }
        if(queryCondition.beginat.comp==0){
            sql+=' and template.DATEEFFECTIVE ='
            sql+="'"+queryCondition.beginat.date+"'";
        }
        if(queryCondition.beginat.comp==1){
            sql+=' and template.DATEEFFECTIVE >';
            sql+="'"+queryCondition.beginat.date+"'";
        }
        if(queryCondition.beginat.comp==2){
            sql+=' and template.DATEEFFECTIVE <= ';
            sql+="'"+queryCondition.beginat.date+"'";
        }
        if(queryCondition.beginat.comp==3){
            sql+=' and template.DATEEFFECTIVE >= ';
            sql+=""+queryCondition.beginat.date+"'";
        }
    }
    if(queryCondition.endat!=null){
        if(queryCondition.endat.comp==-1){
            sql+=' and template.DATEEXPIRES <';
            sql+="'"+queryCondition.endat.date+"'";
        }
        if(queryCondition.endat.comp==0){
            sql+=' and template.DATEEXPIRES ='
            sql+="'"+queryCondition.endat.date+"'";
        }
        if(queryCondition.endat.comp==1){
            sql+=' and template.DATEEXPIRES >';
            sql+="'"+queryCondition.endat.date+"'";
        }
        if(queryCondition.endat.comp==2){
            sql+=' and template.DATEEXPIRES <= ';
            sql+="'"+queryCondition.endat.date+"'";
        }
        if(queryCondition.endat.comp==3){
            sql+=' and template.DATEEXPIRES >= ';
            sql+=""+queryCondition.endat.date+"'";
        }
    }
    console.log(sql);
    generalDAO.runSql(sql,function(err,msg){
        if(!err&&msg){
            var results=[];
            if(msg[0]!=null){
                var couponresults=msg[0];
                for(var i=0;i<couponresults.length;i++){
                    results.push(couponresults[i].COUPONCODE);
                }
                cb(null,results);
            }else{
              cb(err,msg);
            }
        }else{
            cb(err,null);
        }
    })
}

exports.queryEffectiveInstanceInfo=function(queryCondition,merchantCode,cb){
    var sql="";
    //sql="select usescope from coupon_instance as instance,coupon_template as template,(select template_usescope.MERCHANTCODE,template_usescope.DEPTCODE,template_usescope.BRANDCODE from template_usescope,coupon_template where coupon_template.TEMPLATEID=template_usescope.TEMPLATEID ) as usescope where instance.TEMPLATEID = template.TEMPLATEID"

    //var qry="select usescope.* from (select * from template_usescope group by TEMPLATEID) as usescope,coupon_template as template where template.TEMPLATEID=usescope.TEMPLATEID"
    //var qry="select template.TEMPLATECODE,template.TEMPLATECONTENT,template.DATEEFFECTIVE,template.DATEEXPIRES,template.SALIENCE,template.MERCHANTCODE as TEMPLATEMERCHANTCODE,template.DEPTCODE as TEMPLATEDEPTCODE,template.BRANDCODE as BRANDCODE,template.TYPECODE,template.COUPONVALUE,template.COUPONBASE,template.TEMPLATEDESCRIPTION,usescope=(select * from usescope group by usescope.TEMPLATEID) template_usescope as usescope left join coupon_template as template on template.TEMPLATEID=usescope.TEMPLATEID"
    var sql="select template.TEMPLATECODE,template.TEMPLATECONTENT,template.DATEEFFECTIVE,template.DATEEXPIRES,template.SALIENCE,template.MERCHANTCODE as TEMPLATEMERCHANTCODE,template.DEPTCODE as TEMPLATEDEPTCODE,template.BRANDCODE as BRANDCODE,template.TYPECODE,template.COUPONVALUE,template.COUPONBASE,template.TEMPLATEDESCRIPTION,instance.COUPONCODE,instance.STATUS,instance.USEMERCHANTCODE,instance.USEDEPTCODE,instance.USEBRANDCODE,instance.createdAt from coupon_instance as instance,coupon_template as template where instance.TEMPLATEID = template.TEMPLATEID"
    if(queryCondition.usercode!=null){
        sql+=' and instance.USERCODE = ';
        sql+="'"+queryCondition.usercode+"'";
    }
    if(queryCondition.templatecode!=null&&queryCondition.templatemerchantcode!=null){
        sql+=' and template.TEMPLATECODE = ';
        sql+="'"+queryCondition.templatecode+"'";
        sql+=' and template.MERCHANTCODE = ';
        sql+="'"+queryCondition.templatemerchantcode+"'";
    }else{
        sql+=' and template.MERCHANTCODE = ';
        sql+="'"+merchantCode+"'";
    }
    if(queryCondition.status!=null){
        sql+=' and instance.STATUS = ';
        sql+=queryCondition.status;
    }
    if(queryCondition.usemerchantcode!=null){
        sql+=' and instance.USEMERCHANTCODE = ';
        sql+="'"+queryCondition.usemerchantcode+"'";
    }
    if(queryCondition.usedeptcode!=null){
        sql+=' and instance.USEDEPTCODE = ';
        sql+="'"+queryCondition.usedeptcode+"'";
    }
    if(queryCondition.usebrandcode!=null){
        sql+=' and instance.USEBRANDCODE = ';
        sql+="'"+queryCondition.usebrandcode+"'";
    }
    if(queryCondition.createtime!=null){
        if(queryCondition.createtime.comp==-1){
            sql+=' and instance.createdAt <';
            sql+="'"+queryCondition.createtime.date+"'";
        }
        if(queryCondition.createtime.comp==0){
            sql+=' and instance.createdAt ='
            sql+="'"+queryCondition.createtime.date+"'";
        }
        if(queryCondition.createtime.comp==1){
            sql+=' and instance.createdAt >';
            sql+="'"+queryCondition.createtime.date+"'";
        }
        if(queryCondition.createtime.comp==2){
            sql+=' and instance.createdAt <= ';
            sql+="'"+queryCondition.createtime.date+"'";
        }
        if(queryCondition.createtime.comp==3){
            sql+=' and instance.createdAt >= ';
            sql+=""+queryCondition.createtime.date+"'";
        }
    }
    if(queryCondition.beginat!=null){
        if(queryCondition.beginat.comp==-1){
            sql+=' and template.DATEEFFECTIVE <';
            sql+="'"+queryCondition.beginat.date+"'";
        }
        if(queryCondition.beginat.comp==0){
            sql+=' and template.DATEEFFECTIVE ='
            sql+="'"+queryCondition.beginat.date+"'";
        }
        if(queryCondition.beginat.comp==1){
            sql+=' and template.DATEEFFECTIVE >';
            sql+="'"+queryCondition.beginat.date+"'";
        }
        if(queryCondition.beginat.comp==2){
            sql+=' and template.DATEEFFECTIVE <= ';
            sql+="'"+queryCondition.beginat.date+"'";
        }
        if(queryCondition.beginat.comp==3){
            sql+=' and template.DATEEFFECTIVE >= ';
            sql+=""+queryCondition.beginat.date+"'";
        }
    }
    if(queryCondition.endat!=null){
        if(queryCondition.endat.comp==-1){
            sql+=' and template.DATEEXPIRES <';
            sql+="'"+queryCondition.endat.date+"'";
        }
        if(queryCondition.endat.comp==0){
            sql+=' and template.DATEEXPIRES ='
            sql+="'"+queryCondition.endat.date+"'";
        }
        if(queryCondition.endat.comp==1){
            sql+=' and template.DATEEXPIRES >';
            sql+="'"+queryCondition.endat.date+"'";
        }
        if(queryCondition.endat.comp==2){
            sql+=' and template.DATEEXPIRES <= ';
            sql+="'"+queryCondition.endat.date+"'";
        }
        if(queryCondition.endat.comp==3){
            sql+=' and template.DATEEXPIRES >= ';
            sql+=""+queryCondition.endat.date+"'";
        }
    }
    console.log(sql);
    generalDAO.runSql(sql,function(err,msg){
        if(!err&&msg){
            if(msg[0]!=null){
                var couponresults=msg[0];
                //for(var i=0;i<couponresults.length;i++){
                //    delete couponresults.
                //}
                cb(null,couponresults);
            }else{
                cb(err,msg);
            }
        }else{
            cb(err,null);
        }
    })
}