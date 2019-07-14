function load_map(uid) {

    function CenterControl(controlDiv, map) {

        // Set CSS for the control border.
        let controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '2px solid #fff';
        controlUI.style.borderRadius = '3px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to select the pin location as your system location';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        let controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = 'Drag pin to system location and click here';
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function () {
            console.log('button clicked!');

            // Todo: put this location into Firebase
            firebase.database().ref(`users/${uid}/system_location`).update({
                'lat': myMarker.position.lat(),
                'lng': myMarker.position.lng()
            }).then(function () {
                M.toast({html: 'System location updated. Please refresh all dashboard pages!'})
            })
        });

    }

    let myMarker;
    // Grab the system's location
    firebase.database().ref(`users/${uid}/system_location`).once("value").then(function (snapshot) {
        // Set a default lat/lng
        let startLatLng = {
            lat: -37.8136,
            lng: 144.9631
        };

        if (snapshot.val() !== null) {
            startLatLng = snapshot.val()
        }

        console.log(startLatLng);
        let map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            center: startLatLng
        });

        let centerControlDiv = document.createElement('div');
        let centerControl = new CenterControl(centerControlDiv, map);

        centerControlDiv.index = 1;
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
        myMarker = new google.maps.Marker({
            position: startLatLng,
            map: map,
            draggable: true
        });

        google.maps.event.addListener(myMarker, 'drag', function () {
            console.log(myMarker.position.lat());
            console.log(myMarker.position.lng());
        });
    })

}

function change_pw_button_pressed() {
    let old_pw = document.getElementById('old_pw').value;
    let new_pw = document.getElementById('new_pw').value;

    let email = firebase.auth().currentUser.email;
    firebase.auth().currentUser.reauthenticateWithCredential(
        firebase.auth.EmailAuthProvider.credential(
            email,
            old_pw
        )
    )
        .then(function (success) {
            console.log(success)

        })
        .catch(function (error) {
            M.toast({
                html: 'Error: Old password is incorrect'
            })
        })
}

function addLinkedAccount(uid, otherApp, modalInstance) {

    let linkedAccountUID = otherApp.auth().currentUser.uid;

    let db = firebase.database();

    db.ref()
        .child(`users/${uid}/user_info/linked_accounts`)
        .update({
            [linkedAccountUID]: true
        }).then(function () {
            /// Show a toast for the user
            M.toast({html: 'Account successfully linked. Reloading page in 3 seconds..'});

            /// Close the modal
            modalInstance.close();

            /// Reload the page in 3 seconds
            setTimeout(function () {
                location.reload();
            }, 3000)
        }
    )
}

function startSignInUI(uid, modalInstance) {
    // Initialize Firebase
    let config = {
        apiKey: "AIzaSyCaxTOBofd7qrnbas5gGsZcuvy_zNSi_ik",
        authDomain: "smart-charging-app.firebaseapp.com",
        databaseURL: "https://smart-charging-app.firebaseio.com",
        projectId: "smart-charging-app",
        storageBucket: "",
        messagingSenderId: "896921007938"
    };
    // Initialize another app with a different config
    let otherApp = firebase.initializeApp(config, "other");

    // Initialize the FirebaseUI Widget using Firebase.
    let ui = new firebaseui.auth.AuthUI(otherApp.auth());

    let uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: async function (authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                console.log(authResult.user.uid);

                if (authResult !== null) {
                    let db = firebase.database();

                    let systemName = authResult.user.displayName;
                    let $addLinkedAccountModalBody = $("#addLinkedAccountModalBody");

                    $addLinkedAccountModalBody.empty();
                    $addLinkedAccountModalBody.append(`
                        <h6>Sign In Successful! Are you sure you want to link ${systemName}
                         to this account?</h6>
                         <div class="row">
                             <div class="col s6">                        
                                <a class="btn" id="addLinkedAccountConfirmed">Yes</a>
                             </div>                            
                         </div>
                        `)

                }
                $("#addLinkedAccountConfirmed").click(function () {
                    addLinkedAccount(uid, otherApp, modalInstance);
                });
                return false;
            },
            uiShown: function () {
                // The widget is rendered.
                // Hide the loader.
                // document.getElementById('loading_id').style.display = 'none';
            }
        },
        // Disable AccountChooser - annoying! Accounts should already be made in the app
        credentialHelper: firebaseui.auth.CredentialHelper.NONE,

        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
        ],
        // Terms of service url.
        tosUrl: '<your-tos-url>',

    };
    ui.start('#firebaseui-auth-container', uiConfig);

}

function openAddLinkedAccountModal(uid) {

    let addLinkedAccountModalInstance = M.Modal.init(document.getElementById("addLinkedAccountModal"));

    let $addLinkedAccountModalBody = $("#addLinkedAccountModalBody");

    $addLinkedAccountModalBody.append(`
        <div id="firebaseui-auth-container"></div>
    `);

    addLinkedAccountModalInstance.open();

    startSignInUI(uid, addLinkedAccountModalInstance);

}

