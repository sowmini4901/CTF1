const Express = require("express");
const BodyParser = require("body-parser");
const Mongoose = require("mongoose");
const Bcrypt = require("bcryptjs");
const path = require('path');
var moment = require('moment');


var cookieParser = require('cookie-parser');

var app = Express();

app.use(cookieParser('null_chapter_is_the_best'));


app.use(BodyParser.urlencoded({ extend: true }));
app.use(BodyParser.json());
//mongodb+srv://admin:password@123@cluster0-ug10m.mongodb.net/test?retryWrites=true&w=majority
Mongoose.connect("mongodb://127.0.0.1:27017/mydb",{ useNewUrlParser: true,useUnifiedTopology: true });



const UserSchema = new Mongoose.Schema({
    nickname: String,
    
    email:String,
    
    loggedin:{ 
        type : Boolean, 
        default: false 
    },
    score:{
        type:Number,
        default:0
    }
});



const UserModel = new Mongoose.model("user", UserSchema);

app.get('/', function(request, response) {
    return response.sendFile(__dirname + '/welcome.html');
});


/*app.post("/api/register", async (request, response) => {
    
    try {
       
        var user = new UserModel(request.body);
        var already = await UserModel.findOne({ email: request.body.email }).exec();
        if(!already) {
             var result = await user.save();
        
     return response.json({ message: 'User successfully registered!!' });
        }else{
             
            response.json({ message: 'Email already exists' });

        }
      }catch (error) {
        response.status(501).json({error:'internal server error'});
    }
      
        
    }); */
/*app.post("/login"{
    response.cookies
    user.loggedin=true;

})
*/

   

app.post("/register", async (request, response) => {
    try {
        if(request.signedCookies['login']===true){
        var user = new UserModel(request.body);
        var user_check = await UserModel.findOne({ email: request.body.email }).exec();
        var nick_name_check = await UserModel.findOne({ nickname: request.body.nickname }).exec();
        if(!nick_name_check && !user_check) {
            var result = await user.save();
            response.cookie('username', request.body.email,{ maxAge: 900000,signed: true, httpOnly: true });
            return response.status(200).json({message:"User registered","start-time":moment().unix()});
        }else if(!nick_name && user_check){
             
            return response.status(400).json({error: 'Email already exists' });
        }
        else if(nick_name && !user_check){
             
            return response.status(400).json({error: 'nickname already exists' });
        }
    }else{
        return response.status(401).json({error:"Unauthorized access"});
    }

    } catch (error) {
        response.status(501).json({error:'internal server error'});
    }
});

app.post("logout",async(request,response)=>{
    try {
        var user = await UserModel.findOne({ email: request.signedCookies['username'] }).exec();
        if(!user) {
            return response.status(400).json({message:"The email does not exist"});
        }
        
        else{
        UserModel.findOne({email: request.signedCookies['username']}, function(err, user){
            if(err)return ("err");
            user.loggedin = false;
            user.save(function(err){
               if(err)return ("err");
               //user has been updated
             });
                return response.json({message:"Logged out sucessfully"});
           });
        }
    
    } catch (error) {
        response.status(501).json({error:'internal server error'});
    }
});




/*const challenges = require('./challenges.json');
const { INTEGER } = require("sequelize");
*/
/*
app.post("/api/get-challenges", async(request,response)=>{
    try {
        var user = await UserModel.findOne({ email: request.signedCookies['username'] }).exec();
        if(!user) {
            return response.status(400).json({message:"User not registered"});
        }
        
        
        else{
        UserModel.findOne({email: request.signedCookies['username']}, function(err, user){
            if(err)return ("err");
            if(user.loggedin === true) return response.send(JSON.stringify(challenges));
            else return response.json({message:"user not logged in!!"});
           });
        }
    
    } catch (error) {
        response.status(501).json({error:'internal server error'});
    }
});
*/
app.post("/leaderboard", async(request,response)=>{
    //  if()
    var user=Mongoose.model('user');
      user
      .find({}, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          response.json(result);
        }
      })
      .limit(10).sort({ score: -1 });
  });
  

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Listening at :3000...");
});