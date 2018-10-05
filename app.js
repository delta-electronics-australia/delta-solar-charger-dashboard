let express = require('express');
let app = express();
let server = require('http').createServer(app);
let fs = require('fs');
let mkdirp = require('mkdirp');
let csvWriter = require('csv-write-stream');
let csv = require("fast-csv");
let archiver = require('archiver');
let admin = require("firebase-admin");
let moment = require('moment');
let chokidar = require('chokidar');

const analytics = require('./analytics.js');

let serviceAccount = require(__dirname + "/firebase.json");

// Write all of the output logs into a file
let access = fs.createWriteStream('C:\\Delta_AU_Services\\EVCS_portal\\output.log');
process.stdout.write = process.stderr.write = access.write.bind(access);
process.on('uncaughtException', function (err) {
    console.error((err && err.stack) ? err.stack : err);
});

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://smart-charging-app.firebaseio.com"
});

// Define our Firebase database object
let db = admin.database();

app.set('view engine', 'ejs');

// app.use(favicon('public/favicon.ico'));

// Define our ejs routes
app.get('/delta_dashboard/', function (req, res) {
    res.render('index')
});

app.get('/delta_dashboard/index2', function (req, res) {
    res.render('index2')
});

app.get('/delta_dashboard/login', function (req, res) {
    res.render('login')
});

app.get('/delta_dashboard/history', function (req, res) {
    res.render('history')
});

app.get('/delta_dashboard/charging_history', function (req, res) {
    res.render('charging_history')
});

app.get('/delta_dashboard/charging_history2', function (req, res) {
    res.render('charging_history2')
});

app.get('/delta_dashboard/hardware_info', function (req, res) {
    res.render('hardware_info')
});

app.get('/delta_dashboard/profile', function (req, res) {
    res.render('profile')
});

app.use('/delta_dashboard/public', express.static(__dirname + '/public'));
app.use(express.json());

