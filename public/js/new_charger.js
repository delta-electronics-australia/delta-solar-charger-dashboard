function register_charger() {

    let chargerID = document.getElementById("charger_id").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let ws_charger = new WebSocket("ws://203.32.104.46:8000/password_service");

    // This listeners listens ffor the time when the Websocket connection is open
    ws_charger.addEventListener('open', function (event) {
        let payload = {
            'function': 'new account',
            'chargerID': chargerID,
            'email': email,
            'pw': password
        };
        payload = {
            'function': 'new account',
            'chargerID': 'test123',
            'email': 'test123@gmail.com',
            'pw': 'test123'
        };

        ws_charger.send(JSON.stringify(payload));
        // $('#register_charger_btn').removeClass("waves-effect waves-light").addClass('disabled');
    });

    // Todo: A lot more potential for this section. Have Firebase validation, have email auto fill

    // This listener listens for any messages from the OCPP server
    ws_charger.addEventListener('message', function (message) {
        let response = message.data;

        if (response === "1") {
            document.getElementById("charger_reg_form").reset();
            M.toast({
                html: 'Error: Charger ID already exists. Please select a different charger ID.',
                displayLength: 5000
            });
        }
        else if (response === "0") {
            document.getElementById("charger_reg_form").reset();
            M.toast({
                html: 'Charger registration completed',
            });
        }
        // $('#register_charger_btn').removeClass('disabled').addClass('waves-effect waves-light');

        // Close the connection
        ws_charger.close()
    })

}


function checkIfLoggedIn() {

    // Check if we are logged in
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // Start our code for the page
            console.log('yay')

        }

        else {
            //... or go to login
            window.location.replace("delta_dashboard/login")
        }
    });

}

checkIfLoggedIn();
