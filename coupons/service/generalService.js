var express        = require('express');
var crypto          =require('crypto');
var fs              =require('fs');


exports.checkTime1=function(firstTime,secondTime){
    var firstYear=firstTime.getFullYear();
    var secondYear=secondTime.getFullYear();
    var firstMonth=firstTime.getMonth();
    var secondMonth=secondTime.getMonth();
    var firstDay=firstTime.getDate();
    var secondDay=secondTime.getDate();
    var firstHours = firstTime.getHours();
    var firstMinutes = firstTime.getMinutes();
    var firstSeconds = firstTime.getSeconds();
    var secondHours = secondTime.getHours();
    var secondMinutes = secondTime.getMinutes();
    var secondSeconds = secondTime.getSeconds();
    var firsttimes=new Date(firstYear,firstMonth,firstDay,firstHours,firstMinutes,firstSeconds).getTime();
    var secondtimes=new Date(secondYear,secondMonth,secondDay,secondHours,secondMinutes,secondSeconds).getTime();
    var a= secondtimes-firsttimes;
    if (a < 0) {
        //alert("endTime小!");
        return 0;
    } else if (a > 0) {
        //alert("endTime大!");
        return 1;
    } else if (a == 0) {
        //alert("时间相等!");
        return 2;
    } else {
        //return 'exception'
        return 3;
    }
}
exports.checkTime2=function(beginTime,endTime){
    var beginTimes = beginTime.substring(0, 10).split('-');
    var endTimes = endTime.substring(0, 10).split('-');

    beginTime = beginTimes[1] + '-' + beginTimes[2] + '-' + beginTimes[0] + ' ' + beginTime.substring(10, 19);
    endTime = endTimes[1] + '-' + endTimes[2] + '-' + endTimes[0] + ' ' + endTime.substring(10, 19);

    var a = (Date.parse(endTime) - Date.parse(beginTime)) / 3600 / 1000;
    if (a < 0) {
        //alert("endTime小!");
        return 0;
    } else if (a > 0) {
        //alert("endTime大!");
        return 1;
    } else if (a == 0) {
        //alert("时间相等!");
        return 2;
    } else {
        //return 'exception'
        return 3;
    }
}
exports.getFormatTime=function(d){
    var year = d.getYear();
    var month = d.getMonth()+1;
    var date = d.getDate();
    var day = d.getDay();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    var ms = d.getMilliseconds();
    var curDateTime= year;
    if(month>9)
        curDateTime = curDateTime +"-"+month;
    else
        curDateTime = curDateTime +"-0"+month;
    if(date>9)
        curDateTime = curDateTime +"-"+date;
    else
        curDateTime = curDateTime +"-0"+date;
    if(hours>9)
        curDateTime = curDateTime +""+hours;
    else
        curDateTime = curDateTime +"0"+hours;
    if(minutes>9)
        curDateTime = curDateTime +":"+minutes;
    else
        curDateTime = curDateTime +":0"+minutes;
    if(seconds>9)
        curDateTime = curDateTime +":"+seconds;
    else
        curDateTime = curDateTime +":0"+seconds;
    return curDateTime;

}
exports.getNowTimeString=function(){
    var myDate=new Date();
    var date="";
    var year=myDate.getYear().toString().substring(1,3);
    var month=myDate.getMonth().toString();
    var day=myDate.getDate().toString();
    var hour=myDate.getHours().toString();
    var minute=myDate.getMinutes().toString();
    var second=myDate.getSeconds().toString();
    if(month.length==1){
        month="0"+month;
    }
    if(day.length==1){
        day="0"+day;
    }
    if(hour.length==1){
        hour="0"+hour;
    }
    if(minute.length==1){
        minute="0"+minute;
    }
    if(second.length==1){
        second="0"+second;
    }
    var time=year+month+day+hour+minute+second;
    return time;
}
exports.isNumber = function(v){
    return typeof v ==='number'&& isFinite(v);
}