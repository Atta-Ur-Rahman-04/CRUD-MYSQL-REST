const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("Veiw engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "delta_app",
  password: "Atta@51351056195",
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

// Home Route --->
app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"]; // result of 0 print the object in which we want to print the value so we access the key which is count(*)
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("Some Error Occured");
  }
});

// Show routing --->
app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let users = result;
      res.render("show.ejs", { users });
    });
  } catch (err) {
    console.log(err);
    res.send("some error occured");
  }
});

// Edit Route --->
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user Where id='${id}'`; // we have to pass the quote while we are passing the string cause if we didnot it will send as a value not string
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      console.log(user);
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("some error occured");
  }
});

// update route ---> here we will collect the (password,username,email) from the form
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPass, username: newUsername } = req.body;
  let q = `SELECT * FROM user Where id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass != user.password) {
        res.send("Wrong password");
      } else {
        let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`; // here we have also to write the quotes while sending the strings in variable form
        connection.query(q2, (req, res) => {
          if (err) throw err;
        });
        res.redirect("/user");
      }
    });
  } catch (err) {
    console.log(err);
    res.send("some error occured");
  }
});

// add new user post req on /user --->
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});
app.post("/user", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  let q = `INSERT INTO user (id,username,email,password) VALUES ('${id}','${username}','${email}','${password}')`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("user added");
      res.redirect("/user");
    });
  } catch (err) {
    console.log(err);
  }
});

// delete user route --->
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});
app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password } = req.body; // password from the form
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        // if user password is not != form password
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log("User deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.listen("8080", (req, res) => {
  console.log("server is listening on port 8080");
});
