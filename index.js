require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt")
const{Pool} = require('pg')
const z = require("zod");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});
const SignupSchema = z.object({
    username : z.string().min(3),
    password: z.string().min(6),
    email: z.email()
})
const app = express();
app.use(express.json());
app.post("/signup", async(req,res) =>{
    const {data, success,error} = SignupSchema.safeParse(req.body);
    if(!success){
        res.status(403).json({
            message: "Incorrect Inputs" ,error : JSON.parse(error)
        })
        return
    }
    const username = data.username;
    const email = data.email;
    const password = data.password;
    const hashedpassword = await bcrypt.hash(password,10);

   const response =  await pool.query(`INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING id`,[username,email,hashedpassword] );
    res.json({
        message: "Signup Done!",
        id: response.rows[0].id
    })
})
app.post("/signin" , async(req,res) => {
    const email = req.body.email;
    const password = req.body.password;
    

    const response = await pool.query(`SELECT * FROM users WHERE email='${email}'`);
const UserExist = response.rows[0];
if(!UserExist){
    res.status(403).json({
        message: "Invalid Credential"
    })
    
}
else{
    const correctedPass = await bcrypt.compare(password , UserExist.password);
    if(correctedPass){
        res.json({
            token: "asdasdasdasd"
        })
    } else{
        res.status(403).json({
            message: "Invalid Credential"
        })
    }
    
}
})
app.listen(3020);