let date;

let chart_properties = {
    'utility_p': {
        length: 60
    },
    'dcp': {
        length: 60
    },
    'btp': {
        length: 60
    }
};

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

function create_charts(data_obj, initialize_charging_chart) {

    if (initialize_charging_chart) {
        let ev_charging_chart = new Chart(document.getElementById("ev_charging_chart"), {
            type: 'line',
            data: {
                labels: data_obj[0],
                datasets: [{
                    data: [],
                    label: "Solar Power",
                    borderColor: "#ffc107",
                    fill: false
                }, {
                    data: [],
                    label: "Battery Power",
                    borderColor: "#43a047",
                    fill: false
                }, {
                    data: [],
                    label: "EV Charging Power",
                    borderColor: "#f44336",
                    fill: false
                }, {
                    data: [],
                    label: "Grid Power",
                    borderColor: "#3366ff",
                    fill: false,
                    yAxisID: 'A',
                    hidden: false
                }, {
                    data: [],
                    label: "Battery Max Temp",
                    borderColor: "#6600cc",
                    fill: false,
                    yAxisID: 'B',
                    hidden: false

                }, {
                    data: [],
                    label: "Battery SOC",
                    borderColor: "#ef2fac",
                    fill: false,
                    yAxisID: 'B',
                    hidden: false

                }
                ]
            },
            options:
                {
                    title: {
                        display: false,
                        text:
                            'EV Charging'
                    },
                    elements: {
                        line: {
                            tension: 0
                        }
                    },
                    hover: {
                        animationDuration: 0
                    },
                    scales: {
                        xAxes: [
                            {
                                type: 'time',
                                time: {
                                    displayFormats: {
                                        second: 'h:mm:ss a'
                                    }
                                }
                            }
                        ],
                        yAxes: [
                            {
                                id: 'A',
                                position: 'left'
                            },
                            {
                                id: 'B',
                                type: 'linear',
                                position: 'right',
                                ticks: {
                                    max: 100,
                                    min: 0
                                }
                            },
                        ]
                    }
                }
        });

        return {'ev_charging_chart': ev_charging_chart}
    }
    else {
        let utility_chart = new Chart(document.getElementById("utility_chart"), {
            type: 'line',
            data: {
                labels: [data_obj.time],
                datasets: [{
                    data: data_obj.utility_p,
                    label: "Grid Power",
                    borderColor: "#3e95cd",
                    fill: false,
                    yAxisID: 'A'
                }, {
                    data: data_obj.utility_c,
                    label: "Grid Current",
                    borderColor: "#00897b",
                    fill: false,
                    yAxisID: 'B'
                }
                ]
            },
            options:
                {
                    title: {
                        display: false,
                        text:
                            'Grid Export/Import'
                    },
                    elements: {
                        line: {
                            tension: 0.3
                        }
                    },
                    scales: {
                        xAxes: [
                            {
                                // ticks: {
                                //     callback: function (tickValue, index, ticks) {
                                //         return moment(tickValue, 'hhmmss').format('HH:mm:ss')
                                //     }
                                // }
                                type: 'time',
                                time: {
                                    displayFormats: {
                                        second: 'h:mm:ss a'
                                        // minute: 'h:mm a'
                                    }
                                }
                            }
                        ],
                        yAxes: [
                            {
                                id: 'A',
                                position: 'left'
                            },
                            {
                                id: 'B',
                                position: 'right'
                            },
                        ]
                    }
                }
        });

        let dcp = new Chart(document.getElementById("dcp"), {
            type: 'line',
            data: {
                labels: [data_obj.time],
                datasets: [{
                    data: data_obj.dcp,
                    label: "Solar Power",
                    borderColor: "#ffc107",
                    fill: false
                }
                ]
            },
            options:
                {
                    title: {
                        display: false,
                        text:
                            'Solar Power'
                    },
                    elements: {
                        line: {
                            tension: 0.3
                        }
                    },
                    scales: {
                        xAxes: [
                            {
                                // ticks: {
                                //     callback: function (tickValue, index, ticks) {
                                //         return moment(tickValue, 'hhmmss').format('HH:mm:ss')
                                //     }
                                // }
                                type: 'time',
                                time: {
                                    displayFormats: {
                                        second: 'h:mm:ss a'
                                        // minute: 'h:mm a'
                                    }
                                }
                            }
                        ]
                    }
                }
        });

        let btp_chart = new Chart(document.getElementById("btp_chart"), {
            type: 'line',
            data: {
                labels: [data_obj.time],
                datasets: [{
                    label: "Battery Power",
                    data: data_obj.btp,
                    borderColor: "#4caf50",
                    fill: false
                }
                ]
            },
            options:
                {
                    title: {
                        display: false,
                        text:
                            'Battery Power'
                    },
                    elements: {
                        line: {
                            tension: 0.3
                        }
                    },
                    scales: {
                        xAxes: [
                            {
                                type: 'time',
                                time: {
                                    displayFormats: {
                                        second: 'h:mm:ss a'
                                    }
                                }
                            }
                        ]
                    }
                }
        });

        return {'utility_chart': utility_chart, 'dcp': dcp, 'btp_chart': btp_chart}

    }

}

