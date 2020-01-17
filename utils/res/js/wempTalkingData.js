var appid = "0D288716B9BA4B51BBA9C9FC7256478E";

var url = "https://jic.talkingdata.com/app/h5/v1?appid=" + appid + "&vn=bgy1.0&vc=1.0.0";

function loadScript(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    // IE
    if (script.readyState) {
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else { // others
        script.onload = function () {
            callback();
        };
    }
    script.src = url;
    document.body.appendChild(script);
}

loadScript(url, function () {
    TDAPP.onEvent(EventId);
});