var models=require("../models/models.js");

// Autoload
exports.load=function(req, res, next, userId) {
	models.User.find({where: {id: Number(userId)}})
		.then(function(user){
			if(user) {
				req.user=user;
				next();
			} else {
				next(new Error("No existe userId= "+userId));
			}
		}).catch(function(error){next(error);});
};

// Comprueba si el usuario está registrado en users
// Si autenticación falla o hay errores se ejecuta callback(error)
exports.autenticar=function(login, password, callback) {
	models.User.find({where: {username:login}
	}).then(function(user){
		if(user) {
			if(user.verifyPassword(password)) {
				callback(null, user);
			}
			else{callback(new Error("Password erróneo"));}
		} else {callback(new Error("No existe user= "+login));}
	}).catch(function(error){callback(error)});
};

// GET /user
exports.new=function(req, res) {
	var user=models.User.build(
		{username: "", password: ""});
	res.render("users/new", {user: user, errors: []});
};

// POST /user
exports.create=function(req, res){
	var user=models.User.build(req.body.user);
	user.validate().then(function(err) {
		if(err) {
			res.render("users/new", {user: user, errors: err.errors});
		} else {
			user.save({fields: ["username", "password"]}).then(
				function(){
					req.session.user={id: user.id, username: user.username};
					res.redirect(req.session.redir.toString());
				});
		}
	}).catch(function(error){next(error);});
};

// DELETE /user/:id
exports.destroy=function(req, res, next) {
	req.user.destroy().then(function(){
		// borra la sesión y redirige
		delete req.session.user;
		res.redirect(req.session.redir.toString());
	}).catch(function(error){next(error)});
};

// GET /user/:id/edit
exports.edit=function(req, res) {
	res.render("users/edit", {user: req.user, errors: []});
	// req.user: instancia de user cargada con autoload
};

// PUT /user/:id
exports.update=function(req, res, next) {
	req.user.username=req.body.user.username;
	req.user.password=req.body.user.password;
	req.user.validate().then(function(err) {
		if(err) {
			res.render("users/"+req.user.id, {user: user, errors: err.errors});
		} else {
			req.user.save({fields: ["username", "password"]}).then(
				function(){
					req.session.user={id: req.user.id, username: req.user.username};
					res.redirect(req.session.redir.toString());
				});
		}
	}).catch(function(error){next(error);});
};