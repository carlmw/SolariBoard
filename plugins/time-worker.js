var now = new Date(),
    time = {
        hour: now.getHours(),
        minutes: now.getMinutes()
    },
    newTime = time;
self.postMessage(time);
while(true){
    now = new Date(),
    newTime = {
        hour: now.getHours(),
        minutes: now.getMinutes()
    }
    if (time.hour != newTime.hour || time.minutes != newTime.minutes){
        time = newTime;
        self.postMessage(time);
    }
}