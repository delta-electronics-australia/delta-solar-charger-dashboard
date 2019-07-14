function generate_date() {
    return moment().format('YYYY-MM-DD');
}

async function checkSystemStatus(adminUIDObject, linkedUIDsObject) {
    /// This function listens to whether or not our systems are online and changes the dot accordingly

    let adminUID = Object.keys(adminUIDObject)[0];

    let db = firebase.database();

    let latestHistoryNode = await db.ref()
        .child(`users/${adminUID}/history/${generate_date()}`)
        .limitToLast(1)
        .once('value');

    // First get the current time
    let currentTime = moment();

    // Check if our latest admin history node has data
    if (latestHistoryNode.val() !== null) {
        let latestPayloadTime = moment(`${generate_date()} ${latestHistoryNode.val()[Object.keys(latestHistoryNode.val())[0]]['time']}`, 'YYYY-MM-DD HHmmss');

        let minutesDifference = moment.duration(currentTime.diff(latestPayloadTime));
        minutesDifference = minutesDifference.asMinutes();

        // If it has been 15 minutes since the last history message then we display a red dot
        if (minutesDifference > 15) {
            adminUIDObject[adminUID]['dotElement'].css('background-color', '#ff0000');
        }

        // Else, we display a green dot
        else {
            adminUIDObject[adminUID]['dotElement'].css('background-color', '#33CC33');
        }
    }

    // If it doesn't then we simply give our admin system a red dot
    else {
        adminUIDObject[adminUID]['dotElement'].css('background-color', '#ff0000');

    }

    /// Now we loop through our linkedUIDs and do the same
    for (let linkedUID of Object.keys(linkedUIDsObject)) {
        let latestHistoryNode = await db.ref()
            .child(`users/${linkedUID}/history/${generate_date()}`)
            .limitToLast(1)
            .once('value');

        // See if the node actually has data
        if (latestHistoryNode.val() !== null) {
            let latestPayloadTime = moment(`${generate_date()} ${latestHistoryNode.val()[Object.keys(latestHistoryNode.val())[0]]['time']}`, 'YYYY-MM-DD HHmmss');

            if (latestPayloadTime === null) {
                linkedUIDsObject[linkedUID]['dotElement'].css('background-color', '#33CC33');

            }
            let minutesDifference = moment.duration(currentTime.diff(latestPayloadTime));
            minutesDifference = minutesDifference.asMinutes();

            // If it has been 15 minutes since the last history message then we display a red dot
            if (minutesDifference > 15) {
                linkedUIDsObject[linkedUID]['dotElement'].css('background-color', '#ff0000');
            }

            // If not, we display a green dot
            else {
                linkedUIDsObject[linkedUID]['dotElement'].css('background-color', '#33CC33');
            }
        }

        // If there is no data then we simply give the system a red dot
        else {
            linkedUIDsObject[linkedUID]['dotElement'].css('background-color', '#ff0000');
        }
    }
}

function startSystemAnalyticsListeners(adminUIDObject, linkedUIDsObject) {
    let adminUID = Object.keys(adminUIDObject)[0];

    let db = firebase.database();

    db.ref()
        .child(`users/${adminUID}/analytics/live_analytics`)
        .on("value", function (snapshot) {
            let liveAnalyticsNode = snapshot.val();

            // First empty the table
            adminUIDObject[adminUID]['tableElement'].empty();

            // Now append the new data to the table
            adminUIDObject[adminUID]['tableElement'].append(
                `<tr><td>Solar Generated Today</td><td>${liveAnalyticsNode['dcp_t'].toFixed(2)} kW</td>
                <tr><td>Energy Consumed Today</td><td>${liveAnalyticsNode['ac2p_t'].toFixed(2)} kW</td>
                <tr><td>Energy Exported Today</td><td>${liveAnalyticsNode['utility_p_export_t'].toFixed(2)} kWh</td>
                <tr><td>Energy Imported Today</td><td>${-1 * liveAnalyticsNode['utility_p_import_t'].toFixed(2)} kWh</td>
                <tr><td>Battery Consumed Today</td><td>${liveAnalyticsNode['btp_consumed_t'].toFixed(2)} kW</td>
                <tr><td>Battery Charged Today</td><td>${-1 * liveAnalyticsNode['btp_charged_t'].toFixed(2)} kW</td>`
            )
        });

    // Loop through all of our linkedUIDs and start listeners for the live analytics
    for (let linkedUID of Object.keys(linkedUIDsObject)) {
        db.ref()
            .child(`users/${linkedUID}/analytics/live_analytics`)
            .on("value", function (snapshot) {
                let liveAnalyticsNode = snapshot.val();

                // Check if the analytics node is from today
                if (moment(liveAnalyticsNode['time']).isSame(moment(), 'day')) {

                    // First empty the table
                    linkedUIDsObject[linkedUID]['tableElement'].empty();

                    // Now append the new data to the table
                    linkedUIDsObject[linkedUID]['tableElement'].append(
                        `<tr><td>Solar Generated Today</td><td>${liveAnalyticsNode['dcp_t'].toFixed(2)} kW</td>
                <tr><td>Energy Consumed Today</td><td>${liveAnalyticsNode['ac2p_t'].toFixed(2)} kW</td>
                <tr><td>Energy Exported Today</td><td>${liveAnalyticsNode['utility_p_export_t'].toFixed(2)} kWh</td>
                <tr><td>Energy Imported Today</td><td>${-1 * liveAnalyticsNode['utility_p_import_t'].toFixed(2)} kWh</td>
                <tr><td>Battery Consumed Today</td><td>${liveAnalyticsNode['btp_consumed_t'].toFixed(2)} kW</td>
                <tr><td>Battery Charged Today</td><td>${-1 * liveAnalyticsNode['btp_charged_t'].toFixed(2)} kW</td>`
                    )
                }
            });
    }

}

