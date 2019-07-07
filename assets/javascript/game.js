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
        database.ref().child(Account.activeUser.username).update({ "partner": null });
        Account.activeUser = null;
        $("#account").empty();
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
        $("#overlay").attr("class", "overlay hidden");
        let account = $("#account");
        account.empty();
        let button = $("<button>");
        $("#player-one-name").text(this.activeUser.username);
        let p = $("<p>");
        p.text("Waiting for another player to join");
        $("#player-one-text").empty();
        $("#player-one-text").append(p);
        button.text("Log Out");
        button.attr("id", "log-out-button");
        account.append(button);
        $("#overlay").empty();
    },
    writeLogInModal() {
        let overlay = $("#overlay");
        overlay.attr("class", "overlay");
        let logInDiv = $("<div>");
        logInDiv.attr("id", "log-in-div");
        logInDiv.attr("class", "overlay--div");
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
        createAccountDiv.attr("id", "create-account-div");
        createAccountDiv.attr("class", "overlay--div");
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
            Queue.listenToQueue();
            return;
        }, 1000)
    },
    checkQueue() {
        var queue
        database.ref("/queue").on("value", function (snapshot) {
            queue = snapshot.val().queue.split(",");
        })
        setTimeout(function() {
            if (queue.length > 1) {
                Account.activeUser.partner = queue[1]
                queue.splice(1, 1)
                queue = queue.join(",")
                database.ref("/queue").set({ queue })
                console.log(Account.activeUser.partner)
                database.ref().child(Account.activeUser.partner).update({"partner": Account.activeUser.username});
                //Start game function
                Account.pushUser();
                Game.startGame()
                return;
            }
            else {
                //Waiting function
                Account.activeUser.status = "queue"
                Queue.addToQueue(Account.activeUser.username)
                return;
            }
        }, 1000)
    },
    listenToQueue() {
        database.ref(`/${Account.activeUser.username}/partner`).on("value", function (snapshot) {
            let snapshotValue = snapshot.val();
            Account.activeUser.partner = snapshotValue;
            Account.pushUser();
            setTimeout(Game.startGame, 1000)
        })
    }
}

var Game = {
    winners: {
        rock: "paper",
        paper: "scissors",
        scissors: "rock"
    },
    startGame() {
        if (Account.activeUser.partner) {
            Account.activeUser.status = "ingame"
            let bucket = $("#player-one-text");
            bucket.empty();
            let rock = $("<button>");
            rock.attr("class", "rps-button");
            rock.attr("data-img", "assets/images/rock.png");
            rock.attr("data-selection", "rock");
            rock.text("Rock");
            bucket.append(rock);
            let paper = $("<button>");
            paper.attr("class", "rps-button");
            paper.attr("data-img", "assets/images/paper.png");
            paper.attr("data-selection", "paper");
            paper.text("Paper");
            bucket.append(paper);
            let scissors = $("<button>");
            scissors.attr("class", "rps-button");
            scissors.attr("data-img", "assets/images/scissors.png");
            scissors.attr("data-selection", "scissors");
            scissors.text("Scissors");
            bucket.append(scissors);
            $("#player-two-name").text(Account.activeUser.partner);
            $("#player-two-text").text("Waiting for selection")
        }
    },
    declareWinner(partnerSelection) {
        let bucket = $("#player-one-text");
        bucket.empty();
        $("#player-two-image").html("<img height='200px' src='assets/images/" + partnerSelection + ".png'>");
        let bucketTwo = $("#player-two-text")
        bucketTwo.empty();
        let button = $("<button>");
        button.text("Play Again?");
        button.attr("id", "play-again-button");
        bucketTwo.append(button);
        if (Game.winners[partnerSelection] === Account.activeUser.selection) {
            Account.activeUser.wins += 1;
            Account.pushUser();
            bucket.text("You win!")
        }
        else if (partnerSelection === Account.activeUser.selection) {
            bucket.text("It's a tie!")
        }
        else {
            Account.activeUser.losses += 1;
            Account.pushUser();
            bucket.text("You lose!")
        }
    }
}

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

$(document).on("click", ".rps-button", function() {
    Game.hasPlayerOneChosen = true;
    let selection = $(this).attr("data-selection");
    Account.activeUser.selection = selection;
    Account.pushUser()
    selection = selection.charAt(0).toUpperCase() + selection.slice(1);
    let image = $(this).attr("data-img");
    $("#player-one-text").html(selection);
    $("#player-one-image").html("<img height='200px' src='"+image+"'>");
    database.ref(`/${Account.activeUser.partner}/selection`).on("value", function (snapshot) {
        let snapshotValue = snapshot.val();
        if (snapshotValue) {
            if (Account.activeUser.selection) {
                Game.declareWinner(snapshotValue)
            }
        }
    })
})

$(document).on("click", "#play-again-button", function() {
    $("#player-one-name").empty();
    $("#player-one-text").empty();
    $("#player-one-image").empty();
    $("#player-two-name").empty();
    $("#player-two-text").empty();
    $("#player-two-image").empty();
    database.ref().child(Account.activeUser.username).update({ "partner": null });
    database.ref().child(Account.activeUser.username).update({ "selection": null });
    database.ref().child(Account.activeUser.username).update({ "status": null });
    Queue.checkQueue();
})

$(window).unload(function() {
    if (Account.activeUser.status === "queue") {
        var queue
        database.ref("/queue").on("value", function (snapshot) {
            queue = snapshot.val().queue.split(",");
            let index = queue.indexOf(Account.activeUser.username);
            if (index > -1) {
                queue.splice(index, 1);
                queue = queue.join(",");
                database.ref("/queue").set({ queue })
            }
        })
    }
    else if (Account.activeUser.status === "ingame") {
        database.ref().child(Account.activeUser.partner).update("partner", null);
    }
    database.ref().child(Account.activeUser.username).update({ "partner": null });
    database.ref().child(Account.activeUser.username).update({ "selection": null });
    database.ref().child(Account.activeUser.username).update({ "status": null });
})

Account.checkIfLoggedIn()

Queue.checkQueue()
