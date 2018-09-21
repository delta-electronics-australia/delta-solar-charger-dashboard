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
        .catch(function(error){
            M.toast({html: 'Error: Old password is incorrect'})
        })
}

function start_profile_page(user) {


    var elems = document.querySelectorAll('#main_collapsible');
    var instances = M.Collapsible.init(elems, {
        accordion: false
    });

    let db = firebase.database();
    // Get the current charging mode from Firebase and intialize our charging mode input box
    db.ref("users/" + user.uid + "/evc_inputs/charging_modes/single_charging_mode").on('value', function (snapshot) {
        $('#chargemode_select').val(snapshot.val());
        let modeselect_elem = document.getElementById('chargemode_select');
        let modeselect_instance = M.FormSelect.init(modeselect_elem);
    });

    // Listen for a select in the dropdown box
    $('#chargemode_select').on('change', function () {
        // Send the new mode to Firebase to be picked up by our Analyse process
        db.ref("users/" + user.uid + "/evc_inputs/charging_modes").update({
            single_charging_mode: $(this).val()
        })
    });

    // Get the current charging mode from Firebase and intialize our charging mode input box
    db.ref("users/" + user.uid + "/evc_inputs/buffer_aggro_mode").on('value', function (snapshot) {
        $('#battery_buffer_select').val(snapshot.val());
        console.log(snapshot.val())
        let battery_buffer_select_elem = document.getElementById('battery_buffer_select');
        let battery_buffer_select_instance = M.FormSelect.init(battery_buffer_select_elem);
    });

    // Listen for a select in the battery buffer dropdown box
    $('#battery_buffer_select').on('change', function () {
        // Send the new buffer aggressiveness mode to Firebase to be picked up by our Analyse process
        db.ref("users/" + user.uid + "/evc_inputs").update({
            buffer_aggro_mode: $(this).val()
        })
    });

    // Listen for any changes in display name
    $('#change_display_name_button').click(function () {
        let new_display_name = document.getElementById('name').value;
        if (new_display_name === '') {
            M.toast({html: 'Please enter a name.'})
        }
        else {
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

    })


}

function signOut() {
    firebase.auth().signOut().then(function () {
        console.log("Signout Successful")
        // window.location.reload()
    }).catch(function (error) {
        console.log("error", error)
    })
}

function checkIfLoggedIn() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // This will update our global date variable
            // generate_date();

            // Start the main js script
            start_profile_page(user);
        } else {
            window.location.replace("/delta_dashboard/login")
        }
    });

}

checkIfLoggedIn()