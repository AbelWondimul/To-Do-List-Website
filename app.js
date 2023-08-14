const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const day = require(__dirname + "/date.js");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))
app.set('view engine', 'ejs');

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB',{useNewUrlParser:true});
const items = [];
const workList = [];

const itemSchema =({
    name: String
}); 

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
    name: "Homework"
});

const item2 = new Item ({
    name: "Classwork"
});

const item3 = new Item ({
    name: "Work"
});

const defaultItems =[item1,item2,item3];

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
    const itemName = req.body.newItem
    
    if(req.body.button === "Work"){
        workList.push(itemName);
        res.redirect("/work");
    } else{
        const item = new Item({
            name:itemName
        });

        item.save(); 
        res.redirect("/");
    }
   
})

app.post("/delete",(req,res)=>{
    const checkId = req.body.checkBox;
    Item.findByIdAndRemove(checkId).then((err)=>{
        console.log("Removed successfully");
    }).catch((err)=>{
        console.log(err);
    })
    res.redirect('/');
})

app.get("/:listName", (req,res)=>{
    const customList = req.params.listName;

    List.find({name:customList}).then((err)=>{

    }).catch((err) =>{
        console.log(err);
    })

    const list = new List({
        name:customList,
        items:defaultItems
    });

    list.save();
    
})

app.get("/work", (req,res) =>{
    res.render("list",{list:"Grocery List", item:workList, req:req});

})

app.post("/work",(req,res) =>{
    let list = req.body.list;
    workList.push(list);
    res.redirect("/work");
})

app.get("/about", (req,res) =>{
    res.render("about");
});



app.listen(3000, function(){
    console.log("server started on port 3000");
});