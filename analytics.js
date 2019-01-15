let fs = require('fs');
let csv = require("fast-csv");
let moment = require('moment');

function check_inverter_analytics_integrity(db, uid) {
    // This function will check the integrity of inverter analytics for a certain uid and make sure it's all there

    db.ref(`users/${uid}/history_keys`).once("value").then(function (snapshot) {
        if (snapshot.val !== null) {
            let validDates = Object.keys(snapshot.val());

            // Loop through all of our valid dates
            for (let index = 0; index < validDates.length; index++) {
                let date = validDates[index];

                db.ref(`users/${uid}/analytics/inverter_history_analytics/${date}`).once("value").then(function (snapshot) {

                    // If the inverter analytics is null for this date, then we need to analyze it
                    if (snapshot.val() === null) {
                        console.log(`${date} null!`);

                        let inverter_analytics_obj = {
                            dctp: 0,
                            ac2tp: 0
                        };
                        let dcp = 0;
                        let ac2p = 0;

                        let filename = `${date}.csv`;
                        fs.createReadStream(`./logs/${uid}/inverter_logs/${filename}`)
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
                                inverter_analytics_obj.dctp = (inverter_analytics_obj.dctp / 1000).toFixed(2);
                                inverter_analytics_obj.ac2tp = (inverter_analytics_obj.ac2tp / 1000).toFixed(2);
                                console.log(`Finished analysing ${filename}. dctp: ${inverter_analytics_obj.dctp}, ac2tp: ${inverter_analytics_obj.ac2tp}`);
                                db.ref(`users/${uid}/analytics/inverter_history_analytics/${filename.split('.')[0]}/`).update(inverter_analytics_obj)
                            })

                    }
                })
            }
        }

    })
}

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
                    inverter_analytics_obj.dctp = (inverter_analytics_obj.dctp / 1000).toFixed(2);
                    inverter_analytics_obj.ac2tp = (inverter_analytics_obj.ac2tp / 1000).toFixed(2);
                    console.log(`Finished analysing ${file}. dctp: ${inverter_analytics_obj.dctp}, ac2tp: ${inverter_analytics_obj.ac2tp}`);
                    db.ref(`users/${uid}/analytics/inverter_history_analytics/${file.split('.')[0]}/`).update(inverter_analytics_obj)
                })
        })
    })
}

async function update_analytics(path, db) {
    console.log('Detected a new file in the logs folder');

    let path_split = path.split('\\');
    console.log(path_split);

    let uid = path_split[1];
    let log_type = path_split[2];

    if (log_type === "inverter_logs") {
        let file = path_split[3];

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
                inverter_analytics_obj.dctp = (inverter_analytics_obj.dctp / 1000).toFixed(2);
                inverter_analytics_obj.ac2tp = (inverter_analytics_obj.ac2tp / 1000).toFixed(2);
                console.log(`Finished analysing ${file}. dctp: ${inverter_analytics_obj.dctp}, ac2tp: ${inverter_analytics_obj.ac2tp}`);
                db.ref(`users/${uid}/analytics/inverter_history_analytics/${file.split('.')[0]}/`).update(inverter_analytics_obj)
            })
    } else if (log_type === "charging_logs") {
        console.log('charging log!');

        let chargerID = path_split[3];
        let charge_session_date = path_split[4].split('.')[0].split(' ')[0];
        let charge_session_time = path_split[4].split('.')[0].split(' ')[1];

        console.log(chargerID);
        console.log(charge_session_date);
        console.log(charge_session_time);

        // First we need to check if the analytics for this charging session already exists
        let analytics = await db.ref(`users/${uid}/analytics/charging_history_analytics/${chargerID}/${charge_session_date}/${charge_session_time}`)
            .once('value');

        console.log(analytics.val());

        // If there are no analytics, then we must analyze it from the uploaded file
        if (analytics.val() === null) {
            let energy = 0;

            let charging_start_time = null;
            let charging_end_time = null;

            // Read the csv file from the path
            fs.createReadStream(path).pipe(csv()).on("data", function (data) {
                energy = parseFloat(data[4]);
                // If there has not been a start time defined, then define it if the data is not the header row
                if (charging_start_time === null && data[0] !== 'time') {
                    charging_start_time = data[0];
                }

                // If there has been a start time defined, just refine the end time
                else {
                    charging_end_time = data[0];
                }
            })
                .on("end", function () {
                    // Calculate the duration from the start and end times
                    let duration = moment.duration(moment(charging_end_time, "YYYY-MM-DD HH:mm:ss")
                        .diff(moment(charging_start_time, "YYYY-MM-DD HH:mm:ss"))).asSeconds();

                    console.log(`Our duration is ${duration} seconds and our energy is ${energy} kWh`);

                    // Now upload the analytics to Firebase
                    db.ref(`users/${uid}/analytics/charging_history_analytics/${chargerID}/${charge_session_date}/${charge_session_time}`)
                        .update({
                                duration_seconds: duration,
                                energy: energy
                            }
                        )
                })
        }


    }

}

function reduce_data(data, maxPoints, data_type) {
    // If we have less data than the max count then we can just not touch the data
    if (data.length <= maxPoints)
        return data;

    let blockSize = data.length / maxPoints;
    let reduced = [];

    // Now run through the cut data and for each chunk, we take the average and push it back into 'reduced'
    for (let i = 0; i < data.length;) {
        let chunk = data.slice(i, (i += blockSize) + 1);
        reduced.push(average(chunk, data_type));
    }
    return reduced;
}

function average(chunk, data_type) {

    // Sum up the chunk that we have and divide by the chunk length - taking the average of the chunk
    let sum = 0;
    if (data_type === "data") {
        for (let i = 0; i < chunk.length; i++) {
            sum += chunk[i];
        }
        return (sum / chunk.length).toFixed(2)

    }
    // But if we have time labels as our data input then we have to round the value to the nearliest Unix MS
    else if (data_type === "labels") {
        for (let i = 0; i < chunk.length; i++) {
            sum += chunk[i];
        }

        return Math.round(sum / chunk.length)
    }
}

module.exports = {
    'calculate_inverter_analytics': calculate_inverter_analytics,
    'update_analytics': update_analytics,
    'check_inverter_analytics_integrity': check_inverter_analytics_integrity,
    'reduce_data': reduce_data
}
