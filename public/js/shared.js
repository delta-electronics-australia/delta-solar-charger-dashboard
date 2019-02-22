function getPageUID(user) {
    /** This function checks if we have a custom UID and if so, checks if we are logged into an
     * admin account and we have the relevant permissions **/

        // First check if we have any injected custom UIDs
    let finalUID = "";

    // Select the custom UID div
    let $customUIDDiv = $("#custom-uid-div");

    // Check if there is anything inside
    if ($customUIDDiv.attr('custom-uid') !== "") {

        console.log('Custom UID detected');

        // If there is, we use the custom UID as our final UID
        finalUID = $customUIDDiv.attr('custom-uid');

        console.log('Linked account confirmed. Starting the page...')
    } else {
        finalUID = user.uid;
        console.log('No custom UID found, using the normal one');
    }
    return finalUID
}

function signOut() {
    firebase.auth().signOut().then(function () {
    }).catch(function (error) {
        console.log("error", error)
    })
}