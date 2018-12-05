'use strict';

var express = require("express");
var router = express.Router();
var Question = require("./models").Question;

//2 params, name of route param in string, and callback function
router.param("qID", function(req,res,next,id){
	Question.findById(id, function(err, doc){
		if(err) return next(err);
		if(!doc) {
			err = new Error("Not Found");
			err.status = 404;
			return next(err);
		}
		req.question = doc;
		return next();
	});
});


router.param("aID", function(req,res,next,id){
	//   ID method takes an ID of a sub-document, and
	//  returns the sub-document with that matching ID
	req.answer = req.question.answers.id(id);
	if(!req.answer) {
		err = new Error("Not Found");
		err.status = 404;
		return next(err);
	}
	next();
});

// GET /questions
// Route for questions collection
router.get("/", function(req, res, next){
	//null disallows paricaled documents
	//sorting the order
	Question.find({})
				.sort({createdAt: -1})
				.exec(function(err, questions){
					if(err) return next(err);
					res.json(questions);
				});
});

// POST /questions
// Route for creating questions
router.post("/", function(req, res, next){
	var question = new Question(req.body);
	question.save(function(err, question){
		if(err) return next(err);
		res.status(201);
		res.json(question);
	});
	// res.json({
	//   response: "you sent me a POST request",
	//   body: req.body
	// });
});

// GET /questions/:id
// Route for specific questions
router.get("/:qID", function(req, res, next){
	res.json(req.question);
});
// res.json({
//   response: "you sent me a GET request for ID" + req.params.qID
// });
// });

// POST /questions/:id/answers
// Route for creating an answer
router.post("/:qID/answers", function(req, res,next){
	req.question.answers.push(req.body);
	req.question.save(function(err, question){
		if(err) return next(err);
		res.status(201);
		res.json(question);
	});
	// res.json({
	//   response: "you sent me a POST request to /answer",
	//   questionId: req.params.qID,
	//   body: req.body
});

// PUT /questions/:qID/answers/:aID
// Edit a specific answer
router.put("/:qID/answers/:aID", function(req, res){
	req.answer.update(req.body, function(err, result){
		if(err) return next(err);
		res.json(result);
	});
	// res.json({
  //   response: "you sent me a PUT request to  /answers",
  //   questionId: req.params.qID,
  //   answerId: req.params.aID,
  //   body: req.body
  // });
});

// DELETE /questions/:qID/answers/:aID
// Delete a specific answer
router.delete("/:qID/answers/:aID", function(req, res){
	req.answer.remove(function(err){
		req.question.save(function(err, question){
			if(err) return next(err);
			res.json(question);
		});
	});
	// res.json({
  //   response: "you sent me a DELETE request to  /answers",
  //   questionId: req.params.qID,
  //   answerId: req.params.aID
  // });
});

// POST /questions/:qID/answers/:aID/vote-up
// POST /questions/:qID/answers/:aID/vote-down
// Vote on a specific answer
router.post("/:qID/answers/:aID/vote-:dir",
	function(req, res, next){
		//this controls that only up or down can go at the end of vote-
		if(req.params.dir.search(/^(up|down)$/) === -1) {
			var err = new Error("Not Found");
			err.status = 404;
			next(err);
		} else {
			req.vote = req.params.dir;
			next();
		}
	},
	function(req, res, next){
		req.answer.vote(req.vote, function(err, question){
			if(err) return next(err);
			res.json(question);
		});
		// res.json({
	  //   response: "you sent me a POST request to /vote-" + req.params.direct,
	  //   questionId: req.params.qID,
	  //   answerId: req.params.aID,
	  //   vote: req.params.direct
	  // });
});

module.exports = router;
