//根据系统环境载入我们的配置
var node_env        = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
var config          = require('../config/mysqlConfig.json')[node_env];
var sequelize       = require('./_sequelize');

var model= require('../model/usercode_coupon.json');
var table = sequelize.define('usercode_coupon',model,{freezeTableName:true});

exports.table=table;

//表同步，只管表是否存在，不管表内字段是否相同
exports.sync = function (cb) {
    sequelize.sync().success(function () {
        cb(null, true);
    }).error(function (err) {
        myLogger.error(err);
        cb(err, null);
    })
}

//执行sql(无论sql中是否加limit1返回始终是数组类型) 注意options必须是{}对象
exports.runSql = function (sql, options, cb) {
    if(typeof(options)=='function') {
        cb=options;
        options=null;
    }
    options= options ||{};
    options.raw=true;
    sequelize.query(sql, null, options).success(function (res) {
        cb(null, res);
    }).error(function (err) {
        myLogger.error(err);
        cb(err, null);
    })
}

//查1个
exports.queryOne = function(qry,tran,lock,cb){
    var options={raw:true};
    if(typeof(tran)!='function'){
        if(tran) options.transaction=tran;
        if(typeof(lock)!='function'){
            if(lock) options.lock=lock;
        }
        else{
            cb=lock;
        }
    } else{
        cb=tran;
    }

    table.find(qry, options).then(function(res){
        cb(null,res);
    },function (err){
        cb(err,null);
    })
}

//查
exports.queryAll = function(qry,tran,lock,cb){
    var options={raw:true};
    if(typeof(tran)!='function'){
        if(tran) options.transaction=tran;
        if(typeof(lock)!='function'){
            if(lock) options.lock=lock;
        }
        else{
            cb=lock;
        }
    } else{
        cb=tran;
    }
    table.findAll(qry, options).then(function(res){
        cb(null,res);
    },function (err) {
        cb(err,null);
    })
}

//查并计数全部
exports.queryAndCount = function(qry,tran,lock,cb){
    var options={raw:true};
    if(typeof(tran)!='function'){
        if(tran) options.transaction=tran;
        if(typeof(lock)!='function'){
            if(lock) options.lock=lock;
        }
        else{
            cb=lock;
        }
    } else{
        cb=tran;
    }
    table.findAndCountAll(qry, options).then(function(res){
        cb(null,res);
    },function (err) {
        cb(err,null);
    })
}

//增
exports.add = function(value,tran,lock,cb){
    var options={};
    if(typeof(tran)!='function'){
        if(tran) options.transaction=tran;
        if(typeof(lock)!='function'){
            if(lock) options.lock=lock;
        }
        else{
            cb=lock;
        }
    } else{
        cb=tran;
    }
    table.create(value).then(function(res){
        cb(null,res);
    },function (err) {
        cb(err,null);
    })
}

//删
exports.del = function(where,tran,lock,cb){
    var options={};
    if(typeof(tran)!='function'){
        if(tran) options.transaction=tran;
        if(typeof(lock)!='function'){
            if(lock) options.lock=lock;
        }
        else{
            cb=lock;
        }
    } else{
        cb=tran;
    }
    table.destroy(where, options).then(function(res){
        cb(null,res);
    },function (err) {
        cb(err,null);
    })
}

//改
exports.update = function(value,where,tran,lock,cb){
    var options={};
    if(typeof(tran)!='function'){
        if(tran) options.transaction=tran;
        if(typeof(lock)!='function'){
            if(lock) options.lock=lock;
        }
        else{
            cb=lock;
        }
    } else{
        cb=tran;
    }
    table.update(value, where, options).then(function(res){
        cb(null,res);
    },function (err) {
        cb(err,null);
    })
}
