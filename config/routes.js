'use strict'
var Router = require('koa-router')
var User = require('../app/controllers/user')
var App = require('../app/controllers/app')
var Creation = require('../app/controllers/creation')
var Comment = require('../app/controllers/comment')


module.exports = function(){
	var router = new Router({
		prefix:'/api'
	})

	//user
	router.post('/u/signup',App.hasBody,User.signup)
	router.post('/u/verify',App.hasBody,User.verify)
	router.post('/u/update',App.hasBody,App.hasToken,User.update)

	//app
	router.post('/signature',App.hasBody,App.hasToken,App.signature)
	router.post('/creative/video',App.hasBody,App.hasToken,Creation.video)
	router.post('/creative/audio',App.hasBody,App.hasToken,Creation.audio)
	router.post('/creative',App.hasBody,App.hasToken,Creation.save)
	router.get('/creative',App.hasToken,Creation.find)

	//comments
	router.post('/comments',App.hasBody,App.hasToken,Comment.save)
	router.get('/comments',App.hasToken,Comment.find)

	//votes
	router.post('/up',App.hasBody,App.hasToken,Creation.up)
	return router
}