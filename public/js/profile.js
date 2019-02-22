function load_map(uid) {

    function CenterControl(controlDiv, map) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
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
        var controlText = document.createElement('div');
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
            db.ref(`users/${uid}/system_location`).update({
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

function start_profile_page(uid) {

    var elems = document.querySelectorAll('#main_collapsible');
    var instances = M.Collapsible.init(elems, {
        accordion: false,
        onOpenStart: function (test) {

            let opened_collapsible_id = $(test).attr('id');

            if (opened_collapsible_id === "map_collapsible") {
                load_map(uid)
            }
        }
    });

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