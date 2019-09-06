$("#sendToPi").click(function () {
    var time = $("#time").val();
    if (time === '') {
        warningmsg("Time Selection Required..!")
    } else {
        $.each($(".WebId"), function () {
            var Value = $(this).val();
            var Id = $(this).attr("data-Id");
            var WebId = $(this).attr("data-WebId");
            $(".status" + Id).html("<img style='width:30px;height:30px;' src='" + baseurl + "/piadmin/images/loady.gif'>");
            saveValue(Id, WebId, Value)
        })
    }
});
$("#editTime").click(function () {
    $("#time").removeAttr("readonly");
    $("#sendToPi").attr('disabled', true);
    $('input[type="time"][name="time"]').attr({
        'value': '05:00:00'
    });
});
$("#saveTime").click(function () {
    $("#time").attr('readonly', true);
    $("#sendToPi").removeAttr('disabled');
});
$("#refresh").click(function () {
    $.each($(".WebId"), function () {
        var Id = $(this).attr("data-Id");
        $(this).val(0);
        $(".status" + Id).html('')
    })
});

function sort_table(tbodyId) {
    var tbody = document.getElementById(tbodyId);
    var col = 0;
    var asc = 1;
    var rows = tbody.rows,
        rlen = rows.length,
        arr = new Array(),
        i, j, cells, clen;
    for (i = 0; i < rlen; i++) {
        cells = rows[i].cells;
        clen = cells.length;
        arr[i] = new Array();
        for (j = 0; j < clen; j++) {
            arr[i][j] = cells[j].innerHTML
        }
    }
    arr.sort(function (a, b) {
        var first = parseInt(a[col]);
        var second = parseInt(b[col]);
        return (first == second) ? 0 : ((first > second) ? asc : -1 * asc)
    });
    for (i = 0; i < rlen; i++) {
        rows[i].innerHTML = "<td>" + arr[i].join("</td><td>") + "</td>"
    }
}
var now = new Date();
$(function () {
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = month + '/' + day + '/' + now.getFullYear();
    $("#dateTime").val(today);
    $("#dateTime").datepicker({
        dateFormat: 'mm/dd/yy',
        maxDate: '0'
    })
});
$(function () {
    var h = now.getHours(),
        m = now.getMinutes(),
        s = now.getSeconds();
    if (h < 10) h = '0' + h;
    if (m < 10) m = '0' + m;
    if (s < 10) s = '0' + s;
    $('input[type="time"][name="time"]').attr({
        'value': '05:00:00'
    })
});
$.each(ipp600DGR, function (key) {
    var batch = {
        "database": {
            "Method": "GET",
            "Resource": baseServiceUrl + "attributes?path=" + ipp600DGR[key].tag_path + "|" + ipp600DGR[key].parameter
        },
        "values": {
            "Method": "GET",
            "RequestTemplate": {
                "Resource": baseServiceUrl + "streams/{0}/value"
            },
            "ParentIds": ["database"],
            "Parameters": ["$.database.Content.WebId"]
        }
    };
    var batchStr = JSON.stringify(batch, null, 2);
    var batchResult = processJsonContent(baseServiceUrl + "batch", 'POST', batchStr);
    $.when(batchResult).fail(function () {
        console.log("Cannot Launch Batch!!!");
    });
    $.when(batchResult).done(function () {
        var valuesID = 0;
        var WebId = batchResult.responseJSON.database.Content.WebId;
        var uom = batchResult.responseJSON.database.Content.DefaultUnitsNameAbbreviation;
        let attrValue = "-";
        if (batchResult.responseJSON.values.Content.Items !== undefined && (batchResult.responseJSON.values.Content.Status === undefined || batchResult.responseJSON.values.Content.Status < 400) && batchResult.responseJSON.values.Content.Items[valuesID].Status === 200) {
            var attrV = (batchResult.responseJSON.values.Content.Items[0].Content.Value);
            if (attrV !== "" && !isNaN(attrV)) {
                attrValue = (Math.round((attrV) * 100) / 100);
            }
        }
        $('#' + ipp600DGR[key].unitname + ' tbody').append("<tr><td>" + ipp600DGR[key].sr + "</td><td style='text-align:left;padding-left:20px;'>" + ipp600DGR[key].title + "</td><td>" + uom + "</td><td><input type='text' id='value" + ipp600DGR[key].sr + "' data-id='" + ipp600DGR[key].sr + "' data-WebId='" + WebId + "' value='" + attrValue + "' class='form-control input-manual WebId'></td><td><div class='status" + ipp600DGR[key].sr + "'></div></td></tr>")
        sort_table("tbody" + ipp600DGR[key].unitname);
    })
});

function saveValue(Id, WebId, Value) {
    var date = $("#dateTime").val();
    var time = $("#time").val();
    var dateTime = (date + ' ' + time);
    var url = baseServiceUrl + 'streams/' + WebId + '/value?WebId=' + WebId + '&updateOption=Replace';
    var data = {
        "Timestamp": dateTime,
        "Good": !0,
        "Questionable": !1,
        "Value": Value
    };
    var postData = JSON.stringify(data);
    var postAjaxEF = processJsonContent(url, 'POST', postData, null, null);
    $.when(postAjaxEF).fail(function () {
        $(".status" + Id).html("<span style='color:red;font-weight:500;font-size: 18px;'><i class='fa fa-times-circle'></i> Failed.</span>");
    });
    $.when(postAjaxEF).done(function () {
        var response = (JSON.stringify(postAjaxEF.responseText));
        if (response == '""') {
            $(".status" + Id).html("<span style='color:green;font-weight:500;font-size: 18px;'><i class='fa fa-check-circle'></i> Success.</span>");
        } else {
            var failure = postAjaxEF.responseJSON.Items;
            $.each(failure, function (key) {
                $(".status" + Id).html("<span style='color:red;font-weight:500;font-size: 18px;'><i class='fa fa-times-circle'></i> Failed.</span>");
            });
        }
    });
}