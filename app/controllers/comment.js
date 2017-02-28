'use strict'

var mongoose = require('mongoose')


var User = mongoose.model('User')
var Creation = mongoose.model('Creation')
var Comment = mongoose.model('Comment')


var userFields = [
	'avatar',
	'nickname',
	'gender',
	'age',
	'breed'
]



exports.find = function *(next){
	var id = this.query.creative
	if(!id){
		this.body={
			success:false,
			err:'id不能为空'
		}
		return next
	}

	var page = parseInt(this.query.page,10) || 1
	var count = 5
	var offset = (page-1) * count

	var queryArray = [
		Comment
		.find({creation: id})
		.sort({
			'meta.createAt': -1,
		})
		.skip(offset)
		.limit(count)
		.populate('replyBy',userFields.join(' '))
		.exec(),
		Comment.count({creation: id}).exec()
	]

	var data = yield queryArray
	console.log(data);
	this.body = {
		success: true,
		data: data[0],
		total: data[1]
	}
}


exports.save = function *(next){
	var commentData = this.request.body.comment
	var user = this.session.user
	var creation = yield Creation.findOne({
		_id: commentData.creative
	})
	.exec()
	var userData = yield User.findOne({
		_id: user._id
	})
	.exec()

	if(!creation){
		this.body = {
			success:false,
			err:'视频不见了'
		}
		return next
	}

	var comment

	if(commentData.cid){
		comment = yield Comment.findOne({
			_id: commentData.cid
		})
		.exec()

		var reply = {
			from: commentData.from,
			to: commentData.tid,
			content: commentData.content
		}

		content.reply.push(reply)

		comment = yield comment.save()

		this.body = {
			success: true
		}
	}else{

		comment = {
			creation: creation._id,
			replyBy: userData,
			replyTo: creation.author,
			content: commentData.content
		}
		comment = new Comment(comment)

		comment = yield comment.save()

		this.body = {
			success: true,
			data: [comment]
		}
	}
}





