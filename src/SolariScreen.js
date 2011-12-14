var SolariScreen = Backbone.View.extend({
    initialize: function(){
        this.rows = [];
        this.flaps = [];
    },
    add: function(row){
        this.rows.push(row);
        this.flaps = this.flaps.concat(row.flaps);

        var self = this;
        _.each(row.flaps, function(flap){
            _.each(flap.objToRender, function(obj) {
                self.trigger('flapToRender', obj);
            });
        });

        this.trigger('rowAdded', row);

        return this;
    }
});