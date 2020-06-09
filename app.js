var express =  require('express') ;
var app =  express() ;
app.listen(8080,function(){
  console.log("Served has started.");
});
var bodyParser = require('body-parser'); // to use req.body
var mysql = require('mysql');
var session = require('express-session'); // to keep us logged in

var connection =mysql.createConnection({
  host: 'localhost', 
  user: 'root', //put your dbms username here
  password: 'dubai2006', //put your password here
  database:'empDb' // put your db name here
});

connection.connect(function(error){
  if(error) throw error ;
  console.log("Connected.");
});



//setup middleware
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine' , 'ejs');
app.use(session({
  secret: 'secret',
  resave: true ,
  saveUninitialized: true
}))



//routes
app.get('/' , function(req,res){
  connection.query('SELECT COUNT(*) As count From emp' , function(error, result){
    console.log(result);
    username = "";
    if (req.session.loggedin) {
      username = req.session.username;
    }
    res.render('home' , {title:'Home Page', count:result[0].count , username:username});

  })
})

app.get('/home' , function(req,res){
  connection.query('SELECT COUNT(*) As count From emp' , function(error, result){
    console.log(result);
    username = "";
    if (req.session.loggedin) {
          username = req.session.username;
    }
    res.render('home' , {title:'Home Page', count:result[0].count , username:username});

  })
})

app.get('/signup' , function(req,res){
  res.render('signup', {title:'Sign Up Page' ,errMsg: ""})
});

app.post('/signup' , function(req,res){
  var entity = {
    first_name: req.body.first_name ,
    second_name:req.body.second_name,
    user_name: req.body.username,
    user_password: req.body.password,
    email: req.body.email
  }
  var fName =  req.body.first_name;
  var sName = req.body.second_name;
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email ;
  // check if the entered user is actually there first
  connection.query("SELECT * FROM emp WHERE user_name='" + username + "'"  , function(error,result){
    if (error) {
      throw error ;
    }
    if (result.length > 0 ){
    var  errMsg = "This user already exist. Try a deffirent email / username.";
      res.render('signup' , {title:"SignUp Page", errMsg });
    }
    else {
      connection.query("INSERT INTO emp (first_name , second_name , user_name , user_password , email) VALUES (' "
      + fName +"','" + sName + "','" + username +"','" + password  + "','" + email +"')"  ,
      function(error,result){
        if (error) {
          throw error ;
        }
        console.log(result);
        // res.render('signup' , {title:"Sign Up Page", errMsg:""}) ;
        res.redirect('/' );
      })
    }
  })
})

app.get('/login' , function(req,res){
  res.render('login', {title:'Login Page' , errMsg:""});
})

app.post('/login' , function(req,res){
var username  = req.body.username ;
var password =  req.body.password  ;
  connection.query('SELECT * FROM emp WHERE user_name = ? AND user_password = ?' , [username,password], function(error,result){
    if(error) throw error;
    if(result.length > 0) {
      req.session.loggedin = true ;
      req.session.username = username ;
      console.log("Logged In !");
      res.redirect('/');
    }
    else {
      errMsg = "Incorrect username or password" ;
      res.render('login' , {title:"Login Page", errMsg:errMsg}) ;
    }
  })
})

app.get('/logout' , function(req,res){
  req.session.loggedin = false ;
  res.redirect('/')
})

app.get('/display' , function(req,res){
  username = "";
var q = 'SELECT * FROM emp';
if (req.session.loggedin === true){
  var username  = req.session.username;

  connection.query(q, function(error,result){
      // var password =  req.body.password  ;

    if (error) {
      throw error ;
    }
    res.render('displayAll' , {title:"Display All Employees Page" , username:username , employee:result})

    // console.log(result);
  })
}
})

app.get('/edit/:emp' , function(req,res){
  var id = req.params.emp ;
  username = ""  ;
  if (req.session.loggedin === true) {
    username = req.session.username ;

  var q = 'SELECT * FROM emp WHERE id =' + id   ;
    connection.query(q, function(error,result){
      if (error) {
        throw error ;
      }
      console.log(result[0]);
      res.render('edit', {title:"Edit Employee Page" , username:username ,employee:result[0]})
    })
  }
  else {
    var q = 'SELECT * FROM emp WHERE id =' + id   ;
      connection.query(q, function(error,result){
        if (error) {
          throw error ;
        }
        console.log(result[0]);
        res.render('edit', {title:"Edit Employee Page" , username:username ,employee:result[0]})
      })

  }
})

app.post('/edit/:emp' , function(req,res){
  
  var id =  req.params.emp ;
  var fn = req.body.first_name;
  var q2 = "UPDATE emp "+
  "SET first_name ='"+ fn + "', second_name='" + req.body.second_name + "', user_password ='" + req.body.password +"'" +
" WHERE id = "        + id ;
  connection.query(q2 , function(error, result){
    if (error) {
throw error ;
    }
    // console.log(result);
    res.redirect('/display')
  })
})
app.get('/delete/:emp'  ,function(req,res){

  var id =  req.params.emp;

  connection.query('DELETE FROM emp WHERE id  = ' + id , function(error,result){
    if (error) {
      throw error;
    }
    res.redirect('/display');
  })
})

app.get('/search' ,function(req,res){
  username = "" ;
  if (req.session.loggedin === true) {
    username = req.session.username ;
  res.render('search' , {title: "Find by Username Page" , username: username , errMsg:"" , member:"" })
}
else {
  res.render('search' , {title: "Find by Username Page" , username: username , errMsg:"",member:"" })


}
})

app.post('/search', function(req,res){

  username = "" ;
  var sName = req.body.second_name;
  var q3 = "SELECT * FROM emp WHERE second_name ='" + sName + "'" ;

    connection.query(q3,function(error,result){

      // if(req.session.loggedin === true ){
      //   username = req.session.username ;


      if (error) throw error ;
      console.log(result);
      if(result.length>0){
        console.log(result);
        res.render('search' , {title:"Find By Username Page" , username: username , errMsg:"" , member:result})
      }
      
  })



    })








app.get('*' , function(req,res){
  username = "";
  res.render('404Error' , {title:'Page Not Found' });
})