// Define our POST requests
app.post('/delta_dashboard/archive_request', function (req, res) {
    function chunk(str, n) {
        // The chunk method takes in a string and returns an array of strings
        let ret = [];
        let i;
        let len;

        for (i = 0, len = str.length; i < len; i += n) {
            ret.push(str.substr(i, n))
        }
        return ret
    }

    let payload = req.body;

    let current_date = moment(Date.now()).format('YYYY-MM-DD');

    let data_obj = {
        'utility_p': [],
        'utility_c': [],
        'dcp': [],
        'btp': [],
        'ac2p': [],
        'btsoc': [],
        'bt_module1_max_temp': [],
        'bt_module1_min_temp': [],
        'ac1_freq': [],
        'time': []
    };
    console.log(payload);

    admin.auth().verifyIdToken(payload.idToken).then(async function (decodedToken) {

        let uid = decodedToken.uid;
        let selected_date = payload.date;

        // If we have selected any other day besides today
        if (selected_date !== current_date) {
            let counter = 0;

            fs.createReadStream(`C:\\Delta_AU_Services\\EVCS_portal\\logs\\${uid}\\inverter_logs\\${selected_date}.csv`)
                .pipe(csv())
                .on("data", function (data) {
                    if (counter === 2) {
                        data_obj.time.push(data[0]);
                        data_obj.ac2p.push(Number(data[4]));
                        data_obj.dcp.push(Number(data[7]) + Number(data[10]));
                        data_obj.btp.push(Number(data[13]));
                        data_obj.utility_p.push(Number(data[17]));
                        data_obj.btsoc.push(Number(data[16]));

                        if (data[19]) {
                            data_obj.bt_module1_max_temp.push(Number(data[19]));
                            data_obj.bt_module1_min_temp.push(Number(data[20]));
                        }

                        if (data[21]) {
                            data_obj.ac1_freq.push(Number(data[21]))
                        }

                        counter = 0
                    }
                    counter++
                })
                .on("end", function () {
                    console.log("done");

                    res.json({
                        data_obj: data_obj,
                    })
                });
        }
        // If we have selected today, then we need to grab it off Firebase
        else {
            console.log('User has selected today');

            // Counter allows us to skip entries to save data
            let counter = 0;

            // If the selected day is today, then we need to grab data from Firebase history
            let history_ref = db.ref("users/" + uid + "/history/" + selected_date);
            let writer = csvWriter();

            // Grab today's data
            let snapshot = await history_ref.orderByKey().once("value");
            let data = snapshot.val();

            let temp_csv_destination = `C:\\Delta_AU_Services\\EVCS_portal\\logs\\${uid}\\temp_logs\\`;
            mkdirp(temp_csv_destination, function (err) {
                if (err) console.error(err);
                else console.log('pow!')
            });

            let csvwriter = fs.createWriteStream(`${temp_csv_destination}${selected_date}.csv`);
            // This listener waits until the writing is finished, then sends that file out
            csvwriter.on('finish', () => {
                // res.download(`C:\\Delta_AU_Services\\EVCS_portal\\logs\\${uid}\\${selected_date}.csv`);
                res.json({
                    data_obj: data_obj
                });
                console.log('file sent out!')
            });

            // Go through each 2 second entry and write a new line in the csv file
            writer.pipe(csvwriter);
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    // Write to our JSON object
                    if (counter === 20) {
                        data_obj.time.push(chunk(data[key]['time'], 2).join(':'));
                        data_obj.ac2p.push(data[key]['ac2p']);
                        data_obj.dcp.push(data[key]['dctp']);
                        data_obj.btp.push(data[key]['btp']);
                        data_obj.utility_p.push(data[key]['utility_p']);
                        data_obj.btsoc.push(data[key]['btsoc']);
                        data_obj.bt_module1_max_temp.push(data[key]['bt_module1_temp_max']);
                        data_obj.bt_module1_min_temp.push(data[key]['bt_module1_temp_min']);
                        data_obj.ac1_freq.push(data[key]['ac1_freq']);
                        counter = 0
                    }
                    counter++;

                    writer.write({
                        time: chunk(data[key]['time'], 2).join(':'),

                        ac1p: data[key]['ac1p'],
                        ac1v: data[key]['ac1v'],
                        ac1c: data[key]['ac1c'],

                        ac2p: data[key]['ac2p'],
                        ac2v: data[key]['ac2v'],
                        ac2c: data[key]['ac2c'],

                        dc1p: data[key]['dc1p'],
                        dc1v: data[key]['dc1v'],
                        dc1c: data[key]['dc1c'],

                        dc2p: data[key]['dc2p'],
                        dc2v: data[key]['dc2v'],
                        dc2c: data[key]['dc2c'],

                        // dctp: data[key]['dctp'],

                        btp: data[key]['btp'],
                        btv: data[key]['btv'],
                        btc: data[key]['btc'],

                        btsoc: data[key]['btsoc'],

                        utility_p: data[key]['utility_p'],
                        utility_c: data[key]['utility_c'],

                        bt_module1_max_temp: data[key]['bt_module1_temp_max'],
                        bt_module1_min_temp: data[key]['bt_module1_temp_min'],

                        ac1_freq: data[key]['ac1_freq']

                    })
                }
            }

            // Tell the program that writing to csv file has ended
            writer.end('This is the end of writing\n');
        }

    });

});

