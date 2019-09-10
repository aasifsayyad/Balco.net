var plantSummaryPerformance = [{
    "afname": "CPP540",
    "div": "CPP540",
    "title": "CPP540"
},
{
    "afname": "CPP900",
    "div": "CPP900",
    "title": "CPP900"
},
{
    "afname": "IPP300",
    "div": "IPP300",
    "title": "IPP300"
}

];
var summaryPerformance = [
    {
        "afname": "Gross Generation",
        "div": "GG",
        "theme": "light",
        "unit": "MW",
        "decimal":1,
        "type": "gauge",
        "path": "path={0}|color&path={0}|StartValue&path={0}|endValue&path={0}|Realtime_MW"
    },
    {
        "afname": "Aux Consumption",
        "div": "AUX",
        "theme": "light",
        "unit": "%",
        "decimal": 2,
        "type": "gauge",
        "path": "path={0}|color&path={0}|StartValue&path={0}|endValue&path={0}|Realtime_MW"
    },
    {
        "afname": "PLF",
        "div": "PLF",
        "theme": "light",
        "unit": "%",
        "decimal": 1,
        "type": "pie",
        "path": "path={0}|IO&path={0}|Losses",
        "balloonText": "[[title]]<br><span style='font-size:10px'><b>[[value]]</b><br> ([[percents]]%)</span>"
    }

];

var OverallStationAnalysis = [{
    "title": "OverallStationKPIS",
    "path": "path={0}|CPP540&path={0}|IPP600&path={0}|CPP600",
    "table": "OverallStationData",
    "digits": [{
        "name": "1. Availability",
        "decimal": 1
    },
    {
        "name": "2. PLF",
        "decimal": 1
    },
    {
        "name": "3. Gross Generation",
        "decimal": 1
    },
    {
        "name": "4. Aux Consumption",
        "decimal": 2
    },
    {
        "name": "5. Gross Heatrate",
        "decimal": 0
    },
    {
        "name": "6. SCC",
        "decimal": 1
    },
    {
        "name": "7. SOC",
        "decimal": 1
    }
    ]
},
{
    "title": "Coal Stock-Consumption",
    "path": "path={0}|CPP540&path={0}|IPP600&path={0}|CPP600",
    "table": "CoalStockData",
    "digits": [{
        "name": "1.Coal Cons.",
        "decimal": 0
    },
    {
        "name": "2.LDO Cons.",
        "decimal": 0
    },
    {
        "name": "3.HFO Cons.",
        "decimal": 0
    },
    {
        "name": "4.Coal Cls Stock",
        "decimal": 0
    },
    {
        "name": "5.LDO Cls Stock",
        "decimal": 0
    },
    {
        "name": "6.HFO Cls Stock",
        "decimal": 0
    }
    ]
},
{
    "title": "Coal Rakes-Trucks",
    "path": "path={0}|CPP540&path={0}|IPP600&path={0}|CPP600",
    "table": "CoalRakesData",
    "digits": [{
        "name": "Coal Rakes Received",
        "decimal": 2
    },
    {
        "name": "Coal Trucks Received",
        "decimal": 2
    }
    ]
}
];

$(document).ready(function () {
    getDashboardData();
});

setInterval(function () {
    getDashboardData();
}, 20000);

