var express        = require('express');
var generalService        =require('./generalService');
var couponDAO        =require('../dao/coupon_instanceDAO');
var coupon_typeDAO        =require('../dao/coupon_templateDAO');
var redisDAO          =require('../dao/redis');
var async               =require('async');

exports.recoverDistriNum=function(cb){
    async.waterfall([
        function(cb){
            var date=new Date();
            var qry={attributes:['RULEIDENTIFYNUM','TOTALNUMBER'],'where':{'DATEEXPIRES':{gte:date},'DATEEFFECTIVE':{lte:date}}};
            coupon_templateDAO.querySome(qry,function(err,msg){
                if(!err){
                    cb(null,msg);
                }
                else{
                    cb(err,null);
                }
            })
        },
        function(idList,cb){
            var results=[];
            idList.forEach(function(idl){
                var id=idl.RULEIDENTIFYNUM;
                var num=idl.TOTALNUMBER;
                coupon_instanceDAO.queryAndCount({attributes:['COUPONID'],'where':{'RULEIDENTIFYNUM':id}},function(err,msg){
                    if(!err){
                        var distributedNumber=Number(msg.count);
                        var notDistriNum=Number(num)-Number(distributedNumber);
                        var result={
                            "id":id,
                            "distributedNumber":distributedNumber,
                            "notDistriNum":notDistriNum
                        };
                        results.push(result);
                    }else{
                        cb(err,null);
                    }
                });
            });
            cb(null,results);
        },
        function(updateInfo,cb){
            async.parallel([
                function(cb){
                    async.eachSeries(updateInfo, function (item, callback) {
                        coupon_templateDAO.update({HAVEDISTRIBUTED:updateInfo[item].distributedNumber},{where:{RULEIDENTIFYNUM:updateInfo[item].id}},function(err,msg){
                            callback(err,msg);
                        }, function (err,msg) {
                            cb(err,msg);
                        });
                    })
                },
                function(cb){
                    async.eachSeries(updateInfo, function (item, callback) {
                        var id=updateInfo[item].id+"HAVENOTDIS";
                        redisDAO.setString(id,updateInfo[item].notDistriNum,function(err,msg){
                            callback(err,msg);
                        }, function (err) {
                            cb(err,null);
                        });
                    })
                }
            ],function(err,msg){
                if(!err){
                    cb(null,"update all effective coupons");
                }else{
                    cb(err,null);
                }
            })
        }
    ])

}