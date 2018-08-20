L.Control.Slider = L.Control.extend({
    onAdd: function(map) {
        var el = document.getElementById('slider');
        L.DomEvent.disableScrollPropagation(el);
        L.DomEvent.disableClickPropagation(el);
        return el;
    },

    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.slider = function(opts) {
    return new L.Control.Slider(opts);
}