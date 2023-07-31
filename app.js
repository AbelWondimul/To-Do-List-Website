const express = require("express");
const bodyParser = require("body-parser");
const day = require(__dirname + "/date.js");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))
app.set('view engine', 'ejs');
const items = [];
const workList = [];



app.get("/", (req, res) => {
    res.render('list', { list: day.getDate(),item:items, req:req});
    
});

app.post("/",(req,res) =>{
    const item = req.body.newItem
    
    if(req.body.button === "Work"){
        workList.push(item);
        res.redirect("/work");
    } else{
        items.push(item); 
        res.redirect("/");
    }
   
})

app.get("/work", (req,res) =>{
    res.render("list",{list:"Work List", item:workList, req:req});

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