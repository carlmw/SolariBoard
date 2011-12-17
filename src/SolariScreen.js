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
SolariScreen = _.extend({
    init: function(rows, columns){
        this.matrix = Array.matrix(rows, columns, '');
    },
    getMatrix: function(){
        return this.matrix;
    },
    setMatrix: function(matrix){
        this.matrix = matrix;
    }
}, Backbone.Events);