app.post('/delta_dashboard/download_data', function (req, res) {
    function chunk(str, n) {
        // The chunk method takes in a string and returns an array of strings
        let ret = [];
        let i;
        let len;

        for (i = 0, len = str.length; i < len; i += n) {
            ret.push(str.substr(i, n))
        }
        return ret
    }

    req.setTimeout(0);
    let payload = req.body;
    console.log(payload);

    admin.auth().verifyIdToken(payload.idToken)
        .then(async function (decodedToken) {

                let uid = decodedToken.uid;

                let selected_date = payload.date;

                let history_keys_ref = db.ref(`users/${uid}/history_keys`);
                let history_key_snapshot = await history_keys_ref.orderByKey().once("value");
                history_key_snapshot = history_key_snapshot.val();
                let available_dates = Object.keys(history_key_snapshot);
                // console.log(history_key_snapshot);

                // If the selected_date is an individual day...
                if (selected_date !== 'all') {

                    // If the date has true of 'archived', we grab data from our server
                    if (history_key_snapshot[selected_date] === true || history_key_snapshot[selected_date] === 'archived') {
                        // The only exception is if the selected_date is today. Then we need to look into Firebase for the latest data
                        if (selected_date === available_dates[available_dates.length - 1]) {
                            console.log('User has selected today');
                            res.download(`C:\\Delta_AU_Services\\EVCS_portal\\logs\\${uid}\\temp_logs\\${selected_date}.csv`);
                            //
                            // // If the selected day is today, then we need to grab data from Firebase history
                            // let history_ref = db.ref("users/" + uid + "/history/" + selected_date);
                            // let writer = csvWriter();
                            //
                            // // Grab today's data
                            // let snapshot = await history_ref.orderByKey().once("value");
                            // let data = snapshot.val();
                            //
                            // let csvwriter = fs.createWriteStream(`C:\\Delta_AU_Services\\EVCS_portal\\logs\\${uid}\\temp_logs\\${selected_date}.csv`);
                            //
                            // // This listener waits until the writing is finished, then sends that file out
                            // csvwriter.on('finish', () => {
                            //     res.download(`C:\\Delta_AU_Services\\EVCS_portal\\logs\\${uid}\\temp_logs\\${selected_date}.csv`);
                            //     console.log('file sent out!')
                            // });
                            //
                            // // Go through each 2 second entry and write a new line in the csv file
                            // writer.pipe(csvwriter);
                            // for (let key in data) {
                            //     if (data.hasOwnProperty(key)) {
                            //         writer.write({
                            //             time: chunk(data[key]['time'], 2).join(':'),
                            //
                            //             ac1p: data[key]['ac1p'],
                            //             ac1v: data[key]['ac1v'],
                            //             ac1c: data[key]['ac1c'],
                            //
                            //             ac2p: data[key]['ac2p'],
                            //             ac2v: data[key]['ac2v'],
                            //             ac2c: data[key]['ac2c'],
                            //
                            //             dc1p: data[key]['dc1p'],
                            //             dc1v: data[key]['dc1v'],
                            //             dc1c: data[key]['dc1c'],
                            //
                            //             dc2p: data[key]['dc2p'],
                            //             dc2v: data[key]['dc2v'],
                            //             dc2c: data[key]['dc2c'],
                            //
                            //             dctp: data[key]['dctp'],
                            //
                            //             btp: data[key]['btp'],
                            //             btv: data[key]['btv'],
                            //             btc: data[key]['btc'],
                            //
                            //             btsoc: data[key]['btsoc'],
                            //
                            //             utility_p: data[key]['utility_p'],
                            //             utility_c: data[key]['utility_c'],
                            //
                            //             ac1_freq: data[key]['ac1_freq']
                            //
                            //         })
                            //     }
                            // }
                            //
                            // // Tell the program that writing to csv file has ended
                            // writer.end('This is the end of writing\n');

                        }

                        // If the selected date is not today, then we can just send out the csv file from our server
                        else {
                            res.download(`C:\\Delta_AU_Services\\EVCS_portal\\logs\\${uid}\\inverter_logs\\${selected_date}.csv`);
                            console.log(`Sent ${selected_date}.csv out!`)
                        }

                    }
                }

                // If the selected_date is all dates...
                else if (selected_date === 'all') {
                    // If the user has selected to download ALL data
                    // 1) Write the current day's data into the log folder
                    // 2) Archive the whole log folder for that user and send it out

                    let archive = archiver('zip', {zlib: {level: 8}});

                    // This listener waits until the archive is finalized
                    archive.on('end', function () {
                        console.log('Sending to the user now');
                        console.log('Archive wrote %d bytes', archive.pointer());
                    });

                    // Pipe the output of our archive to the Express response package
                    archive.pipe(res);

                    // Define the node for today's historical data
                    let history_ref = db.ref("users/" + uid + "/history/" + available_dates[available_dates.length - 1]);
                    let writer = csvWriter();

                    // Take a snapshot of today's historical data
                    let snapshot = await history_ref.orderByKey().once("value");
                    let data = snapshot.val();
                    let csvwriter = fs.createWriteStream(`C:\\Delta_AU_Services\\EVCS_portal\\logs\\${uid}\\${available_dates[available_dates.length - 1]}.csv`);

                    // Wait until csv writing is complete, then archive the whole log folder for that uid
                    csvwriter.on('finish', () => {
                        archive.directory(`C:\\Delta_AU_Services\\EVCS_portal\\logs\\${uid}\\`, 'logs');
                        archive.finalize();
                        console.log('file sent out!')
                    });

                    writer.pipe(csvwriter);

                    // Loop through
                    for (let key in data) {
                        if (data.hasOwnProperty(key)) {
                            writer.write({
                                time: chunk(data[key]['time'], 2).join(':'),

                                ac1p: data[key]['ac1p'],
                                ac1v: data[key]['ac1v'],
                                ac1c: data[key]['ac1c'],

                                ac2p: data[key]['ac2p'],
                                ac2v: data[key]['ac2v'],
                                ac2c: data[key]['ac2c'],

                                dc1p: data[key]['dc1p'],
                                dc1v: data[key]['dc1v'],
                                dc1c: data[key]['dc1c'],

                                dc2p: data[key]['dc2p'],
                                dc2v: data[key]['dc2v'],
                                dc2c: data[key]['dc2c'],

                                dctp: data[key]['dctp'],

                                btp: data[key]['btp'],
                                btv: data[key]['btv'],
                                btc: data[key]['btc'],

                                btsoc: data[key]['btsoc'],

                                utility_p: data[key]['utility_p'],
                                utility_c: data[key]['utility_c'],

                            })
                        }
                    }
                    writer.end('This is the end of writing todays data to csv.\n');

                }

                // If the selected_date is an array of dates...
                else {
                    // Code here for selected dates
                }

            }
        ).catch(function (error) {
        console.log(error)
    });
});

