const router = require('express').Router();
const mysql = require('mysql');
const connection = require('../db/conn');
const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser')
require('dotenv').config();

// const transporter = require('./Email/sendEmail')

const jwt_key = process.env.SECRET_KEY


const { signupValidation, loginValidation } = require('../validation/validation');


// Get Bus from home page
// router.get('/getAllBuses', (req, res) => {
//     connection.query(`select number_plate, arrivaltime, departure from bus_info `, (err, result) => {
//         if (err) {
//             res.send(err);
//         }
//         // 
//         else {
//             res.send({ result });
//         }
//     })
// })

router.post('/getBusesByDate', (req, res)=>{
    // const dateOfJourney = req.body.dateOfJourney;
    const origin = req.body.origin;
    const destination = req.body.destination

    connection.query(`select * from bus_info where origin=? AND destination=?`, [origin,destination], (err, result)=>{
        if(err){
            res.send(err);
        }else{
            console.log(result)
            res.send(result);
        }
    })
})


// Customer Register
router.post('/signup', (req, res) => {
    const f_name = req.body.f_name;
    const l_name = req.body.l_name;
    const phone = req.body.phone;
    const password = req.body.password;
    const address = req.body.address;

    connection.query('insert into customers value (?,?,?,?,?)', [f_name, l_name, phone, password, address], (err, result) => {
        if (err) {
            res.send(err)
        }
        else {
            res.send(result);
        }
    })
});

// Customer Login
router.post('/login', loginValidation, (req, res) => {
    const { phone, password } = req.body;
    connection.query('select * from customers where phone = ? AND password=? ', [phone, password], (err, result) => {
        if (err) {
            res.send(err);
        }
        if (result.length) {
            try{
                jwt.sign({result}, jwt_key,{expiresIn: "2d"},(err, token)=>{
                    if(err){
                        res.send(err);
                    }
                    res.send({message: 'Login Successful',result: result[0], auth: token});
                })
                
                // res.redirect('/school-dashboard');
                console.log("You are Logged in")
            }
            catch(err){
                res.send({message: "Invalid Credentials"});
            }
        }
        else {
            res.send({
                message: err,
            })
        }
    })
})




// Customer check profile
router.get('/profile/:phone', (req, res) => {
    const phone = req.params.phone;
    if(req.session){
        connection.query(`select * from customers where phone = ?`,[phone], (err, result)=>{
            if(err){
                res.send(err);
            }
            else{
                req.session.userData = result[0]
                res.send(result[0])
            }
    
        })
    }else{
        res.send("User Logged Out")
    }
    
})


// Customer profile update
router.post('/update-profile/:phone', (req, res) => {
    const phone = req.params.phone;
    var updateData = req.body;

    if (req.session) {
        connection.query(`update customers
        set ? where phone=?`, [updateData, phone], (err, result) => {
            if (err) {
                res.send(err);
            }
            else {
                res.send(result);
            }
        })
    } else {
        res.send("User Logged Out")
    }

})



// Ticket Counter
router.get('/ticket-counter', (req, res) => {
    res.send("Ticket Counter")
})


// Buy Ticket
router.post('/add-passenger-details', (req, res) => {
    const {id,PassengerName, PassengerPhone, price, dateOfJourney, time, BusID} = req.body


    if(req.session){
        connection.query(`insert into passenger  values(?,?,?,?,?,?,?)`
        ,[id, PassengerName, PassengerPhone, price, dateOfJourney, time, BusID]
        , (err, result)=>{
            if(err){
                console.log(err)
                res.send(err);
            }
            else{
                console.log(result)
                res.send(result);
            }
        })
    }else{
        res.send("User Logged Out");
    }
})



// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.send("Session ended")
})






module.exports = router;