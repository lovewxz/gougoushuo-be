'use strict'

var qiniu = require('qiniu')
var config = require('../../config/config')
var uuid = require('uuid')
var cloudinary = require('cloudinary')
var Promise =require('bluebird')
var sha1 = require('sha1')


qiniu.conf.ACCESS_KEY = config.qiniu.AK;
qiniu.conf.SECRET_KEY = config.qiniu.SK;

cloudinary.config(config.cloudinary)

exports.saveToQiniu = function(url,key){
	var client = new qiniu.rs.Client()

	return new Promise(function(resolve,reject){
		client.fetch(url,'myappvideo',key,function(err,ret){
			if(err){
				reject(err)
			}else{
				resolve(ret)
			}
		})
	})
}

exports.uploadToCloudinary = function(url){
	return new Promise(function(resolve,reject){
		cloudinary.uploader.upload(url,function(result){
			if(result.public_id){
				resolve(result)
			}else{
				reject(result)
			}
		},{
			resource_type: 'video',
			folder: 'video'
		})
	})
}
exports.getQiniuToken = function(body){
	var type = body.type
	var key = uuid.v4()
	var putPolicy
	var opts = {
		persistentNotifyUrl:config.notify
	}

	if(type === 'avatar'){
		putPolicy = new qiniu.rs.PutPolicy("myappavatar:"+key);
		// putPolicy.callbackUrl = 'http://your.domain.com/callback';
	  	// putPolicy.callbackBody = 'filename=$(fname)&filesize=$(fsize)';
	}else if(type === 'video'){
		opts.scope = 'myappvideo:'+key
		opts.persistentOps = 'avthumb/mp4/an/1'
		putPolicy = new qiniu.rs.PutPolicy2(opts);
	}else if(type === 'audio'){

	}
	var token = putPolicy.token()
	return {
		key:key,
		token:token
	}
}

exports.getCloudinaryToken = function(body) {
	var type = body.type
	var timestamp = body.timestamp
	var folder
	var tags
	if(type === 'avatar'){
		folder = 'avatar'
		tags= 'app,avatar'
	}else if(type==='video'){
		folder = 'video'
		tags = 'app,video'
	}else if(type==='audio'){
		folder = 'audio'
		tags = 'app,audio'
	}

	var signature = 'folder='+folder+'&tags='+tags+'&timestamp='+timestamp+config.cloudinary.api_secret
	signature = sha1(signature)
	var key = uuid.v4()
	return {
		token:signature,
		key:key
	}
}
