import express from 'express';
const app = express()
import {AuthController} from './controller/auth.controller'

app.use(express.json);

app.use('/auth', AuthController)
app.listen(3000, () =>{
    console.log("Hello")
})