app.post('/delta_dashboard/charging_history_request', function (req, res) {

    let payload = req.body;

    let data_obj = {
        'utility_p': [],
        'utility_c': [],
        'dcp': [],
        'btp': [],
        'ac2p': [],
        'btsoc': [],
        'bt_module1_max_temp': [],
        'bt_module1_min_temp': [],
        'time': []
    };

    let analytics_obj = {
        'utility_p': 0,
        'dcp': 0,
        'btp': 0,
        'ac2p': 0
    };

    let overview_data_obj = {
        ac2p: 0,
        dcp: 0,
        btp_discharge: 0,
        btp_charge: 0,
        utility_p_export: 0,
        utility_p_import: 0
    };

    console.log(payload);

    admin.auth().verifyIdToken(payload.idToken).then(async function (decodedToken) {
        let uid = decodedToken.uid;
        let selected_charging_session = payload.date;

        let dcp = 0;
        let utility_p = 0;
        let btp = 0;
        let ac2p = 0;
        let counter = 0;
        fs.createReadStream(`C:\\Delta_AU_Services\\EVCS_portal\\logs\\${uid}\\charging_logs\\${selected_charging_session}.csv`)
            .pipe(csv())
            .on("data", function (data) {

                ac2p = Number(data[4]);
                dcp = Number(data[7]) + Number(data[10]);
                btp = Number(data[13]);
                utility_p = Number(data[17]);

                if (!isNaN(dcp)) {
                    overview_data_obj.ac2p = overview_data_obj.ac2p + (ac2p / 3600);
                    overview_data_obj.dcp = overview_data_obj.dcp + (dcp / 3600);

                    if (btp >= 0) {
                        overview_data_obj.btp_discharge = overview_data_obj.btp_discharge + (btp / 3600);
                    }
                    else {
                        overview_data_obj.btp_charge = overview_data_obj.btp_charge + (btp / 3600);
                    }

                    if (utility_p >= 0) {
                        overview_data_obj.utility_p_export = overview_data_obj.utility_p_export + (utility_p / 3600);
                    }
                    else {
                        overview_data_obj.utility_p_import = overview_data_obj.utility_p_import + (utility_p / 3600);
                    }
                }

                if (!isNaN(dcp)) {
                    analytics_obj.ac2p = analytics_obj.ac2p + (ac2p / 3600);
                    analytics_obj.dcp = analytics_obj.dcp + (dcp / 3600);

                    analytics_obj.btp = analytics_obj.btp + (btp / 3600);

                    analytics_obj.utility_p = analytics_obj.utility_p + (utility_p / 3600);
                }

                if (counter === 2) {
                    data_obj.time.push(data[0]);

                    data_obj.ac2p.push(ac2p);

                    data_obj.dcp.push(dcp);

                    data_obj.btp.push(btp);

                    data_obj.utility_p.push(utility_p);

                    data_obj.btsoc.push(Number(data[16]));

                    // For legacy support - If we have module temp then include that too
                    if (data[19]) {
                        data_obj.bt_module1_max_temp.push(Number(data[19]));
                        data_obj.bt_module1_min_temp.push(Number(data[20]));
                    }
                    counter = 0
                }
                counter++
            })
            .on("end", function () {
                console.log("done");

                let sankey_data_obj = calculate_sankey_values(analytics_obj);

                res.json({
                    data_obj: data_obj,
                    sankey_data_obj: sankey_data_obj,
                    overview_data_obj: overview_data_obj
                })
            });
    })
});

