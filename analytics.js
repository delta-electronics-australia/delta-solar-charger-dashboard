let fs = require('fs');
let csv = require("fast-csv");

function calculate_inverter_analytics(db) {
    console.log('We are going to start calculating inverter analytics!');

    // Loop through all of the Firebase UIDs in the logs folder
    let uid_array = [];
    fs.readdirSync('./logs/').forEach(file => {
        uid_array.push(file);
    });

    // Loop through the array of UIDs
    uid_array.forEach(function (uid) {
        console.log(`Looking at ${uid} now`);

        // Loop through all of the inverter csv logs in the current UID
        fs.readdirSync(`./logs/${uid}/inverter_logs/`).forEach(file => {
            console.log(`Within ${uid} we are analysing ${file}`);

            let inverter_analytics_obj = {
                dctp: 0,
                ac2tp: 0
            };
            let dcp = 0;
            let ac2p = 0;

            fs.createReadStream(`./logs/${uid}/inverter_logs/${file}`)
                .pipe(csv())
                .on("data", function (data) {
                    ac2p = Number(data[4]);
                    dcp = Number(data[7]) + Number(data[10]);

                    if (!isNaN(dcp)) {
                        // Todo: this has to change depending on the interval
                        inverter_analytics_obj.ac2tp = inverter_analytics_obj.ac2tp + ((2 * ac2p) / 3600);
                        inverter_analytics_obj.dctp = inverter_analytics_obj.dctp + ((2 * dcp) / 3600);
                    }
                })
                .on("end", function () {
                    console.log(`Finished analysing ${file}. dctp: ${inverter_analytics_obj.dctp}, ac2tp: ${inverter_analytics_obj.ac2tp}`)
                    db.ref(`users/${uid}/analytics/inverter_history_analytics/${file.split('.')[0]}/`).update(inverter_analytics_obj)
                })
        })
    })
}

function update_inverter_analytics(path, db) {
    console.log('Detected a new file in the logs folder');

    let path_split = path.split('\\');
    console.log(path_split);

    let uid = path_split[1];
    let log_type = path_split[2];
    let file = path_split[3];

    if (log_type === "inverter_logs") {

        let inverter_analytics_obj = {
            dctp: 0,
            ac2tp: 0
        };
        let dcp = 0;
        let ac2p = 0;

        fs.createReadStream(`./logs/${uid}/inverter_logs/${file}`)
            .pipe(csv())
            .on("data", function (data) {
                ac2p = Number(data[4]);
                dcp = Number(data[7]) + Number(data[10]);

                if (!isNaN(dcp)) {
                    // Todo: this has to change depending on the interval
                    inverter_analytics_obj.ac2tp = inverter_analytics_obj.ac2tp + ((2 * ac2p) / 3600);
                    inverter_analytics_obj.dctp = inverter_analytics_obj.dctp + ((2 * dcp) / 3600);
                }
            })
            .on("end", function () {
                console.log(`Finished analysing ${file}. dctp: ${inverter_analytics_obj.dctp}, ac2tp: ${inverter_analytics_obj.ac2tp}`)
                db.ref(`users/${uid}/analytics/inverter_history_analytics/${file.split('.')[0]}/`).update(inverter_analytics_obj)
            })
    }

}

module.exports = {
    'calculate_inverter_analytics': calculate_inverter_analytics,
    'update_inverter_analytics': update_inverter_analytics
}
