require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");
const day = require(__dirname + "/date.js");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))
app.set('view engine', 'ejs');

const db_url = process.env.DB_URL;

mongoose.connect(db_url ,{useNewUrlParser:true});
const items = [];
const workList = [];

const itemSchema =({
    name: String
}); 

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
    name: "Click + to add"
});

const item2 = new Item ({
    name: "Click the checkbox to delete"
});



const defaultItems =[item1,item2];

const listSchema ={
    name:String,
    items:[itemSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {

    Item.find().then((foundItems, err)=>{
        if(foundItems.length === 0){
            Item.insertMany(defaultItems).then((err)=>{
                console.log("Inserted successfully");
                res.redirect('/');
            }).catch((err)=>{
                console.log(err);
            }) 
            
        } else {
            res.render('list', { list: day.getDate(),item:foundItems, req:req});
        }
        
    }).catch((err) => {
            console.log(err);
    })
    
    
    
});

app.post("/",(req,res) =>{
    const itemName = req.body.newItem;
    const listName = req.body.button;

    
    
    if(req.body.button === "Work"){
        workList.push(itemName);
        res.redirect("/work");
    } else{
        const item = new Item({
            name:itemName
        });
        if(listName === day.getDate()){
            item.save(); 
            res.redirect("/");
        } else {
            List.findOne({name: listName}).then((foundList) => {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            }). catch((err)=>{
                console.log(err);
            })
        }
    }
   
})

app.post("/delete",(req,res)=>{
    const checkId = req.body.checkBox;
    const listName = req.body.listName;

    if(listName === day.getDate()){
        Item.findByIdAndRemove(checkId).then((err)=>{
            console.log("Removed successfully");
        }).catch((err)=>{
            console.log(err);
        })
        res.redirect('/');
    } else {
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkId}}}).then((foundList)=>{
            res.redirect("/" + listName);
        }).catch((err) => {
            console.log(err);
        })
    }
})

app.get("/about", (req,res) =>{
    res.render("about");
});


app.get("/:listName", (req,res)=>{
    const customList = _.capitalize(req.params.listName);
    List.findOne({name:customList}).then((foundList)=>{
        console.log("exists");
        console.log(customList);
        if(!foundList){
            const list = new List({
                name:customList,
                items:defaultItems
            });
            list.save();
            res.redirect("/" + customList);
        } else {
            res.render('list', { list: foundList.name,item:foundList.items, req:req});
        }
    }).catch((err) =>{
        console.log(err);
    })

    
    
})

app.get("/work", (req,res) =>{
    res.render("list",{list:"Grocery List", item:workList, req:req});

})

app.post("/work",(req,res) =>{
    let list = req.body.list;
    workList.push(list);
    res.redirect("/work");
})





app.listen(3000, function(){
    console.log("server started on port 3000");
});