const router = require('express').Router();
const mysql = require('mysql');
const connection = require('../db/conn');
const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser')
require('dotenv').config();

const {signupValidation, loginValidation} = require('../validation/validation');
const { route } = require('./bus.routes');




router.post('/signup', signupValidation, (req, res)=>{
    const id = req.body.id;
    const f_name = req.body.f_name;
    const l_name = req.body.l_name;
    const phone = req.body.phone;
    const passsword = req.body.passsword;
    const address = req.body.address;

    connection.query('insert into customers value (?,?,?,?,?,?)', [id, f_name, l_name, phone,passsword,address], (err, result)=>{
        if(err){
            res.send(err)
        }
        else{
            res.send("Passenger signed up");
        }
    })
});

router.post('/login', loginValidation, (req,res)=>{
    const {f_name,phone, passsword} = req.body;

    if(!phone || !f_name){
        res.status(400).send("Enter phone number and password");
    }
    else{
        connection.query(`select * from customers where f_name = ? AND phone = ?`,[f_name, phone], (err, result)=>{
            if(err){
                res.send(err);
            }
            else{
                req.session.loggedin = true;
                req.session.f_name = f_name;
                res.send({f_name})
            }
        })
    }
})

router.get('/profile', (req,res)=>{
    if(req.session){
        res.send(req.session.f_name)
    }
})


router.get('/logout', (req, res)=>{
    req.session.destroy();
    res.send("Session ended")
})


router.get('/getAllBuses', (req, res)=>{
    connection.query(`select number_plate, arrivaltime, departure from bus_info `, (err, result)=>{
        if(err){
            res.send(err);
        }
        // 
        else{
            res.send({result});
        }
    })
})

module.exports = router;