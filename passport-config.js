import passport_local from 'passport-local';
import {compare} from 'bcrypt';

const LocalStrategy = passport_local.Strategy;


// Function for initializing the passport auth
function initialize(passport, getUserByEmail, getUserById){

    
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email);

        // For invalid user case -> (Non - registered users)
        if(user == null){
            return done(null, false, {message: "No user present with these credentials"});
        }

        try{
            // Password Verification
            if(await compare(password, user.hashedPassword)){
                return done(null, user);
            } 
            
            else{
                // Incorrect Password Case
                return done(null, false, {message: "Password Incorrect"});
            }


        } catch(e) {
            return done(e);
        }
    }

    // Using email field for logging in the user 
    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))

    // marks the user as authenticated
    passport.serializeUser((user, done) => done(null, user.id))
    
    // Marks the user as not authenticated
    passport.deserializeUser((id, done) => { 
        return done(null, getUserById(id))
    })

}

export default initialize;