const config=require("./config");
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");

//App Variables
const Local_Port = 3002;
const Prod_Port = process.env.PORT;
const API_KEY = config.API_KEY;
const AID = config.AID;
const mailchimp_URL = "https://us18.api.mailchimp.com/3.0"; //replace X with number in API-key https://usX.api.mailchimp.com/3.0"


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

//serve static files i.e images
app.use(express.static("public"));

//GET Request
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

//POST ROUTE
app.post("/", (req, res) => {
  const first = req.body.fname;
  const last = req.body.lname;
  const email = req.body.email;

  let user = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: first,
          LNAME: last,
        },
      },
    ],
  };
  const jsonData = JSON.stringify(user);
  const options = {
    method: "POST",
    auth: `s1dn3y:${API_KEY}`,
  };
  const url = `${mailchimp_URL}/lists/${AID}`;
  const request = https.request(url, options, (response) => {
    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
    response.on("data", (data) => {
      console.log(JSON.parse(data));
    });
  });
  request.write(jsonData);
  request.end();
});

//REDIRECT ON TRY AGAIN
app.post("/failure", (req, res) => {
  res.redirect("/");
});
app.listen(Prod_Port || Local_Port, () => {
  console.log("Server is Up and Running");
});
