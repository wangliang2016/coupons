var express        = require('express');
var generalService        =require('./generalService');
var coupontemplateDAO        =require('../dao/coupon_templateDAO');
var templateusescopeDAO        =require('../dao/template_usescopeDAO');
var userDAO   =require('../dao/userDAO');
var generalDAO   =require('../dao/generalDAO');
var async   =require('async');
var sequelize   = require('../dao/_sequelize');

function addCouponTemplate(coupon,cb) {
    var templatecode = coupon.templatecode;
    var merchantcode = coupon.merchantcode;
    var userid;
    sequelize.transaction({autocommit: false}).then(function (t) {
    //sequelize.transaction(function(t){
        var tr = {transaction: t};
        async.waterfall([
            function (icb) {
                coupontemplateDAO.queryOne({
                    attributes: ['TEMPLATEID', 'TEMPLATECODE'],
                    where: {'TEMPLATECODE': templatecode, 'MERCHANTCODE': merchantcode}
                },t, function (err, msg) {
                    if (!err && msg) {
                        icb("该TEMPLATECODE已经存在,请重新输入TEMPLATECODE", null);
                    } else {
                        if (!err && !msg) {
                            icb(null, 1);
                        } else {
                            icb(err, null);
                        }
                    }
                });
            },
            function (status, icb) {
                if(status==1){
                    userDAO.queryOne({
                        attributes: ['USERID'],
                        where: {'MERCHANTCODE': merchantcode}
                    },t, function (err, msg) {
                        if (!err && msg) {
                            userid = msg.USERID;
                            icb(null, userid);
                        } else {
                            icb(err, null);
                        }
                    });
                }
            },

            function (userid, icb) {
                var data = {
                    TEMPLATECODE: coupon.templatecode,
                    TEMPLATECONTENT: coupon.templatecontent,
                    DATEEFFECTIVE: coupon.dateeffective,
                    DATEEXPIRES: coupon.dateexpires,
                    SALIENCE: coupon.salience,
                    MERCHANTCODE: coupon.merchantcode,
                    DEPTCODE: coupon.deptcode,
                    BRANDCODE: coupon.brandcode,
                    TYPECODE: coupon.typecode,
                    COUPONBASE: coupon.couponbase,
                    COUPONVALUE: coupon.couponvalue,
                    TOTALNUMBER: coupon.totalnumber,
                    HAVEDISTRIBUTED: coupon.havedistributed,
                    TEMPLATEDESCRIPTION: coupon.templatedescription,
                    USERID: userid
                };
                coupontemplateDAO.add(data,t, function (err, msg) {
                    if (!err) {
                        var templateid = msg.TEMPLATEID;
                        icb(null, templateid);
                    } else {
                        icb(err, null);
                    }
                })
            },
            function (templateid, icb) {
                var usescope = [];
                scope = coupon.usescope;
                for (i = 0; i < scope.length; i++) {
                    var use={};
                    use.BRANDCODE=scope[i].brandcode;
                    use.DEPTCODE=scope[i].deptcode;
                    use.MERCHANTCODE=scope[i].merchantcode;
                    use.TEMPLATEID = templateid;
                    use.FROMMERCHANTCODE=coupon.merchantcode;
                    usescope.push(use);
                }
                templateusescopeDAO.bulkAdd(usescope,t, function (err, msg) {
                    if (!err) {
                        icb(null, msg);
                    } else {
                        icb(err, null);
                    }
                })
            }
        ], function (err, msg) {
            if (!err) {
                t.commit();
                cb(null, {status:true});
                return;
            } else {
                t.rollback();
                cb(err,null);
                return;
            }
        });
    })
}
exports.addCouponTemplate=addCouponTemplate;
function modifyCouponTemplate(coupon,cb) {
    var templatecode = coupon.templatecode;
    var merchantcode = coupon.merchantcode;
    var userid;
    return sequelize.transaction({autocommit: false}).then(function (t) {
        var tr = {transaction: t};
        async.waterfall([
            function (icb) {
                coupontemplateDAO.queryOne({
                    attributes: ['TEMPLATEID', 'TEMPLATECODE'],
                    where: {'TEMPLATECODE': templatecode, 'MERCHANTCODE': merchantcode}
                }, function (err, msg) {
                    if (!err && msg) {
                        icb(null,msg.TEMPLATEID);
                    } else {
                        if (!err && !msg) {
                            icb("templatecode参数并不存在", null);
                        } else {
                            icb(err, null);
                        }
                    }
                });
            },
            function (templateid, icb) {
                userDAO.queryOne({
                    attributes: ['USERID'],
                    where: {'MERCHANTCODE': merchantcode}
                }, function (err, msg) {
                    if (!err && msg) {
                        userid = msg.USERID;
                        icb(null,userid,templateid);
                    } else {
                        icb(err, null);
                    }
                });
            },
            function (userid,templateid, icb) {
                var data = {
                    TEMPLATECODE: coupon.templatecode,
                    TEMPLATECONTENT: coupon.templatecontent,
                    DATEEFFECTIVE: coupon.dateeffective,
                    DATEEXPIRES: coupon.dateexpires,
                    SALIENCE: coupon.salience,
                    MERCHANTCODE: coupon.merchantcode,
                    DEPTCODE: coupon.deptcode,
                    BRANDCODE: coupon.brandcode,
                    TYPECODE: coupon.typecode,
                    COUPONBASE: coupon.couponbase,
                    COUPONVALUE: coupon.couponvalue,
                    TOTALNUMBER: coupon.totalnumber,
                    HAVEDISTRIBUTED: coupon.havedistributed,
                    TEMPLATEDESCRIPTION: coupon.templatedescription,
                    USERID:userid

                };
                coupontemplateDAO.update(data,{where:{TEMPLATEID:templateid}}, t,function (err, msg) {
                    if (!err) {
                        icb(null, templateid);
                    } else {
                        icb(err, null);
                    }
                });
            },
            function(templateid,icb){
                templateusescopeDAO.del({where:{TEMPLATEID:templateid}},t,function(err,msg){
                    if(err){
                       icb(err,null);
                    }else{
                        icb(null,templateid);
                    }
                })
            },
            function (templateid, icb) {
                var usescope = [];
                scope = coupon.usescope;
                for (i = 0; i < scope.length; i++) {
                    var use={};
                    use.BRANDCODE=scope[i].brandcode;
                    use.DEPTCODE=scope[i].deptcode;
                    use.MERCHANTCODE=scope[i].merchantcode;
                    use.TEMPLATEID = templateid;
                    use.FROMMERCHANTCODE=coupon.merchantcode;
                    usescope.push(use);
                }
                templateusescopeDAO.bulkAdd(usescope,t, function (err, msg) {
                    if (!err) {
                        icb(null, msg);
                    } else {
                        icb(err, null);
                    }
                })
            }
        ], function (err, msg) {
            if (!err) {
                cb(null, true);
                return t.commit();
            } else {
                cb(err,null);
                return t.rollback();
            }
        });
    });
}
exports.modifyCouponTemplate=modifyCouponTemplate;
function getCouponTemplate(templateCode,merchantCode,cb){
    var totalInfo={};
    async.waterfall([
        function(icb){
            coupontemplateDAO.queryOne({where:{'TEMPLATECODE': templateCode, 'MERCHANTCODE': merchantCode}},function(err,msg){
                if(!err&&msg){
                    icb(null,msg.dataValues);
                }else{
                    if(!err&&!msg){
                        icb("抱歉，您输入的templatecode和merchantcode存在错误",null);
                    }else{
                        icb(err,null);
                    }

                }
            })
        },
        function(templateInfo,icb){
            templateusescopeDAO.queryAll({where:{'TEMPLATEID': templateInfo.TEMPLATEID}},function(err,msg){
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
        if(!err&&msg){
            cb(null,totalInfo);
        }else{
            cb(err,null);
        }
    })

}
exports.getCouponTemplate=getCouponTemplate;
function delCouponTemplate(templateCode,merchantCode,cb){
    coupontemplateDAO.queryOne({attributes:['TEMPLATEID','HAVEDISTRIBUTED'],
        where:{'TEMPLATECODE':templateCode,'MERCHANTCODE':merchantCode}},function(err,msg){
        if(!err&&msg){
            var havedistr=msg.HAVEDISTRIBUTED;
            var templateid =msg.TEMPLATEID;
            if(havedistr>0){
                cb("该类型优惠券已经发放，无法进行删除");
            }else{
                async.parallel([
                    function(icb){
                        coupontemplateDAO.del({where:{TEMPLATEID:templateid}},function(err,msg){
                            if(!err){
                                icb(null,{status:true});
                            }else{
                                icb(err,null);
                            }
                        });
                    },
                    function(icb){
                        templateusescopeDAO.del({where:{TEMPLATEID:templateid}},function(err,msg){
                            if(!err){
                                icb(null,{status:true});
                            }else{
                                icb(err,null);
                            }
                        })
                    }
                ],function(err,msg){
                    cb(err,msg);
                })


            }
        }else{
            if(!err&&!msg){
                cb("参数中的templatecode和merchantcode输入有误",null);
            }else{
                cb(err,null);
            }
        }
    })
}
exports.delCouponTemplate=delCouponTemplate;
function queryEffectiveTemplate(queryAttributes,queryCondition,merchantCode,cb){
//该接口需要大量的内容需要考虑
    if((queryCondition.usescope!=null)&&(queryCondition.usescope==true)){
        var sql="";
        sql="select "

        for(var i=0;i<queryAttributes.length;i++){
            if(i==(queryAttributes.length-1)) {
                if (queryAttributes[i] == 'templateid') {
                    sql += 'coupon_template.TEMPLATEID ';
                } else {
                    if (queryAttributes[i] == 'merchantcode') {
                        sql += 'coupon_template.MERCHANTCODE';
                    } else {
                        sql += queryAttributes[i].toString().toLocaleUpperCase() + "  from coupon_template,template_usescope where coupon_template.TEMPLATEID=template_usescope.TEMPLATEID";
                    }
                }
            }else{
                    if(queryAttributes[i]=='templateid'){
                        sql+='coupon_template.TEMPLATEID, ';
                    }else{
                        if(queryAttributes[i]=='merchantcode'){
                            sql+='coupon_template.MERCHANTCODE,';
                        }else {
                            sql += queryAttributes[i].toString().toLocaleUpperCase() + ",";
                        }
                }
            }
        }

        if(queryCondition.templatecode!=null){
            sql+='and TEMPLATECODE like %';
            sql+=queryCondition.templatecode+"%";
        }
        if(queryCondition.templatecontent!=null){
            sql+='and TEMPLATECONTENT like %';
            sql+=queryCondition.templatecontent+"% ";
        }
        if(queryCondition.dateeffective!=null){
            if(queryCondition.dateeffective.comp==-1){
               sql+='and DATEEFFECTIVE <';
                sql+=queryCondition.dateeffective.date;
            }
            if(queryCondition.dateeffective.comp==0){
                sql+='and DATEEFFECTIVE='
                sql+=queryCondition.dateeffective.date;
            }
            if(queryCondition.dateeffective.comp==1){
                sql+='and DATEEFFECTIVE >';
                sql+=queryCondition.dateeffective.date;
            }
            if(queryCondition.dateeffective.comp==2){
                sql+='and DATEEFFECTIVE <=';
                sql+=queryCondition.dateeffective.date;
            }
            if(queryCondition.dateeffective.comp==3){
                sql+='and DATEEFFECTIVE >=';
                sql+=queryCondition.dateeffective.date;
            }
        }
        if(queryCondition.dateexpires!=null){
            if(queryCondition.dateexpires.comp==-1){
               sql+='and DATEEXPIRES <';
                sql+=queryCondition.dateexpires.date;
            }
            if(queryCondition.dateexpires.comp==0){
                sql+='and DATEEXPIRES ='
                sql+=queryCondition.dateexpires.date;
            }
            if(queryCondition.dateexpires.comp==1){
                sql+='and DATEEXPIRES >';
                sql+=queryCondition.dateexpires.date;
            }
            if(queryCondition.dateexpires.comp==2){
                sql+='and DATEEXPIRES <=';
                sql+=queryCondition.dateexpires.date;
            }
            if(queryCondition.dateexpires.comp==3){
                sql+='and DATEEXPIRES >=';
                sql+=queryCondition.dateexpires.date;
            }
        }
        if(queryCondition['MERCHANTCODE']!=null){
            sql+= 'and template_usescope.MERCHANTCODE =';
            sql+=queryCondition.MERCHANTCODE;
        }
        if(queryCondition.usescope!=null){
            if(queryCondition.usescope==false){
                if(queryCondition['DEPTCODE']!=null){
                    sql+='and template_usescope.DEPTCODE';
                    sql+=queryCondition.DEPTCODE;
                }
                if(queryConditionu['BRANDCODE']!=null){
                    sql+='and template_usescope.BRANDCODE';
                    sql+=queryCondition.BRANDCODE;
                }
            }
        }
        console.log(sql);
        generalDAO.runSql(sql,function(err,msg){
            cb(err,msg);
        })
    }else{
        var attributes=[];
        for(var i=0;i<queryAttributes.length;i++){
            attributes.push(queryAttributes[i].toString().toLocaleUpperCase());
        }
        var whereCondition={};
        if(queryCondition.templatecode!=null){
            whereCondition['TEMPLATECODE']={$like:queryCondition.templatecode};
        }
        if(queryCondition.templatecontent!=null){
            whereCondition['TEMPLATECONTENT']={$like:queryCondition.templatecontent};
        }
        if(queryCondition.dateeffective!=null){
            if(queryCondition.dateeffective.comp==-1){
                whereCondition['DATEEFFECTIVE']={$lt:queryCondition.dateeffective.date};
            }
            if(queryCondition.dateeffective.comp==0){
                whereCondition['DATEEFFECTIVE']=queryCondition.dateeffective.date;
            }
            if(queryCondition.dateeffective.comp==1){
                whereCondition['DATEEFFECTIVE']={$gt:queryCondition.dateeffective.date};
            }
            if(queryCondition.dateeffective.comp==2){
                whereCondition['DATEEFFECTIVE']={$lte:queryCondition.dateeffective.date};
            }
            if(queryCondition.dateeffective.comp==3){
                whereCondition['DATEEFFECTIVE']={$gte:queryCondition.dateeffective.date};
            }
        }
        if(queryCondition.dateexpires!=null){
            if(queryCondition.dateexpires.comp==-1){
                whereCondition['DATEEXPIRES']={$lt:queryCondition.dateexpires.date};
            }
            if(queryCondition.dateexpires.comp==0){
                whereCondition['DATEEXPIRES']=queryCondition.dateexpires.date;
            }
            if(queryCondition.dateexpires.comp==1){
                whereCondition['DATEEXPIRES']={$gt:queryCondition.dateexpires.date};
            }
            if(queryCondition.dateexpires.comp==2){
                whereCondition['DATEEXPIRES']={$lte:queryCondition.dateexpires.date};
            }
            if(queryCondition.dateexpires.comp==3){
                whereCondition['DATEEXPIRES']={$gte:queryCondition.dateexpires.date};
            }
        }
        if(whereCondition['MERCHANTCODE']!=null){
            whereCondition['MERCHANTCODE']=queryCondition.MERCHANTCODE;
        }
        if(queryCondition.usescope!=null){
            if(queryCondition.usescope==false){
                if(whereCondition['DEPTCODE']!=null){
                    whereCondition['DEPTCODE']=queryCondition.DEPTCODE;
                }
                if(whereCondition['BRANDCODE']!=null){
                    whereCondition['BRANDCODE']=queryCondition.BRANDCODE;
                }
            }
        }
        var query={};
        query.where=whereCondition;
        query.attributes=attributes;
        coupontemplateDAO.queryAll(query,function(err,msg){
            cb(err,msg);
        })
    }

}
exports.queryEffectiveTemplate=queryEffectiveTemplate;