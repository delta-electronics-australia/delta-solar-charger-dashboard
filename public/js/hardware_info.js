function update_ev_charger_information(data_obj) {
    let evc_info_row = $("#evc_info_row");
    let charger_number = 1;
    for (let key in data_obj) {
        if (data_obj.hasOwnProperty(key)) {

            evc_info_row.append(`<div class="col s12">
            <h5><span class="dot" style="background-color: ${data_obj[key]['alive'] ? '#33cc33' : '#ff0000'}"></span> Charger ${charger_number} - ${key}${data_obj[key]['primary_charger'] ? " - Primary Charger" : ''}</h5></div>`);

            evc_info_row.append(`<div class="col s9">
            <table><thead><tr><th>Description</th><th>Value</th></tr></thead><tbody>
            <tr><td>Charge Point Vendor</td><td>${data_obj[key]['chargePointVendor']}</td></tr>
            <tr><td>Charge Point Model</td><td>${data_obj[key]['chargePointModel']}</td></tr>
            <tr><td>Charge Point Serial Number</td><td>${data_obj[key]['chargePointSerialNumber']}</td></tr>
            <tr><td>Charge Point Firmware Version</td><td>${data_obj[key]['firmwareVersion']}</td></tr>
            </tbody></table>
            </div>`);

            if (data_obj[key]['chargePointModel'].substring(0, 4) === 'EVPE') {
                evc_info_row.append(`
            <div class="col s3">
                <img class="materialboxed center-align" style="max-width: 80%; height: auto;" src="../delta_dashboard/public/img/acminiplus.jpg">
            </div>`);
            }
            else if (data_obj[key]['chargePointModel'].substring(0, 4) === 'EVDE') {
                evc_info_row.append(`
            <div class="col s3">
                <img class="materialboxed center-align" style="max-width: 80%; height: auto;" src="../delta_dashboard/public/img/acminiplus.jpg">
            </div>`);
            }

        }
        charger_number++

    }
    document.getElementById('master_row').style.visibility = 'visible';
    document.getElementById('preloader').style.display = 'none';

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
        if (temp_evc_data === null) {
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
            // If we have details on the charger AND the charger is online then we can append
            let alive_temp = await db.ref(`users/${user.uid}/evc_inputs/${ev_chargers[i]}/alive`).once("value");
            if (alive_temp.val()) {
                charger_select_html = charger_select_html + "<option value='" + ev_chargers[i] + "'>" + ev_chargers[i] + "</option>"
            }
        }

        let temp_evc_alive = await db.ref(`users/${user.uid}/evc_inputs/${ev_chargers[i]}/alive`).once("value");
        temp_evc_alive = temp_evc_alive.val();

        let temp_evc_primary_charger = await db.ref(`users/${user.uid}/evc_inputs/${ev_chargers[i]}/primary_charger`).once("value");
        temp_evc_primary_charger = temp_evc_primary_charger.val();


        data_obj[ev_chargers[i]] = temp_evc_data;
        data_obj[ev_chargers[i]]['alive'] = temp_evc_alive;
        data_obj[ev_chargers[i]]['primary_charger'] = temp_evc_primary_charger;

        if (ev_chargers[i] === primary_charger) {
            console.log(ev_chargers[i]);
            console.log('We found the primary charger');
        }

    }
    console.log(data_obj);

    // Append the html for our charge select html and initialize the drop down in the modal
    charger_select.append(charger_select_html);
    let chargerselect_elem = document.getElementById('charger_select');
    let chargerselect_instance = M.FormSelect.init(chargerselect_elem);

    // Update all of the tables and images
    update_ev_charger_information(data_obj);

    $("#confirm_update_fw_btn").click(function () {
        // This function is called when the update firmware button is pressed
        console.log("Pressed!!");
        let selected_charger = $('#charger_select').val();

        console.log(selected_charger);

        let firmwareType = "";
        // Todo: change this to model group specific, not model specific
        if (data_obj[selected_charger].chargePointModel === 'EVPE3225MUN' || data_obj[selected_charger].chargePointModel === 'EVPE3220MWN') {
            console.log('We have chosen a ACMP!');
            let modal_body = $('#modal_body');

            // You have selected a DC Wallbox
            modal_body.empty();
            modal_body.append('<h6>You have selected an AC Mini Plus. Please choose which firmware you would like to upgrade</h6>');
            modal_body.append(`
                <div class="input-field white-text center-align">
                    <select id="firmware_type_select" class="center-align">
                        <option value="" disabled selected>Choose which component you would like to upgrade</option>
                        <option value="FileSystem">File System</option>
                        <option value="FileSystem_Admin">File System Beta</option>
                        <option value="Kernal">Kernal</option>
                    </select>
                </div>
            `);
            modal_body.append(`<a class="waves-effect waves-light btn" id="confirm_fw_type_btn">Update</a>`);
            let firmwareselect_elem = document.getElementById('firmware_type_select');
            let firmwareselect_instance = M.FormSelect.init(firmwareselect_elem);
        }
        else if (data_obj[selected_charger].chargePointModel === 'EVDE25D4DUM') {
            console.log('We have chosen a DCWB!');
            // Todo: need more code here to select more options for the DCWB

            let modal_body = $('#modal_body');

            // You have selected a DC Wallbox
            modal_body.empty();
            modal_body.append('<h6>You have selected a DC Wallbox. Please choose which firmware you would like to upgrade</h6>');
            modal_body.append(`
                <div class="input-field white-text center-align">
                    <select id="firmware_type_select" class="center-align">
                        <option value="" disabled selected>Choose which component you would like to upgrade</option>
                        <option value="Aux_Power">Aux Power</option>
                        <option value="RCB">Relay Control Board</option>
                        <option value="BA_Dual">CHAdeMO and Main Control Unit</option>
                        <option value="CA">CCS Control Unit</option>
                    </select>
                </div>
            `);
            modal_body.append(`<a class="waves-effect waves-light btn" id="confirm_fw_type_btn">Update</a>`);
            let firmwareselect_elem = document.getElementById('firmware_type_select');
            let firmwareselect_instance = M.FormSelect.init(firmwareselect_elem);
        }

        $("#confirm_fw_type_btn").click(function () {
            let firmwareType = $('#firmware_type_select').val();
            console.log(firmwareType);
            // Send the package that will enable the RemoteUpdate message in the backend
            db.ref(`users/${user.uid}/evc_inputs/`).update({
                update_firmware: {
                    'chargerID': selected_charger,
                    'firmwareType': firmwareType,
                    'set': true
                }
            }).then(function () {
                // Define our modal body div
                let modal_body = $('#modal_body');
                let modal_footer = $('#modal-footer');
                // Empty it and append the initial loading title
                modal_body.empty();
                modal_footer.empty();
                modal_body.append('<h6>We vibing</h6>');

                // Start a listener for any FirmwareStatusNotification updates
                db.ref(`users/${user.uid}/evc_inputs/temp_remote_fw_update_info/firmware_update_status`).on('value', function (snapshot) {

                    if (snapshot.val() !== null) {
                        let fw_status = snapshot.val();
                        modal_body.empty();
                        modal_body.append(`<h6>${snapshot.val()}</h6>`);
                        if (fw_status === 'Downloading') {
                            modal_body.append(
                                `<div class="progress">
                        <div class="determinate" style="width: 10%"></div>
                    </div>`
                            )
                        }
                        else if (fw_status === 'Downloaded') {
                            modal_body.append(
                                `<div class="progress">
                        <div class="determinate" style="width: 50%"></div>
                    </div>`
                            )
                        }

                        else if (fw_status === 'Installing') {
                            modal_body.append(
                                `<div class="progress">
                        <div class="determinate" style="width: 70%"></div>
                    </div>`
                            )
                        }

                        else if (fw_status === 'InstallationFailed') {
                            modal_body.append(
                                `Installation Failed, please close and try again`
                            );
                            modal_footer.append(`<a href="#!" class="modal-close waves-effect waves-green btn-flat">Close</a>`)
                        }

                        else if (fw_status === 'Installed') {
                            modal_body.append(
                                `<div class="progress">
                                <div class="determinate" style="width: 100%"></div>
                            </div>`
                            );

                            // Remove the entry in evc_inputs
                            db.ref(`users/${user.uid}/evc_inputs/temp_remote_fw_update_info`).remove()
                                .then(function () {
                                    setTimeout(function () {
                                        modal_body.empty();
                                        modal_body.append(`<h6>New firmware installed. Charger rebooting now...</h6>`);
                                        modal_footer.append(`<a href="#!" class="modal-close waves-effect waves-green btn-flat">Close</a>`)
                                    }, 5000)
                                });
                        }
                    }

                });
            });

        });
    })

}

function checkIfLoggedIn() {
    document.getElementById('master_row').style.visibility = 'hidden';
    document.getElementById('preloader').style.display = 'inline';

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
