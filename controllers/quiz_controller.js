var models = require('../models/models.js');


exports.question=function(req,res) {
  models.Quiz.findAll().then( function(quiz) {res.render('quizes/question',{pregunta: quiz[0].pregunta })} );
};


exports.answer=function(req,res) {
  var resultado='incorrecto';
  if (req.query.respuesta === req.quiz.respuesta ){
    resultado='Correcto';
  }   

  res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado,errors: []}); 
  

};


exports.author=function(req,res){
res.render('author',{quiz: req.quiz,errors: []});
};
// GET /quizes/id:/answer
exports.show= function(req,res) {
  
  res.render('quizes/show',{quiz: req.quiz,errors: []});

  
};

exports.load=function(req,res,next,quizId){
  models.Quiz.find({
    where: {id: Number(quizId)},
    include: [{ model: models.Comment }]
    }).then(
    function(quiz){
      if(quiz){
        req.quiz=quiz;
        next();
      } else {
        next(new Error('No existe quizId'));
      }
    })

};
exports.index= function(req,res) {

  if (req.query.search){
    req.query.search.replace(/ /g,'%');
    models.Quiz.findAll({where:["pregunta like ?","%"+req.query.search+"%"],order: '`pregunta` ASC'}).then(function(quizes) {
    res.render('quizes/index.ejs',{quizes: quizes,errors: []});
    })
    
  } else{
    models.Quiz.findAll().then(function(quizes) {
      res.render('quizes/index.ejs',{quizes: quizes,errors: []});
    })
  }
};

exports.new= function(req,res) {
  var quiz= models.Quiz.build(
    {pregunta: "Pregunta", respuesta: "Respuesta",errors: []}
  );
  res.render('quizes/new',{quiz: quiz,errors: []});
};

exports.create= function(req,res) {
  req.body.quiz.UserId=req.session.user.id;
  var quiz=models.Quiz.build(req.body.quiz);
  quiz.validate().then(function(err){
    if (err){
      res.render('quizes/new',{quiz:quiz, errors:err.errors});
    }else{
      quiz.save({fields: ["pregunta", "respuesta","UserId"]}).then(function(){res.redirect('/quizes');})
    }
  })


};
exports.edit=function(req,res){
  var quiz=req.quiz;
  res.render('quizes/edit',{quiz: quiz,errors: []});
};




exports.update= function(req,res) {
  req.quiz.pregunta=req.body.quiz.pregunta;
  req.quiz.respuesta=req.body.quiz.respuesta;
  
  req.quiz.validate().then(function(err){
    if (err){
      res.render('quizes/edit',{quiz:quiz, errors:err.errors});
    }else{
      req.quiz.save({fields: ["pregunta", "respuesta"]}).then(function(){res.redirect('/quizes');})
    }
  })


};

exports.destroy=function(req,res){
req.quiz.destroy().then( function(){ res.redirect('/quizes');}).catch(function(error){next(error)});
}