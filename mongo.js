const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("Give password as argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fullstack-puhelinluettelo:${password}@cluster0-7rimt.mongodb.net/test?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const contactSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Contact = mongoose.model("Contact", contactSchema);

const contact = new Contact({
  name: process.argv[3],
  number: process.argv[4]
})

if (process.argv.length < 4) {
  Contact.find({}).then(result => {
    console.log("Phonebook:");
    result.forEach(contact => {
      console.log(contact.name, contact.number);
    });
    mongoose.connection.close();
  });
} else {
  contact.save().then(response => {
    console.log(
      `added ${response.name} number ${response.number} to phonebook`
    );
    mongoose.connection.close();
  });
}


