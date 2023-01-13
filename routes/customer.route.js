const router = require('express').Router();
const mysql = require('mysql');
const connection = require('../db/conn');
const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser')
require('dotenv').config();

const { signupValidation, loginValidation } = require('../validation/validation');


// Get Bus from home page (wrt departure date and sort by time)->To be done
router.get('/getAllBuses', (req, res) => {
    connection.query(`select number_plate, arrivaltime, departure from bus_info `, (err, result) => {
        if (err) {
            res.send(err);
        }
        // 
        else {
            res.send({ result });
        }
    })
})

router.post('/signup', signupValidation, (req, res) => {
    const id = req.body.id;
    const f_name = req.body.f_name;
    const l_name = req.body.l_name;
    const phone = req.body.phone;
    const passsword = req.body.passsword;
    const address = req.body.address;

    connection.query('insert into customers value (?,?,?,?,?,?)', [id, f_name, l_name, phone, passsword, address], (err, result) => {
        if (err) {
            res.send(err)
        }
        else {
            res.send("Passenger signed up");
        }
    })
});

router.post('/login', (req, res) => {
    const { phone } = req.body;
    connection.query('select * from customers where phone = ? ', [phone], (err, result) => {
        if (err) {
            res.send(err);
        }
        if (result.length) {
            req.session.id = result[0].id;
            req.session.userData = result[0];

            console.log(result[0].f_name + " Logged in")
            res.redirect('/profile')
        }
        else {
            res.send({
                message: "Wrong Credentials",
            })
        }

    })

})


// Customer check profile
router.get('/profile', (req, res) => {
    if (req.session) {
        res.send(req.session.userData)
    }
    else {
        res.send({ message: 'User Logged out' })
    }
})


// Customer profile update
router.post('/update-profile/:id', (req, res) => {
    const id = req.params.id;
    var updateData = req.body;
    
    if(req.session){
        connection.query(`update customers
        set ? where id=?`, [updateData, id], (err, result)=>{
            if(err){
                res.send(err);
            }
            else{
                res.send(result);
            }
        })
    }else{
        res.send("User Logged Out")
    }
        
})




// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.send("Session ended")
})

router.get('/ticket-counter', (req, res)=>{
    res.send("Ticket Counter")
})




module.exports = router;