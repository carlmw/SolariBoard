var now = new Date(),
    time = {
        hour: now.getHours(),
        minutes: now.getMinutes()
    };
self.postMessage(time);
setInterval(function(){
    now = new Date(),
    newTime = {
        hour: now.getHours(),
        minutes: now.getMinutes()
    }
    if (time.hour != newTime.hour || time.minutes != newTime.minutes){
        time = newTime;
        self.postMessage(time);
    }
}, 500);
