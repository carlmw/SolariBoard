Array.matrix = function(m, n, initial) {
    var a, i, j, mat = [];
    for (i = 0; i < m; i += 1) {
        a = [];
        for (j = 0; j < n; j += 1) {
            a[j] = initial;
        }
        mat[i] = a;
    }
    return mat;
};
Array.init = function(m, initial) {
    var i, a = [];
    for (i = 0; i < m; i+= 1) {
        a[i] = initial;
    }
    return a;
}
SolariScreen = function() {
}

_.extend(SolariScreen.prototype, {
    init: function(rows, columns){
        this.rows = rows;
        this.columns = columns;
        this.matrix = Array.matrix(rows, columns, ' ');
    },
    pushMessage: function(msg){
        this.matrix.pop();
        this.matrix.unshift(Array.init(this.columns, ' '));
        for(i = 0; i < this.matrix[0].length - 1; i++){
            var c;
            if (i < msg.length){
                c = msg[i];
            } else {
                c = ' ';
            }
            this.matrix[0][i] = c;
        }
    }
}, Backbone.Events);