app.post('/delta_dashboard/charging_history_request2', function (req, res) {

    let payload = req.body;

    let selected_charging_session = `${payload['start_date']} ${payload['start_time']}`;
    let chargerID = payload['chargerID'];

    console.log(`${selected_charging_session} ${chargerID}`);

    let data_obj = {
        'time': [],
        'charge_power': []
    }
    // let data_obj = {
    //     'utility_p': [],
    //     'utility_c': [],
    //     'dcp': [],
    //     'btp': [],
    //     'btsoc': [],
    //     'bt_module1_max_temp': [],
    //     'bt_module1_min_temp': [],
    //     'time': []
    // };
    //
    // let analytics_obj = {
    //     'utility_p': 0,
    //     'dcp': 0,
    //     'btp': 0,
    //     'ac2p': 0
    // };
    //
    // let overview_data_obj = {
    //     ac2p: 0,
    //     dcp: 0,
    //     btp_discharge: 0,
    //     btp_charge: 0,
    //     utility_p_export: 0,
    //     utility_p_import: 0
    // };

    console.log(payload);

    admin.auth().verifyIdToken(payload.idToken).then(async function (decodedToken) {
        let uid = decodedToken.uid;

        let dcp = 0;
        let utility_p = 0;
        let btp = 0;
        let ac2p = 0;
        let counter = 0;
        fs.createReadStream(`C:\\Delta_AU_Services\\EVCS_portal\\logs\\${uid}\\charging_logs\\${chargerID}\\${selected_charging_session}.csv`)
            .pipe(csv())
            .on("data", function (data) {

                // ac2p = Number(data[4]);
                // dcp = Number(data[7]) + Number(data[10]);
                // btp = Number(data[13]);
                // utility_p = Number(data[17]);

                // if (!isNaN(dcp)) {
                //     overview_data_obj.ac2p = overview_data_obj.ac2p + (ac2p / 3600);
                //     overview_data_obj.dcp = overview_data_obj.dcp + (dcp / 3600);
                //
                //     if (btp >= 0) {
                //         overview_data_obj.btp_discharge = overview_data_obj.btp_discharge + (btp / 3600);
                //     }
                //     else {
                //         overview_data_obj.btp_charge = overview_data_obj.btp_charge + (btp / 3600);
                //     }
                //
                //     if (utility_p >= 0) {
                //         overview_data_obj.utility_p_export = overview_data_obj.utility_p_export + (utility_p / 3600);
                //     }
                //     else {
                //         overview_data_obj.utility_p_import = overview_data_obj.utility_p_import + (utility_p / 3600);
                //     }
                // }
                //
                // if (!isNaN(dcp)) {
                //     analytics_obj.ac2p = analytics_obj.ac2p + (ac2p / 3600);
                //     analytics_obj.dcp = analytics_obj.dcp + (dcp / 3600);
                //
                //     analytics_obj.btp = analytics_obj.btp + (btp / 3600);
                //
                //     analytics_obj.utility_p = analytics_obj.utility_p + (utility_p / 3600);
                // }

                if (counter === 2) {
                    data_obj.time.push(data[0]);
                    data_obj.charge_power.push(data[3])

                    counter = 0
                }
                counter++
            })
            .on("end", function () {
                console.log("done");

                // let sankey_data_obj = calculate_sankey_values(analytics_obj);

                res.json({
                    data_obj: data_obj,
                    // sankey_data_obj: sankey_data_obj,
                    // overview_data_obj: overview_data_obj
                })
            });
    })
});


