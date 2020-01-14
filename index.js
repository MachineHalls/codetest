const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const port = 3000
const sqlite3 = require('sqlite3').verbose();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let db = new sqlite3.Database(':memory:', (err) => {
	if (err) {
		return console.error(err.message);
	}
	db.run("CREATE TABLE people (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR NOT NULL, age int);", [], function(err){
		if (err) throw err;
		db.run("INSERT INTO people (name, age) VALUES ('Mark', null),('J.P.',31),('Zach',null),('Nadia',null),('Ben',null);", [], (err) => {
			if (err) throw err;
			db.run("CREATE TABLE pets (id INTEGER PRIMARY KEY AUTOINCREMENT, type VARCHAR NOT NULL, breed VARCHAR NOT NULL,name VARCHAR NOT NULL, age int NOT NULL, owner_id int, CONSTRAINT fk_pet_owner_id_owner_id FOREIGN KEY (owner_id) REFERENCES people (id));", [], (err) => {
				if (err) throw err;
				db.run("INSERT INTO pets (name, age, type, breed, owner_id) VALUES ('Zara', 4, 'Dog', 'Pomeranian', null),('Jules', 5, 'Dog', 'Dalmation', null),('Ozzy', 13, 'Bird', 'Cockatiel');",[], (err) => {
					if (err) throw err;
				})
			})
		});
	});
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/index.html')));
app.get('/angular.min.js', (req, res) => res.sendFile(path.join(__dirname + '/angular.min.js')));

app.get('/people', (req, res) => {
	let sql = "SELECT * FROM people;";
	db.all(sql,[],(err, rows) => {
		if (err) throw err;
		res.json(rows);
	})
})

app.get('/pets', (req, res) => {
	let sql = "SELECT pets.id, pets.name, pets.age, pets.type, pets.breed, people.id AS owner_id, people.name AS owner_name FROM pets JOIN people ON pet.owner_id = people.id;";
	db.all(sql,[],(err, rows) => {
		if (err) throw err;
		res.json(rows);
	})
})

app.get('/pets/:id', (req, res) => {
	let sql = "SELECT pets.id, pets.name, pets.age, pets.type, pets.breed, people.id AS owner_id, people.name AS owner_name FROM pets JOIN people ON pets.owner_id = people.id WHERE pets.id = ?;";
	db.all(sql,[req.params.id],(err, rows) => {
		if (err) throw err;
		res.json(rows);
	})
})

app.get('/pets/min_age/:minimumAge', (req, res) => {
	db.all("SELECT * FROM pets WHERE age >= ?",[req.params.minimumAge],(err, rows) => {
		if (err) throw err;
		res.json(rows);
	})
})

app.listen(port, () => console.log(`Listening on port ${port}!`))