function createSystemCards(adminUIDObject, linkedUIDsObject) {
    /** This function will create cards that will show at a glance of all of the systems that are linked
     to this admin account **/

    // First we want to render the system that belongs to the admin account

    let adminUID = Object.keys(adminUIDObject)[0];

    // Select our system row
    let systemRow = $('#system_row');

    // First empty it
    systemRow.empty();

    // Now add some boilerplate code for the card
    systemRow.append(`
    <div class="col s12 m6 l4">
        <div class="card blue-grey darken-1 hoverable">
            <div class="card-content white-text blue-grey darken-1">
                <span class="card-title center-align"><span class="admin_dashboard_dot" id="${adminUID}_dot" style="background-color:#ff0000"></span>   ${adminUIDObject[adminUID]['name']}</span>
                    <table class="">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Value</th>
                            </tr>
                        </thead>

                        <tbody id="${adminUID}_table"></tbody>
                    </table>
                <div class="btn" id="${adminUID}_button">View dashboard</div>
            </div>
        </div>
    </div>
    `);

    document.getElementById(`${adminUID}_button`).addEventListener('click', function () {
        window.location.replace(`/delta_dashboard/index2/`);
    });

    // Append our selected elements to the UIDObject
    adminUIDObject[adminUID]['element'] = $(`#${adminUID}`);
    adminUIDObject[adminUID]['dotElement'] = $(`#${adminUID}_dot`);
    adminUIDObject[adminUID]['tableElement'] = $(`#${adminUID}_table`);
    adminUIDObject[adminUID]['buttonElement'] = $(`#${adminUID}_button`);

    /// Now we want to render cards for the systems that are linked to the admin account

    // First loop through the keys of the linkedUIDsObject
    for (let linkedUID of Object.keys(linkedUIDsObject)) {

        // Now add some boilerplate code for the card
        systemRow.append(`
        <div class="col s12 m6 l4">
            <div class="card blue-grey darken-1 hoverable">
                <div class="card-content white-text blue-grey darken-1">
                    <span class="card-title center-align"><span class="admin_dashboard_dot" id="${linkedUID}_dot"></span>   ${linkedUIDsObject[linkedUID]['name']}</span>
                    <table class="">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Value</th>
                            </tr>
                        </thead>

                        <tbody id="${linkedUID}_table"></tbody>
                    </table>
                    <div class="btn" id="${linkedUID}_button">View dashboard</div>
                </div>
            </div>
        </div>
        `);

        document.getElementById(`${linkedUID}_button`).addEventListener('click', function () {
            window.location.replace(`/delta_dashboard/index2/${linkedUID}`);
        });

        // Append our selected elements to the UIDObject
        linkedUIDsObject[linkedUID]['element'] = $(`#${linkedUID}`);
        linkedUIDsObject[linkedUID]['dotElement'] = $(`#${linkedUID}_dot`);
        linkedUIDsObject[linkedUID]['tableElement'] = $(`#${linkedUID}_table`);
        linkedUIDsObject[linkedUID]['buttonElement'] = $(`#${linkedUID}_button`);
    }

    // Now that we have created the system cards, we can start some listeners to display the data
    startSystemAnalyticsListeners(adminUIDObject, linkedUIDsObject);

    // Now that we have displayed all of the data, we now have to start listeners to update our indicator dot
    // Check every 2 minutes to see if the system is online
    checkSystemStatus(adminUIDObject, linkedUIDsObject);
    setInterval(function () {
        checkSystemStatus(adminUIDObject, linkedUIDsObject);
    }, 120000);
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
                let liveAnalyticsNode = snapshot.val();

                liveAnalyticsObject[linkedUID]['btp_charged_t'] = liveAnalyticsNode['btp_charged_t'] * -1;
                liveAnalyticsObject[linkedUID]['btp_consumed_t'] = liveAnalyticsNode['btp_consumed_t'];
                liveAnalyticsObject[linkedUID]['dcp_t'] = liveAnalyticsNode['dcp_t'];
                liveAnalyticsObject[linkedUID]['utility_p_export_t'] = liveAnalyticsNode['utility_p_export_t'];
                liveAnalyticsObject[linkedUID]['utility_p_import_t'] = liveAnalyticsNode['utility_p_import_t'] * -1;
                liveAnalyticsObject[linkedUID]['ac2p_t'] = liveAnalyticsNode['ac2p_t'];

            })
    }

    // Now start a listener for live analytics with our admin UID
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

                for (let dataString of Object.keys(liveAnalyticsObject[linkedUID])) {
                    summedLiveAnalytics[dataString] += liveAnalyticsObject[linkedUID][dataString];
                }
            }

            // Now convert all the summed live analytics into strings and post them to the webpage
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

            // Now that the data has been displayed, we can how make our master row visible
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

            // Now we get information about our admin UID
            adminUIDObject[user.uid] = {};
            let adminUIDName = await db.ref()
                .child(`users/${user.uid}/user_info/nickname`)
                .once('value');
            adminUIDObject[user.uid]['name'] = adminUIDName.val();

            // First grab our aggregate analytics
            grabAggregateAnalytics(adminUIDObject, linkedUIDsObject);

            // Then we create the cards that display information about our linked systems
            createSystemCards(adminUIDObject, linkedUIDsObject);
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

            // Start the main js script
            startAdminDashboard(user);
        } else {
            window.location.replace("/delta_dashboard/login")
        }
    });

}


checkIfLoggedIn();