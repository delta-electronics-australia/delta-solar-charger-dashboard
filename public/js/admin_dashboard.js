let date;

function generate_date() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    date = yyyy + '-' + mm + '-' + dd;
}

function grabAggregateAnalytics(adminUIDObject, linkedUIDsObject) {
    /// This function will grab all of the analytics to display on our Admin Dashboard

    let db = firebase.database();

    let user = firebase.auth().currentUser;

    let liveAnalyticsObject = {};

    // First we start listeners with our linkedUIDs
    for (let linkedUID of Object.keys(linkedUIDsObject)) {
        liveAnalyticsObject[linkedUID] = {};

        db.ref().child(`users/${linkedUID}/analytics/live_analytics`)
            .on('value', function (snapshot) {
                console.log(snapshot.val());
                let liveAnalyticsNode = snapshot.val();

                liveAnalyticsObject[linkedUID]['btp_charged_t'] = liveAnalyticsNode['btp_charged_t'] * -1;
                liveAnalyticsObject[linkedUID]['btp_consumed_t'] = liveAnalyticsNode['btp_consumed_t'];
                liveAnalyticsObject[linkedUID]['dcp_t'] = liveAnalyticsNode['dcp_t'];
                liveAnalyticsObject[linkedUID]['utility_p_export_t'] = liveAnalyticsNode['utility_p_export_t'];
                liveAnalyticsObject[linkedUID]['utility_p_import_t'] = liveAnalyticsNode['utility_p_import_t'] * -1;
                liveAnalyticsObject[linkedUID]['ac2p_t'] = liveAnalyticsNode['ac2p_t'];

            })
    }

    // Now start a listener with our admin UID
    liveAnalyticsObject[user.uid] = {};

    db.ref().child(`users/${user.uid}/analytics/live_analytics`)
        .on('value', function (snapshot) {
            let liveAnalyticsNode = snapshot.val();

            liveAnalyticsObject[user.uid]['btp_charged_t'] = liveAnalyticsNode['btp_charged_t'] * -1;
            liveAnalyticsObject[user.uid]['btp_consumed_t'] = liveAnalyticsNode['btp_consumed_t'];
            liveAnalyticsObject[user.uid]['dcp_t'] = liveAnalyticsNode['dcp_t'];
            liveAnalyticsObject[user.uid]['utility_p_export_t'] = liveAnalyticsNode['utility_p_export_t'];
            liveAnalyticsObject[user.uid]['utility_p_import_t'] = liveAnalyticsNode['utility_p_import_t'] * -1;
            liveAnalyticsObject[user.uid]['ac2p_t'] = liveAnalyticsNode['ac2p_t'];

            let summedLiveAnalytics = {
                'btp_charged_t': 0,
                'btp_consumed_t': 0,
                'dcp_t': 0,
                'utility_p_export_t': 0,
                'utility_p_import_t': 0,
                'ac2p_t': 0
            };

            // First add all of our liveAnalyticsObjects into summedLiveAnalytics
            for (let linkedUID of Object.keys(liveAnalyticsObject)) {
                console.log(linkedUID);

                for (let dataString of Object.keys(liveAnalyticsObject[linkedUID])) {
                    summedLiveAnalytics[dataString] += liveAnalyticsObject[linkedUID][dataString];
                }
            }

            // Now convert them to strings
            console.log(summedLiveAnalytics);

            document.getElementById("dctp_card")
                .innerText = summedLiveAnalytics['dcp_t'].toFixed(2) + "kWh";

            document.getElementById("utility_p_export_card")
                .innerText = summedLiveAnalytics['utility_p_export_t'].toFixed(2) + "kWh";
            document.getElementById("utility_p_import_card")
                .innerText = summedLiveAnalytics['utility_p_import_t'].toFixed(2) + "kWh";
            document.getElementById("bt_consumed_card")
                .innerText = summedLiveAnalytics['btp_consumed_t'].toFixed(2) + "kWh";
            document.getElementById("bt_charged_card")
                .innerText = (summedLiveAnalytics['btp_charged_t'].toFixed(2)) + "kWh";
            document.getElementById("energy_consumed_card")
                .innerText = (summedLiveAnalytics['ac2p_t'].toFixed(2)) + "kWh";

            document.getElementById("master_row").style.visibility = 'initial';
            document.getElementById("loading_id").style.display = 'none';

        })

}

function initialiseUIElements() {
    // Define the first row of sliders
    let first_row_slider_options = {
        height: 150,
        interval: 10000
    };
    let media_elem = document.getElementById('solar_slider');
    M.Slider.init(media_elem, first_row_slider_options);
    let media_elem1 = document.getElementById('utility_slider');
    M.Slider.init(media_elem1, first_row_slider_options);
    let media_elem2 = document.getElementById('bt_slider');
    M.Slider.init(media_elem2, first_row_slider_options);
}

function startAdminDashboard() {
    /// This function is the main function to start our Admin Dashboard

    // First we need to initialise our UI elements
    initialiseUIElements();

    let db = firebase.database();

    let user = firebase.auth().currentUser;

    let adminUIDObject = {};

    let linkedUIDsObject = {};

    db.ref().child(`users/${user.uid}/user_info/linked_accounts`)
        .on("value", async function (snapshot) {

            // Todo: stop all listeners

            let linkedUIDNode = snapshot.val();

            for (let linkedUID in linkedUIDNode) {

                // Initialise a linkedUID in our linkedUIDsObject
                linkedUIDsObject[linkedUID] = {};

                if (linkedUIDNode.hasOwnProperty(linkedUID)) {

                    let linkedUIDName = await db.ref()
                        .child(`users/${linkedUID}/user_info/nickname`)
                        .once('value');
                    linkedUIDName = linkedUIDName.val();

                    linkedUIDsObject[linkedUID]['name'] = linkedUIDName;

                }
            }
            console.log(linkedUIDsObject);

            // Now we get information about our admin UID
            adminUIDObject[user.uid] = {};
            let adminUIDName = await db.ref()
                .child(`users/${user.uid}/user_info/nickname`)
                .once('value');
            adminUIDObject[user.uid]['name'] = adminUIDName.val();

            console.log(adminUIDObject);

            grabAggregateAnalytics(adminUIDObject, linkedUIDsObject);
        })
}

function checkAdminStatus() {
    /// This function will check if the current user has admin status. If not, then redirect back to the normal dashboard
    let db = firebase.database();
    let user = firebase.auth().currentUser;

    db.ref().child(`users/${user.uid}/user_info/account_type`)
        .once("value")
        .then(function (snapshot) {

            if (snapshot.val() !== "admin") {
                window.location.replace("/delta_dashboard/index2");
            }
        })
}

function checkIfLoggedIn() {

    // Make all of the charts go away until we have data
    document.getElementById("master_row").style.visibility = 'hidden';

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // First check if this is an admin account
            checkAdminStatus();

            // This will update our global date variable
            generate_date();

            // Start the main js script
            startAdminDashboard(user);
        } else {
            window.location.replace("/delta_dashboard/login")
        }
    });

}

function signOut() {
    firebase.auth().signOut().then(function () {
        console.log("Signout Successful")
        // window.location.reload()
    }).catch(function (error) {
        console.log("error", error)
    })
}


checkIfLoggedIn();