app.post('/delta_dashboard/last_charge_session_request', function (req, res) {
    let uid = req.body.uid;
    let received_date_string = req.body.latest_date;

    let charge_list = fs.readdirSync(`./logs/${uid}/charging_logs`);
    let selected_charging_session = charge_list[charge_list.length - 1];

    if (received_date_string === undefined || received_date_string === moment(selected_charging_session.split(".")[0], 'YYYY-MM-DD hhmm').format('MMMM Do, h:mm a')) {
        res.json({
            'new_data': false
        })
    }

    else {
        let data_obj = {
            'utility_p': [],
            'dcp': [],
            'btp': [],
            'ac2p': [],
            'time': []
        };
        let temp_data_obj = {
            'utility_p': [],
            'dcp': [],
            'btp': [],
            'ac2p': [],
            'time': []
        };
        let time_unix = [];
        let date_string = "";

        // First read the appropriate csv file
        fs.createReadStream(`C:\\Delta_AU_Services\\EVCS_portal\\logs\\${uid}\\charging_logs\\${selected_charging_session}`)
            .pipe(csv())
            .on("data", function (data) {

                if (!isNaN(Number(data[7]) + Number(data[10]))) {
                    temp_data_obj.time.push(data[0]);
                    temp_data_obj.ac2p.push(Number(data[4]));
                    temp_data_obj.dcp.push(Number(data[7]) + Number(data[10]));
                    temp_data_obj.btp.push(Number(data[13]));
                    temp_data_obj.utility_p.push(Number(data[17]));
                }
            })
            .on("end", function () {

                for (let key in temp_data_obj) {
                    // If our data is time...
                    if (key === 'time') {
                        temp_data_obj['time'].forEach(function (value, key, time_array) {
                            time_array[key] = moment(time_array[key], "YYYY-MM-DD HH:mm:ss.SSSSSS")
                        });

                        // First convert all of it to Unix ms
                        for (let a = 0; a < temp_data_obj.time.length; a++) {
                            time_unix.push(temp_data_obj.time[a].valueOf())
                        }

                        // Then we reduce it
                        data_obj.time = analytics.reduce_data(time_unix, 200, 'labels');

                    }
                    // If our data is just normal data then we just reduce it
                    else {
                        data_obj[key] = analytics.reduce_data(temp_data_obj[key], 200, 'data')
                        // console.log(analytics.reduce_data(temp_data_obj[key], 500, 'data'))
                    }
                }

                date_string = moment(selected_charging_session.split(".")[0], 'YYYY-MM-DD hhmm').format('MMMM Do, h:mm a');
                res.json({
                    new_data: true,
                    data_obj: data_obj,
                    date_string: date_string
                })
            });
    }
});

server.listen(process.env.PORT, function () {
    console.log('listening on *:3000');
});

let file_watcher = chokidar.watch('./logs/');

file_watcher.on('change', function (path) {
    analytics.update_inverter_analytics(path, db)
});

// analytics.calculate_inverter_analytics(db);