async function grabAccountTypeInformation(uid) {
    /** This function will grab account information for the UID **/

    let db = firebase.database();

    /// First get the account type of the user
    let accountType = await db.ref().child(`users/${uid}/user_info/account_type`).once('value');

    if (accountType.val() === "admin") {
        $("#current_account_type").append("<h6>Current Account Type: <b>Admin Account</b></h6>");

        /// Get the node with all of our linked systems
        let linkedSystems = await db.ref().child(`users/${uid}/user_info/linked_accounts`).once("value");

        /// Show the number of the linked systems on the page
        $("#linked_systems").append(`<h6>Number of linked systems: ${Object.keys(linkedSystems.val()).length}</h6>`);

        /// Add a row of buttons if our account is an admin account
        let $accountTypeRow = $('#account_type_row');
        $accountTypeRow.append(`
            
            <div class="col s4">
                <div class="btn" id="viewLinkedSystems">View Currently Linked Systems</div>
            </div>            
            
            <div class="col s4">
                <div class="btn" id="convertToStandardUserBtn">Convert back to standard user</div>
            </div>

            <div class="col s4">
                <a class="btn" id="addLinkedAccount">Link another account</a>
            </div>
        `);

        /// Add a listener for the view linked systems button
        document.getElementById("viewLinkedSystems").addEventListener("click", function () {
            window.location.replace("/delta_dashboard/adminindex");
        });

        /// Add a listener for the convert to standard user button
        document.getElementById("convertToStandardUserBtn").addEventListener("click", async function () {
            let db = firebase.database();

            await db.ref()
                .child(`users/${uid}/user_info/linked_accounts`)
                .remove();
            await db.ref()
                .child(`users/${uid}/user_info/account_type`)
                .remove();

            M.toast({
                html: 'Account Admin status revoked. Reloading in 3 seconds...'
            });
            setTimeout(function () {
                window.location.replace("/delta_dashboard/index2")
            }, 3000)
        });

        /// Add a listener for adding a new linked account button
        document.getElementById("addLinkedAccount").addEventListener("click", function () {
            openAddLinkedAccountModal(uid);
        });

    } else {
        $("#current_account_type").append("Current Account Type: User")
    }

}

async function grabCameraInformation(uid){
    /** This function will grab camera information from Firebase **/

    let db = firebase.database();

    /// First get the account type of the user
    let camerasNode = await db
        .ref()
        .child(`users/${uid}/user_info/attached_devices/cameras`)
        .once('value');

    console.log(camerasNode.val().entries());
    for ([index, data] of camerasNode.val().entries()){
        console.log(index, data);

        if (data !== undefined){
            console.log(`Camera ${index}!`);
            $("#security_camera_collapsible").append(
                `<div class="col s3 card"></div>
                `
            )
        }
    }

    console.log(camerasNode.val());
}

function initialiseUIElements(uid) {
    let elems = document.querySelectorAll('#main_collapsible');
    let instances = M.Collapsible.init(elems, {
        accordion: false,
        onOpenStart: function (test) {

            let opened_collapsible_id = $(test).attr('id');

            if (opened_collapsible_id === "map_collapsible") {
                load_map(uid)
            }
        }
    });
}

function start_profile_page(uid) {
    initialiseUIElements(uid);

    let db = firebase.database();
    // Get the current charging mode from Firebase and intialize our charging mode input box
    db.ref("users/" + uid + "/evc_inputs/charging_modes/single_charging_mode").on('value', function (snapshot) {
        $('#chargemode_select').val(snapshot.val());
        let modeselect_elem = document.getElementById('chargemode_select');
        let modeselect_instance = M.FormSelect.init(modeselect_elem);
    });

    // Listen for a select in the dropdown box
    $('#chargemode_select').on('change', function () {
        // Send the new mode to Firebase to be picked up by our Analyse process
        db.ref("users/" + uid + "/evc_inputs/charging_modes").update({
            single_charging_mode: $(this).val()
        })
    });

    // Get the current charging mode from Firebase and intialize our charging mode input box
    db.ref("users/" + uid + "/evc_inputs/buffer_aggro_mode").on('value', function (snapshot) {
        $('#battery_buffer_select').val(snapshot.val());
        console.log(snapshot.val());
        let battery_buffer_select_elem = document.getElementById('battery_buffer_select');
        let battery_buffer_select_instance = M.FormSelect.init(battery_buffer_select_elem);
    });

    // Listen for a select in the battery buffer dropdown box
    $('#battery_buffer_select').on('change', function () {
        // Send the new buffer aggressiveness mode to Firebase to be picked up by our Analyse process
        db.ref("users/" + uid + "/evc_inputs").update({
            buffer_aggro_mode: $(this).val()
        })
    });

    // Get the current charging mode from Firebase and intialize our charging mode input box
    db.ref("users/" + uid + "/evc_inputs/charging_modes/authentication_required").on('value', function (snapshot) {
        $('#authentication_select').val(snapshot.val());
        console.log(snapshot.val());
        let authentication_select_elem = document.getElementById('authentication_select');
        let authentication_select_instance = M.FormSelect.init(authentication_select_elem);
    });

    // Listen for a select in the battery buffer dropdown box
    $('#authentication_select').on('change', function () {
        // Send the new buffer aggressiveness mode to Firebase to be picked up by our Analyse process
        db.ref("users/" + uid + "/evc_inputs/charging_modes").update({
            authentication_required: $(this).val()
        })
    });

    // Listen for any changes in display name
    $('#change_display_name_button').click(function () {
        let new_display_name = document.getElementById('name').value;
        if (new_display_name === '') {
            M.toast({
                html: 'Please enter a name.'
            })
        } else {
            user.updateProfile({
                displayName: new_display_name,
                // photoURL: "https://example.com/jane-q-user/profile.jpg"
            }).then(function () {
                console.log('done');
                location.reload()
            }).catch(function (error) {
                // An error happened.
            });
        }

    });

    // Start a listener for the change password button
    $("#change_pw_button").click(change_pw_button_pressed)

    grabAccountTypeInformation(uid);

    // grabCameraInformation(uid);
}


function checkIfLoggedIn() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {

            // Start the main js script
            start_profile_page(getPageUID(user));
        } else {
            window.location.replace("/delta_dashboard/login")
        }
    });

}

checkIfLoggedIn();