angular.module('evalMatrix', [])
    .controller('EvalMatrixController', function() {
        let evalMatrix = this;
        evalMatrix.data = {
            evalRow : [
                {
                    label : 'Vendor 1',
                    criteria: [3,1,2]
                },
                {
                    label : 'Vendor 2',
                    criteria: [3,1,2]
                },
                {
                    label : 'Vendor 3',
                    criteria: [3,1,2]
                }
            ],
            criteria : [
                {
                    label : 'criteria 1',
                    weightTypes : {id:'low'},
                    weightValue: {value : 0}
                },
                {
                    label : 'criteria 2',
                    weightTypes : { id :'hi'},
                    weightValue: {value : 3}
                },
                {
                    label : 'criteria 3',
                    weightTypes : {id:'low'},
                    weightValue: {value : 4}
                }
            ]
        };

        evalMatrix.weightTypes = [
            {
                id :'hi'
            },
            {
                id :  'low'
            }
        ];

        evalMatrix.weights = [
            { label : '0. Doesnt Matter', value : 0 },
            { label : '1. Not Important(Bonus)', value : 1 },
            { label : '2. Would be Nice', value : 2 },
            { label : '3. Moderate', value : 3 },
            { label : '4. Important', value : 4 },
            { label : '5. Extremely Important', value : 5 },
        ];

        evalMatrix.addCriteria = function() {
            evalMatrix.data.criteria.push(   {
                label : 'criteria ' + (evalMatrix.data.criteria.length+1),
                weightTypes : {id:'low'},
                weightValue: {value : 0}
            });
            evalMatrix.data.evalRow.forEach((v) => {
                v.criteria[evalMatrix.data.criteria.length] = 1
            });
        };

        evalMatrix.removeCriteria = function(index) {
            evalMatrix.data.criteria[index] = undefined;
        };

        evalMatrix.calcTotal = [];

        evalMatrix.recalc = function () {
            let critStats = evalMatrix.data.criteria.reduce((crits, crit, i) => {

                let low = 9999999999;
                let hi = -99999999999;
                let total = 0;

                evalMatrix.data.evalRow.forEach((v) => {
                    let values = (!v[i] || isNaN(v[i].value)) ? 0.0 : parseFloat(v[i].value);//default to 0

                    low = Math.min(values);
                    hi = Math.max(values);
                    total += values;
                });

                let  avg = total / evalMatrix.data.evalRow.length;

                crits[i] = {
                    avg,
                    low,
                    hi,
                    total,
                    diff : Math.max(hi - low, 1),
                    weight : (crit.weightValue && !isNaN(crit.weightValue.value)) ? parseFloat(crit.weightValue.value) : 0.0
                };

                return crits;
            }, {});
            //
            evalMatrix.calcTotal = evalMatrix.data.evalRow.reduce((acc, v) => {

                let avg = 0;
                v.criteria.forEach((value, i) => {

                    // if(critStats[i].weight>0) {
                    let numVal = isNaN(value) ? 0.0 : parseFloat(value);
                    avg += ((critStats[i].weight) * (((numVal - critStats[i].low) / critStats[i].diff))) // out of 5
                    console.log(critStats[i], value, avg);
                    // }
                });
                avg = avg / v.criteria.length;

                let value1 = {
                    0 : 'F',
                    1 : 'D',
                    2 : 'C',
                    3 : 'B',
                    4 : 'A',
                    5 : 'A+'
                }[Math.round(avg)];
                console.log('value1', value1, Math.round(avg));
                acc.push({
                    value : value1
                });
                return acc;
            }, []);
        };

        evalMatrix.addOption = function () {
            evalMatrix.data.evalRow.push({
                label: 'Vendor ' + (evalMatrix.data.evalRow.length + 1),
                criteria: new Array(evalMatrix.data.criteria.length).fill(1)
            })
        };

        evalMatrix.archive = function() {
            console.log('archive');
            let dlAnchorElem = document.getElementById('downloadAnchorElem');
            dlAnchorElem.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(evalMatrix.data, null, 2)));
            dlAnchorElem.setAttribute("download", `eval-matrix-${Math.round(Date.now()/1000)}.json`);
            dlAnchorElem.click();
        };

        evalMatrix.loadFile = function loadFile() {
            console.log('loadFile');
            var input, file, fr;

            if (typeof window.FileReader !== 'function') {
                alert("The file API isn't supported on this browser yet.");
                return;
            }

            input = document.getElementById('fileinput');
            if (!input) {
                alert("Um, couldn't find the fileinput element.");
            }
            else if (!input.files) {
                alert("This browser doesn't seem to support the `files` property of file inputs.");
            }
            else if (!input.files[0]) {
                alert("Please select a file before clicking 'Load'");
            }
            else {
                file = input.files[0];
                fr = new FileReader();
                fr.onload = receivedText;
                fr.readAsText(file);
            }

            function receivedText(e) {
                let lines = e.target.result;
                evalMatrix.data = JSON.parse(lines);
            }
        }

    });