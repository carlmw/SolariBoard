var now = new Date(),
    time = {
        hour: now.getHours(),
        minutes: now.getMinutes(),
        day: now.getDay()
    };
self.postMessage(time);
setInterval(function(){
    var now = new Date(),
        newTime = {
            hour: now.getHours(),
            minutes: now.getMinutes(),
            day: now.getDay()
        };
    if (time.hour != newTime.hour || time.minutes != newTime.minutes){
        time = newTime;
        self.postMessage(time);
    }
}, 500);
