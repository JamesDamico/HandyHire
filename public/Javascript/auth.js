////////////////////////////
//  Listen for Auth Changes
////////////////////////////
const loggedOutLinks = document.querySelectorAll(".loggedOut");
const loggedInLinks = document.querySelectorAll(".loggedIn");

const setupUI = (user) => {
    if(user){
        //toggle ui elements
        loggedInLinks.forEach(item => item.style.display = "block");
        loggedOutLinks.forEach(item => item.style.display = "none");
        document.querySelector("#accountEmail").textContent = user.email;
    } else {
        //toggle ui elements
        loggedInLinks.forEach(item => item.style.display = "none");
        loggedOutLinks.forEach(item => item.style.display = "block");
    }
}

auth.onAuthStateChanged(user =>{
    
    if(user){
        //User Logged In
        console.log("user logged in: ", user);
        setupUI(user);
    } else {
        //User Logged Out
        setupUI(user);
    }
});

/////////////////
//  Sign Up
/////////////////
const signupForm = document.querySelector("#signupForm");
const signupError = document.querySelector("#signupError");

//Submit Sign Up Form
signupForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    //get user info
    const email = signupForm["signupEmail"].value;
    const password = signupForm["signupPassword"].value;
    // const confirmPassword = signupForm["signupPasswordConfirm"].value;

    //sign up user
    auth.createUserWithEmailAndPassword(email, password).then(cred =>{
        //Logging user credentials to console
        console.log(cred.user);

        //Close and clear the form when we know account has been created
        $('#signupModal').modal('hide');
        signupForm.reset();
        signupError.style.display = "none";
    }).catch(function(error){
        //If theres an error display the error message under the form.
        signupError.innerHTML = error.message;
        signupError.style.display = "block";
        signupForm.reset();
    });
});

/////////////////
//  Log Out
/////////////////
const logout = document.querySelector("#logout");
logout.addEventListener("click", (e)=>{
    e.preventDefault();

    auth.signOut().then(()=>{
        console.log("User signed out");
    });
});

/////////////////
//  Log In
/////////////////
const loginForm = document.querySelector("#loginForm");
const loginError = document.querySelector("#loginError");

//Submit Log In Form
loginForm.addEventListener("submit", (e)=>{
    e.preventDefault();

    //get user info
    const email = loginForm["loginEmail"].value;
    const password = loginForm["loginPassword"].value;

    auth.signInWithEmailAndPassword(email, password).then(cred =>{
        //Logging user credentials to console
        console.log(cred.user);

        //Close and clear the form when we know account has been created
        $('#loginModal').modal('hide');
        loginForm.reset();
        loginError.style.display = "none";
    }).catch(function(error){
        //If username or password is wrong show "Wrong Username or Password" under the form
        loginError.style.display = "block";
        loginForm.reset();
    });
});