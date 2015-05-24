var models=require("../models/models.js");

// Autoload -factoriza el código si ruta incluye :quizId
exports.load=function(req, res, next, quizId) {
  models.Quiz.find({
    where: {id: Number(quizId)},
    include: [{model: models.Comment}]
  }).then(function(quiz) {
    if(quiz) {
      req.quiz=quiz;
      next();
    } else {next(new Error('No existe quizId='+quizId));}
  }).catch(function(error) {next(error);});
};
//GET /quizes/:id
exports.show=function(req, res) {
  res.render('quizes/show', {quiz: req.quiz, errors: []});
};

//GET /quizes/:id/answer
exports.answer=function(req, res) {
  var resultado= "Incorrecto";
  if(req.query.respuesta === req.quiz.respuesta) {
    resultado="Correcto";
  }
  res.render("quizes/answer", {quiz: req.quiz, respuesta: resultado, errors: []});
};

//GET /quizes
exports.index=function(req, res) {
    var options={};
    if(req.user) {
       // req.user es creado por autoload de usuario
       // si la ruta lleva el pará .quizId
       options.where={UserId: req.user.id};
    }
  if(req.query.search) {
    models.Quiz.findAll({where: ["pregunta like ?", "%"+req.query.search.replace(/ /g, "%")+"%"], order: "pregunta"}).then(function(quizes) {
      res.render('quizes/index', {quizes: quizes, errors: []});
    }).catch(function(error) {next(error);});
  } else {
    models.Quiz.findAll(options).then(function(quizes) {
      res.render('quizes/index', {quizes: quizes, errors: []});
    }).catch(function(error) {next(error);});
  }
};

//GET /quizes/new
exports.new=function(req, res) {
  var quiz=models.Quiz.build(// crea objeto quiz
    {pregunta: "", respuesta: ""});
  res.render("quizes/new", {quiz: quiz, errors: []});
};

//POST /quizes/create
exports.create=function(req, res) {
  req.body.quiz.UserId=req.session.user.id;
  if(req.files.image){
    req.body.quiz.image = req.files.image.name;
  }
  var quiz=models.Quiz.build(req.body.quiz);
  quiz.validate().then(
    function(err) {
      if(err) {
        res.render("quizes/new", {quiz: quiz, errors: err.errors});
      } else {
        // Guarda en DB los campos pregunta y respuesta de quiz
        quiz.save({fields: ["pregunta", "respuesta", "UserId", "image"]}).then(function() {
          res.redirect("/quizes");// Redirección a /quizes
        });
      }
    }
  );
};

//GET /quizes/:id/edit
exports.edit=function(req, res) {
  var quiz=req.quiz;// autoload de instancia quiz
  res.render("quizes/edit", {quiz: quiz, errors: []});
};

//PUT /quizes/:id
exports.update=function(req, res) {
  if(req.files.image){
    req.quiz.image = req.files.image.name;
  }
  req.quiz.pregunta=req.body.quiz.pregunta;
  req.quiz.respuesta=req.body.quiz.respuesta;
  req.quiz.validate().then(
    function(err) {
      if(err) {
        res.render("quizes/new", {quiz: req.quiz, errors: err.errors});
      } else {
        // Guarda en DB los campos pregunta y respuesta de quiz
        req.quiz.save({fields: ["pregunta", "respuesta", "image"]}).then(function() {
          res.redirect("/quizes");// Redirección a /quizes
        });
      }
    }
  );
};

//DELETE /quizes/:id
exports.destroy=function(req, res) {
  
  req.quiz.destroy().then(function(){
    for (var i in req.quiz.Comments) {
      req.quiz.Comments[i].destroy();
    }
    res.redirect("/quizes");
  }).catch(function(error){next(error)});
};

// MW que permite acciones solamente si el quiz objeto
// pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired=function(req, res, next) {
 var objQuizOwner=req.quiz.UserId;
 var logUser=req.session.user.id;
 var isAdmin=req.session.user.isAdmin;
 if(isAdmin || objQuizOwner===logUser) {
   next();
 } else {
   res.redirect(req.session.redir.toString());
 }
}; 
