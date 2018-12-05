'use strict'
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/sandbox");

var db = mongoose.connection;

db.on("error", function(err){
  console.log("message", err);
});

db.once("open", function(){
  console.log("message");
  //all database communication goes here
  var Schema = mongoose.Schema;
  var AnimalSchema = new Schema({
    type:  {type: String, default: "goldfish"},
    size: String,
    color: {type: String, default: "golden"},
    mass:  {type: Number, default: "0.007"},
    name:  {type: String, default: "Angela"}
  });

  AnimalSchema.pre("save", function(next){
      if (this.mass >= 100){
        this.size = "big";
      } else if (this.mass >= 5 && this.mass < 100){
        this.size = "medium";
      } else{
        this.size ="small";
      }
      next();
  });

  AnimalSchema.statics.findSize = function(size, callback){
    //this refers to the model which in this case is Animal
    return this.find({size: "size"}, callback);
  }

  AnimalSchema.methods.findSameColor = function(callback){
    //this === document
    return this.model("Animal").find({color: this.color}, callback);
  }

  var Animal = mongoose.model("Animal", AnimalSchema)

  var elephant = new Animal({
    type: "elephant",
    color: "gray",
    mass: 6000,
    name: "Ben"
  });

  var animal = new Animal({}); //Goldfish

  var whale = new Animal({
    type: "whale",
    mass: 190500,
    name: "Beni"
  });

  var animalData = [
    {
      type: "mouse",
      color: "gray",
      mass: 0.500,
      name: "pop"
    },
    {
      type: "rat",
      color: "brown",
      mass: 6.35,
      name: "pops"
    },
    {
      type: "whale",
      color: "gray",
      mass: 45,
      name: "Iris"
    },
    elephant,
    animal,
    whale
  ];

  Animal.remove({}, function(err) {
    if (err) console.error(err);
    Animal.create(animalData, function(err, animals){
      if (err) console.error(err);
      Animal.findOne({type:"elephant"}, function(err, elephant){
        elephant.findSameColor(function(err, animals){
          if (err) console.error(err);
          animals.forEach(function(animal){
            console.log(animal.name + " " + animal.color + " " + animal.type + " " + animal.size);
          });
          db.close(function(){
            console.log("db connection closed");
          });
        });
      });
    });
  });

});
