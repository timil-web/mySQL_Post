require('dotenv').config();

const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require('uuid');


app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}))
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"/views"));

// const connection = mysql.createConnection({
// 	host: process.env.MYSQL_HOST || 'localhost',
// 	user: process.env.MYSQL_USER || 'root',
// 	database: process.env.MYSQL_DATABASE,
// 	password: process.env.MYSQL_PASSWORD
// });
const connection = mysql.createConnection(process.env.MYSQL_URL);

const port = process.env.MYSQL_PORT;

let getRandomUser = () => {
	return[
		faker.string.uuid(),
		faker.internet.username(),
		faker.internet.email(),
		faker.internet.password(),
	];
}

// home route
app.get("/", (req,res) => {
	let q = `select count(*) from user`;
	try{
		connection.query(q, (err, result) => {	
			if (err) throw err;
			let count = result[0]["count(*)"];
			res.render("home.ejs",{count});
		});
	} catch (err) {
		console.log(err);
		res.send("some error");
	}
	// res.send("home page");
})


// show route
app.get("/user", (req,res) => {
	let q = `select * from user`;
	try{
		connection.query(q, (err, users) => {	
			if (err) throw err;
			res.render("showuser.ejs",{users});
		});
	} catch (err) {
		// console.log(err);
		res.send("some error");
	}
});

// edit route
app.get("/user/:id/edit", (req,res) => {
	let {id} = req.params;
	let q = `select * from user where id='${id}'`
	
	try{
		connection.query(q, (err, result) => {	
			if (err) throw err;
			let user = result[0];
			res.render("edit.ejs",{user});
		});
	} catch (err) {
		// console.log(err);
		res.send("some error");
	}
})

//update (DB) route
app.patch("/user/:id", (req,res) => {
	let {id} = req.params;
	let { username: newUsername, password: formPass } = req.body;
	let q = `SELECT * FROM user WHERE id='${id}'`;
	console.log(formPass);
	
	try{
		connection.query(q, (err, result) => {	
			if (err) throw err;
			let user = result[0];
			if (formPass != user.password) {
				res.send("wrong password");
			}else{
				let q2 = `update user set username='${newUsername}' where id='${id}'`;
				connection.query(q2, (err,result) => {
					if(err) throw err;
					res.redirect("/user");
				});
			}
		});
	} catch (err) {
		console.log(err);
		res.send("some error");
	}
})

// delete route
app.get("/user/:username/delete", (req,res) => {
	let {username} = req.params;
	let q = `select * from user where username='${username}'`
	
	try{
		connection.query(q, (err, result) => {	
			if (err) throw err;
			let user = result[0];
			res.render("delete.ejs",{user});
		});
	} catch (err) {
		// console.log(err);
		res.send("some error");
	}
})

//delete (DB) route
app.delete("/user/:username", (req,res) => {
	let {username} = req.params;
	let { email: newEmail, password: formPass } = req.body;
	let q = `SELECT * FROM user WHERE username='${username}'`;
	
	try{
		connection.query(q, (err, result) => {	
			if (err) throw err;
			let user = result[0];
			if (formPass != user.password) {
				res.send("wrong password");
			}else{
				let q2 = `delete from user where username='${username}'`;
				connection.query(q2, (err,result) => {
					if(err) throw err;
					res.redirect("/user");
				});
			}
		});
	} catch (err) {
		console.log(err);
		res.send("some error");
	}
})


// add user
app.post("/user/add", (req,res) => {
	const { email, username, password } = req.body;
	let id = uuidv4();
	let q = `insert into user (id,email,username,password) values (?,?,?,?)`;

	try{
		connection.query(q,[id,email,username,password], (err, result) => {	
			if (err) throw err;
			let user = result[0];
			res.redirect("/user");
		});
	} catch (err) {
		res.send("some error");
	}
})

app.listen(port,() => {
	console.log("server is listening to port 3000");	
})