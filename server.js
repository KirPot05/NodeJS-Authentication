import { config } from 'dotenv';
import express, {urlencoded} from 'express';
import passport from 'passport';
import {hash} from 'bcrypt';
import methodOverride from 'method-override';
import flash from 'express-flash';
import session from 'express-session';
import initializePassport from './passport-config.js';


// Converts environment variables to string if in development stage
if(process.env.NODE_ENV !== 'production'){
    config();
}


// Express Stuff
const app = express();
const port = process.env.PORT;




// MiddleWares
app.use(express.json());
app.set('view-engine', 'ejs');              // For setting up view engine
app.use(urlencoded({extended: false}));     // For using req.body
app.use(flash());                           // For error reporting
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));


// Initializing the passport for authentication
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);
    

// Array which stores the user upon registration
const users = [];
    

// Index Route
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name});
});


// Renders view for login route
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});


// Login route for handling authentication
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));


// Renders view for register
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
});




// Register route for saving the user in users array
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try{
        // Obtaining credentials from the request body
        const {name, email, password} = req.body;


        // Password Encryption
        const hashedPassword = await hash(password, 10);
        
        // Adding the user to DB (Here, User Array)
        users.push({
            id: Date.now().toString(),
            name,
            email,
            hashedPassword
        });

        res.redirect('/login');

    } catch {

        res.redirect('/register');
    }

});





// Logout Route
app.delete('/logout', (req, res) => {
    req.logOut();   
    res.redirect('/login');
});




// checks if user is authenticated -> if returned true then only gives access to other routes of application 
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect('/login');
}




// If the user is already authenticated then does not let the user login again
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    next();
}




// Application listening at the specified port
app.listen(port, () => {
    console.log(`App running successfully at http://localhost:${port}`);
});