function update_charts(chart_obj, data_obj) {
    if (chart_obj.hasOwnProperty('utility_chart')) {
        chart_obj.utility_chart.data.labels = data_obj.time;
        chart_obj.utility_chart.data.datasets[0].data = data_obj.utility_p;
        chart_obj.utility_chart.data.datasets[1].data = data_obj.utility_c;
        if (data_obj.utility_p.length > 50) {
            chart_obj.utility_chart.options.elements.point.radius = 0;
            chart_obj.utility_chart.options.elements.point.hitRadius = 7;
            chart_obj.utility_chart.options.elements.point.hoverRadius = 7;
        }
        chart_obj.utility_chart.update()
    }

    if (chart_obj.hasOwnProperty('dcp')) {
        chart_obj.dcp.data.labels = data_obj.time;
        chart_obj.dcp.data.datasets[0].data = data_obj.dcp;
        if (data_obj.dcp.length > 35) {
            chart_obj.dcp.options.elements.point.radius = 0;
            chart_obj.dcp.options.elements.point.hitRadius = 7;
            chart_obj.dcp.options.elements.point.hoverRadius = 7;
        }
        chart_obj.dcp.update()
    }

    if (chart_obj.hasOwnProperty('btp_chart')) {
        chart_obj.btp_chart.data.labels = data_obj.time;
        chart_obj.btp_chart.data.datasets[0].data = data_obj.btp;

        if (data_obj.btp.length > 35) {
            chart_obj.btp_chart.options.elements.point.radius = 0;
            chart_obj.btp_chart.options.elements.point.hitRadius = 7;
            chart_obj.btp_chart.options.elements.point.hoverRadius = 7;
        }

        chart_obj.btp_chart.update()
    }

    if (chart_obj.hasOwnProperty('ev_charging_chart')) {
        // data_obj.evc_charging[0] = time, [1-3] are my data
        length = data_obj.evc_charging[0].length;

        // Replace the data field in the chart object with the new data
        chart_obj.ev_charging_chart.data.labels = data_obj.evc_charging[0];
        for (let i = 0; i < 6; i++) {
            chart_obj.ev_charging_chart.data.datasets[i].data = data_obj.evc_charging[i + 1]
        }
        // chart_obj.ev_charging_chart.data.datasets[4].data = data_obj.evc_charging[5]

        // If we have a lot of data then we can turn off data points to optimize performance
        if (data_obj.evc_charging[0].length > 150) {
            chart_obj.ev_charging_chart.options.elements.point.radius = 0;
            chart_obj.ev_charging_chart.options.elements.point.hitRadius = 7;
            chart_obj.ev_charging_chart.options.elements.point.hoverRadius = 7;
        }

        else {
            chart_obj.ev_charging_chart.options.elements.point.radius = 3;
            chart_obj.ev_charging_chart.options.elements.point.hitRadius = 1;
            chart_obj.ev_charging_chart.options.elements.point.hoverRadius = 4;
        }

        // Now update the chart
        chart_obj.ev_charging_chart.update();
    }

}

