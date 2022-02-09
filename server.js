import { config } from 'dotenv';
import express, {urlencoded} from 'express';
import passport from 'passport';
import {hash} from 'bcrypt';
import methodOverride from 'method-override';
import flash from 'express-flash';
import session from 'express-session';
import initializePassport from './passport-config.js';

if(process.env.NODE_ENV !== 'production'){
    config();
}



const app = express();
const port = process.env.PORT;




// MiddleWares
app.use(express.json());
app.set('view-engine', 'ejs');
app.use(urlencoded({extended: false}));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));


initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);
    


const users = [];
    
    
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name});
});


app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});


app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
});


app.post('/register', checkNotAuthenticated, async (req, res) => {
    try{
        
        const {name, email, password} = req.body;
        const hashedPassword = await hash(password, 10);
        
        users.push({
            id: Date.now().toString(),
            name,
            email,
            hashedPassword
        })
        console.log(users);
        res.redirect('/login');

    } catch {
        res.redirect('/register');
    }

});



app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
})



function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect('/login');
}


function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    next();
}



app.listen(port, () => {
    console.log(`App running successfully at http://localhost:${port}`);
})
