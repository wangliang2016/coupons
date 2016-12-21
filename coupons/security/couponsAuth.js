var jwt = require('jwt-simple');
var iconv=require("iconv-lite");
var crypto=require('crypto');
var fs = require('fs');
var userDAO     = require('../dao/userDAO');

exports.authority = function(req, res, next){
    //需要验证它是否是一个string
    var result = checkAuthenticate(req,function(err,msg){
        if(!err&&msg){
            next();
        }else{
            res.send({status:false,msg:err});
        }
    });
}


var checkAuthenticate = function(req,cb){
    var content=req.body;
    var merchantcode = (req.body && req.body.MERCHANTCODE) || (req.query && req.query.MERCHANTCODE)||(req.body && req.body.merchantcode) || (req.query && req.query.merchantcode);
    var signature_str = (req.body && req.body.sign) || (req.query && req.query.sign);
    var sign_type = (req.body && req.body.sign_type) || (req.query && req.query.sign_type);
    if((sign_type!='RSA-SHA1')&&(sign_type!='RSA-SHA256')&&(sign_type!='RSA-SHA512')){
        cb('签名加密方式存在问题',null);
        return;

    }
    console.log("checking authentication:"+ merchantcode);
    var clientKey;
    var userid;
    userDAO.queryOne({
        attributes:['USERID','PUBLICKEY'],
        where:{'MERCHANTCODE':merchantcode}},function(err,msg){
        if(!err&&msg){
            clientKey=(msg.PUBLICKEY).toString('ascii');
            userid=msg.USERID;
            //除去待签名参数数组中的空值和签名参数
            var para_filter = paraFilter(content);
            //对待签名参数数组排序
            var para_sort = argSort(para_filter);
            //把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
            var prestr = createLinkstring(para_sort);

            var gbkBytes = iconv.encode(prestr,'utf8');
            var data=gbkBytes;
            console.log("验证前："+data);
            var verifier = crypto.createVerify(sign_type);
            if(!((data instanceof String)||(typeof data =='string'))&&!Buffer.isBuffer(data)){
                cb("所给的数据不是一个string也不是一个buffer",null);
                return;
            }
            if(!((signature_str instanceof String)||(typeof signature_str =='string'))&&!Buffer.isBuffer(signature_str)){
                cb("所给的数据不是一个string也不是一个buffer",null);
                return;
            }
            verifier.update(data);
            var ver= verifier.verify(clientKey,signature_str, "base64");
            if(ver==false){
                cb("签名错误",null);
                return;
            }else {
                console.log("success1");
                cb(null,userid);
                return;
            }
        }else{
            cb("该商户号不存在",null);
            return;
        }
    });
};
var getSign=function(serverPrivateKey,sign_type,content){
    //除去待签名参数数组中的空值和签名参数
    var para_filter = paraFilter(content);
    //对待签名参数数组排序
    var para_sort = argSort(para_filter);
    //把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
    var prestr = createLinkstring(para_sort);

    var gbkBytes = iconv.encode(prestr,'utf8');
    var data=gbkBytes;
    var signn=crypto.createSign(sign_type);
    signn.update(data);
    var sig=signn.sign(serverPrivateKey,'base64');

    return sig;
}
exports.getSign=getSign;

var  paraFilter = function(para){
    var para_filter = new Object();
    for (var key in para){
        if(key == 'sign' || key == 'sign_type' || para[key] == ''){
            continue;
        }
        else{
            para_filter[key] = para[key];
        }
    }

    return para_filter;
}

var argSort = function(para){
    var result = new Object();
    var keys = Object.keys(para).sort();
    for (var i = 0; i < keys.length; i++){
        var k = keys[i];
        result[k] = para[k];
    }
    return result;
}
var createLinkstring = function(para){
    //return qs.stringify(para);
    var ls = '';
    for(var k in para){
        ls = ls + k + '=' + para[k] + '&';
    }
    ls = ls.substring(0, ls.length - 1);
    return ls;
}