function calculate_sankey_values(analytics_obj) {
    // This function takes an object with values about the power and returns arrays for google charts
    let utility_p_left;
    let btp_left;
    let sankey_data_obj = [[], [], []];

    utility_p_left = analytics_obj.utility_p <= 0;

    btp_left = analytics_obj.btp > 0;

    if (analytics_obj.dcp > analytics_obj.ac2p) {
        // We have more solar than our load, so we can say that all our load is run by solar

        if (btp_left) {
            // If battery is the on left (it is discharging)
            if (utility_p_left === false) {
                // If grid is on the right
                sankey_data_obj[0].push(([
                    ['Battery', 'AC Load', analytics_obj.btp]
                ]));
                sankey_data_obj[1].push(([
                    ['Solar Power', 'AC Load', analytics_obj.ac2p - analytics_obj.btp]
                ]));
                sankey_data_obj[2].push(([
                    ['Solar Power', 'Grid', analytics_obj.utility_p]
                ]));

            } else {
                // If grid is on the left (importing from grid)
                sankey_data_obj[0].push(([
                    ['Solar Power', 'AC Load', analytics_obj.ac2p - (-1 * analytics_obj.utility_p) - analytics_obj.btp]
                ]));
                sankey_data_obj[1].push(([
                    ['Grid', 'AC Load', (-1 * analytics_obj.utility_p)]
                ]));
                sankey_data_obj[2].push(([
                    ['Battery', 'AC Load', analytics_obj.btp]
                ]));
            }
        } else {
            // If battery is on the right (it is charging)
            if (utility_p_left === false) {
                // If grid is on the right (export)
                sankey_data_obj[0].push(([
                    ['Solar Power', 'Battery', -1 * analytics_obj.btp]
                ]));
                sankey_data_obj[1].push(([
                    ['Solar Power', 'Grid', analytics_obj.utility_p]
                ]));
                sankey_data_obj[2].push(([
                    ['Solar Power', 'AC Load', analytics_obj.ac2p]
                ]));
            }
            else {
                // If grid is on the left (import)
                sankey_data_obj[0].push(([
                    ['Solar Power', 'Battery', (-1 * analytics_obj.btp)]
                ]));
                sankey_data_obj[1].push(([
                    ['Grid', 'AC Load', (-1 * analytics_obj.utility_p)]
                ]));
                sankey_data_obj[2].push(([
                    ['Solar Power', 'AC Load', analytics_obj.ac2p - (-1 * analytics_obj.utility_p)]
                ]));
            }
        }
    }
    else {
        // We have less solar than our load, so all of our solar is consumed by load
        if (btp_left) {
            // If battery is a source (is discharging)
            if (utility_p_left === true) {
                // If grid is on the left (importing)
                sankey_data_obj[0].push(([
                    ['Battery', 'AC Load', analytics_obj.btp]
                ]));
                sankey_data_obj[1].push(([
                    ['Grid', 'AC Load', -1 * analytics_obj.utility_p]
                ]));
                if (analytics_obj.ac2p - analytics_obj.btp - (-1 * analytics_obj.utility_p) < 0) {
                    sankey_data_obj[2].push(([
                        ['Solar Power', 'AC Load', analytics_obj.dcp]
                    ]));
                }
                else {
                    sankey_data_obj[2].push(([
                        ['Solar Power', 'AC Load', analytics_obj.ac2p - analytics_obj.btp - (-1 * analytics_obj.utility_p)]
                    ]));
                }

            }
            else {
                // If grid is on the right (exporting)
                sankey_data_obj[0].push(([
                    ['Battery', 'AC Load', analytics_obj.btp]
                ]));
                sankey_data_obj[1].push(([
                    ['Solar Power', 'Grid', analytics_obj.utility_p]
                ]));
                sankey_data_obj[2].push(([
                    ['Solar Power', 'AC Load', analytics_obj.ac2p - analytics_obj.btp]
                ]));
            }
        }
        else {
            // If battery is charging (on the right)
            if (utility_p_left === true) {
                // If grid is importing (on the left)
                sankey_data_obj[0].push(([
                    ['Solar Power', 'AC Load', analytics_obj.ac2p - (-1 * analytics_obj.utility_p) - (-1 * analytics_obj.btp)]
                ]));
                sankey_data_obj[1].push(([
                    ['Grid', 'AC Load', (-1 * analytics_obj.utility_p)]
                ]));
                sankey_data_obj[2].push(([
                    ['Solar Power', 'Battery', (-1 * analytics_obj.btp)]
                ]));
            }
            else {
                // If grid is on the right (exporting)
                // Impossible because if we have less solar than load and battery is charging, then grid must be on left

            }
            // If battery not a source (it is charging)
        }
    }

    return sankey_data_obj

}

Date.prototype.yyyymmdd = function () {
    let mm = this.getMonth() + 1; // getMonth() is zero-based
    let dd = this.getDate();

    return [this.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
    ].join('-');
};