function getDashboardData() {
    $.each(OverallStationAnalysis, function (key) {
        var rankingElements1 = [];
        var batch1 = {
            "database": {
                "Method": "GET",
                "Resource": baseServiceUrl + "elements?path=\\\\" + afServerName + "\\" + afDatabaseName + "\\KPIs\\Summary\\Overall Station Summary\\" + OverallStationAnalysis[key].title + "&selectedFields=WebId;Name;Path;Links.Elements"
            },
            "elements": {
                "Method": "GET",
                "Resource": "{0}?selectedFields=Items.Name;Items.WebId;Items.Path;&searchFullHierarchy=false",
                "ParentIds": ["database"],
                "Parameters": ["$.database.Content.Links.Elements"]
            },
            "attributes": {
                "Method": "GET",
                "RequestTemplate": {
                    "Resource": baseServiceUrl + "attributes/multiple?selectedFields=Items.Object.Name;Items.Object.Path;Items.Object.WebId&" + OverallStationAnalysis[key].path
                },
                "ParentIds": ["elements"],
                "Parameters": ["$.elements.Content.Items[*].Path"]
            },
            "values": {
                "Method": "GET",
                "RequestTemplate": {
                    "Resource": baseServiceUrl + "streams/{0}/value"
                },
                "ParentIds": [
                    "attributes"
                ],
                "Parameters": [
                    "$.attributes.Content.Items[*].Content.Items[*].Object.WebId"
                ]
            }
        };
        var batchStr1 = JSON.stringify(batch1, null, 2);
        var batchResult1 = processJsonContent(baseServiceUrl + "batch", 'POST', batchStr1);
        $.when(batchResult1).fail(function () {
            console.log("Cannot Launch Batch!!!");
        });
        $.when(batchResult1).done(function () {
            var batchResultItems = (batchResult1.responseJSON.attributes.Content.Items);
            var valuesID = 0;

            $.each(batchResultItems, function (elementID) {
                var attrItems = batchResultItems[elementID].Content.Items;
                var elementName1 = batchResult1.responseJSON.elements.Content.Items[elementID].Name;
                var UO = (batchResult1.responseJSON.values.Content.Items[valuesID].Content.UnitsAbbreviation);
                var elementItems1 = [{
                    "mw": elementName1
                }, {
                    "UOM": UO
                }];
                var decimal = '';
                $.each(OverallStationAnalysis[key].digits, function (key1) {
                    if (OverallStationAnalysis[key].digits[key1].name === elementName1) {
                        decimal = OverallStationAnalysis[key].digits[key1].decimal;
                    }
                });
                attrItems.forEach(function (attr, attrID) {
                    var attrValue = "-";
                    if (attr !== undefined && attr.Object !== undefined) {
                        attrName1 = attr.Object.Name;

                        if (batchResult1.responseJSON.values.Content.Items !== undefined && (batchResult1.responseJSON.values.Content.Status === undefined || batchResult1.responseJSON.values.Content.Status < 400) && batchResult1.responseJSON.values.Content.Items[valuesID].Status === 200) {
                            var attrV = batchResult1.responseJSON.values.Content.Items[valuesID].Content.Value;
                            if (attrV !== "" && !isNaN(attrV)) {
                                attrValue = parseFloat((attrV).toFixed(decimal));
                                //attrValue = parseFloat((Math.round((attrV) * 100) / 100));
                            } else {
                                var attrVal = "Bad";//batchResult1.responseJSON.values.Content.Items[valuesID].Content.Value.Name;
                                attrValue = attrVal.fontcolor("red");
                            }
                        }
                    }
                    if (attrName1 === 'CPP540') {
                        elementItems1.push({
                            'CPP540': attrValue
                        }); //THIRD
                    } else if (attrName1 === 'CPP600') {
                        elementItems1.push({
                            'CPP600': attrValue
                        });
                    } else if (attrName1 === 'IPP600') {
                        elementItems1.push({
                            'IPP600': attrValue
                        });
                    }
                    valuesID++;
                });
                rankingElements1[elementID] = elementItems1;
            });
            var t = $('#' + OverallStationAnalysis[key].table).DataTable({
                info: false,
                retrieve: true,
                searching: false,
                paging: false,
                columnDefs: [{
                    targets: "_all",
                    orderable: false
                }]
            });
            t.clear().draw();
            $.each(rankingElements1, function (key) {
                var rows2 = [];
                var uom = '';
                if (rankingElements1[key][1].UOM === '') {
                    uom = '-';
                } else {
                    uom = rankingElements1[key][1].UOM;
                }
                //if (rankingElements1[key][2].CPP540 || rankingElements1[key][2].CPP540 === 0) {
                rows2.push(rankingElements1[key][0].mw, uom, rankingElements1[key][2].CPP540, rankingElements1[key][4].CPP600, rankingElements1[key][3].IPP600);
               // }
                t.row.add(rows2).draw(!1);
            });
        });
    });

    $.each(summaryPerformance, function (key1) {
        $.each(plantSummaryPerformance, function (key) {
            // $('#' + plantSummaryPerformance[key].div + summaryPerformance[key1].div).html("<img style='margin-top:20%;margin-left:40%;width:75px;height:75px;' src='../piadmin/images/loading.gif'>");
            var rankingElements = [];
            if (summaryPerformance[key1].type === 'gauge') {
                var batch = {
                    "database": {
                        "Method": "GET",
                        "Resource": baseServiceUrl + "elements?path=\\\\" + afServerName + "\\" + afDatabaseName + "\\KPIs\\Summary\\Overall Station Summary\\Charts\\" + summaryPerformance[key1].afname + "\\" + plantSummaryPerformance[key].afname + "&selectedFields=WebId;Links.Elements"
                    },
                    "elements": {
                        "Method": "GET",
                        "Resource": "{0}?selectedFields=Items.Name;Items.Path;&searchFullHierarchy=true",
                        "ParentIds": [
                            "database"
                        ],
                        "Parameters": [
                            "$.database.Content.Links.Elements"
                        ]
                    },
                    "attributes": {
                        "Method": "GET",
                        "RequestTemplate": {
                            "Resource": baseServiceUrl + "attributes/multiple?selectedFields=Items.Object.Name;Items.Object.Path;Items.Object.WebId&" + summaryPerformance[key1].path
                        },
                        "ParentIds": [
                            "elements"
                        ],
                        "Parameters": [
                            "$.elements.Content.Items[*].Path"
                        ]
                    },
                    "values": {
                        "Method": "GET",
                        "RequestTemplate": {
                            "Resource": baseServiceUrl + "streams/{0}/value"
                        },
                        "ParentIds": [
                            "attributes"
                        ],
                        "Parameters": [
                            "$.attributes.Content.Items[*].Content.Items[*].Object.WebId"
                        ]
                    }
                };

                var batchStr = JSON.stringify(batch, null, 2);
                var batchResult = processJsonContent(baseServiceUrl + "batch", 'POST', batchStr);
                $.when(batchResult).fail(function () {
                    warningmsg("Cannot Launch Batch!!!");
                });
                $.when(batchResult).done(function () {
                    var batchResultItems = (batchResult.responseJSON.attributes.Content.Items);
                    var valuesID = 0;
                    $.each(batchResultItems, function (elementID) {
                        var attrItems = batchResultItems[elementID].Content.Items;
                        var elementName = batchResult.responseJSON.elements.Content.Items[elementID].Name;
                        var elementItems = [];
                        elementItems[0] = ({
                            "mw": elementName
                        });
                        attrItems.forEach(function (attr, attrID) {
                            var attrValue = 0;
                            if (attr !== undefined && attr.Object !== undefined) {
                                attrName = attr.Object.Name;
                                if (batchResult.responseJSON.values.Content.Items !== undefined && (batchResult.responseJSON.values.Content.Status === undefined || batchResult.responseJSON.values.Content.Status < 400) && batchResult.responseJSON.values.Content.Items[valuesID].Status === 200) {
                                    var attrV = batchResult.responseJSON.values.Content.Items[valuesID].Content.Value;                                    
                                }                                
                            }
                            if (attrName === 'color') {
                                elementItems[attrID + 1] = ({
                                    'color': attrV
                                });
                            } else if (attrName === 'StartValue') {
                                elementItems[attrID + 1] = ({
                                    'StartValue': attrV
                                });
                            } else if (attrName === 'endValue') {
                                elementItems[attrID + 1] = ({
                                    'endValue': attrV
                                });
                            } else if (attrName === 'Realtime_MW') {
                                elementItems[attrID + 1] = ({
                                    'Realtime_MW': attrV
                                });
                            }
                            valuesID++;
                        });
                        rankingElements[elementID] = elementItems;
                    });
                    var cols = [];
                    var marker, topTextColor, StartValue, endval, topTextYOffset, nailRadius, topText;
                    if (rankingElements[0][4].Realtime_MW !== "" && !isNaN(rankingElements[0][4].Realtime_MW)) {
                        marker = (rankingElements[0][4].Realtime_MW).toFixed(summaryPerformance[key1].decimal);
                        topTextColor = "#124b6b";
                        $.each(rankingElements, function (key1) {
                            cols.push({
                                "balloonText": rankingElements[key1][3].endValue,
                                "color": rankingElements[key1][1].color,
                                "startValue": rankingElements[key1][2].StartValue,
                                "endValue": rankingElements[key1][3].endValue,
                                "innerRadius": "100%",
                                "radius": "165%",
                                "gradientRatio": [0.5, 0, -0.5]
                            });
                        });
                        topTextYOffset = 55;
                        StartValue = rankingElements[0][2].StartValue;
                        endval = rankingElements[0][3].endValue;
                        nailRadius = 10;
                        topText = plantSummaryPerformance[key].title + "\n " + marker + summaryPerformance[key1].unit;
                    } else {
                        marker = "Bad";
                        topTextColor = "#ff0000";                       
                        topTextYOffset = -35;
                        StartValue = "";
                        endval = "";
                        nailRadius = 0;
                        topText = marker + "\n \n \n \n \n" + plantSummaryPerformance[key].title;
                    }
                   
                    AmCharts.makeChart(plantSummaryPerformance[key].div + summaryPerformance[key1].div, {
                        "theme": "none",
                        "type": "gauge",
                        "rotate": true,
                        "startDuration": 0,
                        "axes": [{
                            "topTextFontSize": 13,
                            "topTextYOffset": topTextYOffset,
                            "topText": topText,
                            "topTextColor": topTextColor,
                            "color": "#dfa804",
                            "fontSize": 12,
                            "axisColor": "#31d6ea",
                            "startValue": StartValue,
                            "endValue": endval,
                            "radius": "68%",
                           // "valueInterval": valueInterval,
                            "tickColor": "#ffffff",
                            "startAngle": -90,
                            "endAngle": 90,
                            //"unit": "%",
                            "bandOutlineAlpha": 0,
                            "axisThickness": 0,
                            "gridInside": true,
                            "inside": false,
                            "bands": cols
                        }],
                        "allLabels": [],
                        "balloon": {
                            "drop": true,
                            "adjustBorderColor": false,
                            "color": "#FFFFFF",
                            "fontSize": 12
                        },
                        "arrows": [{
                            "alpha": 1,
                            "innerRadius": "20%",
                            "nailRadius": nailRadius,
                            "color": "#cccc00",
                            "radius": "150%",
                            "value": marker
                        }]
                    });

                });
            }
            else {
                var batch3 = {
                    "database": {
                        "Method": "GET",
                        "Resource": baseServiceUrl + "elements?path=\\\\" + afServerName + "\\" + afDatabaseName + "\\KPIs\\Summary\\Overall Station Summary\\Charts\\" + summaryPerformance[key1].afname + "\\" + plantSummaryPerformance[key].afname + "&selectedFields=WebId;Name;Path;Links.Attributes"
                    },
                    "attributes": {
                        "Method": "GET",
                        "RequestTemplate": {
                            "Resource": baseServiceUrl + "attributes/multiple?selectedFields=Items.Object.Name;Items.Object.Path;Items.Object.WebId&" + summaryPerformance[key1].path
                        },
                        "ParentIds": [
                            "database"
                        ],
                        "Parameters": [
                            "$.database.Content.Path"
                        ]
                    },
                    "values": {
                        "Method": "GET",
                        "RequestTemplate": {
                            "Resource": baseServiceUrl + "streams/{0}/value"
                        },
                        "ParentIds": [
                            "attributes"
                        ],
                        "Parameters": [
                            "$.attributes.Content.Items[*].Content.Items[*].Object.WebId"
                        ]
                    }
                };
                var batchStr3 = JSON.stringify(batch3, null, 2);
                var batchResult3 = processJsonContent(baseServiceUrl + "batch", 'POST', batchStr3);
                $.when(batchResult3).fail(function () {
                    warningmsg("Cannot Launch Batch!!!");
                });
                $.when(batchResult3).done(function () {
                    var batchResultItems = (batchResult3.responseJSON.attributes.Content.Items);
                    var valuesID = 0;
                    var color = [{
                        "color": "#0D52D1"
                    }, {
                        "color": "#de4c4f"
                    }];
                    $.each(batchResultItems, function (elementID) {
                        var attrItems = batchResultItems[elementID].Content.Items;
                        attrItems.forEach(function (attr, attrID) {
                            var elementName = batchResult3.responseJSON.attributes.Content.Items[elementID].Content.Items[attrID].Object.Name;
                            var attrValue = "Bad";
                            if (attr !== undefined && attr.Object !== undefined) {
                                attrName = attr.Object.Name;
                                if (batchResult3.responseJSON.values.Content.Items !== undefined &&
                                    (batchResult3.responseJSON.values.Content.Status === undefined || batchResult3.responseJSON.values.Content.Status < 400) &&
                                    batchResult3.responseJSON.values.Content.Items[valuesID].Status === 200) {
                                    var attrV = batchResult3.responseJSON.values.Content.Items[valuesID].Content.Value;
                                    if (attrV !== "" && !isNaN(attrV)) {
                                        attrValue = (Math.round((attrV) * 100) / 100).toFixed(1);
                                    }
                                }
                            }
                            rankingElements.push({
                                mw: elementName,
                                color: color[attrID].color,
                                val: attrValue
                            });
                            valuesID++;
                        });
                    });
                    var io = '';
                    var col = '';
                    if (rankingElements[0].val === "Bad") {
                        io = rankingElements[0].val;
                        col = "#ff0000";
                    } else {
                        io = rankingElements[0].val + "%";
                        col = "#555";
                    }
                    //var io = (rankingElements[0].val / (rankingElements[0].val + rankingElements[1].val) * 100).toFixed(2);
                    AmCharts.makeChart(plantSummaryPerformance[key].div + summaryPerformance[key1].div, {
                        "type": summaryPerformance[key1].type,
                        "theme": summaryPerformance[key1].theme,
                        "marginBottom": 35,
                        "allLabels": [{
                            "x": "50%",
                            "y": "40%",
                            "text": io,
                            "size": 13,
                            "bold": true,
                            "align": "middle",
                            "color": col
                        }, {
                            "x": "50%",
                            "y": "80%",
                            "text": plantSummaryPerformance[key].title,
                            "size": 13,
                            "bold": true,
                            "align": "middle",
                            "color": col
                        }],
                        "dataProvider": rankingElements,
                        "balloon": {
                            "drop": true, //"cornerRadius": 5,
                            "adjustBorderColor": false,
                            "color": "#ffffff",
                            "fixedPosition": true,
                            "fontSize": 9
                        },
                        "valueField": "val",
                        "titleField": "mw",
                        "adjustBorderColor": false, //"startEffect": "elastic",
                        "startDuration": 0,
                        "labelsEnabled": false,
                        "labelRadius": 5,
                        "pullOutRadius":0,
                        "outlineColor": "",
                        "innerRadius": "65%",
                        "depth3D": 7,
                        "balloonText": summaryPerformance[key1].balloonText,
                        "angle": 3,
                        "export": {
                            "enabled": true
                        }
                    });

                });
            }

        });
    });
}
