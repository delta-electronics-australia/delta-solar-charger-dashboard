function update_ev_charger_information(data_obj) {
    let evc_info_row = $("#evc_info_row");
    let charger_number = 1;
    for (let key in data_obj) {
        if (data_obj.hasOwnProperty(key)) {
            // console.log(key);
            evc_info_row.append(`<div class="col s12">
            <h5><span class="dot" style="background-color: ${data_obj[key]['alive'] ? '#33cc33': '#ff0000'}"></span> Charger ${charger_number} - ${key}${data_obj[key]['primary_charger'] ? " - Primary Charger": 'sup'}</h5></div>`);

            evc_info_row.append(`<div class="col s8">
            <table><thead><tr><th>Description</th><th>Value</th></tr></thead><tbody>
            <tr><td>Charge Point Vendor</td><td>${data_obj[key]['chargePointVendor']}</td></tr>
            <tr><td>Charge Point Model</td><td>${data_obj[key]['chargePointModel']}</td></tr>
            <tr><td>Charge Point Serial Number</td><td>${data_obj[key]['chargePointSerialNumber']}</td></tr>
            <tr><td>Charge Point Firmware Version</td><td>${data_obj[key]['firmwareVersion']}</td></tr>
            </tbody></table>
            </div>`);

            if (data_obj[key]['chargePointModel'].substring(0, 4) === 'EVPE') {
            evc_info_row.append(`
            <div class="col s4">
                <img class="materialboxed center-align" width="225" src="../delta_dashboard/public/img/acminiplus.jpg">
            </div>`);
                charger_number++
            }
        }
    }

    let inverter_info_row = $("inverter_info_row");

}

async function start_hardware_info_page(user) {
    let db = firebase.database();

    let elems = document.querySelectorAll('.modal');
    let instances = M.Modal.init(elems, {
        dismissible: false,
        // endingTop: '50%'
    });

    let charger_select = $('#charger_select');


    // Todo: In the future we need to change this for
    // Get the list of EV chargers that we have connected to this E5
    let ev_charger_keys = db.ref(`users/${user.uid}/ev_chargers`);
    let ev_chargers = await ev_charger_keys.once("value");
    ev_chargers = Object.keys(ev_chargers.val());

    let primary_charger_ref = db.ref(`users/${user.uid}/evc_inputs/primary_charger_id`);
    let primary_charger = await primary_charger_ref.once("value");
    primary_charger = primary_charger.val();

    let data_obj = {};
    let charger_select_html = "";
    for (let i = 0; i < ev_chargers.length; i++) {
        console.log(ev_chargers[i]);

        let temp_evc_data = await db.ref(`users/${user.uid}/evc_inputs/${ev_chargers[i]}/charger_info`).once("value");
        temp_evc_data = temp_evc_data.val();
        // Just in case a boot notification has not come yet, we have an empty Object
        if (temp_evc_data === null){
            temp_evc_data = {
                chargeBoxSerialNumber: "",
                chargePointModel: "Model Unknown",
                chargePointSerialNumber: "Serial Unknown",
                chargePointVendor: "Vendor Unknown",
                firmwareVersion: "Version Unknown",
                "imsi": ""
            }
        }
        else {
            // If we have details on the charger then we can append
            // Todo: append when online only
            charger_select_html = charger_select_html + "<option value='" + ev_chargers[i] + "'>" + ev_chargers[i] + "</option>"
        }

        let temp_evc_alive = await db.ref(`users/${user.uid}/evc_inputs/${ev_chargers[i]}/alive`).once("value");
        temp_evc_alive = temp_evc_alive.val();

        let temp_evc_primary_charger = await db.ref(`users/${user.uid}/evc_inputs/${ev_chargers[i]}/primary_charger`).once("value");
        temp_evc_primary_charger = temp_evc_primary_charger.val();


        data_obj[ev_chargers[i]] = temp_evc_data;
        data_obj[ev_chargers[i]]['alive'] = temp_evc_alive;
        data_obj[ev_chargers[i]]['primary_charger'] = temp_evc_primary_charger;

        if (ev_chargers[i] === primary_charger){
            console.log(ev_chargers[i]);
            console.log('We found the primary charger');
        }

    }
    console.log(data_obj);

    // Append the html for our charge select html and initialize the drop down in the modal
    charger_select.append(charger_select_html);
    let chargerselect_elem = document.getElementById('charger_select');
    let chargerselect_instance = M.FormSelect.init(chargerselect_elem);

    update_ev_charger_information(data_obj)

}

function checkIfLoggedIn() {

    // Check if we are logged in
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // Initialize our collapsable
            let elems = document.querySelectorAll('.collapsible');
            let instances = M.Collapsible.init(elems, {
                accordion: false
            });

            // Start our code for the page
            start_hardware_info_page(user)
        }

        else {
            //... or go to login
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

Date.prototype.yyyymmdd = function () {
    let mm = this.getMonth() + 1; // getMonth() is zero-based
    let dd = this.getDate();

    return [this.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
    ].join('-');
};