function start_master_listener(user) {

    // user.updateProfile({
    //     displayName: "CSIRO Test1",
    //     // photoURL: "https://example.com/jane-q-user/profile.jpg"
    // }).then(function() {
    //     console.log('done')
    // }).catch(function(error) {
    //     // An error happened.
    // });

    let db = firebase.database();
    let data_obj = {
        'utility_p': [],
        'utility_c': [],
        'ac2p': [],
        'ac2v': [],
        'ac2c': [],
        'dcp': [],
        'dc1v': [],
        'dc1c': [],
        'dc1p': [],
        'dc2v': [],
        'dc2c': [],
        'dc2p': [],
        'btp': [],
        'btv': [],
        'btc': [],
        'btsoc': [],
        'bt_module_temp': [],
        'time': []
    };

    let charging_data_obj = {
        'evc_charging': [[], [], [], [], [], [], []],
        'latest_timestamp': ""
    };

    let charging_table_data_obj = {
        'ac2p': 0,
        'ac2v': 0,
        'ac2c': 0
    }


    // Get the current charging mode from Firebase and intialize our charging mode input box
    db.ref("users/" + user.uid + "/evc_inputs/charging_mode").on('value', function (snapshot) {
        $('#chargemode_select').val(snapshot.val());
        let modeselect_elem = document.querySelector('select');
        let modeselect_instance = M.FormSelect.init(modeselect_elem);
    });

    // Listen for a select in the dropdown box
    $('#chargemode_select').on('change', function () {
        // Send the new mode to Firebase to be picked up by our Analyse process
        db.ref("users/" + user.uid + "/evc_inputs").update({
            charging_mode: $(this).val()
        })
    });

    let media_options = {
        height: 150,
        interval: 30000
    };
    let media_elem = document.querySelector('.slider');
    M.Slider.init(media_elem, media_options);
    let media_elem1 = document.getElementById('utility_slider');
    M.Slider.init(media_elem1, media_options);
    let media_elem2 = document.getElementById('bt_slider');
    M.Slider.init(media_elem2, media_options);

    // let slider = document.getElementById('test-slider');
    // noUiSlider.create(slider, {
    //     start: [0],
    //     behaviour: 'snap',
    //     connect: 'lower',
    //     step: 1,
    //     orientation: 'horizontal', // 'horizontal' or 'vertical'
    //     range: {
    //         'min': 0,
    //         'max': 3,
    //     },
    //     // pips: {
    //     //     mode: 'values',
    //     //     values: [0, 1, 2, 3],
    //     //     // density: 1,
    //     //     stepped: true
    //     // }
    //     format: wNumb({
    //         decimals: 0
    //     })
    // });


    // Start a listener for the EV charging STATUS Todo: this URL will change when we migrate charging status into ID
    let charging_ref = db.ref("users/" + user.uid + "/evc_inputs/charging/");

    // _isCharging is the universal variable for whether or not there is an active charging session
    let _isCharging = false;

    // charging_chart_obj is the object of the ev charging chart
    let charging_chart_obj = null;

    // FIRST LOAD FLAG is for the ev charging chart. The value will depend on whether or not there is a charging session
    // active when we first load the page
    let FIRST_LOAD_FLAG = null;
    charging_chart_obj = create_charts(charging_data_obj.evc_charging, true);

    charging_ref.once('value', function (snapshot) {
        // First we change the _isCharging variable for the whole webpage
        _isCharging = snapshot.val();

        // Our first load flag will also be isCharging. If it is true, then we need to run special code later
        FIRST_LOAD_FLAG = _isCharging;

    }).then(function () {
        // Start a listener for our charging status
        charging_ref.on('value', async function (snapshot) {
            _isCharging = snapshot.val();
            console.log("New value of _isCharging");
            console.log(_isCharging);

            if (_isCharging === true) {
                // First we need to get the time of the latest charging session
                let charging_history_keys_ref = db.ref(`users/${user.uid}/charging_history_keys/`);
                let latest_charging_time = await charging_history_keys_ref.orderByKey().limitToLast(1).once("value");
                latest_charging_time = Object.keys(latest_charging_time.val())[0];

                console.log('We are charging! Lets start a listener');
                console.log(latest_charging_time);

                // Navigate to the node of the latest charge session
                let charging_history_ref = db.ref(`users/${user.uid}/charging_history/${latest_charging_time}`);

                // If there is already a charging session active before we loaded the page, we grab the latest timestamp
                if (FIRST_LOAD_FLAG) {
                    let latest_timestamp = await charging_history_ref.orderByKey().limitToLast(1).once("value");
                    latest_timestamp = latest_timestamp.val();
                    charging_data_obj['latest_timestamp'] = latest_timestamp[Object.keys(latest_timestamp)[0]]['time'];
                }

                // Now start a listener for the latest charging session since we know a charging session is happening
                charging_history_ref.on("child_added", function (snapshot) {
                    let new_data = snapshot.val();

                    // Push all of the new data into the evc charging arrays
                    charging_data_obj.evc_charging[0].push(moment(new_data['time'], 'hhmmss'));
                    charging_data_obj.evc_charging[1].push(new_data['dctp']);
                    charging_data_obj.evc_charging[2].push(new_data['btp']);
                    charging_data_obj.evc_charging[3].push(new_data['ac2p']);
                    charging_data_obj.evc_charging[4].push(new_data['utility_p']);
                    charging_data_obj.evc_charging[5].push(new_data['bt_module1_temp_max']);
                    charging_data_obj.evc_charging[6].push(new_data['btsoc']);

                    charging_table_data_obj.ac2p = new_data['ac2p'];
                    charging_table_data_obj.ac2v = new_data['ac2v'];
                    charging_table_data_obj.ac2c = new_data['ac2c'];

                    // If the first load flag is no longer raised, we can update our charts
                    if (FIRST_LOAD_FLAG === false) {
                        update_charts(charging_chart_obj, charging_data_obj);
                        update_tables(charging_table_data_obj, 'evc_table');
                    }

                    // If the first load flag is raised, we have to check to see if the latest data coming in is the
                    // has the latest timestamp on it. If so, then we can clear the flag and start updating charts
                    if (FIRST_LOAD_FLAG === true) {
                        // console.log(new_data['time'] + ' ' + charging_data_obj['latest_timestamp']);
                        if (new_data['time'] === charging_data_obj['latest_timestamp']) {
                            console.log('We have found the latest time, lets trigger our flag');
                            FIRST_LOAD_FLAG = false;
                            update_charts(charging_chart_obj, charging_data_obj);
                            update_tables(charging_table_data_obj, 'evc_table')

                        }
                    }
                });

                // Update the text in our ev charging card to charging
                document.getElementById('evc_table').style.visibility = 'initial';
                document.getElementById('evc_status').innerHTML = "EV is Charging <i class=\"material-icons\">battery_charging_full\n</i>\n";
                document.getElementById('evc_status_body').innerText = "";
            }

            else {
                // Clear the array if we are not charging anymore
                for (let i = 0, length = charging_data_obj.evc_charging.length; i < length; i++) {
                    charging_data_obj.evc_charging[i].length = 0
                }
                update_charts(charging_chart_obj, charging_data_obj);

                // Update the text in our ev charging card to not charging
                document.getElementById('evc_table').style.visibility = 'hidden';
                document.getElementById('evc_status').innerHTML = "EV Disconnected ";
                document.getElementById('evc_status_body').innerText = "EV is disconnected and not charging"
            }
        });
    });


    // Now grab all of the historical values for today
    let history_ref = db.ref("users/" + user.uid + "/history/" + date);
    history_ref.orderByKey().limitToLast(70).once("value", function (snapshot) {
            let data = snapshot.val();

            // Grab the whole history Todo: we aren't grabbing all of the values in data_obj so keep that in mind!!
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    data_obj.utility_p.push(data[key]['utility_p']);
                    data_obj.utility_c.push(data[key]['utility_c']);
                    data_obj.ac2p.push(data[key]['ac2p']);
                    data_obj.dcp.push(data[key]['dc1p'] + data[key]['dc2p']);
                    data_obj.dc1v.push(data[key].dc1v);
                    data_obj.dc1c.push(data[key].dc1c);
                    data_obj.dc1p.push(data[key].dc1p);
                    data_obj.dc2v.push(data[key].dc2v);
                    data_obj.dc2c.push(data[key].dc2c);
                    data_obj.dc2p.push(data[key].dc2p);
                    data_obj.btp.push(data[key]['btp']);
                    data_obj.btv.push(data[key].btv);
                    data_obj.btc.push(data[key].btc);
                    data_obj.btsoc.push(data[key].btsoc);
                    data_obj.bt_module_temp.push(data[key].bt_module1_temp_max);

                    data_obj.time.push(data[key]['time']);
                }
            }
            // Cut it so that we only have the amount we want
            data_obj.utility_p = data_obj.utility_p.slice(chart_properties['utility_p']['length'] * -1);
            data_obj.utility_c = data_obj.utility_c.slice(chart_properties['utility_p']['length'] * -1);
            data_obj.ac2p = data_obj.ac2p.slice(chart_properties['utility_p']['length'] * -1);
            data_obj.dcp = data_obj.dcp.slice(chart_properties['dcp']['length'] * -1);
            data_obj.dc1v = data_obj.dc1v.slice(chart_properties['dcp']['length'] * -1);
            data_obj.dc1c = data_obj.dc1c.slice(chart_properties['dcp']['length'] * -1);
            data_obj.dc1p = data_obj.dc1p.slice(chart_properties['dcp']['length'] * -1);
            data_obj.dc2v = data_obj.dc2v.slice(chart_properties['dcp']['length'] * -1);
            data_obj.dc2c = data_obj.dc2c.slice(chart_properties['dcp']['length'] * -1);
            data_obj.dc2p = data_obj.dc2p.slice(chart_properties['dcp']['length'] * -1);
            data_obj.btp = data_obj.btp.slice(chart_properties['btp']['length'] * -1);
            data_obj.btv = data_obj.btv.slice(chart_properties['btp']['length'] * -1);
            data_obj.btc = data_obj.btc.slice(chart_properties['btp']['length'] * -1);
            data_obj.btsoc = data_obj.btsoc.slice(chart_properties['btp']['length'] * -1);
            data_obj.bt_module_temp = data_obj.bt_module_temp.slice(chart_properties['btp']['length'] * -1);

            data_obj.time = data_obj.time.slice(chart_properties['dcp']['length'] * -1);

            data_obj.time.forEach(function (value, key, time_array) {
                time_array[key] = moment(time_array[key], 'hhmmss');
            });

        }
    ).then(function () {
        document.getElementById("master_row").style.visibility = 'initial';
        document.getElementById("loading_id").style.visibility = 'hidden';

        // Now create the charts
        let chart_obj = create_charts(data_obj, false);

        // Start listening to any NEW ADDITIONS and only grab the newest addition - THEN push to chart/tables
        history_ref.orderByKey().limitToLast(1).on("child_added", function (snapshot) {
            // new_data is the newest secondly data that has come in
            let new_data = snapshot.val();
            let new_time = moment(new_data.time, 'hhmmss');

            // If there is no data, then we just add to array
            if (data_obj.time.length === 0) {
                data_obj.utility_p.push(new_data.utility_p);
                data_obj.utility_c.push(new_data.utility_c);
                data_obj.ac2p.push(new_data.ac2p);
                data_obj.ac2v.push(new_data.ac2v);
                data_obj.ac2c.push(new_data.ac2c);
                data_obj.dcp.push(new_data.dctp);
                data_obj.dc1v.push(new_data.dc1v);
                data_obj.dc1c.push(new_data.dc1c);
                data_obj.dc1p.push(new_data.dc1p);
                data_obj.dc2v.push(new_data.dc2v);
                data_obj.dc2c.push(new_data.dc2c);
                data_obj.dc2p.push(new_data.dc2p);
                data_obj.btp.push(new_data.btp);
                data_obj.btv.push(new_data.btv);
                data_obj.btc.push(new_data.btc);
                data_obj.btsoc.push(new_data.btsoc);
                data_obj.bt_module_temp.push(new_data.bt_module1_temp_max);

                data_obj.time.push(moment(new_data.time, 'hhmmss'));
            }

            // Check if the incoming data is more up to date than our most up to date value
            if (data_obj.time[data_obj.time.length - 1].isBefore(new_time)) {
                // Shift the data over if we are past our time threshold
                if (data_obj.utility_p.length >= chart_properties.utility_p.length) {
                    data_obj.utility_p.shift();
                    data_obj.utility_p.push(new_data.utility_p);
                    data_obj.utility_c.shift();
                    data_obj.utility_c.push(new_data.utility_c);
                    data_obj.ac2p.shift();
                    data_obj.ac2p.push(new_data.ac2p);
                    data_obj.ac2v.shift();
                    data_obj.ac2v.push(new_data.ac2v);
                    data_obj.ac2c.shift();
                    data_obj.ac2c.push(new_data.ac2c);
                    data_obj.dcp.shift();
                    data_obj.dcp.push(new_data.dctp);
                    data_obj.dc1v.shift();
                    data_obj.dc1v.push(new_data.dc1v);
                    data_obj.dc1c.shift();
                    data_obj.dc1c.push(new_data.dc1c);
                    data_obj.dc1p.shift();
                    data_obj.dc1p.push(new_data.dc1p);
                    data_obj.dc2v.shift();
                    data_obj.dc2v.push(new_data.dc2v);
                    data_obj.dc2c.shift();
                    data_obj.dc2c.push(new_data.dc2c);
                    data_obj.dc2p.shift();
                    data_obj.dc2p.push(new_data.dc2p);
                    data_obj.btp.shift();
                    data_obj.btp.push(new_data.btp);
                    data_obj.btv.shift();
                    data_obj.btv.push(new_data.btv);
                    data_obj.btc.shift();
                    data_obj.btc.push(new_data.btc);
                    data_obj.btsoc.shift();
                    data_obj.btsoc.push(new_data.btsoc);
                    data_obj.bt_module_temp.shift();
                    data_obj.bt_module_temp.push(new_data.bt_module1_temp_max);

                    data_obj.time.shift();
                    data_obj.time.push(moment(new_data.time, 'hhmmss'));

                }

                else {
                    data_obj.utility_p.push(new_data.utility_p);
                    data_obj.utility_c.push(new_data.utility_c);
                    data_obj.ac2p.push(new_data.ac2p);
                    data_obj.ac2v.push(new_data.ac2v);
                    data_obj.ac2c.push(new_data.ac2c);
                    data_obj.dcp.push(new_data.dctp);
                    data_obj.dc1v.push(new_data.dc1v);
                    data_obj.dc1c.push(new_data.dc1c);
                    data_obj.dc1p.push(new_data.dc1p);
                    data_obj.dc2v.push(new_data.dc2v);
                    data_obj.dc2c.push(new_data.dc2c);
                    data_obj.dc2p.push(new_data.dc2p);
                    data_obj.btp.push(new_data.btp);
                    data_obj.btv.push(new_data.btv);
                    data_obj.btc.push(new_data.btc);
                    data_obj.btsoc.push(new_data.btsoc);
                    data_obj.bt_module_temp.push(new_data.bt_module1_temp_max);
                    data_obj.time.push(moment(new_data.time, 'hhmmss'))
                }

            }

            // Push all the new data into our charts
            update_charts(chart_obj, data_obj);
            update_tables(data_obj, 'general table');
        });

        // Define our analytics listener and print info to all our top cards
        let analytics_ref = db.ref("users/" + user.uid + "/analytics/");
        analytics_ref.on("value", function (snapshot) {
            let payload = snapshot.val();

            document.getElementById("dctp_card").innerText = payload['dcp_t'].toFixed(2) + "kWh";
            document.getElementById("utility_p_export_card").innerText = payload['utility_p_export_t'].toFixed(2) + "kWh";
            document.getElementById("utility_p_import_card").innerText = payload['utility_p_import_t'].toFixed(2) + "kWh";
            document.getElementById("bt_consumed_card").innerText = payload['btp_consumed_t'].toFixed(2) + "kWh";
            document.getElementById("bt_charged_card").innerText = -1 * (payload['btp_charged_t'].toFixed(2)) + "kWh";

        });

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


function checkIfLoggedIn() {

    // Make all of the charts go away until we have data
    document.getElementById("master_row").style.visibility = 'hidden';

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // This will update our global date variable
            generate_date();


            // Start the main js script
            start_master_listener(user);
        }

        else {
            window.location.replace("/delta_dashboard/login")
        }
    });

}

