//Object called Account that stores account related data and methods
const firebaseConfig = {
    apiKey: "AIzaSyDz-sBnHdx2qeKK6NFBrBckVAgp_JXPO7o",
    authDomain: "rock-paper-scissors-bec0f.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-bec0f.firebaseio.com",
    projectId: "rock-paper-scissors-bec0f",
    storageBucket: "",
    messagingSenderId: "640164059442",
    appId: "1:640164059442:web:4379bb22d9a22193"
};

firebase.initializeApp(firebaseConfig);

var database = firebase.database();

var Account = {
    activeUser: null,
    checkIfLoggedIn() {
        let session = localStorage.getItem("session");
        if (session) {
            let sessionObj = JSON.parse(session);
            let username = sessionObj.username;
            let sessionID = sessionObj.sessionID;
            database.ref("/"+username).on("value", function(snapshot) {
                let snapshotValue = snapshot.val();
                if (snapshotValue.sessionID === sessionID) {
                    Account.setActiveUser(snapshotValue);
                    Account.writeLoggedInState()
                }
            })
        }
    },
    createAccount(user) {
        database.ref(`/${user.username}`).set(user)
        Account.setActiveUser(user)
        Account.writeLoggedInState()
    },
    logIn(username, password) {
        database.ref().on("value", function(snapshot) {
            if (snapshot.hasChild(username)) {
                database.ref(`/${username}`).on("value", function(snapshot) {
                    let snapshotValue = snapshot.val();
                    if (snapshotValue.password === password) {
                        Account.setActiveUser(snapshotValue)
                        Account.writeLoggedInState()
                    } 
                    else {
                        //Show a message that the password was incorrect
                        console.log("wrong password")
                    }
                })
            }
            else {
                console.log("No account")
            }
        })
    },
    pullUser() {
        database.ref(`/${this.activeUser.username}`).on("value", function(snapshot) {
            let snapshotValue = snapshot.val();
            this.activeUser = snapshotValue;
        })
    },
    pushUser() {
        database.ref(`/${this.activeUser.username}`).set(this.activeUser);
    },
    setActiveUser(user) {
        this.activeUser = user;
        if (user) {
            let session = {
                username: user.username,
                sessionID: user.sessionID
            }
            localStorage.setItem("session", JSON.stringify(session))
        }
        console.log(this.activeUser);
    },
    writeLoggedInState() {
        $("#status").text(`You are logged in as ${this.activeUser.username}`)
    }
}

$("#create-account-button").click(function() {
    let user = {
        username: $("#create-account-username").val(),
        password: $("#create-account-password").val(),
        status: "menu",
        partner: null,
        sessionID: this.username+"session",
        selection: null,
        wins: 0,
        losses: 0
    }
    if (user.password === $("#create-account-password-reentered").val()) {
        Account.createAccount(user);
    }
})

$("#log-in-button").click(function() {
    let username = $("#log-in-username").val();
    let password = $("#log-in-password").val();
    Account.logIn(username, password);
})

Account.checkIfLoggedIn()
//Method to execute after a user is logged in

//Method to log the user in or respond that the account or password is wrong

//Method to create an account

//Method to call the active user data from the database

//Method to send the active user data to the database

//Object to store the active user and user properties

//Object to store Game related methods

//Method to set up the user turn

//Method to set up opponent turn

//Method to declare a winner

var example = {
    username: "username",
    password: "password",
    status: "menu | queueing | choosing | waiting | postgame",
    partner: "partner-username",
    sessionID: "id",
    selection: "rock | paper | scissors",
    wins: 0,
    losses: 0
}