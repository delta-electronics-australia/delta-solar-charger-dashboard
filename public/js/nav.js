function initialiseNavUIElements() {
    let archive_dropdown_elems = document.querySelectorAll('.archive_dropdown_trigger');
    let archive_dropdown_instances = M.Dropdown.init(archive_dropdown_elems, {
        coverTrigger: false,
        constrainWidth: false,
        hover: true,
        outDuration: 150
    });
    let user_dropdown_elems = document.querySelectorAll('.user_dropdown_trigger');
    let user_dropdown_instances = M.Dropdown.init(user_dropdown_elems, {
        coverTrigger: false,
        hover: true,
        outDuration: 150

    });
}

async function test123(user) {
    /** This function checks if we have a custom UID and if so, checks if we are logged into an
     * admin account and we have the relevant permissions **/

        // First check if we have any injected custom UIDs
    let finalUID = "";

    let systemName = "";

    // Select the custom UID div
    let $customUIDDiv = $("#custom-uid-div");

    // Check if there is anything inside
    if ($customUIDDiv.attr('custom-uid') !== "") {

        // If we have detected a custom UID, then we switch the nav bar to red
        $nav_wrapper_div = $("#nav-wrapper-div");
        $nav_wrapper_div.removeClass('blue');
        $nav_wrapper_div.addClass('red');

        // If there is, we use the custom UID as our final UID
        finalUID = $customUIDDiv.attr('custom-uid');

        // Now check if this account has the custom UID in it's linked accounts node
        let linkedAccountsNode = await firebase.database()
            .ref()
            .child(`users/${user.uid}/user_info/linked_accounts`)
            .once("value");

        // If it doesn't, then we exit this page into the normal index2 page
        if (!linkedAccountsNode.val().hasOwnProperty(finalUID)) {
            window.location.replace("/delta_dashboard/index2");
        } else {
            // If it does, then we get the system name, change the title and load the dashboard
            systemName = await firebase.database()
                .ref()
                .child(`users/${finalUID}/user_info/nickname`)
                .once("value");

            $("#nav-mobile").prepend(`<li><b>Viewing ${systemName.val()}'s System</b></li>`);

            // Get the user's displayname and put it in the nav bar
            $("#displayName").append(`<b>${systemName.val()}</b>`);

            // Modify all of our navigation links
            document.getElementById("dashboard_link").href = `/delta_dashboard/index2/${finalUID}`;
            document.getElementById("charging_history_link").href = `/delta_dashboard/charging_history2/${finalUID}`;
            document.getElementById("archive_link").href = `/delta_dashboard/history/${finalUID}`;
            document.getElementById("hardware_info_link").href = `/delta_dashboard/hardware_info/${finalUID}`;
            document.getElementById("settings_link").href = `/delta_dashboard/profile/${finalUID}`;

        }

    } else {
        // Get the user's displayname and put it in the nav bar
        $("#displayName").append(`<b>${user.displayName}</b>`);

        finalUID = user.uid;
    }
    return finalUID
}

$(function () {
    initialiseNavUIElements();

    firebase.auth().onAuthStateChanged(function (user) {
        test123(user);

        // Now we need to determine what kind of system this account is running
        let db = firebase.database();

        // If this system is running a multiple charger system, then we need to change the links to index2 etc...
        db.ref(`users/${user.uid}/system_type`).once("value", function (snapshot) {
            if (snapshot.val() === "multiple") {
                document.getElementById("dashboard_link").href = '/delta_dashboard/index2';
                document.getElementById("charging_history_link").href = '/delta_dashboard/charging_history2';
            }
        });

        db.ref(`users/${user.uid}/user_info/account_type`).once("value", function (snapshot) {
            if (snapshot.val() === "admin") {
                $("#nav-mobile").prepend(`<li><a href="/delta_dashboard/adminindex">Admin Dashboard</a></li>`)

            }

        })
    });

    /// Add a listener for the signOut button
    document.getElementById('signOutButton').addEventListener('click', signOut);
});