function update_tables(data_obj, purpose) {

    if (purpose === "evc_table") {

        let evc_output = "";

        evc_output += "<tr><td>" + "AC2 Power" + "</td><td>" + data_obj.ac2p + "W" + "</td>";
        evc_output += "<tr><td>" + "AC2 Voltage" + "</td><td>" + data_obj.ac2v + "V" + "</td>";
        evc_output += "<tr><td>" + "AC2 Current" + "</td><td>" + data_obj.ac2c + "A" + "</td>";

        document.getElementById("evc_table_body").innerHTML = evc_output;
    }
    else {
        let ac1_output = "";
        let dcp_output = "";
        let btp_output = "";
        ac1_output += "<tr><td>" + "Utility AC Current" + "</td><td>" + data_obj.utility_c[data_obj.utility_c.length - 1] + "A" + "</td>";
        ac1_output += "<tr><td>" + "Utility AC Power" + "</td><td>" + data_obj.utility_p[data_obj.utility_p.length - 1] + "W" + "</td>";
        document.getElementById("utility_reveal_table").innerHTML = ac1_output;

        dcp_output += "<tr><td>" + "DC Total Power" + "</td><td>" + data_obj.dcp[data_obj.dcp.length - 1] + "W" + "</td>";
        dcp_output += "<tr><td>" + "DC1 Voltage" + "</td><td>" + data_obj.dc1v[data_obj.dc1v.length - 1] + "V" + "</td>";
        dcp_output += "<tr><td>" + "DC1 Current" + "</td><td>" + data_obj.dc1c[data_obj.dc1c.length - 1] + "A" + "</td>";
        dcp_output += "<tr><td>" + "DC1 Power" + "</td><td>" + data_obj.dc1p[data_obj.dc1p.length - 1] + "W" + "</td>";
        dcp_output += "<tr><td>" + "DC2 Voltage" + "</td><td>" + data_obj.dc2v[data_obj.dc2v.length - 1] + "V" + "</td>";
        dcp_output += "<tr><td>" + "DC2 Current" + "</td><td>" + data_obj.dc2c[data_obj.dc2c.length - 1] + "A" + "</td>";
        dcp_output += "<tr><td>" + "DC2 Power" + "</td><td>" + data_obj.dc2p[data_obj.dc2p.length - 1] + "W" + "</td>";

        // dcp_output += "<tr><td>" + "AC2 Power" + "</td><td>" + data_obj.ac2p[data_obj.ac2p.length - 1] + "W" + "</td>";
        document.getElementById("dcp_reveal_table").innerHTML = dcp_output;

        btp_output += "<tr><td>" + "Battery Power" + "</td><td>" + data_obj.btp[data_obj.btp.length - 1] + "W" + "</td>";
        btp_output += "<tr><td>" + "Battery Voltage" + "</td><td>" + data_obj.btv[data_obj.btv.length - 1] + "V" + "</td>";
        btp_output += "<tr><td>" + "Battery Current" + "</td><td>" + data_obj.btc[data_obj.btc.length - 1] + "A" + "</td>";
        btp_output += "<tr><td>" + "Battery SOC" + "</td><td>" + data_obj.btsoc[data_obj.btsoc.length - 1] + "%" + "</td>";
        btp_output += "<tr><td>" + "Battery Temperature" + "</td><td>" + data_obj.bt_module_temp[data_obj.bt_module_temp.length - 1] + "C" + "</td>";
        document.getElementById("btp_reveal_table").innerHTML = btp_output;
        document.getElementById('btsoc_card').innerText = data_obj.btsoc[data_obj.btsoc.length - 1] + '%';

    }


}

checkIfLoggedIn();
