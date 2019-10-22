require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

const Contact = require("./models/contact");

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("build"));
// app.use(morgan('tiny'))

morgan.token("data", function(req, res) {
  return JSON.stringify(req.body);
});

const loggerFormat = ':data ":method :url" :status :response-time';

app.use(morgan(loggerFormat));

app.get("/api/persons", (request, response, next) => {
  Contact.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()));
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Contact.findById(request.params.id)
    .then(contact => {
      if (contact) {
        response.json(contact.toJSON());
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.get("/api/info", (request, response, next) => {
  const date = new Date();
  Contact.find({}).then(persons => {
    response.json(`Phonebook has info for ${persons.length} people. ${date} `);
  });
});

app.delete("/api/persons/:id", (request, response, next) => {
  Contact.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

// const generateId = () => {
//     const id = Math.floor(Math.random() * 1000)
//     return id
// }

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body) {
    return response.status(400).json({
      error: "content missing"
    });
  }

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Both name and number must be provided"
    });
  }

  const contact = new Contact({
    name: body.name,
    number: body.number
  });

  contact
    .save()
    .then(savedContact => {
      response.json(savedContact.toJSON());
    })
    .catch(error => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const contact = {
    name: request.body.name,
    number: request.body.number
  };

  Contact.findByIdAndUpdate(request.params.id, contact, {
    new: true,
    omitUndefined: true
  })
    .then(updatedContact => {
      console.log("updatedContact:", updatedContact);
      response.json(updatedContact.toJSON());
    })
    .catch(error => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError" && error.kind == "ObjectId") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
