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
                else {
                    Account.writeLogInModal()
                }
            })
        }
        else {
            Account.writeLogInModal()
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
    logOut() {
        localStorage.clear();
        Account.activeUser = null;
        $("#status").html("<p>You are not logged in</p>");
        Account.writeLogInModal();
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
        let statusDiv = $("#status");
        statusDiv.empty();
        let p = $("<p>");
        let button = $("<button>");
        p.text(`Welcome ${this.activeUser.username}!`)
        statusDiv.append(p);
        button.text("Log Out");
        button.attr("id", "log-out-button");
        statusDiv.append(button);
        $("#overlay").empty();
    },
    writeLogInModal() {
        let overlay = $("#overlay");
        let logInDiv = $("<div>");
        let logInH3 = $("<h3>");
        let logInUsername = $("<input>");
        let logInPassword = $("<input>");
        let logInButton = $("<button>");
        logInH3.text("Log In");
        logInDiv.append(logInH3);
        logInUsername.attr("id", "log-in-username");
        logInUsername.attr("type", "text");
        logInUsername.attr("placeholder", "Username");
        logInDiv.append(logInUsername);
        logInPassword.attr("id", "log-in-password");
        logInPassword.attr("type", "password");
        logInPassword.attr("placeholder", "Password");
        logInDiv.append(logInPassword);
        logInButton.text("Log In");
        logInButton.attr("id", "log-in-button");
        logInDiv.append(logInButton);
        let createAccountDiv = $("<div>");
        let createAccountH3 = $("<h3>");
        let createAccountUsername = $("<input>");
        let createAccountPassword = $("<input>");
        let createAccountPasswordReentered = $("<input>");
        let createAccountButton = $("<button>");
        createAccountH3.text("Create Account");
        createAccountDiv.append(createAccountH3);
        createAccountUsername.attr("id", "create-account-username");
        createAccountUsername.attr("type", "text");
        createAccountUsername.attr("placeholder", "Username");
        createAccountDiv.append(createAccountUsername);
        createAccountPassword.attr("id", "create-account-password");
        createAccountPassword.attr("type", "password");
        createAccountPassword.attr("placeholder", "Password");
        createAccountDiv.append(createAccountPassword);
        createAccountPasswordReentered.attr("id", "create-account-password-reentered");
        createAccountPasswordReentered.attr("type", "password");
        createAccountPasswordReentered.attr("placeholder", "Password");
        createAccountDiv.append(createAccountPasswordReentered);
        createAccountButton.text("Create Account");
        createAccountButton.attr("id", "create-account-button");
        createAccountDiv.append(createAccountButton);
        overlay.append(logInDiv);
        overlay.append(createAccountDiv);
    }
}

var Queue = {
    addToQueue(username) {
        var queue
        database.ref("/queue").on("value", function(snapshot) {
            queue = snapshot.val().queue.split(",");
        })
        setTimeout(function() {
            queue.push(username);
            queue = queue.join(",")
            database.ref("/queue").set({queue})
        }, 1000)
    },
    checkQueue() {
        var queue
        database.ref("/queue").on("value", function (snapshot) {
            queue = snapshot.val().queue.split(",");
        })
        setTimeout(function() {
            if (queue.length > 1) {
                let partner = queue[1]
                queue.splice(1, 1)
                queue = queue.join(",")
                database.ref("/queue").set({ queue })
                console.log(partner)
                //Start game function
                return;
            }
            else {
                //Waiting function
                Queue.addToQueue(Account.activeUser.username)
                return;
            }
        }, 1000)
    }
}

Queue.checkQueue()
$(document).on("click", "#create-account-button", function() {
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

$(document).on("click", "#log-in-button", function() {
    let username = $("#log-in-username").val();
    let password = $("#log-in-password").val();
    Account.logIn(username, password);
})

$(document).on("click", "#log-out-button", function() {
    Account.logOut();
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