var pg=require('pg');
var path = require('path');

var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6]||null);
var user = (url[2]||null);
var pwd = (url[3]||null);
var protocol = (url[1]||null);
var dialect = "sqlite";
var port = (url[5]||null);
var host = (url[4]||null);
var storage = process.env.DATABASE_STORAGE;

var Sequelize = require('sequelize');
var comment_path=path.join(__dirname,'comment');

var user_path = path.join(__dirname,'user');


var sequelize = new Sequelize(DB_name, user, pwd,
 {
  dialect: protocol,
  protocol: protocol,
  port: port,
  host: host,
  storage: storage, // solo SQLite (.env)
  omitNull: true // solo Postgres
 });


var sequelize = new Sequelize(null, null, null, {dialect: "sqlite", storage: "quiz.sqlite"});
var Quiz = sequelize.import(path.join(__dirname,'quiz'));
var Comment = sequelize.import(comment_path);
var User = sequelize.import(user_path);

Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

Quiz.belongsTo(User);
User.hasMany(Quiz);

sequelize.sync().then(function() {
  User.count().then(function (count){
    if (count === 0) {
      User.bulkCreate(
        [{username:'admin', password: '1234', isAdmin: true},
         {username:'pepe', password: '5678',}]
      ).then(function(){ 
        console.log('base de datos iniciada');
        Quiz.count().then(function(count){
          if (count==0) {
            User.bulkCreate(
            [{pregunta:'capital italia', respuesta: 'roma', UserId: 2},
            {pregunta:'capital portugal', respuesta: 'lisboa',UserId:2}]
            ).then(function(){console.log('base de datos iniciada');});
          }
        });

      });
    };
  });
});
exports.Quiz = Quiz;
exports.Comment = Comment;
exports.User=User;